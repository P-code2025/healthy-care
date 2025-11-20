// src/services/api/workoutApi.ts
import { http } from '../http';

export interface WorkoutLog {
    id: string;
    date: string; // YYYY-MM-DD
    workoutName: string;
    duration: number; // minutes
    caloriesBurned: number;
    exercises: string[]; // List of exercises
    completedAt: string; // ISO timestamp
}

export interface ProgressStats {
    currentStreak: number;
    longestStreak: number;
    totalWorkouts: number;
    totalMinutes: number;
    totalCaloriesBurned: number;
    weeklyWorkouts: number;
    weeklyMinutes: number;
    weeklyCalories: number;
    lastWorkoutDate: string | null;
}

export interface Milestone {
    id: string;
    type: 'streak' | 'workouts' | 'calories' | 'minutes';
    title: string;
    description: string;
    icon: string;
    achievedAt: string;
    value: number;
}

/**
 * Log a completed workout
 */
export const logWorkout = async (workout: {
    date: string;
    workoutName: string;
    duration: number;
    caloriesBurned: number;
    exercises?: string[];
}): Promise<void> => {
    await http.post('/api/workout-log', {
        completedAt: new Date(workout.date).toISOString(),
        exerciseName: workout.workoutName,
        durationMinutes: workout.duration,
        caloriesBurnedEstimated: workout.caloriesBurned,
        isAiSuggested: false
    });
};

/**
 * Get workout progress stats
 */
export const getWorkoutStats = async (): Promise<ProgressStats> => {
    const response = await http.get<ProgressStats>('/api/workouts/stats');
    return response.data;
};

/**
 * Get all workout logs
 */
export const getWorkoutLogs = async (): Promise<any[]> => {
    const response = await http.get('/api/workout-log');
    return response.data;
};
