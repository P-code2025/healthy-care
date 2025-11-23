import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextValue {
    toasts: ToastData[];
    showToast: (toast: Omit<ToastData, 'id'>) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastData = {
            id,
            duration: 5000,
            ...toast,
        };

        setToasts((prev) => [...prev, newToast]);

        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, newToast.duration);
        }
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function useToastHelpers() {
    const { showToast } = useToast();

    return {
        success: (message: string, action?: ToastData['action']) =>
            showToast({ type: 'success', message, action }),
        error: (message: string, action?: ToastData['action']) =>
            showToast({ type: 'error', message, action }),
        warning: (message: string, action?: ToastData['action']) =>
            showToast({ type: 'warning', message, action }),
        info: (message: string, action?: ToastData['action']) =>
            showToast({ type: 'info', message, action }),
    };
}
