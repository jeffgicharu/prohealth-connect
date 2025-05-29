"use client";

import { Loader2 } from 'lucide-react';

interface CenteredSpinnerMessageProps {
  message?: string;
  spinnerSize?: string; // Changed from number to string
  textSize?: string;    // e.g., text-lg
  className?: string;   // For additional container styling
}

export function CenteredSpinnerMessage({
  message = "Loading...",
  spinnerSize = "h-8 w-8",
  textSize = "text-lg",
  className = "py-10", // Default padding
}: CenteredSpinnerMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <Loader2 className={`${spinnerSize} text-brand-primary animate-spin mb-4`} />
      <p className={`${textSize} text-brand-light-gray`}>{message}</p>
    </div>
  );
} 