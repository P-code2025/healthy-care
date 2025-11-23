// Action Intent Handler - Triggers tool execution based on user commands
import type { IntentHandler, HandlerContext, HandlerResponse } from './base';
import type { DetectedIntent } from '../intentDetector';
import { getToolRegistry } from '../tools/registry';
import type { ToolContext } from '../tools/base';

/**
 * Maps user queries to tool names
 */
function detectToolFromQuery(query: string): string | null {
    const normalized = query.toLowerCase();

    // Calendar actions
    if (normalized.match(/l[eê]n l[ií]ch|schedule|add.*calendar|t[aạ]o.*l[ií]ch/)) {
        return 'add_calendar_event';
    }
    if (normalized.match(/xem l[ií]ch|view.*calendar|show.*event/)) {
        return 'list_calendar_events';
    }
    if (normalized.match(/x[oó]a l[ií]ch|remove.*event|delete.*calendar/)) {
        return 'remove_calendar_event';
    }

    // Food diary actions
    if (normalized.match(/th[eê]m.*food|add.*food|log.*food|th[eê]m.*([0-9]+).*calor/)) {
        return 'add_food_diary_entry';
    }
    if (normalized.match(/t[oổ]ng.*calor|total.*calor|h[oô]m nay.*([aă]n|calor)/)) {
        return 'get_today_nutrition';
    }

    // Workout actions
    if (normalized.match(/log.*workout|ghi.*t[aậ]p|l[uư]u.*workout|ho[aà]n th[aà]nh.*t[aậ]p/)) {
        return 'save_workout_log';
    }

    return null;
}

/**
 * Extract tool parameters from natural language
 * This is a simple extractor - can be enhanced with CLOVA AI later
 */
function extractToolParameters(query: string, toolName: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract common patterns
    const tomorrow = /ng[aà]y mai|tomorrow/i.test(query);
    const today = /h[oô]m nay|today/i.test(query);

    // Date extraction
    if (tomorrow) {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        params.date = date.toISOString().split('T')[0];
    } else if (today || toolName === 'add_food_diary_entry') {
        params.date = new Date().toISOString().split('T')[0];
    }

    // Time extraction (e.g., "6 giờ tối", "18:00", "6pm")
    const timeMatch = query.match(/(\d{1,2})\s*(gi[oờ]|h|:|pm|am)?\s*(s[aá]ng|chi[eề]u|t[oố]i)?/i);
    if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const period = timeMatch[3];

        if (period?.match(/t[oố]i|chi[eề]u/) && hour < 12) {
            hour += 12; // Convert to 24h format
        } else if (period?.match(/s[aá]ng/) && hour === 12) {
            hour = 0;
        }

        params.time = `${hour.toString().padStart(2, '0')}:00`;
    }

    // Calories extraction
    const caloriesMatch = query.match(/(\d+)\s*calor/i);
    if (caloriesMatch) {
        params.calories = parseInt(caloriesMatch[1]);
    }

    // Duration extraction (e.g., "30 phút", "1 giờ")
    const durationMatch = query.match(/(\d+)\s*(ph[uú]t|gi[oờ]|minute|hour)/i);
    if (durationMatch) {
        let duration = parseInt(durationMatch[1]);
        if (durationMatch[2].match(/gi[oờ]|hour/i)) {
            duration *= 60; // Convert hours to minutes
        }
        params.durationMinutes = duration;
    }

    // Tool-specific extraction
    switch (toolName) {
        case 'add_calendar_event':
            // Extract title (everything after "lên lịch" or before time/date)
            const titleMatch = query.match(/l[eê]n l[ií]ch\s+([^\d]+?)(?:\s+ng[aà]y|\s+l[uú]c|\s+v[aà]o|$)/i);
            if (titleMatch) {
                params.title = titleMatch[1].trim();
            } else {
                params.title = 'Event'; // Default
            }

            // Detect category
            if (query.match(/t[aậ]p|gym|workout|exercise/i)) {
                params.category = 'activity';
            } else if (query.match(/[aă]n|meal|food/i)) {
                params.category = 'meal';
            } else {
                params.category = 'appointment';
            }
            break;

        case 'add_food_diary_entry':
            // Extract food name
            const foodMatch = query.match(/th[eê]m\s+([^\d]+?)(?:\s+v[aà]o|\s+cho|\s+\d|$)/i) ||
                query.match(/(\d+)\s*calor\s+([a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ\s]+)/i);
            if (foodMatch) {
                params.foodName = (foodMatch[2] || foodMatch[1] || 'Food item').trim();
            }
            break;

        case 'save_workout_log':
            // Extract exercise name
            const exerciseMatch = query.match(/ghi\s+([^\d]+?)(?:\s+\d|\s+trong|$)/i) ||
                query.match(/ho[aà]n th[aà]nh\s+([^\d]+?)(?:\s+\d|$)/i);
            if (exerciseMatch) {
                params.exerciseName = exerciseMatch[1].trim();
            } else {
                params.exerciseName = 'Workout';
            }
            break;
    }

    return params;
}

/**
 * Action Intent Handler
 * Handles action-oriented queries that should trigger tool execution
 */
export class ActionHandler implements IntentHandler {
    readonly intent = 'action' as const;
    category = 'action' as const;

    canHandle(_intent: DetectedIntent, _context: HandlerContext): boolean {
        // This handler is checked after specific intent handlers
        // It handles action-oriented queries
        return true;
    }

    async handle(
        query: string,
        _intent: DetectedIntent,
        context?: HandlerContext
    ): Promise<HandlerResponse> {
        try {
            // Detect which tool to use
            const toolName = detectToolFromQuery(query);

            if (!toolName) {
                // No tool detected, return null to fallback to other handlers
                return {
                    content: '',
                };
            }

            const registry = getToolRegistry();
            const tool = registry.get(toolName);

            if (!tool) {
                return {
                    content: `⚠️ Tool "${toolName}" is not available.\n\nAvailable tools: ${registry.listToolNames().join(', ')}`,
                };
            }

            // Extract parameters from query
            const params = extractToolParameters(query, toolName);

            // Build tool context
            const toolContext: ToolContext = {
                userId: context?.userProfile?.userId,
                userProfile: context?.userProfile,
            };

            // Execute the tool
            const result = await registry.executeToolByName(toolName, params, toolContext);

            if (!result.success) {
                return {
                    content: `❌ **Action Failed**\n\n${result.message}\n\n${result.error ? `Error: ${result.error}` : ''}`,
                };
            }

            return {
                content: result.message,
                toolResults: [result],
            };
        } catch (error: any) {
            console.error('Action handler error:', error);
            return {
                content: `❌ **System Error**\n\nFailed to process action: ${error.message}\n\nPlease try again or rephrase your request.`,
            };
        }
    }
}
