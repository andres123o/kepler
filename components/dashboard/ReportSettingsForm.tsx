"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, X, Settings, Mail, Webhook } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "./DashboardContext";

interface ReportSettingsFormProps {
  organizationId: string;
  existingSettings?: any;
  onCancel?: () => void;
}

export function ReportSettingsForm({ organizationId, existingSettings, onCancel }: ReportSettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { setActivePanel } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamEmails, setTeamEmails] = useState<string[]>([]); // Emails del equipo desde team_context
  
  const [formData, setFormData] = useState({
    // Platform (siempre habilitado)
    platform_frequency: "realtime" as "realtime" | "hourly" | "daily",
    
    // Slack
    slack_enabled: false,
    slack_webhook_url: "",
    slack_channel: "",
    slack_frequency: "daily" as "realtime" | "hourly" | "daily" | "weekly",
    
    // Email
    email_enabled: false,
    email_recipients: [] as string[],
    email_recipient_input: "",
    email_frequency: "weekly" as "daily" | "weekly" | "monthly",
    email_format: "summary" as "summary" | "detailed",
    
    // Webhook
    webhook_enabled: false,
    webhook_url: "",
    webhook_secret: "",
    webhook_events: [] as string[],
    
    // Filtros globales
    min_priority: "medium" as "low" | "medium" | "high" | "critical",
    categories_filter: [] as string[],
  });

  // Cargar datos existentes primero (sin email_recipients - se maneja en el otro useEffect)
  useEffect(() => {
    if (existingSettings) {
      console.log('[ReportSettingsForm] Cargando existingSettings:', existingSettings);
      setFormData(prev => ({
        ...prev,
        platform_frequency: existingSettings.platform_frequency || "realtime",
        slack_enabled: false, // Siempre deshabilitado por ahora (próximamente)
        slack_webhook_url: existingSettings.slack_webhook_url || "",
        slack_channel: existingSettings.slack_channel || "",
        slack_frequency: existingSettings.slack_frequency || "daily",
        email_enabled: existingSettings.email_enabled || false,
        // NO tocar email_recipients aquí - se maneja en el useEffect de teamEmails
        email_recipient_input: "",
        email_frequency: existingSettings.email_frequency || "weekly",
        email_format: existingSettings.email_format || "summary",
        webhook_enabled: existingSettings.webhook_enabled || false,
        webhook_url: existingSettings.webhook_url || "",
        webhook_secret: existingSettings.webhook_secret || "",
        webhook_events: existingSettings.webhook_events || [],
        min_priority: existingSettings.min_priority || "medium",
        categories_filter: existingSettings.categories_filter || [],
      }));
    }
  }, [existingSettings]);

  // Cargar emails del equipo desde team_context y hacer merge con existingSettings
  useEffect(() => {
    const loadTeamEmails = async () => {
      // Consultar TODOS los team_contexts (sin filtrar por email null)
      const { data: teamContexts, error } = await supabase
        .from('team_context')
        .select('email')
        .eq('organization_id', organizationId);
      
      console.log('[ReportSettingsForm] Team contexts loaded:', teamContexts);
      console.log('[ReportSettingsForm] Error:', error);
      
      if (!error && teamContexts) {
        // Filtrar emails válidos (no null, no vacíos, con formato válido)
        const emails = (teamContexts as any[])
          .map((tc: any) => ({
            original: tc.email,
            normalized: tc.email?.trim().toLowerCase()
          }))
          .filter(({ original, normalized }) => {
            const isValid = !!normalized && normalized.length > 0 && normalized.includes('@');
            if (!isValid && original) {
              console.log('[ReportSettingsForm] Email inválido filtrado:', original);
            }
            return isValid;
          })
          .map(({ normalized }) => normalized as string);
        
        console.log('[ReportSettingsForm] Emails válidos del equipo:', emails);
        console.log('[ReportSettingsForm] Total emails encontrados:', emails.length);
        
        setTeamEmails(emails);
        
        // Hacer merge inteligente: emails del equipo + emails externos guardados
        setFormData(prev => {
          const savedRecipients = existingSettings?.email_recipients || [];
          const allRecipients = new Set<string>();
          
          // 1. Agregar todos los emails del equipo (SIEMPRE, automáticamente)
          emails.forEach(email => {
            allRecipients.add(email);
            console.log('[ReportSettingsForm] Agregando email del equipo:', email);
          });
          
          // 2. Agregar emails guardados que NO sean del equipo (son externos)
          savedRecipients.forEach((email: string) => {
            const emailLower = email.toLowerCase();
            if (!emails.includes(emailLower)) {
              allRecipients.add(email); // Mantener formato original
              console.log('[ReportSettingsForm] Agregando email externo guardado:', email);
            } else {
              console.log('[ReportSettingsForm] Email guardado ya está en equipo, omitiendo:', email);
            }
          });
          
          const finalRecipients = Array.from(allRecipients);
          console.log('[ReportSettingsForm] Total destinatarios finales:', finalRecipients.length);
          console.log('[ReportSettingsForm] Destinatarios finales:', finalRecipients);
          
          return {
            ...prev,
            email_recipients: finalRecipients,
          };
        });
      } else if (error) {
        console.error('[ReportSettingsForm] Error cargando team_context:', error);
      }
    };
    
    loadTeamEmails();
    
    // Escuchar cambios en team_context para sincronización en tiempo real
    const channel = supabase
      .channel('team-context-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_context',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          // Recargar emails del equipo cuando haya cambios (agregar/eliminar miembro)
          loadTeamEmails();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, supabase, existingSettings]);

  const addEmailRecipient = () => {
    const email = formData.email_recipient_input.trim();
    if (!email) return;
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }
    
    if (!formData.email_recipients.includes(email)) {
      setFormData({
        ...formData,
        email_recipients: [...formData.email_recipients, email],
        email_recipient_input: "",
      });
      setError(""); // Limpiar error si se agregó correctamente
    } else {
      setError("Este email ya está agregado");
    }
  };

  const removeEmailRecipient = (email: string) => {
    // No permitir eliminar emails del equipo
    if (isTeamEmail(email)) {
      setError("No puedes eliminar emails del equipo. Elimina el miembro desde 'Define tu equipo' si no debe recibir reportes.");
      return;
    }
    
    setFormData({
      ...formData,
      email_recipients: formData.email_recipients.filter((e) => e !== email),
    });
  };

  // Helper para determinar si un email es del equipo
  const isTeamEmail = (email: string): boolean => {
    return teamEmails.includes(email.toLowerCase());
  };

  const addWebhookEvent = (event: string) => {
    if (!formData.webhook_events.includes(event)) {
      setFormData({
        ...formData,
        webhook_events: [...formData.webhook_events, event],
      });
    }
  };

  const removeWebhookEvent = (event: string) => {
    setFormData({
      ...formData,
      webhook_events: formData.webhook_events.filter((e) => e !== event),
    });
  };

  const validateForm = (): { valid: boolean; message: string } => {
    // Slack está deshabilitado por ahora (próximamente), no validar
    
    // Validar Email
    if (formData.email_enabled && formData.email_recipients.length === 0) {
      return { valid: false, message: "Email está habilitado pero necesitas agregar al menos un destinatario" };
    }
    
    // Validar Webhook
    if (formData.webhook_enabled && !formData.webhook_url.trim()) {
      return { valid: false, message: "Webhook está habilitado pero falta la URL" };
    }
    
    return { valid: true, message: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No estás autenticado");
      }

      // Construir array de canales activos
      const deliveryChannels: string[] = ["platform"];
      // Slack deshabilitado por ahora (próximamente)
      // if (formData.slack_enabled) deliveryChannels.push("slack");
      if (formData.email_enabled) deliveryChannels.push("email");
      if (formData.webhook_enabled) deliveryChannels.push("webhook");

      const insertData: any = {
        organization_id: organizationId,
        delivery_channels: deliveryChannels,
        platform_frequency: formData.platform_frequency,
        slack_enabled: false, // Deshabilitado por ahora (próximamente)
        email_enabled: formData.email_enabled,
        webhook_enabled: formData.webhook_enabled,
        min_priority: formData.min_priority,
        categories_filter: formData.categories_filter.length > 0 ? formData.categories_filter : null,
      };

      // Slack deshabilitado por ahora (próximamente)
      // No se guarda configuración de Slack

      // Configuración de Email
      if (formData.email_enabled) {
        // Asegurar que siempre incluya todos los emails del equipo + externos
        const allRecipients = new Set<string>();
        
        // 1. Agregar todos los emails del equipo (siempre)
        teamEmails.forEach(email => allRecipients.add(email));
        
        // 2. Agregar emails externos del formulario
        formData.email_recipients.forEach(email => {
          if (!isTeamEmail(email)) {
            allRecipients.add(email);
          }
        });
        
        insertData.email_recipients = Array.from(allRecipients);
        insertData.email_frequency = formData.email_frequency;
        insertData.email_format = formData.email_format;
      }

      // Configuración de Webhook
      if (formData.webhook_enabled) {
        insertData.webhook_url = formData.webhook_url.trim();
        if (formData.webhook_secret) {
          insertData.webhook_secret = formData.webhook_secret.trim();
        }
        insertData.webhook_events = formData.webhook_events.length > 0 ? formData.webhook_events : null;
      }

      // Insertar o actualizar
      if (existingSettings && existingSettings.id) {
        const { error: updateError } = await supabase
          .from("report_settings")
          // @ts-ignore - Supabase client types issue with generic table
          .update(insertData)
          .eq("organization_id", organizationId);

        if (updateError) throw updateError;
        console.log('[ReportSettingsForm] Updated existing settings');
      } else {
        const { data: insertedData, error: insertError } = await supabase
          .from("report_settings")
          // @ts-ignore - Supabase client types issue with generic table
          .insert(insertData)
          .select()
          .single();

        if (insertError) throw insertError;
        console.log('[ReportSettingsForm] Inserted new settings:', insertedData);
      }

      // Marcar el paso 4 como completado (tanto si es insert como update)
      const { data: existingProgress } = await supabase
        .from("onboarding_progress")
        .select("id")
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (existingProgress) {
        await supabase
          .from("onboarding_progress")
          // @ts-ignore - Supabase client types issue with generic table
          .update({
            step_4_completed: true,
            step_4_completed_at: new Date().toISOString(),
          })
          .eq("organization_id", organizationId);
      } else {
        await supabase
          .from("onboarding_progress")
          // @ts-ignore - Supabase client types issue with generic table
          .insert({
            organization_id: organizationId,
            step_4_completed: true,
            step_4_completed_at: new Date().toISOString(),
          });
      }

      // Refrescar y redirigir al dashboard
      router.refresh();
      setActivePanel('dashboard');
      
      // Recargar la página para actualizar el estado
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Error al guardar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-transparent rounded-xl border border-neutral-200/50 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform (siempre habilitado) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
              <Settings className="w-5 h-5 text-neutral-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-900 text-lg">Plataforma</h3>
              <p className="text-sm text-neutral-600">
                Los reportes siempre estarán disponibles en la plataforma.
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              Siempre activo
            </span>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              Frecuencia de actualización <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "realtime", label: "Tiempo real" },
                { value: "hourly", label: "Cada hora" },
                { value: "daily", label: "Diario" },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform_frequency: option.value as any })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    formData.platform_frequency === option.value
                      ? "bg-black text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#191970]/10 via-[#4A0072]/10 to-[#8A2BE2]/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="email_enabled"
              checked={formData.email_enabled}
              onChange={(e) => setFormData({ ...formData, email_enabled: e.target.checked })}
              className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 cursor-pointer"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-xl bg-white/80">
                <Mail className="w-5 h-5 text-neutral-900" />
              </div>
              <label htmlFor="email_enabled" className="text-lg font-bold text-neutral-900 cursor-pointer">
                Email
              </label>
            </div>
          </div>
          
          {formData.email_enabled && (
            <div className="space-y-4 pl-8">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Destinatarios <span className="text-red-500">*</span>
                </label>
                {teamEmails.length > 0 && (
                  <p className="text-xs text-neutral-500 mb-3">
                    💡 Los emails de tu equipo se agregan automáticamente. Puedes agregar destinatarios externos adicionales abajo.
                  </p>
                )}
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={formData.email_recipient_input}
                    onChange={(e) => setFormData({ ...formData, email_recipient_input: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEmailRecipient();
                      }
                    }}
                    placeholder="Agregar email externo (ej: stakeholder@empresa.com)"
                    className="flex-1 px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                  <motion.button
                    type="button"
                    onClick={addEmailRecipient}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-neutral-900 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                {formData.email_recipients.length > 0 ? (
                  <div className="space-y-3">
                    {/* Emails del equipo */}
                    {formData.email_recipients.filter(e => isTeamEmail(e)).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">
                          👥 Miembros del equipo
                        </p>
                  <div className="flex flex-wrap gap-2">
                          {formData.email_recipients
                            .filter(email => isTeamEmail(email))
                            .map((email) => (
                      <motion.span
                        key={email}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#191970]/10 to-[#4A0072]/10 border border-[#191970]/20 text-neutral-700 rounded-xl text-sm font-medium"
                      >
                        {email}
                                <span className="text-xs px-1.5 py-0.5 bg-[#191970]/20 text-[#191970] rounded-full font-medium">
                                  Del equipo
                                </span>
                                <span className="text-xs text-neutral-400 italic">
                                  (automático)
                                </span>
                              </motion.span>
                            ))}
                        </div>
                        <p className="text-xs text-neutral-500 mt-2 italic">
                          Estos emails se agregan automáticamente desde "Define tu equipo". Para eliminarlos, elimina el miembro del equipo.
                        </p>
                      </div>
                    )}
                    
                    {/* Emails externos */}
                    {formData.email_recipients.filter(e => !isTeamEmail(e)).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">
                          ➕ Destinatarios adicionales
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.email_recipients
                            .filter(email => !isTeamEmail(email))
                            .map((email) => (
                              <motion.span
                                key={email}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#C2185B]/10 to-[#FF8C00]/10 border border-[#C2185B]/20 text-neutral-700 rounded-xl text-sm font-medium"
                              >
                                {email}
                                <span className="text-xs px-1.5 py-0.5 bg-[#C2185B]/20 text-[#C2185B] rounded-full font-medium">
                                  Externo
                                </span>
                        <button
                          type="button"
                          onClick={() => removeEmailRecipient(email)}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                                  title="Quitar de destinatarios"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Debes agregar al menos un destinatario para habilitar el envío por email.
                      {teamEmails.length > 0 && (
                        <span className="block mt-1 text-xs">
                          💡 Los emails de tu equipo se agregarán automáticamente cuando los definas en "Define tu equipo".
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-3">
                  Frecuencia <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "daily", label: "Diario" },
                    { value: "weekly", label: "Semanal" },
                    { value: "monthly", label: "Mensual" },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, email_frequency: option.value as any })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        formData.email_frequency === option.value
                          ? "bg-black text-white shadow-sm"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-3">
                  Formato <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "summary", label: "Resumen" },
                    { value: "detailed", label: "Detallado" },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, email_format: option.value as any })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        formData.email_format === option.value
                          ? "bg-black text-white shadow-sm"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Webhook */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="webhook_enabled"
              checked={formData.webhook_enabled}
              onChange={(e) => setFormData({ ...formData, webhook_enabled: e.target.checked })}
              className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 cursor-pointer"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-xl bg-white/80">
                <Webhook className="w-5 h-5 text-neutral-900" />
              </div>
              <label htmlFor="webhook_enabled" className="text-lg font-bold text-neutral-900 cursor-pointer">
                Webhook
              </label>
            </div>
          </div>
          
          {formData.webhook_enabled && (
            <div className="space-y-4 pl-8">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Webhook URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  placeholder="https://tu-servidor.com/webhook"
                  required={formData.webhook_enabled}
                  className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Secret (opcional)
                </label>
                <input
                  type="password"
                  value={formData.webhook_secret}
                  onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                  placeholder="Secret para validar requests"
                  className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Eventos (opcional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["new_insight", "critical_alert", "weekly_report"].map((event) => (
                    <button
                      key={event}
                      type="button"
                      onClick={() => {
                        if (formData.webhook_events.includes(event)) {
                          removeWebhookEvent(event);
                        } else {
                          addWebhookEvent(event);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        formData.webhook_events.includes(event)
                          ? "bg-black text-white shadow-sm"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {event.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Slack - Próximamente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#C2185B]/10 via-[#FF8C00]/10 to-[#FF4500]/10 p-6 backdrop-blur-sm opacity-60"
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="slack_enabled"
              checked={false}
              disabled
              className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 cursor-not-allowed opacity-50"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-xl bg-white/80">
                <img 
                  src="https://cdn.simpleicons.org/slack/4A154B" 
                  alt="Slack" 
                  className="w-5 h-5"
                />
              </div>
              <label htmlFor="slack_enabled" className="text-lg font-bold text-neutral-900 cursor-not-allowed">
                Slack
              </label>
            </div>
            <span className="px-3 py-1 bg-neutral-200 text-neutral-600 text-xs font-semibold rounded-full">
              Próximamente
            </span>
          </div>
          <p className="text-sm text-neutral-500 pl-8">
            La integración con Slack estará disponible próximamente.
          </p>
        </motion.div>

        {/* Jira - Próximamente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#0052CC]/10 via-[#2684FF]/10 to-[#4C9AFF]/10 p-6 backdrop-blur-sm opacity-60"
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="jira_enabled"
              checked={false}
              disabled
              className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 cursor-not-allowed opacity-50"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-xl bg-white/80">
                <img 
                  src="https://cdn.simpleicons.org/jira/0052CC" 
                  alt="Jira" 
                  className="w-5 h-5"
                />
              </div>
              <label htmlFor="jira_enabled" className="text-lg font-bold text-neutral-900 cursor-not-allowed">
                Jira
              </label>
            </div>
            <span className="px-3 py-1 bg-neutral-200 text-neutral-600 text-xs font-semibold rounded-full">
              Próximamente
            </span>
          </div>
          <p className="text-sm text-neutral-500 pl-8">
            La integración con Jira estará disponible próximamente.
          </p>
        </motion.div>

        {/* Notion - Próximamente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#000000]/10 via-[#37352F]/10 to-[#FFFFFF]/10 p-6 backdrop-blur-sm opacity-60"
        >
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="notion_enabled"
              checked={false}
              disabled
              className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 cursor-not-allowed opacity-50"
            />
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-xl bg-white/80">
                <img 
                  src="https://cdn.simpleicons.org/notion/000000" 
                  alt="Notion" 
                  className="w-5 h-5"
                />
              </div>
              <label htmlFor="notion_enabled" className="text-lg font-bold text-neutral-900 cursor-not-allowed">
                Notion
              </label>
            </div>
            <span className="px-3 py-1 bg-neutral-200 text-neutral-600 text-xs font-semibold rounded-full">
              Próximamente
            </span>
          </div>
          <p className="text-sm text-neutral-500 pl-8">
            La integración con Notion estará disponible próximamente.
          </p>
        </motion.div>

        {/* Filtros globales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl bg-gradient-to-br from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15 backdrop-blur-sm p-6"
        >
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Filtros globales</h3>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              Prioridad mínima <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "low", label: "Baja" },
                { value: "medium", label: "Media" },
                { value: "high", label: "Alta" },
                { value: "critical", label: "Crítica" },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, min_priority: option.value as any })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    formData.min_priority === option.value
                      ? "bg-black text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
          <motion.button
            type="submit"
            disabled={isLoading || !validateForm().valid}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              "Guardar configuración"
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

