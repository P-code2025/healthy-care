import type { Tool, ToolContext, ToolResult } from './base';

export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();

    register(tool: Tool): void {
        if (this.tools.has(tool.name)) {
            console.warn(`⚠️ Tool "${tool.name}" is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
        console.log(`✅ Registered tool: ${tool.name} (${tool.category})`);
    }


    registerAll(tools: Tool[]): void {
        tools.forEach(tool => this.register(tool));
    }

    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }


    getAllTools(): Tool[] {
        return Array.from(this.tools.values());
    }


    getToolsByCategory(category: Tool['category']): Tool[] {
        return this.getAllTools().filter(tool => tool.category === category);
    }


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


    has(name: string): boolean {
        return this.tools.has(name);
    }

    get count(): number {
        return this.tools.size;
    }


    listToolNames(): string[] {
        return Array.from(this.tools.keys());
    }
}

let registryInstance: ToolRegistry | null = null;

export function getToolRegistry(): ToolRegistry {
    if (!registryInstance) {
        registryInstance = new ToolRegistry();
    }
    return registryInstance;
}


export function resetToolRegistry(): void {
    registryInstance = null;
}
