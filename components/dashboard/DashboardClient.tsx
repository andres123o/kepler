"use client";

import { useEffect } from "react";
import { DashboardPanels } from "./DashboardPanels";
import { DashboardContent } from "./DashboardContent";
import { useDashboard } from "./DashboardContext";

interface DashboardClientProps {
  profile?: any;
  organization: any;
  businessContexts: any[];
  hasBusinessInfo: boolean;
  teamContexts?: any[];
  dataSources?: any[];
  reportSettings?: any;
  organizationMembers?: any[];
  insights?: any[];
}

export function DashboardClient({
  profile,
  organization,
  businessContexts,
  hasBusinessInfo,
  teamContexts = [],
  dataSources = [],
  reportSettings,
  organizationMembers = [],
  insights = [],
}: DashboardClientProps) {
  const { activePanel } = useDashboard();

  useEffect(() => {
    if (activePanel !== "dashboard") {
      const timeoutId = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [activePanel]);

  const organizationId = organization?.id ?? '';

  if (insights.length > 0) {
    if (activePanel === "dashboard") {
      return (
        <DashboardContent
          profile={profile}
          organization={organization}
          insights={insights}
          dataSources={dataSources}
          businessContexts={businessContexts}
          teamContexts={teamContexts}
          organizationMembers={organizationMembers}
        />
      );
    }
    return (
      <DashboardPanels
        activePanel={activePanel}
        organizationId={organizationId}
        businessContexts={businessContexts}
        teamContexts={teamContexts}
        dataSources={dataSources}
        reportSettings={reportSettings}
        organizationMembers={organizationMembers}
        organization={organization}
      />
    );
  }

  if (activePanel === "dashboard") {
    return (
      <DashboardContent
        profile={profile}
        organization={organization}
        insights={insights}
        dataSources={dataSources}
        businessContexts={businessContexts}
        teamContexts={teamContexts}
        organizationMembers={organizationMembers}
      />
    );
  }

  return (
    <DashboardPanels
      activePanel={activePanel}
      organizationId={organizationId}
      businessContexts={businessContexts}
      teamContexts={teamContexts}
      dataSources={dataSources}
      reportSettings={reportSettings}
      organizationMembers={organizationMembers}
      organization={organization}
    />
  );
}
