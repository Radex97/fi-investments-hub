import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  exponentialBackoff?: boolean;
}

interface NetworkRetryState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

export function useNetworkRetry() {
  const [state, setState] = useState<NetworkRetryState>({
    isLoading: false,
    error: null,
    retryCount: 0,
  });
  const { toast } = useToast();

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const {
      maxRetries = 3,
      delayMs = 1000,
      exponentialBackoff = true,
    } = options;

    setState(prev => ({ ...prev, isLoading: true, error: null, retryCount: 0 }));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setState(prev => ({ ...prev, retryCount: attempt }));
        const result = await operation();
        setState(prev => ({ ...prev, isLoading: false, error: null }));
        return result;
      } catch (error: any) {
        console.error(`Network operation attempt ${attempt} failed:`, error);

        // Prüfe, ob es ein Netzwerkfehler ist, der wiederholt werden sollte
        const isRetryableError = 
          error.message?.includes('network') ||
          error.message?.includes('connection') ||
          error.message?.includes('Load failed') ||
          error.message?.includes('TypeError: Load failed') ||
          error.code === 'NSURLErrorDomain' ||
          error.__isAuthError && error.name === 'AuthRetryableFetchError';

        if (attempt === maxRetries || !isRetryableError) {
          setState(prev => ({ ...prev, isLoading: false, error }));
          
          // Zeige benutzerfreundliche Fehlermeldung
          if (isRetryableError) {
            toast({
              title: "Verbindungsproblem",
              description: `Keine stabile Verbindung zum Server nach ${maxRetries} Versuchen. Bitte prüfen Sie Ihre Internetverbindung.`,
              variant: "destructive",
            });
          }
          
          throw error;
        }

        // Warte vor dem nächsten Versuch
        const delay = exponentialBackoff 
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs;
        
        console.log(`Retrying network operation in ${delay}ms... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('All retry attempts failed');
  }, [toast]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
    });
  }, []);

  return {
    ...state,
    executeWithRetry,
    reset,
  };
} 