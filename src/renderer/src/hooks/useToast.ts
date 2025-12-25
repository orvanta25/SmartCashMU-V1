// src/renderer/src/hooks/useToast.ts
import { useState, useCallback } from 'react';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    type: Toast['type'], 
    message: string, 
    duration: number = 3000
  ) => {
    const id = Date.now();
    
    setToasts(prev => [...prev, { id, type, message, duration }]);
    
    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts
  };
};