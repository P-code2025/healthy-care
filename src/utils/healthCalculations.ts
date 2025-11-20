// src/utils/healthCalculations.ts

/**
 * Calculate BMI (Body Mass Index)
 * @param weightKg - Weight in kilograms
 * @param heightCm - Height in centimeters
 * @returns BMI value
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
    if (!weightKg || !heightCm || heightCm === 0) return 0;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
};

/**
 * Get BMI category and color
 */
export const getBMICategory = (bmi: number): { category: string; color: string; message: string } => {
    if (bmi < 18.5) {
        return {
            category: 'Underweight',
            color: '#60a5fa',
            message: 'Below healthy range'
        };
    } else if (bmi < 25) {
        return {
            category: 'Normal',
            color: '#34d399',
            message: 'Healthy weight'
        };
    } else if (bmi < 30) {
        return {
            category: 'Overweight',
            color: '#fbbf24',
            message: 'Above healthy range'
        };
    } else {
        return {
            category: 'Obese',
            color: '#f87171',
            message: 'Significantly above healthy range'
        };
    }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * Using Mifflin-St Jeor Equation
 */
export const calculateTDEE = (params: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: string;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}): number => {
    const { weightKg, heightCm, age, gender, activityLevel = 'moderate' } = params;

    // BMR calculation (Mifflin-St Jeor)
    let bmr: number;
    if (gender.toLowerCase() === 'nam' || gender.toLowerCase() === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
        sedentary: 1.2,      // Little to no exercise
        light: 1.375,        // Light exercise 1-3 days/week
        moderate: 1.55,      // Moderate exercise 3-5 days/week
        active: 1.725,       // Heavy exercise 6-7 days/week
        very_active: 1.9     // Very heavy exercise, physical job
    };

    return Math.round(bmr * activityMultipliers[activityLevel]);
};

/**
 * Calculate daily calorie goal based on weight goal
 */
export const calculateCalorieGoal = (params: {
    tdee: number;
    goalType: 'lose' | 'maintain' | 'gain';
    aggressive?: boolean;  // For faster results
}): number => {
    const { tdee, goalType, aggressive = false } = params;

    switch (goalType) {
        case 'lose':
            // Moderate: -500 kcal/day ≈ 0.5kg/week
            // Aggressive: -750 kcal/day ≈ 0.75kg/week
            return Math.round(tdee - (aggressive ? 750 : 500));
        case 'gain':
            // Moderate: +300 kcal/day ≈ 0.3kg/week
            // Aggressive: +500 kcal/day ≈ 0.5kg/week
            return Math.round(tdee + (aggressive ? 500 : 300));
        case 'maintain':
        default:
            return tdee;
    }
};

/**
 * Determine goal type from current and target weight
 */
export const determineGoalType = (currentWeight: number, targetWeight: number): 'lose' | 'maintain' | 'gain' => {
    const diff = targetWeight - currentWeight;
    if (diff < -2) return 'lose';
    if (diff > 2) return 'gain';
    return 'maintain';
};
