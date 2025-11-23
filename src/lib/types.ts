export type MessageContent = string | ContentPart[];

export interface ContentPart {
  type: "text" | "image_url";
  text?: string; 
  imageUrl?: {
    url: string;
  };
  dataUri?: {
    data: string;
  };
}

export interface ClovaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: MessageContent;
  toolCallId?: string; 
  toolCalls?: ToolCall[]; 
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: Record<string, any>;
  };
}

export interface Tool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, ToolParameter>;
      required?: string[];
    };
  };
}

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  enum?: string[];
  items?: {
    type: string;
  };
}

export interface ClovaCompletionRequest {
  messages: ClovaMessage[];
  tools?: Tool[];
  toolChoice?: "auto" | "none" | { type: "function"; function: { name: string } };
  topP?: number;
  topK?: number;
  max_tokens?: number;
  temperature?: number;
  repetitionPenalty?: number;
  stop?: string[];
  includeAiFilters?: boolean;
  seed?: number;
}

export interface ClovaCompletionResponse {
  status: {
    code: string;
    message: string;
  };
  result: {
    message: ClovaMessage;
    finishReason: "stop" | "length" | "tool_calls";
    created: number;
    seed: number;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

export interface NewsSearchParams {
  query: string;
  fromDate?: string;
  toDate?: string;
  language?: string;
  sortBy?: "relevancy" | "popularity" | "publishedAt";
}

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}


export interface FoodItem {
  name: string;
  grams?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}


export interface AnalysisResult {
  foodName: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  base100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
  };
  baseAmount?: number;
}

export interface FoodEntry {
  id: string;
  date: string;
  time: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodName: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  status: 'Energized' | 'Quite Satisfied' | 'Satisfied' | 'Guilty' | 'Uncomfortable';
  thoughts?: string;
  imageUrl?: string;
  imageAttribution?: string;
}