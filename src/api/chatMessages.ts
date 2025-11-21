// Chat Messages API Client
import { http } from '../services/http';

export interface ChatMessage {
    id: number;
    userId: number;
    role: 'user' | 'assistant';
    content: string;
    intent?: string | null;
    nutritionData?: any;
    exercisePlan?: any;
    createdAt: string;
}

export interface CreateChatMessageRequest {
    role: 'user' | 'assistant';
    content: string;
    intent?: string;
    nutritionData?: any;
    exercisePlan?: any;
}

export const chatMessagesApi = {
    /**
     * Get user's chat message history
     */
    async list(params?: { limit?: number; before?: string }): Promise<ChatMessage[]> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.before) queryParams.set('before', params.before);

        const queryString = queryParams.toString();
        const path = `/api/chat-messages${queryString ? `?${queryString}` : ''}`;

        const response = await http.get<{ messages: ChatMessage[] }>(path);
        return response.messages;
    },

    /**
     * Save a new chat message
     */
    async create(data: CreateChatMessageRequest): Promise<ChatMessage> {
        const response = await http.post<{ message: ChatMessage }>(
            '/api/chat-messages',
            data
        );
        return response.message;
    },
};
