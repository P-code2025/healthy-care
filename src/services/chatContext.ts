// Conversation Context Manager for AI Chat

export interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
}

/**
 * Manages conversation context for AI interactions
 * Stores recent messages to provide context for better responses
 */
export class ChatContextManager {
    private history: ChatMessage[] = [];
    private readonly maxHistory: number;
    private topics: string[] = [];
    private lastIntent?: string;

    constructor(maxHistory: number = 10) {
        this.maxHistory = maxHistory;
    }

    /**
     * Add a message to the conversation history
     */
    addMessage(message: ChatMessage): void {
        this.history.push(message);

        // Keep only the most recent messages
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
        }

        // Extract topics from message
        this.extractTopics(message.content);
    }

    /**
     * Get context from recent messages (default: last 5)
     */
    getContext(count: number = 5): string {
        const recentMessages = this.history.slice(-count);

        if (recentMessages.length === 0) {
            return '';
        }

        return recentMessages
            .map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.content}`)
            .join('\n');
    }

    /**
     * Get recent messages as structured data
     */
    getRecentMessages(count: number = 5): ChatMessage[] {
        return this.history.slice(-count);
    }

    /**
     * Clear all conversation history
     */
    clear(): void {
        this.history = [];
        this.topics = [];
        this.lastIntent = undefined;
    }

    /**
     * Get total message count
     */
    getMessageCount(): number {
        return this.history.length;
    }

    /**
     * Check if user has asked about a topic recently
     */
    hasRecentTopic(keywords: string[], withinLast: number = 3): boolean {
        const recentMessages = this.history.slice(-withinLast);

        return recentMessages.some(msg =>
            keywords.some(keyword =>
                msg.content.toLowerCase().includes(keyword.toLowerCase())
            )
        );
    }

    /**
     * Get recent topics discussed
     */
    getRecentTopics(count: number = 5): string[] {
        return this.topics.slice(-count);
    }

    /**
     * Set the last detected intent
     */
    setLastIntent(intent: string): void {
        this.lastIntent = intent;
    }

    /**
     * Get the last detected intent
     */
    getLastIntent(): string | undefined {
        return this.lastIntent;
    }

    /**
     * Extract and track topics from message
     */
    private extractTopics(content: string): void {
        const normalized = content.toLowerCase();
        const topicKeywords = [
            'workout', 'exercise', 'plan', 'training',
            'food', 'meal', 'diet', 'nutrition',
            'calorie', 'protein', 'carbs', 'macro',
            'weight', 'progress', 'goal',
            'tired', 'motivation', 'energy'
        ];

        for (const keyword of topicKeywords) {
            if (normalized.includes(keyword) && !this.topics.includes(keyword)) {
                this.topics.push(keyword);
                // Keep only last 20 topics
                if (this.topics.length > 20) {
                    this.topics.shift();
                }
            }
        }
    }
}

// Singleton instance for global use
let contextManagerInstance: ChatContextManager | null = null;

/**
 * Get or create the global context manager
 */
export function getChatContextManager(): ChatContextManager {
    if (!contextManagerInstance) {
        contextManagerInstance = new ChatContextManager();
    }
    return contextManagerInstance;
}

/**
 * Reset the global context manager
 */
export function resetChatContext(): void {
    if (contextManagerInstance) {
        contextManagerInstance.clear();
    }
}
