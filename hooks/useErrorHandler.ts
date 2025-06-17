import { useState, useCallback } from 'react';

interface ErrorState {
  hasError: boolean;
  message: string | null;
  code?: string | null;
}

interface ErrorHandlerResult {
  error: ErrorState;
  setError: (message: string, code?: string) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

export const useErrorHandler = (): ErrorHandlerResult => {
  const [error, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: null,
    code: null
  });

  const setError = useCallback((message: string, code?: string) => {
    setErrorState({
      hasError: true,
      message,
      code: code || null
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      message: null,
      code: null
    });
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error('Error capturado:', error);
    
    if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === 'string') {
      setError(error);
    } else {
      setError('Ha ocurrido un error inesperado');
    }
    
    // Aquí podrías integrar logging a servicios externos
  }, [setError]);

  return { error, setError, clearError, handleError };
};