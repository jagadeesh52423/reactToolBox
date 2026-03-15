'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, AlertCircleIcon, InfoIcon, XIcon } from '@/components/shared/Icons';

export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastNotificationProps {
  toast: ToastConfig | null;
  onClose: () => void;
}

export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      setIsLeaving(false);
    } else {
      setIsLeaving(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsLeaving(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!isVisible && !toast) return null;

  const getStyles = () => {
    switch (toast?.type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          icon: 'text-emerald-400 bg-emerald-500/20',
          text: 'text-emerald-300',
        };
      case 'error':
        return {
          bg: 'bg-red-500/10 border-red-500/30',
          icon: 'text-red-400 bg-red-500/20',
          text: 'text-red-300',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30',
          icon: 'text-amber-400 bg-amber-500/20',
          text: 'text-amber-300',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30',
          icon: 'text-blue-400 bg-blue-500/20',
          text: 'text-blue-300',
        };
    }
  };

  const getIcon = () => {
    switch (toast?.type) {
      case 'success':
        return <CheckIcon size={16} />;
      case 'error':
        return <AlertCircleIcon size={16} />;
      case 'warning':
        return <AlertCircleIcon size={16} />;
      case 'info':
      default:
        return <InfoIcon size={16} />;
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-3 px-4 py-3 rounded-xl
        border backdrop-blur-sm shadow-2xl
        transform transition-all duration-300 ease-out
        ${styles.bg}
        ${toast && !isLeaving
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-4 opacity-0 scale-95'
        }
      `}
    >
      <div className={`p-2 rounded-lg ${styles.icon}`}>
        {getIcon()}
      </div>
      <span className={`font-medium text-sm ${styles.text}`}>
        {toast?.message}
      </span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors"
        aria-label="Close notification"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
}
