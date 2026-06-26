"use client";

import { CachedAnalysis } from "@/libs/types";

interface HistoryCardProps {
  data: CachedAnalysis;
}

export default function HistoryCard({ data }: HistoryCardProps) {
  const date = new Date(data.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="border rounded-lg shadow-sm p-4 space-y-2 cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{data.companyName}</h3>
        <span className="text-xs text-gray-400 shrink-0">{date}</span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{data.summary}</p>
      <p className="text-xs text-gray-400 truncate">{data.url}</p>
    </article>
  );
}
