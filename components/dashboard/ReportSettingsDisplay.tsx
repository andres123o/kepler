"use client";

import { Edit2, CheckCircle2, Clock, Mail, MessageSquare, Webhook, Settings, Zap, Shield, Bell, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReportSettingsForm } from "./ReportSettingsForm";

interface ReportSettingsDisplayProps {
  settings: any;
  organizationId: string;
  showEditButtonInHeader?: boolean;
}

const frequencyLabels: Record<string, string> = {
  realtime: "Tiempo real",
  hourly: "Cada hora",
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
};

const priorityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};

const formatLabels: Record<string, string> = {
  summary: "Resumen",
  detailed: "Detallado",
};

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "critical":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
  }
};

export function ReportSettingsDisplay({ settings, organizationId, showEditButtonInHeader = false }: ReportSettingsDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [teamEmails, setTeamEmails] = useState<string[]>([]);
  const [allRecipients, setAllRecipients] = useState<string[]>([]);
  const [showEmailsModal, setShowEmailsModal] = useState(false);
  const [insightsCount, setInsightsCount] = useState<number | null>(null);
  const supabase = createClient();

  // Cargar contador de insights
  useEffect(() => {
    const loadInsightsCount = async () => {
      const { count, error } = await supabase
        .from('insights')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);
      
      if (!error && count !== null) {
        setInsightsCount(count);
      }
    };
    
    loadInsightsCount();
  }, [organizationId, supabase]);

  // Cargar emails del equipo y hacer merge con los guardados
  useEffect(() => {
    const loadTeamEmails = async () => {
      const { data: teamContexts, error } = await supabase
        .from('team_context')
        .select('email')
        .eq('organization_id', organizationId);
      
      if (!error && teamContexts) {
        const emails = (teamContexts as any[])
          .map((tc: any) => ({
            original: tc.email,
            normalized: tc.email?.trim().toLowerCase()
          }))
          .filter(({ normalized }) => !!normalized && normalized.length > 0 && normalized.includes('@'))
          .map(({ normalized }) => normalized as string);
        
        setTeamEmails(emails);
        
        // Hacer merge: emails del equipo + emails externos guardados
        const savedRecipients = settings?.email_recipients || [];
        const merged = new Set<string>();
        
        // 1. Agregar todos los emails del equipo
        emails.forEach(email => merged.add(email));
        
        // 2. Agregar emails guardados que NO sean del equipo (externos)
        savedRecipients.forEach((email: string) => {
          const emailLower = email.toLowerCase();
          if (!emails.includes(emailLower)) {
            merged.add(email); // Mantener formato original
          }
        });
        
        setAllRecipients(Array.from(merged));
      }
    };
    
    loadTeamEmails();
  }, [organizationId, settings?.email_recipients, supabase]);

  // Helper para determinar si un email es del equipo
  const isTeamEmail = (email: string): boolean => {
    return teamEmails.includes(email.toLowerCase());
  };

  if (isEditing) {
    return <ReportSettingsForm organizationId={organizationId} existingSettings={settings} onCancel={() => setIsEditing(false)} />;
  }

  // Contar canales activos
  const activeChannels = [
    true, // Platform siempre activo
    settings.slack_enabled,
    settings.email_enabled,
    settings.webhook_enabled,
  ].filter(Boolean).length;

  // Botón de editar (solo se muestra si no está en el header)
  const editButton = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-neutral-900 transition-colors shadow-lg font-semibold"
    >
      <Edit2 className="w-5 h-5" />
      <span>Modificar</span>
    </motion.button>
  );

  return (
    <div className="space-y-8">
      {/* Header con botón de editar (solo si no está en el header externo) */}
      {!showEditButtonInHeader && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
          {editButton}
        </div>
      )}

      {/* Widget de resumen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-br from-[#8A2BE2] to-[#C2185B] rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="px-3 py-1 bg-gradient-to-r from-[#8A2BE2] to-[#C2185B] text-white text-xs font-bold rounded-full">
              {activeChannels}
            </span>
          </div>
          <h4 className="font-bold text-neutral-900 text-lg">Canales Activos</h4>
          <p className="text-sm text-neutral-600 mt-1">Configurados y funcionando</p>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-br from-[#C2185B]/15 via-[#FF8C00]/15 to-[#FF4500]/15 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-br from-[#FF8C00] to-[#FF6347] rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadgeColor(settings.min_priority || "medium")}`}>
              {priorityLabels[settings.min_priority] || "Media"}
            </span>
          </div>
          <h4 className="font-bold text-neutral-900 text-lg">Prioridad Mínima</h4>
          <p className="text-sm text-neutral-600 mt-1">Filtro global aplicado</p>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-br from-[#191970]/15 via-[#4A0072]/15 to-[#8A2BE2]/15 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-br from-[#191970] to-[#4A0072] rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
              Activo
            </span>
          </div>
          <h4 className="font-bold text-neutral-900 text-lg">Estado del Sistema</h4>
          <p className="text-sm text-neutral-600 mt-1">Todo configurado correctamente</p>
        </div>
      </motion.div>

      {/* Canales de entrega */}
      <div>
        <h4 className="text-xl font-bold text-neutral-900 mb-4">Canales de Entrega</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform - Siempre activo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group rounded-2xl bg-gradient-to-br from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badge en la esquina superior derecha */}
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                Siempre Activo
              </span>
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 pr-20 flex flex-col h-full min-h-[200px]">
              {/* Sección principal: Icono y título */}
              <div className="flex items-center gap-4 mb-5">
                {/* Icono destacado */}
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-white/50">
                    <Settings className="w-6 h-6 text-neutral-900" />
                </div>

                {/* Título */}
                <div className="flex-1 min-w-0">
                  <h4 
                    className="text-xl font-bold text-neutral-900 mb-1.5 leading-tight"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    Plataforma
                  </h4>
                </div>
              </div>

              {/* Detalles */}
              <div className="mb-3 flex-1">
                <p 
                  className="text-sm text-neutral-600 leading-relaxed mb-3"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Acceso instantáneo a todos tus reportes e insights
                </p>
                
                {/* Información adicional */}
                <div className="space-y-2">
                  {insightsCount !== null && (
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 bg-white/70 rounded-lg border border-white/50">
                        <span className="text-xs font-semibold text-neutral-900">
                          {insightsCount} {insightsCount === 1 ? 'insight' : 'insights'} disponible{insightsCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Badges de funcionalidades */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 bg-white/60 rounded-md text-[10px] font-medium text-neutral-700 border border-white/40">
                      ⚡ Tiempo real
                    </span>
                    <span className="px-2 py-1 bg-white/60 rounded-md text-[10px] font-medium text-neutral-700 border border-white/40">
                      📊 Histórico
                    </span>
                    <span className="px-2 py-1 bg-white/60 rounded-md text-[10px] font-medium text-neutral-700 border border-white/40">
                      🔍 Filtros
                    </span>
                    <span className="px-2 py-1 bg-white/60 rounded-md text-[10px] font-medium text-neutral-700 border border-white/40">
                      📈 Métricas
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: Metadatos - Siempre abajo */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/30 mt-auto">
                <div className="p-1.5 rounded-lg bg-white/50">
                  <Clock className="w-4 h-4 text-neutral-700" />
                </div>
                <span className="text-xs text-neutral-500 font-medium">Frecuencia:</span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-white/70 text-neutral-700 rounded-full backdrop-blur-sm border border-white/50">
                  {frequencyLabels[settings.platform_frequency] || "Tiempo real"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Slack */}
          {settings.slack_enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group rounded-2xl bg-gradient-to-br from-[#C2185B]/15 via-[#FF8C00]/15 to-[#FF4500]/15 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge en la esquina superior derecha */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                  Activo
                </span>
              </div>

              {/* Contenido principal */}
              <div className="relative z-10 pr-20 flex flex-col h-full min-h-[140px]">
                {/* Sección principal: Icono y título */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Icono destacado */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm shadow-md border border-white/50">
                    <MessageSquare className="w-6 h-6 text-neutral-900" />
                  </div>

                  {/* Título */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-xl font-bold text-neutral-900 mb-1.5 leading-tight"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      Slack
                    </h4>
                  </div>
                </div>

                {/* Detalles */}
                <div className="mb-3 flex-1">
                  <p 
                    className="text-sm text-neutral-600 leading-relaxed mb-2"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    Notificaciones en tiempo real
                  </p>
                  {settings.slack_channel && (
                    <div className="mb-3">
                      <span className="text-xs text-neutral-500 font-medium mb-2 block">Canal:</span>
                      <span className="inline-block px-3 py-1.5 bg-white/70 rounded-lg text-sm font-medium text-neutral-900 border border-white/50">
                        #{settings.slack_channel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer: Metadatos - Siempre abajo */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/30 mt-auto">
                  <div className="p-1.5 rounded-lg bg-white/50">
                    <Clock className="w-4 h-4 text-neutral-700" />
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">Frecuencia:</span>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-white/70 text-neutral-700 rounded-full backdrop-blur-sm border border-white/50">
                    {frequencyLabels[settings.slack_frequency] || "Diario"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Email */}
          {settings.email_enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group rounded-2xl bg-gradient-to-br from-[#191970]/15 via-[#4A0072]/15 to-[#8A2BE2]/15 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge en la esquina superior derecha */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                  Activo
                </span>
              </div>

              {/* Contenido principal */}
              <div className="relative z-10 pr-20 flex flex-col h-full min-h-[140px]">
                {/* Sección principal: Icono y título */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Icono destacado */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm shadow-md border border-white/50">
                    <Mail className="w-6 h-6 text-neutral-900" />
                  </div>

                  {/* Título */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-xl font-bold text-neutral-900 mb-1.5 leading-tight"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      Email
                    </h4>
                  </div>
                </div>

                {/* Detalles */}
                <div className="mb-3 flex-1">
                  <p 
                    className="text-sm text-neutral-600 leading-relaxed mb-2"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    Reportes por correo
                  </p>
                  {allRecipients.length > 0 && (
                    <div>
                      <span className="text-xs text-neutral-500 font-medium mb-1.5 block">Destinatarios:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {allRecipients.slice(0, 3).map((email, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-lg text-xs font-medium text-neutral-900 border ${
                              isTeamEmail(email)
                                ? 'bg-gradient-to-r from-[#191970]/10 to-[#4A0072]/10 border-[#191970]/20'
                                : 'bg-white/70 border-white/50'
                            }`}
                          >
                            {email}
                          </span>
                        ))}
                        {allRecipients.length > 3 && (
                          <button
                            onClick={() => setShowEmailsModal(true)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors cursor-pointer"
                          >
                            +{allRecipients.length - 3} más
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Metadatos - Siempre abajo */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/30 mt-auto">
                  <div className="p-1.5 rounded-lg bg-white/50">
                    <Clock className="w-4 h-4 text-neutral-700" />
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">Frecuencia:</span>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-white/70 text-neutral-700 rounded-full backdrop-blur-sm border border-white/50">
                    {frequencyLabels[settings.email_frequency] || "Semanal"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-400/50" />
                  <span className="px-2.5 py-1 text-xs font-semibold bg-white/70 text-neutral-700 rounded-full backdrop-blur-sm border border-white/50">
                    {formatLabels[settings.email_format] || "Resumen"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Webhook */}
          {settings.webhook_enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group rounded-2xl bg-gradient-to-br from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge en la esquina superior derecha */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                  Activo
                </span>
              </div>

              {/* Contenido principal */}
              <div className="relative z-10 pr-20 flex flex-col h-full min-h-[140px]">
                {/* Sección principal: Icono y título */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Icono destacado */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm shadow-md border border-white/50">
                    <Webhook className="w-6 h-6 text-neutral-900" />
                  </div>

                  {/* Título */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-xl font-bold text-neutral-900 mb-1.5 leading-tight"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      Webhook
                    </h4>
                  </div>
                </div>

                {/* Detalles */}
                <div className="mb-3 flex-1">
                  <p 
                    className="text-sm text-neutral-600 leading-relaxed mb-2"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    Integración personalizada
                  </p>
                  {settings.webhook_url && (
                    <div className="mb-3">
                      <span className="text-xs text-neutral-500 font-medium mb-2 block">URL:</span>
                      <div className="px-3 py-2 bg-white/70 rounded-lg border border-white/50">
                        <p className="text-xs text-neutral-700 font-mono truncate">{settings.webhook_url}</p>
                      </div>
                    </div>
                  )}
                  {settings.webhook_events && settings.webhook_events.length > 0 && (
                    <div>
                      <span className="text-xs text-neutral-500 font-medium mb-2 block">Eventos configurados:</span>
                      <div className="flex flex-wrap gap-2">
                        {settings.webhook_events.map((event: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-white/70 rounded-lg text-xs font-medium text-neutral-900 border border-white/50"
                          >
                            {event.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Filtros globales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15 p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#4A0072]/10 to-[#8A2BE2]/10">
            <CheckCircle2 className="w-5 h-5 text-neutral-900" />
          </div>
          <h4 className="font-bold text-neutral-900 text-lg">Filtros Globales</h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600 font-semibold">Prioridad mínima:</span>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getPriorityBadgeColor(settings.min_priority || "medium")}`}>
              {priorityLabels[settings.min_priority] || "Media"}
            </span>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-3">
          Solo recibirás reportes con prioridad igual o superior a la configurada
        </p>
      </motion.div>

      {/* Modal de todos los emails */}
      {showEmailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Todos los destinatarios</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {allRecipients.length} {allRecipients.length === 1 ? 'destinatario' : 'destinatarios'} configurado{allRecipients.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                onClick={() => setShowEmailsModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Emails del equipo */}
                {allRecipients.filter(e => isTeamEmail(e)).length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <span>👥</span> Miembros del equipo ({allRecipients.filter(e => isTeamEmail(e)).length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allRecipients
                        .filter(email => isTeamEmail(email))
                        .map((email, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-2 bg-gradient-to-r from-[#191970]/10 to-[#4A0072]/10 border border-[#191970]/20 rounded-lg text-sm font-medium text-neutral-900"
                          >
                            {email}
                            <span className="ml-2 text-xs text-[#191970] font-semibold">(equipo)</span>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Emails externos */}
                {allRecipients.filter(e => !isTeamEmail(e)).length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                      <span>➕</span> Destinatarios externos ({allRecipients.filter(e => !isTeamEmail(e)).length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allRecipients
                        .filter(email => !isTeamEmail(email))
                        .map((email, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-900"
                          >
                            {email}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-200">
              <button
                onClick={() => setShowEmailsModal(false)}
                className="w-full px-4 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-neutral-900 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
