import { useContext } from "react";
import { Context } from "../context/app-context";

const useAppContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }

  return context;
};

export default useAppContext;
