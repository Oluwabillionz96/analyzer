"use client";

interface ErrorCardProps {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorCard({ message, onDismiss }: ErrorCardProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="size-5 shrink-0 mt-0.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="text-red-500">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16ZM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Analysis failed</p>
          <p className="text-sm text-red-700 wrap-break-words">{message}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDismiss}
          className="text-sm px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
