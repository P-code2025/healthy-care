import { initializeTools } from './tools/initialize';

let toolsInitialized = false;

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


export function areToolsInitialized(): boolean {
    return toolsInitialized;
}
