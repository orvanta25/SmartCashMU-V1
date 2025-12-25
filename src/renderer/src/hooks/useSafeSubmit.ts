// src/hooks/useSafeSubmit.ts
import { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useSafeSubmit() {
  const isSubmittingRef = useRef(false);
  const pendingRequests = useRef<Map<string, AbortController>>(new Map());

  const safeSubmit = useCallback(async <T>(
    submitFunction: () => Promise<T>,
    options: {
      key?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
      timeout?: number;
    } = {}
  ): Promise<T | null> => {
    const requestKey = options.key || uuidv4();
    
    // Protection 1 : Vérification synchrone immédiate
    if (isSubmittingRef.current) {
      console.warn('Une soumission est déjà en cours');
      return null;
    }

    // Protection 2 : Vérifier si la même requête est déjà en cours
    if (pendingRequests.current.has(requestKey)) {
      console.warn(`Requête ${requestKey} déjà en cours`);
      return null;
    }

    // Marquer comme en cours
    isSubmittingRef.current = true;
    
    // Créer un AbortController pour cette requête
    const abortController = new AbortController();
    pendingRequests.current.set(requestKey, abortController);

    // Timeout de sécurité
    const timeoutId = setTimeout(() => {
      if (pendingRequests.current.has(requestKey)) {
        abortController.abort();
        pendingRequests.current.delete(requestKey);
        isSubmittingRef.current = false;
        options.onError?.(new Error('Timeout dépassé'));
      }
    }, options.timeout || 30000);

    try {
      const result = await submitFunction();
      
      if (abortController.signal.aborted) {
        console.log('Requête annulée');
        return null;
      }

      clearTimeout(timeoutId);
      options.onSuccess?.(result);
      return result;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name !== 'AbortError') {
        console.error('Erreur dans safeSubmit:', error);
        options.onError?.(error);
      }
      
      throw error;
      
    } finally {
      // Nettoyage avec délai de sécurité
      setTimeout(() => {
        pendingRequests.current.delete(requestKey);
        
        if (pendingRequests.current.size === 0) {
          isSubmittingRef.current = false;
        }
      }, 1000);
    }
  }, []);

  return { safeSubmit, isSubmitting: isSubmittingRef.current };
}