interface ErrorMessageConfig {
    title: string;
    message: string;
    action?: string;
    retryable?: boolean;
}

const ERROR_MESSAGES: Record<string, ErrorMessageConfig> = {
    NETWORK_ERROR: {
        title: "Connection Issue",
        message: "Please check your internet connection and try again.",
        action: "Retry",
        retryable: true,
    },
    TIMEOUT: {
        title: "Request Timeout",
        message: "The request took too long. Please try again.",
        action: "Retry",
        retryable: true,
    },

    INVALID_CREDENTIALS: {
        title: "Login Failed",
        message: "The email or password you entered is incorrect. Please try again.",
        action: "Try Again",
    },
    EMAIL_EXISTS: {
        title: "Email Already Registered",
        message: "An account with this email already exists. Try logging in instead.",
        action: "Go to Login",
    },
    WEAK_PASSWORD: {
        title: "Weak Password",
        message: "Password must be at least 6 characters long and include letters and numbers.",
    },
    PASSWORDS_MISMATCH: {
        title: "Passwords Don't Match",
        message: "The passwords you entered don't match. Please try again.",
    },
    INVALID_EMAIL: {
        title: "Invalid Email",
        message: "Please enter a valid email address.",
    },

    ONBOARDING_SAVE_ERROR: {
        title: "Unable to Save",
        message: "We couldn't save your information. Please check your connection and try again.",
        action: "Retry",
        retryable: true,
    },
    ONBOARDING_VERIFICATION_ERROR: {
        title: "Verification Failed",
        message: "We couldn't verify your onboarding data. Please complete all steps and try again.",
    },

    PROFILE_UPDATE_ERROR: {
        title: "Update Failed",
        message: "We couldn't update your profile. Please try again.",
        action: "Retry",
        retryable: true,
    },

    INVALID_INPUT: {
        title: "Invalid Input",
        message: "Please check your input and try again.",
    },
    MISSING_REQUIRED_FIELDS: {
        title: "Missing Information",
        message: "Please fill in all required fields.",
    },

    UNKNOWN_ERROR: {
        title: "Something Went Wrong",
        message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
        action: "Try Again",
        retryable: true,
    },
};

export const getErrorMessage = (error: unknown): ErrorMessageConfig => {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes("network") || message.includes("failed to fetch")) {
            return ERROR_MESSAGES.NETWORK_ERROR;
        }
        if (message.includes("timeout")) {
            return ERROR_MESSAGES.TIMEOUT;
        }
        if (message.includes("invalid credentials") || message.includes("unauthorized")) {
            return ERROR_MESSAGES.INVALID_CREDENTIALS;
        }
        if (message.includes("email already") || message.includes("already registered")) {
            return ERROR_MESSAGES.EMAIL_EXISTS;
        }
        if (message.includes("password") && message.includes("weak")) {
            return ERROR_MESSAGES.WEAK_PASSWORD;
        }

        if (error.message.length < 100 && !error.message.includes("Error:")) {
            return {
                title: "Error",
                message: error.message,
            };
        }
    }

    if (typeof error === "string") {
        const errorKey = error.toUpperCase().replace(/\s+/g, "_");
        if (ERROR_MESSAGES[errorKey]) {
            return ERROR_MESSAGES[errorKey];
        }
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const formatErrorForDisplay = (
    error: unknown,
    context?: string
): ErrorMessageConfig => {
    const errorConfig = getErrorMessage(error);

    if (context) {
        return {
            ...errorConfig,
            message: `${context}: ${errorConfig.message}`,
        };
    }

    return errorConfig;
};

export const validateEmail = (email: string): string | null => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/[a-zA-Z]/.test(password)) return "Password must contain letters";
    if (!/[0-9]/.test(password)) return "Password must contain numbers";
    return null;
};

export const validatePasswordMatch = (
    password: string,
    confirmPassword: string
): string | null => {
    if (password !== confirmPassword) return "Passwords don't match";
    return null;
};

export const getPasswordStrength = (password: string): {
    strength: "weak" | "medium" | "strong";
    score: number;
} => {
    let score = 0;
    if (!password) return { strength: "weak", score: 0 };

    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (password.length >= 14) score += 1;

    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score < 3) return { strength: "weak", score };
    if (score < 5) return { strength: "medium", score };
    return { strength: "strong", score };
};
