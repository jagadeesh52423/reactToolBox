'use client';

import { useEffect, useState } from 'react';
import { ToastConfig, ToastType } from '../models/JsonModels';

interface ToastNotificationProps {
    toast: ToastConfig | null;
    onClose: () => void;
}

/**
 * ToastNotification Component
 *
 * Displays toast notifications for user feedback.
 * Replaces browser confirm/alert dialogs for better UX.
 */
export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (toast) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [toast]);

    if (!toast) return null;

    const getStyles = () => {
        switch (toast.type) {
            case ToastType.SUCCESS:
                return 'bg-green-500 text-white';
            case ToastType.ERROR:
                return 'bg-red-500 text-white';
            case ToastType.WARNING:
                return 'bg-yellow-500 text-white';
            case ToastType.INFO:
            default:
                return 'bg-blue-500 text-white';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case ToastType.SUCCESS:
                return '✓';
            case ToastType.ERROR:
                return '✕';
            case ToastType.WARNING:
                return '⚠';
            case ToastType.INFO:
            default:
                return 'ℹ';
        }
    };

    return (
        <div
            className={`
                fixed bottom-4 right-4 z-50
                flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
                transform transition-all duration-300 ease-in-out
                ${getStyles()}
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
        >
            <span className="text-lg">{getIcon()}</span>
            <span className="font-medium">{toast.message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-white/80 hover:text-white"
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}
