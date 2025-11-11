"use client"

import * as React from "react"
import { X, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onClose?: () => void
}

export function Toast({
  title,
  description,
  variant = "default",
  className,
  onClose,
}: ToastProps) {
  const variantClasses = {
    default: "bg-white border-gray-200 text-gray-900",
    destructive: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
  }

  const icon =
    variant === "success" ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : variant === "destructive" ? (
      <XCircle className="w-5 h-5 text-red-600" />
    ) : null

  return (
    <div
      className={cn(
        "w-[340px] rounded-lg border p-4 shadow-lg flex items-start gap-3 transition-all",
        variantClasses[variant],
        className
      )}
    >
      {icon && <div className="mt-0.5">{icon}</div>}
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700 transition"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
