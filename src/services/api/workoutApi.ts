import { http } from '../http';

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



export const getWorkoutStats = async (): Promise<ProgressStats> => {
    const response = await http.get('/api/workouts/stats');
    return response.data;
};


export const getWorkoutLogs = async (): Promise<any[]> => {
    const response = await http.get('/api/workout-log');
    return response.data;
};


export const logWorkout = async (data: {
  workoutName: string;
  duration: number;
  caloriesBurned: number;
  date?: string;
}) => {
  await http.post('/api/workout-log', {
    exerciseName: data.workoutName,
    durationMinutes: data.duration,
    caloriesBurnedEstimated: data.caloriesBurned,
    completedAt: data.date || new Date().toISOString(),
  });
};