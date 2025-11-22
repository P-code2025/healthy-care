// src/services/progressTracker.ts
import { http } from './http';

export interface WorkoutLog {
    id: string;
    date: string; // YYYY-MM-DD
    workoutName: string;
    duration: number; // minutes
    caloriesBurned: number;
    exercises: string[]; // List of exercises completed
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
 * Save workout log to database via API
 */
export const saveWorkoutLog = async (workout: Omit<WorkoutLog, 'id' | 'completedAt'>): Promise<void> => {
    await http.post('/api/workout-log', {
        exerciseName: workout.workoutName,                // ← sửa
        caloriesBurnedEstimated: workout.caloriesBurned, // ← sửa
        durationMinutes: workout.duration,               // ← sửa
        completedAt: new Date().toISOString(),          // ← sửa
        isAiSuggested: false, // hoặc true nếu là AI plan
    });
};


/**
 * Get progress stats from API
 */
export const getProgressStats = async (): Promise<ProgressStats> => {
    try {
        const stats = await http.request<ProgressStats>('/api/workouts/stats', {
            method: 'GET'
        });
        return stats;
    } catch (error) {
        console.error('Failed to get progress stats:', error);
        // Return default stats on error
        return {
            currentStreak: 0,
            longestStreak: 0,
            totalWorkouts: 0,
            totalMinutes: 0,
            totalCaloriesBurned: 0,
            weeklyWorkouts: 0,
            weeklyMinutes: 0,
            weeklyCalories: 0,
            lastWorkoutDate: null
        };
    }
};
