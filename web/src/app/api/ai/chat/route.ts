import { NextRequest, NextResponse } from "next/server";
import { ollamaClient } from "@/ai/ollama";

// --- Types & Configuration ---

const MODELS = {
    ROUTER: "llama3.2:3b",
    REASONER: "qwen2.5:7b",
    CODER: "deepseek-coder:6.7b",
    DEFAULT: "phi3:mini"
};

interface ChatRequestBody {
    prompt: string;
    context?: any;
    mode?: string;
}

// --- Orchestration Logic ---

async function detectIntent(prompt: string) {
    const routingPrompt = `
    Analyze the following user prompt for a project management system.
    Identify the primary intent and the required specialized agent.
    
    USER PROMPT: "${prompt}"
    
    INTENTS:
    1. PLANNING: Creating sprints, roadmaps, or breaking down tasks. (Agent: Project Intelligence)
    2. RISK: Identifying delays, bottlenecks, or delivery issues. (Agent: Risk Intelligence)
    3. ANALYTICS: Summarizing KPIs, generating reports, or insights. (Agent: Analytics Agent)
    4. AUTOMATION: Creating triggers, workflows, or auto-actions. (Agent: Automation Agent)
    5. CODING: Generating SQL, scripts, API logic, or debugging. (Agent: Developer Agent)
    6. CHAT: General conversation or questions. (Agent: Default)
    
    Return ONLY a JSON object:
    { "intent": "INTENT_NAME", "agent": "AGENT_NAME", "requires_tools": true/false }
    `;

    try {
        const response = await ollamaClient.generate(routingPrompt, MODELS.ROUTER, { temperature: 0.1 });
        const cleanContent = response.response.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanContent);
    } catch (e) {
        return { intent: "CHAT", agent: "Default", requires_tools: false };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
        if (!body?.prompt) {
            return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
        }

        // 1. INTENT DETECTION & ROUTING
        const { intent, agent, requires_tools } = await detectIntent(body.prompt);

        // 2. MODEL SELECTION
        let selectedModel = MODELS.REASONER;
        if (intent === "CODING") selectedModel = MODELS.CODER;
        if (intent === "CHAT") selectedModel = MODELS.DEFAULT;

        // 3. EXECUTE REASONING
        const systemPrompt = `You are the Stroovo ${agent}. You are part of an Enterprise AI Workforce Operating System.
        Your goal is to ${intent.toLowerCase()} for the user. 
        Context: ${JSON.stringify(body.context || {})}
        
        If an action is required, specify the tool to call.
        `;

        const response = await ollamaClient.generate(
            `${systemPrompt}\n\nUser Question: ${body.prompt}`,
            selectedModel,
            { temperature: 0.4, max_tokens: 2000 }
        );

        // 4. TOOL CALL EXTRACTION (Simplified for now)
        // In a real system, we'd use structured output or regex to detect tool calls.

        return NextResponse.json({
            success: true,
            data: {
                model: selectedModel,
                content: response.response.trim(),
                intent,
                agent,
                requires_tools,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("Error in AI Orchestration:", error);
        return NextResponse.json(
            { error: "Neural Orchestrator failed to process request.", details: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}
