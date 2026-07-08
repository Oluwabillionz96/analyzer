"use client";

import { fetchHistory } from "@/libs/utils";
import AnalysisCard from "@/components/analysis-card";
import ErrorCard from "@/components/error-card";
import useAppContext from "@/libs/hooks/use-app-context";

export default function Analysis() {
  const {
    state: {
      analysis,
      error,
      isLoadingFromHistory,
      url,
      isLoadingAnalysis: loading,
      selectedSort: { value: sortValue },
    },
    stateSetters: {
      setAnalysis,
      setError,
      setHistory,
      setTotalHistory,
      setIsLoadingHistory,
      setUrl,
    },
    handleSubmit,
  } = useAppContext();

  return (
    <section className="min-h-screen place-items-center grid max-w-xl mx-auto py-4 px-6 space-y-6">
      <div className="space-y-8 w-full">
        <form
          className="flex flex-col md:flex-row w-full justify-center gap-4"
          onSubmit={async (e) => {
            await handleSubmit(e);
            await fetchHistory(
              setHistory,
              setTotalHistory,
              setIsLoadingHistory,
              sortValue,
            );
          }}
        >
          <input
            type="url"
            placeholder="Enter Url"
            className="border w-full px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={loading || isLoadingFromHistory}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || isLoadingFromHistory}
            className="border px-4 rounded-lg cursor-pointer py-2 md:py-0 bg-gray-500 text-white hover:bg-transparent disabled:hover:cursor-not-allowed disabled:opacity-50 hover:text-black transition-all duration-500"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>
        {(loading || isLoadingFromHistory) && (
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
          {error && !loading && !isLoadingFromHistory && (
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
          {analysis && !loading && !isLoadingFromHistory && (
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
