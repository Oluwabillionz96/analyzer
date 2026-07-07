"use client";

import useAppContext from "@/libs/hooks/use-app-context";
import HistorySection from "./history-section";
import { History, PanelRightClose } from "lucide-react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Footer from "./footer";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const {
    state: { isSidebarOpen },
    stateSetters: { setIsSidebarOpen },
  } = useAppContext();

  const pathname = usePathname();

  return (
    <>
      <main
        className={
          "min-w-0 " +
          (isSidebarOpen && pathname === "/analysis" ? "md:pr-80" : "pr-0")
        }
      >
        {children}
      </main>
      {pathname === "/analysis" && (
        <aside>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={
              "fixed top-4 z-50 border rounded px-2 py-1 text-sm bg-white cursor-pointer transition-all duration-300 " +
              (isSidebarOpen ? "right-4 md:right-84" : "right-4")
            }
          >
            {isSidebarOpen ? <PanelRightClose /> : <History />}
          </button>
          <HistorySection isOpen={isSidebarOpen} />
        </aside>
      )}
      {pathname === "/" && <Footer />}
    </>
  );
};

export default AppLayout;
