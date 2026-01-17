"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Loader2, Instagram, Linkedin, Smartphone, MessageSquare, Ticket, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "./DashboardContext";

interface DataSourceFormProps {
  organizationId: string;
  onCancel?: () => void;
  showFormOnly?: boolean; // Si es true, siempre muestra el formulario (para primera vez)
  existingSource?: any; // Si se proporciona, el formulario está en modo edición
}

type SourceType = "social" | "app_store" | "nps" | "csat" | "tickets";
type SocialPlatform = "instagram" | "linkedin";
type AppStoreType = "play_store" | "app_store";
type TicketsMethod = "api" | "file";
type ApiProvider = "zendesk" | "hubspot" | "custom";

export function DataSourceForm({ organizationId, onCancel, showFormOnly = false, existingSource }: DataSourceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { setActivePanel } = useDashboard();
  // Si hay onCancel o showFormOnly, el formulario debe estar abierto desde el inicio
  const [isOpen, setIsOpen] = useState(showFormOnly || !!onCancel || !!existingSource);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Estado del formulario - inicializar con datos existentes si hay
  const [sourceType, setSourceType] = useState<SourceType | "">(
    existingSource?.source_type || ""
  );
  const [formData, setFormData] = useState({
    // Redes Sociales
    socialPlatform: (existingSource?.social_platform || "") as SocialPlatform | "",
    socialUsername: existingSource?.social_username || "",
    socialProfileUrl: existingSource?.social_profile_url || "",
    
    // App Stores
    appStoreType: (existingSource?.app_store_type || "") as AppStoreType | "",
    appUrl: existingSource?.app_url || "",
    
    // Tickets
    ticketsMethod: (existingSource?.tickets_method || "") as TicketsMethod | "",
    apiProvider: (existingSource?.api_provider || "") as ApiProvider | "",
    apiEndpoint: existingSource?.api_endpoint || "",
    apiKey: existingSource?.api_credentials_encrypted || "",
    apiToken: existingSource?.api_credentials_encrypted || "",
    apiConfig: existingSource?.api_config ? JSON.stringify(existingSource.api_config, null, 2) : "",
  });

  // Función para validar que todos los campos requeridos estén llenos
  const validateForm = (): boolean => {
    if (!sourceType) return false;
    
    switch (sourceType) {
      case "social":
        return !!(formData.socialPlatform && formData.socialUsername && formData.socialProfileUrl);
      case "app_store":
        return !!(formData.appStoreType && formData.appUrl);
      case "nps":
      case "csat":
        return true; // No requieren campos adicionales
      case "tickets":
        if (formData.ticketsMethod === "api") {
          return !!(formData.apiProvider && formData.apiEndpoint && formData.apiKey && formData.apiConfig);
        }
        return formData.ticketsMethod === "file";
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      setError("Por favor completa todos los campos requeridos");
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

      // Construir el objeto de inserción según el tipo
      let insertData: any = {
        organization_id: organizationId,
        source_type: sourceType,
      };

      // Configurar según el tipo de fuente
      switch (sourceType) {
        case "social":
          if (!formData.socialUsername || !formData.socialProfileUrl) {
            throw new Error("Debes proporcionar tanto el usuario como la URL del perfil");
          }
          insertData.source_name = formData.socialPlatform === "instagram" ? "Instagram" : "LinkedIn";
          insertData.social_platform = formData.socialPlatform;
          insertData.social_username = formData.socialUsername.trim();
          insertData.social_profile_url = formData.socialProfileUrl.trim();
          break;

        case "app_store":
          insertData.source_name = formData.appStoreType === "play_store" ? "Play Store" : "App Store";
          insertData.app_store_type = formData.appStoreType;
          insertData.app_url = formData.appUrl.trim();
          break;

        case "nps":
          insertData.source_name = "NPS";
          insertData.import_method_reference = "Se subirá archivo cuando se genere el análisis";
          break;

        case "csat":
          insertData.source_name = "CSAT";
          insertData.import_method_reference = "Se subirá archivo cuando se genere el análisis";
          break;

        case "tickets":
          if (formData.ticketsMethod === "api") {
            if (!formData.apiConfig || formData.apiConfig.trim() === "") {
              throw new Error("La configuración adicional (JSON) es requerida");
            }
            insertData.source_name = formData.apiProvider === "zendesk" ? "Zendesk" : 
                                     formData.apiProvider === "hubspot" ? "HubSpot" : 
                                     "Custom API";
            insertData.tickets_method = "api";
            insertData.api_provider = formData.apiProvider;
            insertData.api_endpoint = formData.apiEndpoint.trim();
            // En producción, esto debería estar encriptado
            insertData.api_credentials_encrypted = formData.apiKey || formData.apiToken || "";
            try {
              insertData.api_config = JSON.parse(formData.apiConfig);
            } catch {
              throw new Error("La configuración adicional debe ser un JSON válido");
            }
          } else {
            insertData.source_name = "Tickets (Archivo)";
            insertData.tickets_method = "file";
            insertData.import_method_reference = "Usuario importará data desde un archivo después";
          }
          break;
      }

      // Insertar o actualizar fuente de datos
      if (existingSource?.id) {
        // Modo edición: actualizar
        const { error: updateError } = await supabase
          .from("data_sources")
          .update(insertData)
          .eq("id", existingSource.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Modo creación: insertar
        const { error: insertError } = await supabase
          .from("data_sources")
          .insert(insertData);

        if (insertError) {
          throw insertError;
        }

        // Verificar si es la primera fuente de datos para marcar el paso 3 como completado
        const { data: existingSources } = await supabase
          .from("data_sources")
          .select("id")
          .eq("organization_id", organizationId);

        if (existingSources && existingSources.length === 1) {
          // Es la primera fuente, marcar paso 3 como completado
          const { data: existingProgress } = await supabase
            .from("onboarding_progress")
            .select("id")
            .eq("organization_id", organizationId)
            .maybeSingle();

          if (existingProgress) {
            await supabase
              .from("onboarding_progress")
              .update({
                step_3_completed: true,
                step_3_completed_at: new Date().toISOString(),
              })
              .eq("organization_id", organizationId);
          } else {
            await supabase
              .from("onboarding_progress")
              .insert({
                organization_id: organizationId,
                step_3_completed: true,
                step_3_completed_at: new Date().toISOString(),
              });
          }
        }
      }

      // Limpiar formulario y cerrar
      setSourceType("");
      setFormData({
        socialPlatform: "",
        socialUsername: "",
        socialProfileUrl: "",
        appStoreType: "",
        appUrl: "",
        ticketsMethod: "",
        apiProvider: "",
        apiEndpoint: "",
        apiKey: "",
        apiToken: "",
        apiConfig: "",
      });
      setIsOpen(false);
      
      // Si hay onCancel, llamarlo
      if (onCancel) {
        onCancel();
      }
      
      // Refrescar página
      if (!existingSource?.id) {
        // Si es la primera fuente, cambiar al panel dashboard y refrescar
        const { data: existingSources } = await supabase
          .from("data_sources")
          .select("id")
          .eq("organization_id", organizationId);
        
        if (existingSources && existingSources.length === 1) {
          setActivePanel('dashboard');
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          router.refresh();
          window.location.reload();
        }
      } else {
        // Modo edición: solo refrescar
        router.refresh();
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la fuente de datos");
    } finally {
      setIsLoading(false);
    }
  };

  // Si showFormOnly es false y no está abierto, mostrar botón
  if (!showFormOnly && !isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-neutral-900 transition-all duration-300 shadow-lg font-semibold"
      >
        <Plus className="w-5 h-5" />
        <span>Agregar fuente</span>
      </motion.button>
    );
  }

  return (
    <div className="bg-transparent rounded-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de tipo de fuente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10 p-6 backdrop-blur-sm"
        >
          <div className="mb-4">
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              Tipo de fuente de datos <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "social", label: "Redes Sociales", icon: MessageSquare },
                { value: "app_store", label: "App Stores", icon: Smartphone },
                { value: "nps", label: "NPS", icon: FileText },
                { value: "csat", label: "CSAT", icon: FileText },
                { value: "tickets", label: "Tickets de Soporte", icon: Ticket },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSourceType(option.value as SourceType);
                      // Resetear formulario al cambiar tipo
                      setFormData({
                        socialPlatform: "",
                        socialUsername: "",
                        socialProfileUrl: "",
                        appStoreType: "",
                        appUrl: "",
                        ticketsMethod: "",
                        apiProvider: "",
                        apiEndpoint: "",
                        apiKey: "",
                        apiToken: "",
                        apiConfig: "",
                      });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      sourceType === option.value
                        ? "bg-black text-white shadow-sm"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Formulario dinámico según el tipo */}
        {sourceType === "social" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#C2185B]/10 via-[#FF8C00]/10 to-[#FF4500]/10 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
                {formData.socialPlatform === "instagram" ? (
                  <Instagram className="w-5 h-5 text-neutral-900" />
                ) : (
                  <Linkedin className="w-5 h-5 text-neutral-900" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-lg">Redes Sociales</h3>
                <p className="text-sm text-neutral-600">
                  Conecta tus perfiles de Instagram o LinkedIn
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-3">
                  Plataforma <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "instagram", label: "Instagram", icon: Instagram },
                    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, socialPlatform: option.value as SocialPlatform })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          formData.socialPlatform === option.value
                            ? "bg-black text-white shadow-sm"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Usuario <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.socialUsername}
                  onChange={(e) => setFormData({ ...formData, socialUsername: e.target.value })}
                  placeholder="@usuario"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  URL completa del perfil <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.socialProfileUrl}
                  onChange={(e) => setFormData({ ...formData, socialProfileUrl: e.target.value })}
                  placeholder="https://instagram.com/usuario"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}

        {sourceType === "app_store" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#191970]/10 via-[#4A0072]/10 to-[#8A2BE2]/10 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
                <Smartphone className="w-5 h-5 text-neutral-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-lg">App Stores</h3>
                <p className="text-sm text-neutral-600">
                  Conecta tu app de Play Store o App Store
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-3">
                  Tienda <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "play_store", label: "Play Store" },
                    { value: "app_store", label: "App Store" },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, appStoreType: option.value as AppStoreType })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        formData.appStoreType === option.value
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
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  URL de la app <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.appUrl}
                  onChange={(e) => setFormData({ ...formData, appUrl: e.target.value })}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}

        {(sourceType === "nps" || sourceType === "csat") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#FF8C00]/10 via-[#FF6347]/10 to-[#C2185B]/10 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
                <FileText className="w-5 h-5 text-neutral-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-lg">
                  {sourceType === "nps" ? "NPS" : "CSAT"}
                </h3>
                <p className="text-sm text-neutral-600">
                  Solo guardamos la referencia. El archivo se subirá cuando generes el análisis.
                </p>
              </div>
            </div>
            <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50">
              <p className="text-sm text-neutral-700">
                <strong>Nota:</strong> Solo guardamos la referencia de que usarás este método. 
                El archivo se subirá cuando generes el análisis.
              </p>
            </div>
          </motion.div>
        )}

        {sourceType === "tickets" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
                <Ticket className="w-5 h-5 text-neutral-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-lg">Tickets de Soporte</h3>
                <p className="text-sm text-neutral-600">
                  Conecta con tu sistema de tickets o sube archivos
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-3">
                  Método <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "api", label: "Conectar con API" },
                    { value: "file", label: "Subir archivo" },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, ticketsMethod: option.value as TicketsMethod })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        formData.ticketsMethod === option.value
                          ? "bg-black text-white shadow-sm"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {formData.ticketsMethod === "api" && (
                <div className="space-y-4 pt-4 border-t border-neutral-200/50">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-3">
                      Proveedor <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "zendesk", label: "Zendesk" },
                        { value: "hubspot", label: "HubSpot" },
                        { value: "custom", label: "Custom API" },
                      ].map((option) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, apiProvider: option.value as ApiProvider })}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            formData.apiProvider === option.value
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
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Endpoint de la API <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.apiEndpoint}
                      onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                      placeholder="https://empresa.zendesk.com/api/v2"
                      required
                      className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      API Key o Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="Tu API key o token"
                      required
                      className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Configuración adicional (JSON) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.apiConfig}
                      onChange={(e) => setFormData({ ...formData, apiConfig: e.target.value })}
                      placeholder='{"filters": {"status": "open"}, "limit": 100}'
                      rows={4}
                      required
                      className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {formData.ticketsMethod === "file" && (
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50">
                  <p className="text-sm text-neutral-700">
                    <strong>Nota:</strong> Solo guardamos la referencia de que usarás este método. 
                    El archivo se subirá cuando generes el análisis.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="flex gap-3 pt-4">
          <motion.button
            type="submit"
            disabled={isLoading || !sourceType || !validateForm()}
            whileHover={{ scale: isLoading || !sourceType || !validateForm() ? 1 : 1.02 }}
            whileTap={{ scale: isLoading || !sourceType || !validateForm() ? 1 : 0.98 }}
            className="btn-black-always flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              existingSource ? "Actualizar fuente" : "Guardar fuente"
            )}
          </motion.button>
          {(onCancel || !showFormOnly) && (
            <motion.button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSourceType("");
                setFormData({
                  socialPlatform: "",
                  socialUsername: "",
                  socialProfileUrl: "",
                  appStoreType: "",
                  appUrl: "",
                  ticketsMethod: "",
                  apiProvider: "",
                  apiEndpoint: "",
                  apiKey: "",
                  apiToken: "",
                  apiConfig: "",
                });
                setError("");
                if (onCancel) {
                  onCancel();
                }
              }}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="px-6 py-3.5 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
}
