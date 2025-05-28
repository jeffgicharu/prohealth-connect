import { toast } from 'react-hot-toast';

export function handleNetworkError(error: unknown): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network connection lost. Please check your internet and try again.';
  }
  
  if (error instanceof Error) {
    // Check if it's a rate limit error
    if (error.message.includes('RATE_LIMIT_EXCEEDED') || error.message.includes('rate_limit')) {
      return 'You\'ve made too many requests. Please wait a moment before trying again.';
    }
    // Check if it's a validation error
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return error.message;
    }
    // For known error types, return their message
    if (error.message.includes('Failed to') || error.message.includes('Unable to')) {
      return error.message;
    }
  }
  
  // For any other error, return generic message
  return 'An unexpected error occurred. Please try again.';
}

export function handleApiError(error: unknown, response?: Response): void {
  // Check for rate limit response
  if (response?.status === 429) {
    toast.error('You\'ve made too many requests. Please wait a moment before trying again.', {
      duration: 5000,
    });
    return;
  }

  // If error is an Error instance with a message, use it
  if (error instanceof Error) {
    // Check if the error has a response property (from fetch)
    if ('response' in error && error.response instanceof Response) {
      error.response.json().then(data => {
        const errorMessage = data.error || data.message || error.message;
        toast.error(errorMessage, {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      }).catch(() => {
        // If we can't parse the response, use the error message
        toast.error(error.message, {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      });
      return;
    }

    // Use the error message directly
    toast.error(error.message, {
      duration: 4000,
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    });
    return;
  }

  // For unknown errors, show a generic message
  toast.error(
    'An unexpected error occurred. Please try again or contact support if the issue persists.',
    { 
      duration: 5000,
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    }
  );
  
  console.error('API Error:', error);
}

export function handleServerError(error: unknown, context: string): string {
  if (error instanceof Error) {
    // Log the error with context
    console.error(`Error in ${context}:`, error);
    
    // Return the error message if it's a known error type
    if (error.message.includes('Failed to') || 
        error.message.includes('Unable to') || 
        error.message.includes('Invalid') ||
        error.message.includes('not found')) {
      return error.message;
    }
  }
  
  // For unknown errors, return a generic message
  return `An error occurred while ${context}. Please try again or contact support if the issue persists.`;
} 