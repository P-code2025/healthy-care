// Auto-retry utility with exponential backoff

export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2,
    onRetry: () => { }
};

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: any;

    for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on last attempt
            if (attempt === opts.maxRetries - 1) {
                break;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
                opts.maxDelay
            );

            // Notify retry callback
            opts.onRetry(attempt + 1, error);

            if (import.meta.env.DEV) {
                console.log(`[Retry] Attempt ${attempt + 1}/${opts.maxRetries} failed. Retrying in ${delay}ms...`);
            }

            // Wait before retrying
            await sleep(delay);
        }
    }

    // All retries failed
    throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return true;
    }

    // Timeout errors are retryable
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        return true;
    }

    // 5xx server errors are retryable
    if (error.status && error.status >= 500 && error.status < 600) {
        return true;
    }

    // 429 Too Many Requests might be retryable after delay
    if (error.status === 429) {
        return true;
    }

    // Check retryable property from AIError
    if (error.retryable !== undefined) {
        return error.retryable;
    }

    return false;
}

/**
 * Retry only if error is retryable
 */
export async function retryIfRetryable<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    return retryWithBackoff(fn, {
        ...options,
        maxRetries: options.maxRetries || 2,
        onRetry: (attempt, error) => {
            if (!isRetryableError(error)) {
                throw error; // Stop retrying if not retryable
            }
            options.onRetry?.(attempt, error);
        }
    });
}
