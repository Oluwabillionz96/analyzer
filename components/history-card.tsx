"use client";

import { CachedAnalysis } from "@/libs/types";

interface HistoryCardProps {
  data: CachedAnalysis;
}

export default function HistoryCard({ data }: HistoryCardProps) {
  const date = new Date(data.updated_at).toLocaleDateString("en-US", {
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
      <p className="text-xs text-gray-500">
        Searched {data.searchcount} time{data.searchcount !== 1 ? "s" : ""}
      </p>
      <p className="text-xs text-gray-400 truncate">{decodeURIComponent(data.url)}</p>
    </article>
  );
}
