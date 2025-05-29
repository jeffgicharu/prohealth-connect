import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import React from "react"

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
          <span className="text-current">{loadingText || children}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  )
} 