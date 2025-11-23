import { http } from './http';

export interface WorkoutLog {
    id: string;
    date: string; 
    workoutName: string;
    duration: number;
    caloriesBurned: number;
    exercises: string[]; 
    completedAt: string; 
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

export const saveWorkoutLog = async (workout: Omit<WorkoutLog, 'id' | 'completedAt'>): Promise<void> => {
    await http.post('/api/workout-log', {
        exerciseName: workout.workoutName,                
        caloriesBurnedEstimated: workout.caloriesBurned,
        durationMinutes: workout.duration,              
        completedAt: new Date().toISOString(),         
        isAiSuggested: false, 
    });
};


export const getProgressStats = async (): Promise<ProgressStats> => {
    try {
        const stats = await http.request<ProgressStats>('/api/workouts/stats', {
            method: 'GET'
        });
        return stats;
    } catch (error) {
        console.error('Failed to get progress stats:', error);
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
