// Tool System Base Interfaces
// Defines the foundation for AI Chat tool calling system

export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    description: string;
    required: boolean;
    enum?: string[]; // For enums like meal type, calendar category
}

export interface Tool {
    name: string;
    description: string;
    category: 'calendar' | 'food' | 'workout' | 'meal_plan' | 'utility';
    parameters: ToolParameter[];
    execute: (args: Record<string, any>, context: ToolContext) => Promise<ToolResult>;
}

export interface ToolContext {
    userId?: number;
    userProfile?: {
        age?: number;
        weight?: number;
        height?: number;
        gender?: string;
        goal?: string;
        workoutDays?: number;
    };
}

export interface ToolResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Base class for tools to extend
 */
export abstract class BaseTool implements Tool {
    abstract name: string;
    abstract description: string;
    abstract category: Tool['category'];
    abstract parameters: ToolParameter[];
    abstract execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult>;

    /**
     * Validate required parameters
     */
    protected validateParameters(args: Record<string, any>): void {
        for (const param of this.parameters) {
            if (param.required && !(param.name in args)) {
                throw new Error(`Missing required parameter: ${param.name}`);
            }

            if (param.enum && args[param.name] && !param.enum.includes(args[param.name])) {
                throw new Error(
                    `Invalid value for ${param.name}. Expected one of: ${param.enum.join(', ')}`
                );
            }
        }
    }

    /**
     * Create success result
     */
    protected success(message: string, data?: any): ToolResult {
        return {
            success: true,
            message,
            data,
        };
    }

    /**
     * Create error result
     */
    protected error(message: string, error?: any): ToolResult {
        return {
            success: false,
            message,
            error: error?.message || String(error),
        };
    }
}
