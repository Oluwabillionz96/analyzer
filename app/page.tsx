"use client";

import { AnalysisResponse } from "@/libs/types";
import { analyzeUrl, getAnalysisById } from "@/libs/utils";
import { SubmitEvent, useState } from "react";
import AnalysisCard from "@/components/analysis-card";
import ErrorCard from "@/components/error-card";
import HistorySection from "@/components/history-section";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleSelection(id: string) {
    try {
      setLoading(true);
      setAnalysis(null);
      const response = await getAnalysisById(id);
      console.log(response);
      if (!response?.success) {
        console.log("Here");
        throw new Error(response?.error);
      }
      setAnalysis(response?.data ?? null);

      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e?: SubmitEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);
    analyzeUrl(url)
      .then((response) => {
        setAnalysis(response?.data ?? null);
        setUrl("");
      })
      .catch((error) => {
        setError(error?.message ?? "Something went wrong");
        setAnalysis(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="flex">
      <main className={"flex-1 min-w-0 " + (sidebarOpen ? "md:pr-80" : "pr-0")}>
        <section className="min-h-screen place-items-center grid max-w-xl mx-auto py-4 px-6 space-y-6">
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
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="border px-4 rounded-lg cursor-pointer py-2 md:py-0 bg-gray-500 text-white hover:bg-transparent disabled:hover:cursor-not-allowed disabled:opacity-50 hover:text-black transition-all duration-500"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </form>

          {loading && (
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
            {error && !loading && (
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
            {analysis && !loading && (
              <button
                onClick={() => setAnalysis(null)}
                className="border w-full px-4 rounded-lg cursor-pointer py-2 bg-gray-500 text-white hover:bg-transparent hover:text-black transition-all duration-500"
              >
                Clear
              </button>
            )}
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
        {sidebarOpen ? "Hide" : "History"}
      </button>
      <HistorySection onSelectAction={handleSelection} isOpen={sidebarOpen} />
    </div>
  );
}
