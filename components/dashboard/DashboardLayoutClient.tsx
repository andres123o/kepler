"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardProvider, useDashboard } from "./DashboardContext";

interface DashboardLayoutClientProps {
  organization: any;
  profile: any;
  children: React.ReactNode;
}

function DashboardLayoutContent({ organization, profile, children }: DashboardLayoutClientProps) {
  const { activePanel, setActivePanel } = useDashboard();

  return (
    <div className="h-screen bg-neutral-900 overflow-hidden">
      <div className="flex h-full relative">
        <Sidebar 
          organization={organization} 
          profile={profile}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />
        <div className="flex-1 p-6 flex flex-col overflow-hidden">
          <div className="bg-[#FFFEF7] rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
            <Header profile={profile} organization={organization} />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayoutClient({ organization, profile, children }: DashboardLayoutClientProps) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent organization={organization} profile={profile}>
        {children}
      </DashboardLayoutContent>
    </DashboardProvider>
  );
}

