import type { ClovaCompletionRequest, ClovaCompletionResponse } from "../../lib/types";


/**
 * ClovaX API Client
 * Handles communication with Naver's ClovaX Chat Completions V3 API
 */
export class ClovaXClient {
  private apiKey: string;
  private endpoint: string;

  constructor(modelOverride?: string) {
    this.apiKey = import.meta.env.VITE_NCP_API_KEY || "";
    this.endpoint = "/api/clova/v3/chat-completions/HCX-005";



    // Allow overriding the model in the endpoint (e.g., for HCX-005 vision model)
    if (modelOverride && this.endpoint) {
      this.endpoint = this.endpoint.replace(/HCX-[^/]+$/, modelOverride);
    }

    if (!this.apiKey || !this.endpoint) {
      throw new Error(
        "Missing required environment variables: NCP_API_KEY, NCP_CLOVASTUDIO_ENDPOINT"
      );
    }
  }

  /**
   * Generate a unique request ID for tracking
   */
  private generateRequestId(): string {
    return crypto.randomUUID().replace(/-/g, "");
  }

  /**
   * Send a chat completion request to ClovaX
   * @param request The completion request with messages and tools
   * @returns The completion response from ClovaX
   */
  async createChatCompletion(
    request: ClovaCompletionRequest
  ): Promise<ClovaCompletionResponse> {
    try {
      const requestId = this.generateRequestId();

      const requestBody = JSON.stringify(request);

      console.log("=== ACTUAL REQUEST BEING SENT ===");
      console.log("URL:", this.endpoint);
      console.log("Headers:", {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey.substring(0, 10)}...`,
        "X-NCP-CLOVASTUDIO-REQUEST-ID": requestId,
      });
      console.log("Body length:", requestBody.length);
      console.log("Body (first 500 chars):", requestBody.substring(0, 500));

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "X-NCP-CLOVASTUDIO-REQUEST-ID": requestId,
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("ERROR Response:", errorText);
        throw new Error(
          `ClovaX API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: ClovaCompletionResponse = await response.json();

      // Check for API-level errors
      if (data.status.code !== "20000") {
        throw new Error(
          `ClovaX API returned error: ${data.status.code} - ${data.status.message}`
        );
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to call ClovaX API: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Helper method to create a basic chat request with default parameters
   * @param messages Array of messages
   * @param tools Optional array of tools for function calling
   * @returns Completion request object
   */
  createRequest(
    messages: ClovaCompletionRequest["messages"],
    tools?: ClovaCompletionRequest["tools"]
  ): ClovaCompletionRequest {
    const hasTools = tools && tools.length > 0;

    // When using tools, maxTokens is not allowed according to API error
    const request: ClovaCompletionRequest = {
      messages,
      temperature: 0.7,
      topP: 0.8,
      repetitionPenalty: 1.2,
      includeAiFilters: true,
    };

    if (hasTools) {
      request.tools = tools;
      request.toolChoice = "auto";
    } else {
      request.max_tokens = 1000;
    }

    return request;
  }
}
