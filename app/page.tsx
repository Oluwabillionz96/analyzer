"use client";

import { AnalysisResponse } from "@/libs/types";
import { analyzeUrl } from "@/libs/utils";
import { SubmitEvent, useState } from "react";
import { AnalysisCard } from "@/components/analysis-card";
import { ErrorCard } from "@/components/error-card";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);
    analyzeUrl(url)
      .then((response) => setAnalysis(response?.data ?? null))
      .catch((error) => {
        setError(error?.message ?? "Something went wrong");
        setAnalysis(null);
      })
      .finally(() => {
        setUrl("");
        setLoading(false);
      });
  }

  return (
    <section className="min-h-screen grid place-items-center py-4 px-6">
      <div className="w-full space-y-6">
        <form
          className="flex flex-col md:flex-row w-full justify-center gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="url"
            placeholder="Enter Url"
            className="border px-6 py-2 rounded-lg w-fill md:w-3/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mx-auto max-w-xl">
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
          </div>
        )}

        <div className="mx-auto max-w-xl space-y-4">
          {error && !loading && (
            <ErrorCard message={error} onDismiss={() => setError(null)} />
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
      </div>
    </section>
  );
}
