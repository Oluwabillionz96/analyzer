"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  SubmitEvent,
  useEffect,
  useState,
} from "react";
import { AnalysisResponse, CachedAnalysis, SORTVALUES } from "../types";
import { analyzeUrl, SORT_OPTIONS } from "../utils";
import useIsMobile from "../hooks/use-is-mobile";

const Context = createContext<{
  state: {
    isSidebarOpen: boolean;
    isLoadingHistory: boolean;
    analysis: AnalysisResponse | null;
    error: string | null;
    history: CachedAnalysis[];
    isLoadingFromHistory: boolean;
    totalHistory: number;
    url: string;
    isLoadingAnalysis: boolean;
    selectedSort: { label: string; value: SORTVALUES };
  };
  stateSetters: {
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
    setIsLoadingHistory: Dispatch<SetStateAction<boolean>>;
    setAnalysis: Dispatch<SetStateAction<AnalysisResponse | null>>;
    setError: Dispatch<SetStateAction<string | null>>;
    setHistory: Dispatch<SetStateAction<CachedAnalysis[]>>;
    setIsLoadingFromHistory: Dispatch<SetStateAction<boolean>>;
    setTotalHistory: Dispatch<SetStateAction<number>>;
    setUrl: Dispatch<SetStateAction<string>>;
    setIsLoadingAnalysis: Dispatch<SetStateAction<boolean>>;
    setSelectedSort: Dispatch<
      SetStateAction<{ label: string; value: SORTVALUES }>
    >;
  };
  handleSubmit: (e?: SubmitEvent<HTMLFormElement>) => Promise<void>;
} | null>(null);

const AppContext = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(isMobile ? false : true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingFromHistory, setIsLoadingFromHistory] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CachedAnalysis[]>([]);
  const [totalHistory, setTotalHistory] = useState(0);
  const [url, setUrl] = useState("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [selectedSort, setSelectedSort] = useState<{
    label: string;
    value: SORTVALUES;
  }>(SORT_OPTIONS[0]);

  useEffect(() => {
    function handleResize() {
      setIsSidebarOpen(isMobile ? false : true);
    }

    handleResize();
  }, [isMobile]);

  async function handleSubmit(e?: SubmitEvent<HTMLFormElement>) {
    e?.preventDefault();
    setIsLoadingAnalysis(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await analyzeUrl(url);
      setAnalysis(res?.data ?? null);
      setUrl("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
      setAnalysis(null);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }
  return (
    <Context.Provider
      value={{
        state: {
          isSidebarOpen,
          isLoadingHistory,
          analysis,
          error,
          history,
          isLoadingFromHistory,
          totalHistory,
          url,
          isLoadingAnalysis,
          selectedSort,
        },
        stateSetters: {
          setIsSidebarOpen,
          setIsLoadingHistory,
          setAnalysis,
          setError,
          setHistory,
          setIsLoadingFromHistory,
          setTotalHistory,
          setUrl,
          setIsLoadingAnalysis,
          setSelectedSort,
        },
        handleSubmit,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { AppContext, Context };
