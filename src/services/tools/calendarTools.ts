import { BaseTool, type ToolParameter, type ToolContext, type ToolResult } from './base';
import { calendarApi } from '../calendarApi';


export class AddCalendarEventTool extends BaseTool {
    name = 'add_calendar_event';
    description = 'Add a new event to the calendar (workout, meal, appointment)';
    category = 'calendar' as const;

    parameters: ToolParameter[] = [
        {
            name: 'title',
            type: 'string',
            description: 'Event title (e.g., "Tập gym", "Yoga class")',
            required: true,
        },
        {
            name: 'date',
            type: 'date',
            description: 'Event date in YYYY-MM-DD format',
            required: true,
        },
        {
            name: 'time',
            type: 'string',
            description: 'Time slot (e.g., "18:00", "09:30")',
            required: true,
        },
        {
            name: 'category',
            type: 'string',
            description: 'Event category',
            required: true,
            enum: ['meal', 'activity', 'appointment'],
        },
        {
            name: 'location',
            type: 'string',
            description: 'Event location (optional)',
            required: false,
        },
        {
            name: 'note',
            type: 'string',
            description: 'Additional notes (optional)',
            required: false,
        },
    ];

    async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
        try {
            this.validateParameters(args);

            if (!context.userId) {
                return this.error('User ID is required to add calendar event');
            }

            const event = await calendarApi.create(context.userId, {
                title: args.title,
                date: args.date,
                time: args.time,
                category: args.category,
                location: args.location,
                note: args.note,
                linkedModule: null,
            });

            const categoryEmoji: Record<string, string> = {
                meal: '🍽️',
                activity: '🏋️',
                appointment: '📅',
            };
            const emoji = categoryEmoji[args.category] || '📅';

            return this.success(
                `${emoji} **Calendar Event Added!**\n\n` +
                `📌 **${args.title}**\n` +
                `📅 ${args.date} at ${args.time}\n` +
                `${args.location ? `📍 ${args.location}\n` : ''}` +
                `${args.note ? `📝 ${args.note}\n` : ''}\n` +
                `✅ Successfully added to your calendar!`,
                event
            );
        } catch (error: any) {
            return this.error(
                `Failed to add calendar event: ${error.message}`,
                error
            );
        }
    }
}


export class ListCalendarEventsTool extends BaseTool {
    name = 'list_calendar_events';
    description = 'Get a list of upcoming calendar events';
    category = 'calendar' as const;

    parameters: ToolParameter[] = [
        {
            name: 'days',
            type: 'number',
            description: 'Number of days to look ahead (default: 7)',
            required: false,
        },
        {
            name: 'category',
            type: 'string',
            description: 'Filter by category (optional)',
            required: false,
            enum: ['meal', 'activity', 'appointment'],
        },
    ];

    async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
        try {
            if (!context.userId) {
                return this.error('User ID is required to list calendar events');
            }

            const days = args.days || 7;
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);

            const events = await calendarApi.list(context.userId, {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
                category: args.category,
            });

            if (events.length === 0) {
                return this.success(
                    `📅 No events found in the next ${days} days${args.category ? ` for category "${args.category}"` : ''}.`
                );
            }

            const categoryEmoji: Record<string, string> = {
                meal: '🍽️',
                activity: '🏋️',
                appointment: '📅',
            };

            const eventList = events
                .map(event => {
                    const emoji = categoryEmoji[event.category] || '📅';
                    return `${emoji} **${event.title}**\n` +
                        `   📅 ${event.eventDate.split('T')[0]} at ${event.timeSlot}\n` +
                        `${event.location ? `   📍 ${event.location}\n` : ''}`;
                })
                .join('\n');

            return this.success(
                `📅 **Upcoming Events** (next ${days} days):\n\n${eventList}\n\n` +
                `Total: ${events.length} event${events.length > 1 ? 's' : ''}`,
                events
            );
        } catch (error: any) {
            return this.error(
                `Failed to list calendar events: ${error.message}`,
                error
            );
        }
    }
}


export class RemoveCalendarEventTool extends BaseTool {
    name = 'remove_calendar_event';
    description = 'Remove an event from the calendar';
    category = 'calendar' as const;

    parameters: ToolParameter[] = [
        {
            name: 'eventId',
            type: 'number',
            description: 'Event ID to remove',
            required: false,
        },
        {
            name: 'title',
            type: 'string',
            description: 'Event title to match (if no ID provided)',
            required: false,
        },
        {
            name: 'date',
            type: 'date',
            description: 'Event date to help find the right event',
            required: false,
        },
    ];

    async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
        try {
            if (!context.userId) {
                return this.error('User ID is required to remove calendar event');
            }

            if (!args.eventId && !args.title) {
                return this.error('Either eventId or title must be provided');
            }

            if (args.eventId) {
                await calendarApi.remove(args.eventId, context.userId);
                return this.success(`✅ Calendar event removed successfully!`);
            }

            const events = await calendarApi.list(context.userId, {
                start: args.date || new Date().toISOString().split('T')[0],
                end: args.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });

            const matchingEvent = events.find(e =>
                e.title.toLowerCase().includes(args.title.toLowerCase()) &&
                (!args.date || e.eventDate.split('T')[0] === args.date)
            );

            if (!matchingEvent) {
                return this.error(
                    `No event found matching "${args.title}"${args.date ? ` on ${args.date}` : ''}`
                );
            }

            await calendarApi.remove(matchingEvent.id, context.userId);
            return this.success(
                `✅ **Event Removed**\n\n` +
                `📌 ${matchingEvent.title}\n` +
                `📅 ${matchingEvent.eventDate.split('T')[0]} at ${matchingEvent.timeSlot}`
            );
        } catch (error: any) {
            return this.error(
                `Failed to remove calendar event: ${error.message}`,
                error
            );
        }
    }
}
