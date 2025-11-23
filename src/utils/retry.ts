export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    onRetry: () => { }
};

/**
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

            if (attempt === opts.maxRetries - 1) {
                break;
            }

            const delay = Math.min(
                opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
                opts.maxDelay
            );

            opts.onRetry(attempt + 1, error);

            if (import.meta.env.DEV) {
                console.log(`[Retry] Attempt ${attempt + 1}/${opts.maxRetries} failed. Retrying in ${delay}ms...`);
            }

            await sleep(delay);
        }
    }

    throw lastError;
}


function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export function isRetryableError(error: any): boolean {
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return true;
    }

    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        return true;
    }

    if (error.status && error.status >= 500 && error.status < 600) {
        return true;
    }

    if (error.status === 429) {
        return true;
    }

    if (error.retryable !== undefined) {
        return error.retryable;
    }

    return false;
}


export async function retryIfRetryable<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    return retryWithBackoff(fn, {
        ...options,
        maxRetries: options.maxRetries || 2,
        onRetry: (attempt, error) => {
            if (!isRetryableError(error)) {
                throw error; 
            }
            options.onRetry?.(attempt, error);
        }
    });
}
