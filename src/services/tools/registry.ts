// Tool Registry - Central management for all AI Chat tools
import type { Tool, ToolContext, ToolResult } from './base';

export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();

    /**
     * Register a new tool
     */
    register(tool: Tool): void {
        if (this.tools.has(tool.name)) {
            console.warn(`⚠️ Tool "${tool.name}" is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
        console.log(`✅ Registered tool: ${tool.name} (${tool.category})`);
    }

    /**
     * Register multiple tools at once
     */
    registerAll(tools: Tool[]): void {
        tools.forEach(tool => this.register(tool));
    }

    /**
     * Get a tool by name
     */
    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    /**
     * Get all registered tools
     */
    getAllTools(): Tool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get tools by category
     */
    getToolsByCategory(category: Tool['category']): Tool[] {
        return this.getAllTools().filter(tool => tool.category === category);
    }

    /**
     * Execute a tool by name
     */
    async executeToolByName(
        name: string,
        args: Record<string, any>,
        context: ToolContext
    ): Promise<ToolResult> {
        const tool = this.get(name);

        if (!tool) {
            return {
                success: false,
                message: `Tool "${name}" not found`,
                error: `Available tools: ${Array.from(this.tools.keys()).join(', ')}`,
            };
        }

        try {
            console.log(`🔧 Executing tool: ${name}`, args);
            const result = await tool.execute(args, context);
            console.log(`✅ Tool executed: ${name}`, result.success ? '✓' : '✗');
            return result;
        } catch (error: any) {
            console.error(`❌ Tool execution failed: ${name}`, error);
            return {
                success: false,
                message: `Failed to execute tool "${name}"`,
                error: error.message || String(error),
            };
        }
    }

    /**
     * Check if a tool exists
     */
    has(name: string): boolean {
        return this.tools.has(name);
    }

    /**
     * Get tool count
     */
    get count(): number {
        return this.tools.size;
    }

    /**
     * List all tool names
     */
    listToolNames(): string[] {
        return Array.from(this.tools.keys());
    }
}

// Singleton instance
let registryInstance: ToolRegistry | null = null;

/**
 * Get or create the global tool registry
 */
export function getToolRegistry(): ToolRegistry {
    if (!registryInstance) {
        registryInstance = new ToolRegistry();
    }
    return registryInstance;
}

/**
 * Reset the global registry (for testing)
 */
export function resetToolRegistry(): void {
    registryInstance = null;
}
