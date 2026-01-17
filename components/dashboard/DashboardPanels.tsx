"use client";

import { BusinessContextForm } from "./BusinessContextForm";
import { BusinessContextList } from "./BusinessContextList";
import { TeamContextForm } from "./TeamContextForm";
import { TeamContextList } from "./TeamContextList";
import { DataSourceForm } from "./DataSourceForm";
import { DataSourceList } from "./DataSourceList";
import { ReportSettingsForm } from "./ReportSettingsForm";
import { ReportSettingsDisplay } from "./ReportSettingsDisplay";
import { TeamMemberForm } from "./TeamMemberForm";
import { TeamMemberList } from "./TeamMemberList";
import { SettingsPanel } from "./SettingsPanel";
import { InsightsPanel } from "./InsightsPanel";
import { Edit2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface BusinessContext {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface TeamContext {
  id: string;
  name: string;
  email: string | null;
  expertise: string;
  responsible_for: string;
  created_at: string;
}

interface DataSource {
  id: string;
  source_type: string;
  source_name: string;
  created_at: string;
}

interface ReportSettings {
  id: string;
  organization_id: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: "admin" | "member";
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

interface DashboardPanelsProps {
  activePanel: string;
  organizationId: string;
  businessContexts?: BusinessContext[];
  teamContexts?: TeamContext[];
  dataSources?: DataSource[];
  reportSettings?: ReportSettings;
  organizationMembers?: TeamMember[];
}

export function DashboardPanels({ activePanel, organizationId, businessContexts = [], teamContexts = [], dataSources = [], reportSettings, organizationMembers = [], organization }: DashboardPanelsProps) {
  const [isEditingReportSettings, setIsEditingReportSettings] = useState(false);
  const [isAddingDataSource, setIsAddingDataSource] = useState(false);
  const [editingDataSource, setEditingDataSource] = useState<any | null>(null);
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const [editingTeamContext, setEditingTeamContext] = useState<any | null>(null);
  const [isAddingBusinessContext, setIsAddingBusinessContext] = useState(false);
  const [editingBusinessContext, setEditingBusinessContext] = useState<any | null>(null);
  switch (activePanel) {
    case "business":
      // Si está en modo agregar o editar, mostrar el formulario completo
      if (isAddingBusinessContext || editingBusinessContext || businessContexts.length === 0) {
        return (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 
                  className="text-3xl font-bold text-neutral-900 mb-2"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {editingBusinessContext ? 'Editar contexto de negocio' : 'Configura tu negocio'}
                </h2>
                <p 
                  className="text-neutral-600"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {editingBusinessContext 
                    ? 'Modifica los datos del contexto de negocio'
                    : 'Comparte la misión, visión, métricas clave y objetivos de tu empresa. Puedes agregar múltiples contextos.'
                  }
                </p>
              </div>
            </div>
            <BusinessContextForm 
              organizationId={organizationId}
              existingContext={editingBusinessContext}
              onCancel={() => {
                setIsAddingBusinessContext(false);
                setEditingBusinessContext(null);
              }}
              showFormOnly={businessContexts.length === 0}
            />
          </div>
        );
      }

      return (
        <div className="max-w-5xl mx-auto">
          {/* Header con botón en la esquina superior derecha */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex-1">
              <h2 
                className="text-3xl font-bold text-neutral-900 mb-2"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                Configura tu negocio
              </h2>
              <p 
                className="text-neutral-600"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Comparte la misión, visión, métricas clave y objetivos de tu empresa. Puedes agregar múltiples contextos.
              </p>
            </div>
            
            {/* Botón sutil en la esquina superior derecha */}
            <div className="flex-shrink-0">
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingBusinessContext(true)}
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-300 shadow-sm hover:shadow-md"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {/* Efecto de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl" />
                
                <div className="relative z-10 flex items-center gap-2">
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-sm font-semibold">
                    Nuevo contexto
                  </span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Lista de contextos */}
          {businessContexts && businessContexts.length > 0 && (
            <BusinessContextList 
              contexts={businessContexts} 
              onEdit={(context) => setEditingBusinessContext(context)}
            />
          )}
        </div>
      );

    case "team":
      // Si está en modo agregar o editar, mostrar el formulario completo
      if (isAddingTeamMember || editingTeamContext) {
        return (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 
                  className="text-3xl font-bold text-neutral-900 mb-2"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {editingTeamContext ? 'Editar miembro del equipo' : 'Define tu equipo'}
                </h2>
                <p 
                  className="text-neutral-600"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {editingTeamContext 
                    ? 'Modifica los datos del miembro del equipo'
                    : 'Define quién es cada persona, qué hace y de qué es responsable. Esto ayuda a la IA a generar análisis personalizados y accionables.'
                  }
                </p>
              </div>
            </div>
            <TeamContextForm 
              organizationId={organizationId}
              existingContext={editingTeamContext}
              onCancel={() => {
                setIsAddingTeamMember(false);
                setEditingTeamContext(null);
              }}
            />
          </div>
        );
      }

      return (
        <div className="max-w-5xl mx-auto">
          {/* Header con botón en la esquina superior derecha */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex-1">
              <h2 
                className="text-3xl font-bold text-neutral-900 mb-2"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                Define tu equipo
              </h2>
              <p 
                className="text-neutral-600"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Define quién es cada persona, qué hace y de qué es responsable. Esto ayuda a la IA a generar análisis personalizados y accionables.
              </p>
            </div>
            
            {/* Botón en la esquina superior derecha */}
            <div className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingTeamMember(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-neutral-900 transition-colors shadow-lg font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar miembro</span>
              </motion.button>
            </div>
          </div>

          {/* Si no hay datos, mostrar formulario vacío (cards) */}
          {(!teamContexts || teamContexts.length === 0) ? (
            <TeamContextForm 
              organizationId={organizationId}
              showFormOnly={true}
            />
          ) : (
            <TeamContextList 
              contexts={teamContexts} 
              onEdit={(context) => setEditingTeamContext(context)}
            />
          )}
        </div>
      );

    case "data":
      // Si está en modo agregar o editar, mostrar el formulario completo
      if (isAddingDataSource || editingDataSource) {
        return (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 
                  className="text-3xl font-bold text-neutral-900 mb-2"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {editingDataSource ? 'Editar fuente de datos' : 'Conecta tus datos'}
                </h2>
                <p 
                  className="text-neutral-600"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {editingDataSource 
                    ? 'Modifica los datos de tu fuente de información'
                    : 'Elige cómo quieres ingresar los datos: conecta APIs, sube documentos o configura integraciones'
                  }
                </p>
              </div>
            </div>
            <DataSourceForm 
              organizationId={organizationId}
              existingSource={editingDataSource}
              onCancel={() => {
                setIsAddingDataSource(false);
                setEditingDataSource(null);
              }}
            />
          </div>
        );
      }

      return (
        <div className="max-w-5xl mx-auto">
          {/* Header con botón en la esquina superior derecha */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex-1">
              <h2 
                className="text-3xl font-bold text-neutral-900 mb-2"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                Conecta tus datos
              </h2>
              <p 
                className="text-neutral-600"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Elige cómo quieres ingresar los datos: conecta APIs, sube documentos o configura integraciones
              </p>
            </div>
            
            {/* Botón en la esquina superior derecha */}
            <div className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingDataSource(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-neutral-900 transition-colors shadow-lg font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar fuente</span>
              </motion.button>
            </div>
          </div>

          {/* Si no hay datos, mostrar formulario vacío (cards) */}
          {(!dataSources || dataSources.length === 0) ? (
            <DataSourceForm 
              organizationId={organizationId}
              showFormOnly={true}
            />
          ) : (
            <DataSourceList 
              sources={dataSources} 
              onEdit={(source) => setEditingDataSource(source)}
            />
          )}
        </div>
      );

    case "communication":
      // Verificar si hay configuración guardada
      // Una configuración existe si tiene id (indica que está guardada en la BD)
      const hasSettings = reportSettings && reportSettings.id;
      
      // Debug temporal
      if (typeof window !== 'undefined') {
        console.log('[DashboardPanels] Communication - reportSettings:', reportSettings);
        console.log('[DashboardPanels] Communication - hasSettings:', hasSettings);
        console.log('[DashboardPanels] Communication - reportSettings?.id:', reportSettings?.id);
      }
      
      // Si está en modo edición, mostrar el formulario
      if (isEditingReportSettings) {
        return (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 
                  className="text-3xl font-bold text-neutral-900 mb-2"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Elige cómo recibir reportes
                </h2>
                <p 
                  className="text-neutral-600"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Selecciona cómo quieres recibir los insights: plataforma, Slack, email o webhook
                </p>
              </div>
            </div>
            <ReportSettingsForm 
              organizationId={organizationId} 
              existingSettings={reportSettings}
              onCancel={() => setIsEditingReportSettings(false)}
            />
          </div>
        );
      }
      
      return (
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 
                className="text-3xl font-bold text-neutral-900 mb-2"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                Elige cómo recibir reportes
              </h2>
              <p 
                className="text-neutral-600"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Selecciona cómo quieres recibir los insights: plataforma, Slack, email o webhook
              </p>
            </div>
            {hasSettings && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingReportSettings(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-neutral-900 transition-colors shadow-lg font-semibold"
              >
                <Edit2 className="w-5 h-5" />
                <span>Modificar</span>
              </motion.button>
            )}
          </div>
          
          {hasSettings ? (
            <ReportSettingsDisplay 
              settings={reportSettings} 
              organizationId={organizationId}
              showEditButtonInHeader={true}
            />
          ) : (
            <ReportSettingsForm organizationId={organizationId} existingSettings={reportSettings} />
          )}
        </div>
      );

    case "insights":
      return <InsightsPanel organizationId={organizationId} />;

    case "settings":
      return (
        <SettingsPanel 
          organization={organization}
          organizationMembers={organizationMembers}
        />
      );

    default:
      return null;
  }
}

