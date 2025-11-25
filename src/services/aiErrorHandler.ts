// AI Error Handling System

export type AIErrorType = 'network' | 'timeout' | 'invalid_input' | 'api_limit' | 'server_error' | 'unknown';

export class AIError extends Error {
    public type: AIErrorType;
    public retryable: boolean;
    public originalError?: any;

    constructor(
        type: AIErrorType,
        message: string,
        retryable: boolean = false,
        originalError?: any
    ) {
        super(message);
        this.name = 'AIError';
        this.type = type;
        this.retryable = retryable;
        this.originalError = originalError;
    }
}

export interface ErrorAction {
    message: string;
    action?: string;
    retryable: boolean;
}

/**
 * Handle AI errors and return user-friendly messages
 */
export function handleAIError(error: any): ErrorAction {
    // Handle AIError instances
    if (error instanceof AIError) {
        switch (error.type) {
            case 'network':
                return {
                    message: 'Network error. Please check your internet connection.',
                    action: 'Retry',
                    retryable: true
                };

            case 'timeout':
                return {
                    message: 'AI response timed out. The server might be busy.',
                    action: 'Try again',
                    retryable: true
                };

            case 'api_limit':
                return {
                    message: 'AI usage limit reached. Please try again in a few minutes.',
                    action: undefined,
                    retryable: false
                };

            case 'invalid_input':
                return {
                    message: error.message || 'Invalid input data. Please check your profile.',
                    action: 'Update Profile',
                    retryable: false
                };

            case 'server_error':
                return {
                    message: 'Server error. Our team has been notified.',
                    action: 'Try again later',
                    retryable: true
                };

            default:
                return {
                    message: error.message || 'Something went wrong with AI processing.',
                    action: 'Retry',
                    retryable: true
                };
        }
    }

    // Handle fetch/network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
            message: 'Network error. Please check your connection.',
            action: 'Retry',
            retryable: true
        };
    }

    // Handle HTTP errors
    if (error.status) {
        if (error.status === 401) {
            return {
                message: 'Authentication failed. Please log in again.',
                action: 'Log In',
                retryable: false
            };
        }

        if (error.status === 429) {
            return {
                message: 'Too many requests. Please wait a moment.',
                action: undefined,
                retryable: false
            };
        }

        if (error.status >= 500) {
            return {
                message: 'Server error occurred. Please try again.',
                action: 'Retry',
                retryable: true
            };
        }
    }

    // Generic error
    return {
        message: error.message || 'An unexpected error occurred.',
        action: 'Retry',
        retryable: true
    };
}

/**
 * Wrap AI function calls with error handling
 */
export async function withAIErrorHandling<T>(
    fn: () => Promise<T>,
    context: string = 'AI operation'
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error(`[AI Error] ${context}:`, error);
        }

        // Re-throw as AIError if not already
        if (error instanceof AIError) {
            throw error;
        }

        // Convert to AIError
        throw new AIError(
            'unknown',
            `Failed to complete ${context}`,
            true,
            error
        );
    }
}

/**
 * Log AI errors for analytics
 */
export function logAIError(error: AIError, context: string) {
    if (import.meta.env.DEV) {
        console.error('[AI Error Log]', {
            type: error.type,
            message: error.message,
            context,
            retryable: error.retryable,
            timestamp: new Date().toISOString()
        });
    }

    // TODO: Send to analytics service
    // analytics.track('ai_error', { ... });
}
