"use client";

import { fetchHistory } from "@/libs/utils";
import AnalysisCard from "@/components/analysis-card";
import ErrorCard from "@/components/error-card";
import useAppContext from "@/libs/hooks/use-app-context";
import { AnalysisStages } from "@/libs/types";
import SkeletonLoader from "@/components/skeleton-loader";

const STAGE_MESSAGES: Record<AnalysisStages, string> = {
  fetching: "Getting site content…",
  discovering: "Discovering related pages…",
  analyzing: "Analyzing the content…",
  retrieving:"Retrieving content..."
};

export default function Analysis() {
  const {
    state: {
      analysis,
      error,
      isLoadingFromHistory,
      url,
      isLoadingAnalysis: loading,
      stage,
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
    <section className="min-h-[91vh] place-items-center grid max-w-xl mx-auto pt-24 pb-6 px-6 space-y-6">
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
            className="border px-4 rounded-lg cursor-pointer capitalize py-2 md:py-0 bg-gray-500 text-white hover:bg-transparent disabled:hover:cursor-not-allowed disabled:opacity-50 hover:text-black transition-all duration-500"
          >
            {loading ? (stage ? `${stage}...` : "Analyzing...") : "Analyze"}
          </button>
        </form>
        {(isLoadingFromHistory || loading) ? stage ? (
          <div className="border rounded-lg shadow-sm p-6 flex items-center gap-3">
            <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
            <p className="font-medium">{STAGE_MESSAGES[stage]}</p>
          </div>
        ):<SkeletonLoader />: null }
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
