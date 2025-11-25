// Tool Initializer - Register all tools at startup
import { getToolRegistry } from './registry';
import {
    AddCalendarEventTool,
    ListCalendarEventsTool,
    RemoveCalendarEventTool,
} from './calendarTools';
import {
    AddFoodDiaryEntryTool,
    GetTodayNutritionTool,
} from './foodDiaryTools';
import {
    SaveWorkoutLogTool,
} from './workoutTools';
import {
    GenerateWeeklyMealPlanTool,
    ModifyMealPlanItemTool,
    GetCurrentMealPlanTool,
} from './mealPlanTools';

/**
 * Initialize and register all tools
 * Call this once at app startup
 */
export function initializeTools(): void {
    const registry = getToolRegistry();

    // Calendar tools
    registry.register(new AddCalendarEventTool());
    registry.register(new ListCalendarEventsTool());
    registry.register(new RemoveCalendarEventTool());

    // Food diary tools
    registry.register(new AddFoodDiaryEntryTool());
    registry.register(new GetTodayNutritionTool());

    // Workout tools
    registry.register(new SaveWorkoutLogTool());

    // Meal plan tools
    registry.register(new GenerateWeeklyMealPlanTool());
    registry.register(new ModifyMealPlanItemTool());
    registry.register(new GetCurrentMealPlanTool());

    console.log(`✅ Initialized ${registry.count} tools for AI Chat`);
    console.log(`📋 Available tools: ${registry.listToolNames().join(', ')}`);
}

/**
 * Get a summary of all available tools
 */
export function getToolsSummary(): string {
    const registry = getToolRegistry();
    const tools = registry.getAllTools();

    const byCategory = tools.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
    }, {} as Record<string, typeof tools>);

    let summary = '🔧 **Available AI Tools**\n\n';

    for (const [category, categoryTools] of Object.entries(byCategory)) {
        summary += `**${category.toUpperCase()}** (${categoryTools.length}):\n`;
        categoryTools.forEach(tool => {
            summary += `  • \`${tool.name}\` - ${tool.description}\n`;
        });
        summary += '\n';
    }

    return summary;
}
