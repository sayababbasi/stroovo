export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaError {
  error: string;
}

export interface OllamaModel {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434') {
    this.baseUrl = baseUrl;
  }

  async generate(
    prompt: string,
    model: string,
    options: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<OllamaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: options.stream || false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorData: OllamaError = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Ollama client error:', error);
      throw new Error(`Failed to call Ollama API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.statusText}`);
      }
      const data = (await response.json()) as { models?: OllamaModel[] };
      return data.models || [];
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      throw error;
    }
  }

  async pullModel(model: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: model }),
      });
      if (!response.ok) {
        throw new Error(`Failed to pull model ${model}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error pulling model ${model}:`, error);
      throw error;
    }
  }

  async isModelAvailable(model: string): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.some((candidate) => candidate.name === model || candidate.name.startsWith(model));
    } catch (error) {
      console.error('Error checking model availability:', error);
      return false;
    }
  }
}

export const ollamaClient = new OllamaClient();
