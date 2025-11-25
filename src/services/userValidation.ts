// User Profile Validation for AI Features

export interface ValidationResult {
    isValid: boolean;
    missing: string[];
    message: string;
}

export interface AIUserProfile {
    age?: number | null;
    weight_kg?: number | null;
    height_cm?: number | null;
    gender?: string | null;
    goal?: string | null;
}

/**
 * Validates user profile for AI features
 * Ensures all required fields are present and valid
 */
export function validateProfileForAI(user: AIUserProfile | null): ValidationResult {
    if (!user) {
        return {
            isValid: false,
            missing: ['profile'],
            message: 'Please complete your profile to use AI features'
        };
    }

    const missing: string[] = [];

    // Age validation
    if (!user.age || user.age < 13 || user.age > 120) {
        missing.push('age');
    }

    // Weight validation
    if (!user.weight_kg || user.weight_kg < 20 || user.weight_kg > 300) {
        missing.push('weight');
    }

    // Height validation
    if (!user.height_cm || user.height_cm < 100 || user.height_cm > 250) {
        missing.push('height');
    }

    // Gender validation
    if (!user.gender) {
        missing.push('gender');
    }

    // Goal validation
    if (!user.goal) {
        missing.push('goal');
    }

    const isValid = missing.length === 0;

    return {
        isValid,
        missing,
        message: isValid
            ? 'Profile is complete for AI features'
            : `Please complete your profile: ${missing.join(', ')}`
    };
}

/**
 * Get user-friendly field names
 */
export function getFieldDisplayName(field: string): string {
    const displayNames: Record<string, string> = {
        age: 'Age',
        weight: 'Weight',
        height: 'Height',
        gender: 'Gender',
        goal: 'Fitness Goal'
    };
    return displayNames[field] || field;
}

/**
 * Format validation message for display
 */
export function formatValidationMessage(result: ValidationResult): string {
    if (result.isValid) {
        return result.message;
    }

    const fields = result.missing
        .map(field => getFieldDisplayName(field))
        .join(', ');

    return `Complete your profile to use AI features: ${fields}`;
}
