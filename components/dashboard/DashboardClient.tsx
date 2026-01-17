"use client";

import { DashboardPanels } from "./DashboardPanels";
import { OnboardingTimeline } from "./OnboardingTimeline";
import { DashboardContent } from "./DashboardContent";
import { useDashboard } from "./DashboardContext";

interface DashboardClientProps {
  organization: any;
  onboardingProgress: any;
  businessContexts: any[];
  hasBusinessInfo: boolean;
  teamContexts?: any[];
  dataSources?: any[];
  reportSettings?: any;
  organizationMembers?: any[];
  insights?: any[];
}

export function DashboardClient({ 
  organization, 
  onboardingProgress, 
  businessContexts,
  hasBusinessInfo,
  teamContexts = [],
  dataSources = [],
  reportSettings,
  organizationMembers = [],
  insights = []
}: DashboardClientProps) {
  const { activePanel, setActivePanel } = useDashboard();

  // Verificar si el onboarding está completo
  const isOnboardingComplete = onboardingProgress?.step_1_completed 
    && onboardingProgress?.step_2_completed 
    && onboardingProgress?.step_3_completed 
    && onboardingProgress?.step_4_completed;

  // Si el onboarding NO está completo, mostrar timeline o panel según activePanel
  if (!isOnboardingComplete) {
    // Si el panel activo NO es "dashboard", mostrar el panel correspondiente
    if (activePanel !== "dashboard") {
      return (
        <DashboardPanels 
          activePanel={activePanel} 
          organizationId={organization.id}
          businessContexts={businessContexts}
          teamContexts={teamContexts}
          dataSources={dataSources}
          reportSettings={reportSettings}
          organizationMembers={organizationMembers}
          organization={organization}
        />
      );
    }
    // Si está en dashboard, mostrar timeline
    return <OnboardingTimeline progress={onboardingProgress} onStepClick={setActivePanel} />
  }

  // Si el onboarding está completo, mostrar dashboard normal o panel según activePanel
  if (activePanel === "dashboard") {
    return (
      <DashboardContent 
        organization={organization}
        insights={insights}
        dataSources={dataSources}
        businessContexts={businessContexts}
      />
    )
  }

  // Mostrar panel seleccionado
  return (
        <DashboardPanels 
          activePanel={activePanel} 
          organizationId={organization.id}
          businessContexts={businessContexts}
          teamContexts={teamContexts}
          dataSources={dataSources}
          reportSettings={reportSettings}
          organizationMembers={organizationMembers}
          organization={organization}
        />
  );
}

