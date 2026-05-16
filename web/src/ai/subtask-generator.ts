import crypto from 'crypto';
import prisma from '@/lib/prisma';
import aiService from './service';

export interface GeneratedSubtask {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedTime: number;
  semanticHash: string;
}

type GenerationHistoryEntry = {
  createdAt: string;
  titles: string[];
  fingerprints: string[];
};

type GenerationOptions = {
  regeneration?: boolean;
  triggeredByUserId?: string;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function semanticHash(input: string) {
  return crypto.createHash('sha256').update(normalizeText(input)).digest('hex');
}

function titleFingerprint(title: string, description?: string | null) {
  const base = `${normalizeText(title)} ${normalizeText(description ?? '')}`;
  const tokens = Array.from(new Set(base.split(' ').filter((token) => token.length > 2))).sort().join(' ');
  return semanticHash(tokens);
}

function buildFallbackSubtasks(task: { title: string; description?: string | null }, variation: number): GeneratedSubtask[] {
  const descriptor = normalizeText(task.description || task.title);
  const hasDesign = descriptor.includes('design');
  const hasApi = descriptor.includes('api') || descriptor.includes('backend');
  const hasTesting = descriptor.includes('test') || descriptor.includes('qa');

  const templates = [
    {
      title: `${variation % 2 === 0 ? 'Clarify' : 'Confirm'} acceptance criteria`,
      description: `Define the measurable completion criteria for ${task.title}.`,
      priority: 'HIGH' as const,
      estimatedTime: 45,
    },
    {
      title: hasDesign ? 'Create implementation wireframe' : 'Break implementation into execution steps',
      description: hasDesign
        ? `Map the design states, edge cases, and assets needed for ${task.title}.`
        : `Convert ${task.title} into concrete execution slices with dependencies called out.`,
      priority: 'MEDIUM' as const,
      estimatedTime: 60,
    },
    {
      title: hasApi ? 'Define API and data contract changes' : 'Prepare delivery dependencies',
      description: hasApi
        ? `List request, response, validation, and persistence changes required for ${task.title}.`
        : `Identify the people, files, or upstream inputs required to complete ${task.title}.`,
      priority: 'MEDIUM' as const,
      estimatedTime: 50,
    },
    {
      title: hasTesting ? 'Document test scenarios' : 'Validate edge cases and failure handling',
      description: hasTesting
        ? `Capture positive, negative, and regression scenarios before shipping ${task.title}.`
        : `Review the likely failure paths and edge cases for ${task.title}.`,
      priority: 'MEDIUM' as const,
      estimatedTime: 40,
    },
    {
      title: 'Ship and verify completion',
      description: `Close the loop on ${task.title} with rollout verification and status updates.`,
      priority: 'HIGH' as const,
      estimatedTime: 35,
    },
  ];

  return templates.map((template) => ({
    ...template,
    semanticHash: titleFingerprint(template.title, template.description),
  }));
}

async function loadGenerationHistory(taskId: string): Promise<GenerationHistoryEntry[]> {
  const entries = await prisma.activityLog.findMany({
    where: {
      entity: 'TASK',
      entityId: taskId,
      action: 'AI_SUBTASK_GENERATED',
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      createdAt: true,
      metadata: true,
    },
  });

  return entries.map((entry) => ({
    createdAt: entry.createdAt.toISOString(),
    titles: Array.isArray((entry.metadata as Record<string, unknown> | null)?.titles)
      ? ((entry.metadata as Record<string, unknown>).titles as string[])
      : [],
    fingerprints: Array.isArray((entry.metadata as Record<string, unknown> | null)?.fingerprints)
      ? ((entry.metadata as Record<string, unknown>).fingerprints as string[])
      : [],
  }));
}

function dedupeCandidates(
  candidates: GeneratedSubtask[],
  existingFingerprints: Set<string>,
  historicalFingerprints: Set<string>,
  regeneration: boolean
) {
  const accepted: GeneratedSubtask[] = [];
  const seenInBatch = new Set<string>();

  for (const candidate of candidates) {
    const combinedHash = candidate.semanticHash || titleFingerprint(candidate.title, candidate.description);

    if (seenInBatch.has(combinedHash)) continue;
    if (existingFingerprints.has(combinedHash)) continue;
    if (regeneration && historicalFingerprints.has(combinedHash)) continue;

    seenInBatch.add(combinedHash);
    accepted.push({ ...candidate, semanticHash: combinedHash });
  }

  return accepted;
}

export class SubtaskGenerator {
  static async generate(
    taskId: string,
    options: GenerationOptions = {}
  ): Promise<{ subtasks: GeneratedSubtask[]; history: GenerationHistoryEntry[] }> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        subTasks: {
          select: {
            title: true,
            description: true,
          },
        },
        parent: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const history = await loadGenerationHistory(taskId);
    const existingFingerprints = new Set(task.subTasks.map((item) => titleFingerprint(item.title, item.description)));
    const historicalFingerprints = new Set(history.flatMap((entry) => entry.fingerprints));
    const variationSeed = history.length + (options.regeneration ? 1 : 0);

    const aiPayload = await aiService.complete(
      `
      You are an expert project decomposer. Generate 4 to 7 implementation subtasks.
      Return strict JSON:
      {
        "subtasks": [
          {
            "title": "string",
            "description": "string",
            "priority": "LOW|MEDIUM|HIGH|URGENT",
            "estimatedTime": number
          }
        ]
      }

      Rules:
      - Titles must be concrete and execution-focused.
      - Do not repeat existing or historical subtasks.
      - Regeneration must produce meaningfully different decomposition.
      - Avoid generic verbs like "work on", "handle", or repeating the parent title.

      Parent task:
      ${JSON.stringify({
        title: task.title,
        description: task.description,
        parentTask: task.parent?.title,
      })}

      Existing subtasks:
      ${JSON.stringify(task.subTasks.map((item) => item.title))}

      Previous generation titles:
      ${JSON.stringify(history.flatMap((entry) => entry.titles))}

      Variation seed: ${variationSeed}
      `
    );

    const aiCandidates = Array.isArray((aiPayload as { subtasks?: unknown[] })?.subtasks)
      ? ((aiPayload as { subtasks: Array<Record<string, unknown>> }).subtasks ?? []).map((candidate) => {
          const title = String(candidate.title ?? '').trim();
          const description = String(candidate.description ?? '').trim();
          return {
            title,
            description,
            priority: (String(candidate.priority ?? 'MEDIUM').toUpperCase() as GeneratedSubtask['priority']),
            estimatedTime: Math.max(15, Math.min(8 * 60, Number(candidate.estimatedTime ?? 45))),
            semanticHash: titleFingerprint(title, description),
          };
        }).filter((candidate) => candidate.title && candidate.description)
      : [];

    const fallbackCandidates = buildFallbackSubtasks(task, variationSeed);
    const chosenCandidates = aiCandidates.length > 0 ? aiCandidates : fallbackCandidates;
    const subtasks = dedupeCandidates(
      chosenCandidates,
      existingFingerprints,
      historicalFingerprints,
      Boolean(options.regeneration)
    ).slice(0, 7);

    return {
      subtasks,
      history,
    };
  }
}

export default SubtaskGenerator;
