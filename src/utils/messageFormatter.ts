// Enhanced Message Formatter
// Supports progress bars, colored tags, and highlights

/**
 * Format AI message with enhanced markup
 */
export function formatMessage(content: string): string {
    let formatted = content;

    // Progress bars: [PROGRESS:current:max:label]
    formatted = formatted.replace(
        /\[PROGRESS:(\d+):(\d+):([^\]]+)\]/g,
        (_, current, max, label) => {
            const percentage = Math.round((Number(current) / Number(max)) * 100);
            return renderProgressBar(Number(current), Number(max), label, percentage);
        }
    );

    // Tags: [TIP], [WARNING], [URGENT]
    formatted = formatted.replace(/\[TIP\]/g, '<span class="tag tag-tip">💡 Tip</span>');
    formatted = formatted.replace(/\[WARNING\]/g, '<span class="tag tag-warning">⚠️ Warning</span>');
    formatted = formatted.replace(/\[URGENT\]/g, '<span class="tag tag-urgent">🔴 Urgent</span>');

    // Highlights: [HIGHLIGHT]text[/HIGHLIGHT]
    formatted = formatted.replace(
        /\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/g,
        '<span class="highlight">$1</span>'
    );

    // Bold text: **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return formatted;
}

/**
 * Render progress bar HTML
 */
function renderProgressBar(current: number, max: number, label: string, percentage: number): string {
    const barWidth = Math.min(percentage, 100);
    const color = percentage >= 100 ? '#ef4444' : percentage >= 80 ? '#f59e0b' : '#10b981';

    return `
    <div class="progress-container">
      <div class="progress-header">
        <span class="progress-label">${label}</span>
        <span class="progress-value">${current} / ${max}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${barWidth}%; background-color: ${color};"></div>
      </div>
      <div class="progress-percentage">${percentage}%</div>
    </div>
  `;
}

/**
 * Check if content has special formatting
 */
export function hasSpecialFormatting(content: string): boolean {
    return (
        content.includes('[PROGRESS:') ||
        content.includes('[TIP]') ||
        content.includes('[WARNING]') ||
        content.includes('[URGENT]') ||
        content.includes('[HIGHLIGHT]')
    );
}
