"use client";

import HistoryCard from "./history-card";
import { RefObject, useEffect, useRef, useState } from "react";
import { fetchHistory, getAnalysisById, loadHistory } from "@/libs/utils";
import useAppContext from "@/libs/hooks/use-app-context";

export default function HistorySection({ isOpen }: { isOpen: boolean }) {
  const {
    state: { isLoadingHistory: loading, history, totalHistory },
    stateSetters: {
      setHistory,
      setIsLoadingHistory,
      setIsLoadingFromHistory,
      setAnalysis,
      setError,
      setTotalHistory,
    },
  } = useAppContext();
  const historyBarRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  async function handleSelection(id: string) {
    try {
      setIsLoadingFromHistory(true);
      setAnalysis(null);
      const response = await getAnalysisById(id);
      if (!response?.success) {
        throw new Error(response?.error);
      }
      setAnalysis(response?.data ?? null);
      await fetchHistory(setHistory, setTotalHistory, setIsLoadingHistory);

      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setAnalysis(null);
    } finally {
      setIsLoadingFromHistory(false);
    }
  }
  useEffect(() => {
    let isMounted = true;

    if (!isMounted) return;

    fetchHistory(setHistory, setTotalHistory, setIsLoadingHistory);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!historyBarRef.current) return;

    let isLoading = false;

    function handleScroll() {
      if (isLoading) return;

      const scrollTop = historyBarRef.current?.scrollTop || 0;
      const scrollHeight = historyBarRef.current?.scrollHeight || 0;

      if (
        scrollHeight - scrollTop < 900 &&
        totalHistory &&
        history.length < totalHistory
      ) {
        isLoading = true;
        setIsLoadingHistory(true);
        loadHistory(page + 1)
          .then((data) => {
            setHistory((prev) => [...prev, ...(data.data ?? [])]);
            setPage(data?.page ?? page);
          })
          .finally(() => {
            isLoading = false;
            setIsLoadingHistory(false);
          });
      }
    }

    const sidebar = historyBarRef.current;

    if (sidebar) {
      sidebar.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener("scroll", handleScroll);
      }
    };
  }, [totalHistory, history.length, page, setHistory, setIsLoadingHistory]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" />}
      <div
        className={
          "fixed right-0 top-0 h-screen overflow-y-auto p-4 transition-transform duration-300 z-40 w-80 md:w-80 bg-white md:border-l " +
          (isOpen
            ? "translate-x-0 shadow-2xl md:shadow-none"
            : "translate-x-full")
        }
        ref={historyBarRef}
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">People also searched:</h2>
          {!loading && history?.length === 0 ? (
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
                    onClick={() => handleSelection(item.id)}
                  >
                    <HistoryCard data={item} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <>
            {loading && (
              <ul className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
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
            )}
          </>
        </div>
      </div>
    </>
  );
}
