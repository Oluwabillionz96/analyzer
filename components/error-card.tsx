"use client";

import { X } from "lucide-react";

interface ErrorCardProps {
  message: string;
  onDismissAction: () => void;
  onRetryAction?: () => void;
}

export default function ErrorCard({
  message,
  onDismissAction,
  onRetryAction,
}: ErrorCardProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="size-5 shrink-0 mt-0.5">
          <X className="text-red-500" />
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Analysis failed</p>
          <p className="text-sm text-red-700 wrap-break-words">{message}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDismissAction}
          className="text-sm px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        <button
          onClick={onRetryAction}
          className="text-sm px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
