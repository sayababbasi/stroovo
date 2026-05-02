import { NextRequest, NextResponse } from "next/server";
import { ollamaClient } from "@/ai/ollama";

interface ChatRequestBody {
  prompt?: string;
  model?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const prompt = body.prompt?.trim();
    const model = body.model?.trim() || "phi3:mini";

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    if (prompt.length > 4000) {
      return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });
    }

    if (model.length > 100) {
      return NextResponse.json({ error: "Model name is invalid." }, { status: 400 });
    }

    const response = await ollamaClient.generate(prompt, model, {
      temperature: 0.6,
      max_tokens: 1200,
    });

    return NextResponse.json({
      success: true,
      data: {
        model: response.model,
        content: response.response.trim(),
        createdAt: response.created_at,
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/chat:", error);

    return NextResponse.json(
      {
        error: "Failed to generate AI response.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to chat with the assistant." },
    { status: 405 },
  );
}
