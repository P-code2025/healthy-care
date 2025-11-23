export interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
}


export class ChatContextManager {
    private history: ChatMessage[] = [];
    private readonly maxHistory: number;
    private topics: string[] = [];
    private lastIntent?: string;

    constructor(maxHistory: number = 10) {
        this.maxHistory = maxHistory;
    }


    addMessage(message: ChatMessage): void {
        this.history.push(message);

        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
        }

        this.extractTopics(message.content);
    }


    getContext(count: number = 5): string {
        const recentMessages = this.history.slice(-count);

        if (recentMessages.length === 0) {
            return '';
        }

        return recentMessages
            .map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.content}`)
            .join('\n');
    }

    getRecentMessages(count: number = 5): ChatMessage[] {
        return this.history.slice(-count);
    }

    clear(): void {
        this.history = [];
        this.topics = [];
        this.lastIntent = undefined;
    }


    getMessageCount(): number {
        return this.history.length;
    }


    hasRecentTopic(keywords: string[], withinLast: number = 3): boolean {
        const recentMessages = this.history.slice(-withinLast);

        return recentMessages.some(msg =>
            keywords.some(keyword =>
                msg.content.toLowerCase().includes(keyword.toLowerCase())
            )
        );
    }

    getRecentTopics(count: number = 5): string[] {
        return this.topics.slice(-count);
    }


    setLastIntent(intent: string): void {
        this.lastIntent = intent;
    }


    getLastIntent(): string | undefined {
        return this.lastIntent;
    }


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
                if (this.topics.length > 20) {
                    this.topics.shift();
                }
            }
        }
    }
}

let contextManagerInstance: ChatContextManager | null = null;


export function getChatContextManager(): ChatContextManager {
    if (!contextManagerInstance) {
        contextManagerInstance = new ChatContextManager();
    }
    return contextManagerInstance;
}


export function resetChatContext(): void {
    if (contextManagerInstance) {
        contextManagerInstance.clear();
    }
}
