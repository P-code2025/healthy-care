// src/api/clovax/client.ts
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
  private apiKey: string;
  private appId: string;
  private endpoint: string;

  constructor(appId: string) {
    this.appId = appId;
    this.apiKey = import.meta.env.VITE_NCP_API_KEY || "";
    this.endpoint = "/api/clova/v3/chat-completions/HCX-005";
  }

  createRequest(messages: ClovaMessage[]): ClovaCompletionRequest {
    return {
      messages,
      topP: 0.8,
      temperature: 0.5,
      repetitionPenalty: 1.1,
      maxTokens: 4091, // Maximum tokens supported by CLOVA X
      includeAiFilters: true,
      stop: [],
      seed: 0,
    };
  }

  async createChatCompletion(request: ClovaCompletionRequest) {
    const requestId = uuidv4();
    const url = `/api/clova/v3/chat-completions/${this.appId}`;

    console.log("URL:", url);
    console.log("Headers:", {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-NCP-CLOVASTUDIO-REQUEST-ID': requestId
    });
    console.log("Body length:", JSON.stringify(request).length);
    console.log("Body (first 500 chars):", JSON.stringify(request).slice(0, 500));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
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
