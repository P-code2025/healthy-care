// CLOVA Tool Calling Service
// Enables CLOVA AI to automatically select and execute tools based on user queries

import { getToolRegistry } from './tools/registry';
import type { Tool, ToolContext, ToolResult } from './tools/base';
import { http } from './http';

/**
 * CLOVA Function Definition (OpenAI-compatible format)
 */
export interface ClovaFunction {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
        }>;
        required: string[];
    };
}

/**
 * CLOVA Function Call Response
 */
export interface ClovaFunctionCall {
    name: string;
    arguments: string; // JSON string
}

/**
 * Convert a Tool to CLOVA function definition
 */
export function toolToFunctionDefinition(tool: Tool): ClovaFunction {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    // Convert tool parameters to function parameters
    for (const param of tool.parameters) {
        properties[param.name] = {
            type: param.type === 'array' ? 'string' : param.type,
            description: param.description,
        };

        if (param.enum) {
            properties[param.name].enum = param.enum;
        }

        if (param.required) {
            required.push(param.name);
        }
    }

    return {
        name: tool.name,
        description: tool.description,
        parameters: {
            type: 'object',
            properties,
            required,
        },
    };
}

/**
 * Get all tools as CLOVA function definitions
 */
export function getAllFunctionDefinitions(): ClovaFunction[] {
    const registry = getToolRegistry();
    const tools = registry.getAllTools();
    return tools.map(toolToFunctionDefinition);
}

/**
 * Build system prompt - MINIMAL and DIRECT
 */
function buildSystemPromptWithFunctions(functions: ClovaFunction[], userProfile?: any): string {
    const functionNames = functions.map(f => f.name).join(', ');

    return `RESPOND ONLY WITH FUNCTION CALL. NO TEXT.

Functions: ${functionNames}

Format: FUNCTION_CALL: {"name": "...", "arguments": {...}}

Example:
User: "tạo meal plan"
You: FUNCTION_CALL: {"name": "generate_weekly_meal_plan", "arguments": {}}`;
}

/**
 * Call CLOVA with function calling support
 */
export async function callClovaWithFunctions(
    userMessage: string,
    functions: ClovaFunction[],
    chatHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [],
    userProfile?: any
): Promise<{
    content?: string;
    functionCall?: ClovaFunctionCall;
}> {
    try {
        const systemPrompt = buildSystemPromptWithFunctions(functions, userProfile);

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...chatHistory,
            { role: 'user' as const, content: userMessage },
        ];

        const response = await http.post<any>('/api/chat-clova-functions', {
            messages,
            functions,
            userProfile,
        });

        return response;
    } catch (error: any) {
        console.error('Error calling CLOVA with functions:', error);
        throw new Error(error.message || 'Failed to get AI response');
    }
}

/**
 * Parse CLOVA response for function calls
 */
export function parseFunctionCall(content: string): ClovaFunctionCall | null {
    try {
        const match = content.match(/FUNCTION_CALL:\s*(\{[\s\S]*?\})/);
        if (!match) {
            return null;
        }

        const functionCallData = JSON.parse(match[1]);

        return {
            name: functionCallData.name,
            arguments: JSON.stringify(functionCallData.arguments),
        };
    } catch (error) {
        console.error('Failed to parse function call:', error);
        return null;
    }
}

/**
 * Execute tool from CLOVA function call
 */
export async function executeToolFromFunctionCall(
    functionCall: ClovaFunctionCall,
    context: ToolContext
): Promise<ToolResult> {
    try {
        const registry = getToolRegistry();
        const args = JSON.parse(functionCall.arguments);

        console.log(`🔧 Executing tool from CLOVA: ${functionCall.name}`, args);

        const result = await registry.executeToolByName(
            functionCall.name,
            args,
            context
        );

        return result;
    } catch (error: any) {
        console.error('Failed to execute tool from function call:', error);
        return {
            success: false,
            message: 'Failed to execute tool',
            error: error.message,
        };
    }
}

/**
 * Main entry point: Process chat with CLOVA tool calling
 */
export async function processChatWithToolCalling(
    userMessage: string,
    context: ToolContext,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{
    content: string;
    toolResults?: ToolResult[];
    usedTool: boolean;
}> {
    try {
        const functions = getAllFunctionDefinitions();

        console.log(`🤖 CLOVA Tool Calling: ${functions.length} tools available`);

        const response = await callClovaWithFunctions(
            userMessage,
            functions,
            chatHistory,
            context.userProfile
        );

        if (response.functionCall) {
            console.log(`📞 CLOVA requested function: ${response.functionCall.name}`);

            const toolResult = await executeToolFromFunctionCall(
                response.functionCall,
                context
            );

            return {
                content: toolResult.message,
                toolResults: [toolResult],
                usedTool: true,
            };
        }

        return {
            content: response.content || 'I apologize, but I could not process your request.',
            usedTool: false,
        };
    } catch (error: any) {
        console.error('Error in CLOVA tool calling:', error);
        throw error;
    }
}
