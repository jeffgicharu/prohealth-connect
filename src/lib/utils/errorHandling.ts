import { toast } from 'react-hot-toast';

export function handleNetworkError(error: unknown): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error instanceof Error) {
    // Check if it's a rate limit error
    if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
      return 'You\'ve made too many requests. Please try again later.';
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
    toast.error('You\'ve made too many requests. Please try again later.', {
      duration: 5000,
    });
    return;
  }

  const errorMessage = handleNetworkError(error);
  
  // For unexpected errors, show a more detailed message
  if (errorMessage === 'An unexpected error occurred. Please try again.') {
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
  } else {
    toast.error(errorMessage, {
      duration: 4000,
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    });
  }
  
  console.error('API Error:', error);
} 