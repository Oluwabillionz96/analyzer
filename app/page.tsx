"use client";

import { AnalysisResponse, CachedAnalysis } from "@/libs/types";
import {
  analyzeUrl,
  fetchHistory,
  getAllHistory,
  getAnalysisById,
} from "@/libs/utils";
import { SubmitEvent, useEffect, useRef, useState } from "react";
import AnalysisCard from "@/components/analysis-card";
import ErrorCard from "@/components/error-card";
import HistorySection from "@/components/history-section";
import { History, PanelRightClose } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState({
    analysis: false,
    history: true,
    fromHistory: false,
  });
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState<CachedAnalysis[]>([]);
  const historyBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!historyBarRef.current) {
      console.log("None");
      return;
    }

    historyBarRef.current.addEventListener("scroll", () => {
      const scrollTop = historyBarRef.current?.scrollTop || 0;
      const scrollHeight = historyBarRef.current?.scrollHeight || 0;
      let isLoading = false;

      if (scrollHeight - scrollTop < 900) {
        console.log("Load");
        console.log(scrollTop - scrollHeight);
        if (!isLoading) {
          isLoading = true;
          fetchHistory(setHistory, loading, setLoading, 2).finally(() => {
            isLoading = false;
          });
        }
      }
      // console.log()
    });
  }, []);

  async function handleSelection(id: string) {
    try {
      setLoading({ ...loading, fromHistory: true });
      setAnalysis(null);
      const response = await getAnalysisById(id);
      if (!response?.success) {
        throw new Error(response?.error);
      }
      setAnalysis(response?.data ?? null);
      await fetchHistory(setHistory, loading, setLoading);

      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setAnalysis(null);
    } finally {
      setLoading({ ...loading, fromHistory: false });
    }
  }

  function handleSubmit(e?: SubmitEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading({ ...loading, analysis: true });
    setError(null);
    setAnalysis(null);
    analyzeUrl(url)
      .then((response) => {
        setAnalysis(response?.data ?? null);
        setUrl("");
        fetchHistory(setHistory, loading, setLoading);
      })
      .catch((error) => {
        setError(error?.message ?? "Something went wrong");
        setAnalysis(null);
      })
      .finally(() => {
        setLoading({ ...loading, analysis: false });
      });
  }

  useEffect(() => {
    let isMounted = true;

    if (!isMounted) return;

    fetchHistory(setHistory, loading, setLoading);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex">
      <main className={"flex-1 min-w-0 " + (sidebarOpen ? "md:pr-80" : "pr-0")}>
        <section className="min-h-screen place-items-center grid max-w-xl mx-auto py-4 px-6 space-y-6">
          <div className="space-y-8">
            <form
              className="flex flex-col md:flex-row w-full justify-center gap-4"
              onSubmit={handleSubmit}
            >
              <input
                type="url"
                placeholder="Enter Url"
                className="border w-full px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={loading.analysis || loading.fromHistory}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading.analysis || loading.fromHistory}
                className="border px-4 rounded-lg cursor-pointer py-2 md:py-0 bg-gray-500 text-white hover:bg-transparent disabled:hover:cursor-not-allowed disabled:opacity-50 hover:text-black transition-all duration-500"
              >
                {loading.analysis ? "Analyzing..." : "Analyze"}
              </button>
            </form>
            {(loading.analysis || loading.fromHistory) && (
              <div className="border rounded-lg shadow-sm p-6 space-y-4 animate-pulse">
                <div className="h-7 bg-gray-200 rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                    <div className="h-6 bg-gray-200 rounded-full w-24" />
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {error && !loading.analysis && !loading.fromHistory && (
                <ErrorCard
                  message={error}
                  onDismissAction={() => {
                    setError(null);
                    setUrl("");
                  }}
                  onRetryAction={() => handleSubmit()}
                />
              )}
              <AnalysisCard data={analysis} />
              {analysis && !loading.analysis && !loading.fromHistory && (
                <button
                  onClick={() => setAnalysis(null)}
                  className="border w-full px-4 rounded-lg cursor-pointer py-2 bg-gray-500 text-white hover:bg-transparent hover:text-black transition-all duration-500"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={
          "fixed top-4 z-50 border rounded px-2 py-1 text-sm bg-white cursor-pointer transition-all duration-300 " +
          (sidebarOpen ? "right-4 md:right-84" : "right-4")
        }
      >
        {sidebarOpen ? <PanelRightClose /> : <History />}
      </button>
      <HistorySection
        loading={loading.history}
        onSelectAction={handleSelection}
        isOpen={sidebarOpen}
        history={history}
        historyBarRef={historyBarRef}
      />
    </div>
  );
}
