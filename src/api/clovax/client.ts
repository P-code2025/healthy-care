import { v4 as uuidv4 } from 'uuid';

export interface ClovaMessage {
  role: 'system' | 'user' | 'assistant';
  content: { type: 'text'; text: string }[];
}

export interface ClovaCompletionRequest {
  messages: ClovaMessage[];
  topP: number;
  temperature: number;
  repetitionPenalty: number;
  maxTokens: number;
  includeAiFilters: boolean;
  stop: string[];
  seed: number;
}

export class ClovaXClient {
  private appId: string;
  private endpoint: string;

  constructor(appId: string) {
    this.appId = appId;
    this.endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clova-proxy/chat-completions/${appId}`;
  }

  createRequest(messages: ClovaMessage[]): ClovaCompletionRequest {
    return {
      messages,
      topP: 0.8,
      temperature: 0.5,
      repetitionPenalty: 1.1,
      maxTokens: 4091, 
      includeAiFilters: true,
      stop: [],
      seed: 0,
    };
  }

  async createChatCompletion(request: ClovaCompletionRequest) {
    const requestId = uuidv4();

    if (import.meta.env.DEV) {
      console.log("CLOVA Request URL:", this.endpoint);
      console.log("Request ID:", requestId);
      console.log("Body length:", JSON.stringify(request).length);
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NCP-CLOVASTUDIO-REQUEST-ID': requestId,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Clova API Error: ${response.status} ${error}`);
    }

    return response.json();
  }
}
