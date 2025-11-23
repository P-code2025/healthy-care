import { BaseTool, type ToolParameter, type ToolContext, type ToolResult } from './base';


interface WorkoutLogInput {
    completedAt: string;
    exerciseName: string;
    durationMinutes: number;
    caloriesBurnedEstimated: number;
    isAiSuggested?: boolean;
}

const workoutApi = {
    async create(userId: number, data: WorkoutLogInput) {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/workout-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, userId }),
        });
        if (!response.ok) throw new Error('Failed to create workout log');
        return response.json();
    },
};

export class SaveWorkoutLogTool extends BaseTool {
    name = 'save_workout_log';
    description = 'Log a completed workout session';
    category = 'workout' as const;

    parameters: ToolParameter[] = [
        {
            name: 'exerciseName',
            type: 'string',
            description: 'Name of the exercise (e.g., "Gym workout", "Running", "Yoga")',
            required: true,
        },
        {
            name: 'durationMinutes',
            type: 'number',
            description: 'Duration in minutes',
            required: true,
        },
        {
            name: 'caloriesBurned',
            type: 'number',
            description: 'Calories burned (auto-estimated if not provided)',
            required: false,
        },
    ];

    async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
        try {
            this.validateParameters(args);

            if (!context.userId) {
                return this.error('User ID is required to save workout log');
            }

            const estimatedCalories = args.caloriesBurned || this.estimateCalories(
                args.durationMinutes,
                args.exerciseName
            );

            const log = await workoutApi.create(context.userId, {
                completedAt: new Date().toISOString(),
                exerciseName: args.exerciseName,
                durationMinutes: args.durationMinutes,
                caloriesBurnedEstimated: estimatedCalories,
                isAiSuggested: true, 
            });

            return this.success(
                `🏋️ **Workout Logged!**\n\n` +
                `💪 **${args.exerciseName}**\n` +
                `⏱️ Duration: ${args.durationMinutes} minutes\n` +
                `🔥 Calories burned: ~${estimatedCalories} kcal\n\n` +
                `✅ Great workout! Keep it up! 💪`,
                log
            );
        } catch (error: any) {
            return this.error(
                `Failed to save workout log: ${error.message}`,
                error
            );
        }
    }

    private estimateCalories(minutes: number, exerciseName: string): number {
        const name = exerciseName.toLowerCase();
        let caloriesPerMinute = 6; 

        if (name.includes('run') || name.includes('hiit')) {
            caloriesPerMinute = 10; 
        } else if (name.includes('walk') || name.includes('yoga')) {
            caloriesPerMinute = 4; 
        } else if (name.includes('gym') || name.includes('weight')) {
            caloriesPerMinute = 7; 
        } else if (name.includes('swim') || name.includes('cycle')) {
            caloriesPerMinute = 8; 
        }

        return Math.round(minutes * caloriesPerMinute);
    }
}
