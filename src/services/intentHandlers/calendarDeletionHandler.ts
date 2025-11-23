// Calendar Deletion Handler
import type { IntentHandler, DetectedIntent, HandlerContext, HandlerResponse } from './base';
import { getToolRegistry } from '../tools/registry';
import type { ToolContext } from '../tools/base';

export class CalendarDeletionHandler implements IntentHandler {
    intent = 'calendar_deletion' as const;
    category = 'calendar_deletion' as const;

    canHandle(intent: DetectedIntent, _context: HandlerContext): boolean {
        return intent.category === this.category;
    }

    async handle(
        query: string,
        intent: DetectedIntent,
        context?: HandlerContext
    ): Promise<HandlerResponse> {
        const registry = getToolRegistry();
        const tool = registry.get('clear_calendar_events');

        if (!tool) {
            return {
                content: '❌ Calendar deletion tool is not available at the moment.'
            };
        }

        const normalized = query.toLowerCase();
        const params: any = {};

        // Extract date range
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Check for "this month" / "tháng này"
        if (normalized.match(/thang nay|tháng này|this month|thang|tháng/i)) {
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
            params.startDate = startOfMonth.toISOString().split('T')[0];
            params.endDate = endOfMonth.toISOString().split('T')[0];
        }
        // Check for "this week" / "tu ần này"
        else if (normalized.match(/tuan nay|tuần này|this week|tuan|tuần/i)) {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            params.startDate = startOfWeek.toISOString().split('T')[0];
            params.endDate = endOfWeek.toISOString().split('T')[0];
        }
        // Check for "today" / "hôm nay"
        else if (normalized.match(/hom nay|hôm nay|today/i)) {
            const today = now.toISOString().split('T')[0];
            params.startDate = today;
            params.endDate = today;
        }
        // Check for "all" / "hết" / "tất cả"
        else if (normalized.match(/tat ca|tất cả|het|hết|all/i)) {
            params.deleteAll = true;
        }

        // Extract category if specified
        if (normalized.match(/workout|tap|tập|exercise|activity/i)) {
            params.category = 'activity';
        } else if (normalized.match(/meal|an|ăn|food/i)) {
            params.category = 'meal';
        } else if (normalized.match(/appointment|hen|hẹn|meeting/i)) {
            params.category = 'appointment';
        }

        // Execute tool - userId is passed via context from chatQueryProcessor
        const toolContext: ToolContext = {
            userId: (context as any)?.userId,
            userProfile: context?.userProfile
        };

        try {
            const result = await registry.executeToolByName('clear_calendar_events', params, toolContext);
            return {
                content: result.message,
                toolResults: [result]
            };
        } catch (error: any) {
            console.error('Failed to clear calendar events:', error);
            return {
                content: '❌ Failed to delete calendar events. Please try again.'
            };
        }
    }
}
