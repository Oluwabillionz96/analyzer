"use client";

import { AnalysisResponse, CachedAnalysis } from "@/libs/types";
import HistoryCard from "./history-card";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getAllHistory } from "@/libs/utils";

export default function HistorySection({
  onSelectAction,
  isOpen,
}: {
  onSelectAction: Dispatch<SetStateAction<AnalysisResponse | null>>;
  isOpen: boolean;
}) {
  const [history, setHistory] = useState<CachedAnalysis[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isMounted) return;
    getAllHistory()
      .then((data) => setHistory(data?.data || null))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" />}
      <aside
        className={
          "fixed right-0 top-0 h-screen overflow-y-auto p-4 transition-transform duration-300 z-40 w-80 md:w-80 bg-white md:border-l " +
          (isOpen
            ? "translate-x-0 shadow-2xl md:shadow-none"
            : "translate-x-full")
        }
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">People also searched:</h2>
          {loading ? (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i}>
                  <div className="border rounded-lg shadow-sm p-4 space-y-2 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-14" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </li>
              ))}
            </ul>
          ) : error ? (
            <div className="text-center py-12 text-gray-400">
              <p>{error}</p>
            </div>
          ) : history?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No past analyses yet</p>
              <p className="text-sm">Your analyzed URLs will appear here</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history?.map((item) => (
                <li key={item.id}>
                  <button
                    className="text-left w-full hover:bg-gray-50 transition-colors rounded-lg"
                    onClick={() => {
                      const {
                        id,
                        created_at,
                        updated_at,
                        url,
                        searchcount,
                        ...analysis
                      } = item;
                      void id;
                      void created_at;
                      void updated_at;
                      void url;
                      void searchcount;
                      onSelectAction(analysis);
                    }}
                  >
                    <HistoryCard data={item} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
