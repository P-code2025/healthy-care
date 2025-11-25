// Date Divider Utilities
import type { ChatMessage } from '../pages/messages/Messages';

export interface GroupedMessages {
    date: Date;
    label: string;
    messages: ChatMessage[];
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: ChatMessage[]): GroupedMessages[] {
    const groups: Map<string, GroupedMessages> = new Map();

    for (const message of messages) {
        // Parse date - handle both ISO format and time-only format
        let date: Date;
        try {
            // Try ISO date first
            date = new Date(message.timestamp);
            // If invalid (like "10:54 PM"), use today's date
            if (isNaN(date.getTime())) {
                date = new Date();
            }
        } catch {
            date = new Date();
        }

        const dateKey = date.toDateString();

        if (!groups.has(dateKey)) {
            groups.set(dateKey, {
                date,
                label: formatDateLabel(date),
                messages: []
            });
        }

        groups.get(dateKey)!.messages.push(message);
    }

    return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Format date as "Today", "Yesterday", or date string
 */
export function formatDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare dates only
    const resetTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const targetDate = resetTime(date);
    const todayDate = resetTime(today);
    const yesterdayDate = resetTime(yesterday);

    if (targetDate.getTime() === todayDate.getTime()) {
        return 'Today';
    }

    if (targetDate.getTime() === yesterdayDate.getTime()) {
        return 'Yesterday';
    }

    // Format as "Mon, Nov 21"
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}
