"use client";

import { createContext, useContext, useState, ReactNode } from "react";
export type TabId = "demand" | "supply" | "matching" | "margin" | "vendor" | "projects" | "pipeline" | "skillgap" | "activity" | "createDemand";

interface TabContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

const TabContext = createContext<TabContextValue | null>(null);

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("demand");

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTab() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTab must be used within TabProvider");
  }
  return context;
}