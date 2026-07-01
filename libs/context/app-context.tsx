"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { AnalysisResponse, CachedAnalysis } from "../types";

const Context = createContext<{
  state: {
    isSidebarOpen: boolean;
    isLoadingHistory: boolean;
    analysis: AnalysisResponse | null;
    error: string | null;
    history: CachedAnalysis[];
    isLoadingFromHistory: boolean;
    totalHistory: number;
  };
  stateSetters: {
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
    setIsLoadingHistory: Dispatch<SetStateAction<boolean>>;
    setAnalysis: Dispatch<SetStateAction<AnalysisResponse | null>>;
    setError: Dispatch<SetStateAction<string | null>>;
    setHistory: Dispatch<SetStateAction<CachedAnalysis[]>>;
    setIsLoadingFromHistory: Dispatch<SetStateAction<boolean>>;
    setTotalHistory: Dispatch<SetStateAction<number>>;
  };
} | null>(null);

const AppContext = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingFromHistory, setIsLoadingFromHistory] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CachedAnalysis[]>([]);
  const [totalHistory, setTotalHistory] = useState(0);
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
        },
        stateSetters: {
          setIsSidebarOpen,
          setIsLoadingHistory,
          setAnalysis,
          setError,
          setHistory,
          setIsLoadingFromHistory,
          setTotalHistory,
        },
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { AppContext, Context };
