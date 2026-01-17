"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
  activePanel: string;
  setActivePanel: (panel: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState("dashboard");

  return (
    <DashboardContext.Provider value={{ activePanel, setActivePanel }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}

