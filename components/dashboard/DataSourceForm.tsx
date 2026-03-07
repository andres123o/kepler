"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Instagram, Linkedin, Smartphone, MessageSquare, Ticket, FileText, Database, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DataSourceFormProps {
  organizationId: string;
  onCancel?: () => void;
  showFormOnly?: boolean;
  existingSource?: any;
  /** Conectar al backend: POST /api/data-sources (o equivalente) */
  onSave?: (payload: Record<string, unknown>) => Promise<void>;
}

type SourceType = "social" | "app_store" | "website" | "nps" | "tickets" | "internal_data";
type SocialPlatform = "instagram" | "linkedin";
type AppStoreType = "play_store" | "app_store";
type TicketsMethod = "api" | "file";
type InternalDataMethod = "api" | "file";
type ApiProvider = "zendesk" | "hubspot" | "custom";

export function DataSourceForm({ organizationId, onCancel, showFormOnly = false, existingSource, onSave }: DataSourceFormProps) {
  const router = useRouter();
  // Si hay onCancel o showFormOnly, el formulario debe estar abierto desde el inicio
  const [isOpen, setIsOpen] = useState(showFormOnly || !!onCancel || !!existingSource);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
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
    // Sitio Web
    websiteUrl: existingSource?.website_url || "",
    // Tickets
    ticketsMethod: (existingSource?.tickets_method || "") as TicketsMethod | "",
    // Internal Data
    internalDataMethod: (existingSource?.internal_data_method || "") as InternalDataMethod | "",
    // API (compartido entre tickets e internal_data)
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
      case "website":
        return !!formData.websiteUrl?.trim();
      case "nps":
        return true; // No requieren campos adicionales
      case "tickets":
        // Solo validar método "file" (API bloqueada)
        return formData.ticketsMethod === "file";
      case "internal_data":
        // Solo validar método "file" (API bloqueada)
        return formData.internalDataMethod === "file";
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
      const insertData: Record<string, unknown> = {
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

        case "website":
          if (!formData.websiteUrl?.trim()) {
            throw new Error("Debes proporcionar la URL del sitio web");
          }
          insertData.source_name = "Sitio Web";
          insertData.website_url = formData.websiteUrl.trim();
          break;

        case "nps":
          insertData.source_name = "NPS";
          insertData.import_method_reference = "Se subirá archivo cuando se genere el análisis";
          break;

        case "tickets":
          // Solo permitir método "file" por ahora (API bloqueada)
          if (formData.ticketsMethod === "api") {
            throw new Error("La conexión con API estará disponible pronto. Por ahora, usa la opción de subir archivo.");
          }
          insertData.source_name = "Tickets (Archivo)";
          insertData.tickets_method = "file";
          insertData.import_method_reference = "Usuario importará data desde un archivo después";
          break;

        case "internal_data":
          // Solo permitir método "file" por ahora (API bloqueada)
          if (formData.internalDataMethod === "api") {
            throw new Error("La conexión con API estará disponible pronto. Por ahora, usa la opción de subir archivo.");
          }
          insertData.source_name = "Data Interna (Archivo)";
          insertData.internal_data_method = "file";
          insertData.import_method_reference = "Usuario importará data interna desde un archivo después";
          break;
      }

      if (existingSource?.id) {
        (insertData as any).id = existingSource.id;
      }
      if (onSave) {
        await onSave(insertData);
      }

      // Limpiar formulario y cerrar
      setSourceType("");
      setFormData({
        socialPlatform: "",
        socialUsername: "",
        socialProfileUrl: "",
        appStoreType: "",
        appUrl: "",
        websiteUrl: "",
        ticketsMethod: "",
        internalDataMethod: "",
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
      
      // Refrescar datos del servidor sin cambiar de panel ni recargar la página
      router.refresh();
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
                { value: "website", label: "Sitio Web", icon: Globe },
                { value: "social", label: "Redes Sociales", icon: MessageSquare },
                { value: "app_store", label: "App Stores", icon: Smartphone },
                { value: "nps", label: "NPS", icon: FileText },
                { value: "tickets", label: "Tickets de Soporte", icon: Ticket },
                { value: "internal_data", label: "Data Interna", icon: Database },
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
                        websiteUrl: "",
                        ticketsMethod: "",
                        internalDataMethod: "",
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

        {sourceType === "website" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#0ea5e9]/10 via-[#06b6d4]/10 to-[#22c55e]/10 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
                <Globe className="w-5 h-5 text-neutral-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-lg">Sitio Web</h3>
                <p className="text-sm text-neutral-600">
                  Añade la URL de tu sitio web para analizar su contenido
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  URL del sitio web <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://tuempresa.com"
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

        {sourceType === "nps" && (
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
                  NPS
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
                    { value: "api", label: "Conectar con API", disabled: true },
                    { value: "file", label: "Subir archivo", disabled: false },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (option.disabled) {
                          setShowComingSoonModal(true);
                        } else {
                          setFormData({ ...formData, ticketsMethod: option.value as TicketsMethod });
                        }
                      }}
                      whileHover={option.disabled ? {} : { scale: 1.05 }}
                      whileTap={option.disabled ? {} : { scale: 0.95 }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        formData.ticketsMethod === option.value
                          ? "bg-black text-white shadow-sm"
                          : option.disabled
                          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

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

        {sourceType === "internal_data" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl bg-gradient-to-br from-[#191970]/10 via-[#4A0072]/10 to-[#8A2BE2]/10 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
                <Database className="w-5 h-5 text-neutral-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-lg">Data Interna</h3>
                <p className="text-sm text-neutral-600">
                  Conecta con tu API de Product Analytics o sube archivos de datos internos
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
                    { value: "api", label: "Conectar con API", disabled: true },
                    { value: "file", label: "Subir archivo", disabled: false },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (option.disabled) {
                          setShowComingSoonModal(true);
                        } else {
                          setFormData({ ...formData, internalDataMethod: option.value as InternalDataMethod });
                        }
                      }}
                      whileHover={option.disabled ? {} : { scale: 1.05 }}
                      whileTap={option.disabled ? {} : { scale: 0.95 }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        formData.internalDataMethod === option.value
                          ? "bg-black text-white shadow-sm"
                          : option.disabled
                          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {formData.internalDataMethod === "api" && (
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
                      placeholder="https://api.amplitude.com/v2/events"
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
                      placeholder='{"filters": {"event_type": "funnel"}, "date_range": "last_30_days"}'
                      rows={4}
                      required
                      className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {formData.internalDataMethod === "file" && (
                <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-neutral-200/50">
                  <p className="text-sm text-neutral-700">
                    <strong>Nota:</strong> Solo guardamos la referencia de que usarás este método. 
                    El archivo se subirá cuando generes el análisis. Puedes subir datos de funnels, 
                    métricas, logs de errores, User Journey, etc.
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
                  websiteUrl: "",
                  ticketsMethod: "",
                  internalDataMethod: "",
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

      {/* Modal "Disponible pronto" */}
      <AnimatePresence>
        {showComingSoonModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComingSoonModal(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neutral-200">
                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-[#8A2BE2]/10 to-[#C2185B]/10 flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-[#8A2BE2]" />
                  </div>
                  <h3 
                    className="text-xl font-bold text-neutral-900 mb-2"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    Disponible pronto
                  </h3>
                  <p 
                    className="text-sm text-neutral-600 mb-6"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    La conexión con API estará disponible próximamente. Por ahora, puedes subir tus datos mediante archivo.
                  </p>
                  <motion.button
                    onClick={() => setShowComingSoonModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-neutral-900 transition-colors"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    Entendido
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
