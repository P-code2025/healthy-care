// Initialize tools at app startup
// This file should be imported in the main App.tsx or entry point

import { initializeTools } from './tools/initialize';

let toolsInitialized = false;

/**
 * Initialize tool calling system
 * Should be called once at app startup
 */
export function initializeToolSystem(): void {
    if (toolsInitialized) {
        console.warn('⚠️ Tools already initialized');
        return;
    }

    try {
        initializeTools();
        toolsInitialized = true;
        console.log('✅ Tool calling system initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize tool system:', error);
        throw error;
    }
}

/**
 * Check if tools are initialized
 */
export function areToolsInitialized(): boolean {
    return toolsInitialized;
}
