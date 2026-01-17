"use client";

import { Trash2, Edit2, Instagram, Linkedin, Smartphone, MessageSquare, FileText, Database, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

interface DataSource {
  id: string;
  source_type: string;
  source_name: string;
  social_platform?: string;
  social_username?: string;
  social_profile_url?: string;
  app_store_type?: string;
  app_url?: string;
  tickets_method?: string;
  api_provider?: string;
  api_endpoint?: string;
  import_method_reference?: string;
  created_at: string;
}

interface DataSourceListProps {
  sources: DataSource[];
  onEdit?: (source: DataSource) => void;
}

const gradients = [
  "from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15",
  "from-[#C2185B]/15 via-[#FF8C00]/15 to-[#FF4500]/15",
  "from-[#8A2BE2]/15 via-[#4A0072]/15 to-[#191970]/15",
  "from-[#FF8C00]/15 via-[#FF6347]/15 to-[#C2185B]/15",
  "from-[#191970]/15 via-[#4A0072]/15 to-[#8A2BE2]/15",
  "from-[#C2185B]/15 via-[#8A2BE2]/15 to-[#4A0072]/15",
];

const borderColors = [
  "border-[#8A2BE2]/30",
  "border-[#FF8C00]/30",
  "border-[#4A0072]/30",
  "border-[#FF6347]/30",
  "border-[#191970]/30",
  "border-[#C2185B]/30",
];

function getSourceIcon(source: DataSource): { icon: any; label: string } {
  if (source.source_type === "social") {
    if (source.social_platform === "instagram") {
      return { icon: Instagram, label: "Instagram" };
    }
    return { icon: Linkedin, label: "LinkedIn" };
  }
  if (source.source_type === "app_store") {
    return { icon: Smartphone, label: "App Store" };
  }
  if (source.source_type === "nps" || source.source_type === "csat") {
    return { icon: FileText, label: source.source_name };
  }
  if (source.source_type === "tickets") {
    return { icon: MessageSquare, label: "Tickets" };
  }
  return { icon: Database, label: "Fuente" };
}

function getRelativeTime(date: string): string {
  const now = new Date();
  const created = new Date(date);
  const diffInMs = now.getTime() - created.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? "Hace un momento" : `Hace ${diffInMinutes} minutos`;
  }
  if (diffInHours < 24) {
    return diffInHours === 1 ? "Hace 1 hora" : `Hace ${diffInHours} horas`;
  }
  if (diffInDays === 0) {
    return "Hoy";
  }
  if (diffInDays === 1) {
    return "Ayer";
  }
  if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  }
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "Hace 1 semana" : `Hace ${weeks} semanas`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "Hace 1 mes" : `Hace ${months} meses`;
  }
  const years = Math.floor(diffInDays / 365);
  return years === 1 ? "Hace 1 año" : `Hace ${years} años`;
}

function getSourceDetails(source: DataSource): string {
  if (source.source_type === "social") {
    if (source.social_username) {
      return source.social_username;
    }
    if (source.social_profile_url) {
      return source.social_profile_url;
    }
    return "Sin configuración";
  }
  if (source.source_type === "app_store") {
    return source.app_url || "Sin URL";
  }
  if (source.source_type === "tickets") {
    if (source.tickets_method === "api") {
      return `${source.api_provider || "API"} - ${source.api_endpoint || "Sin endpoint"}`;
    }
    // Si import_method_reference contiene "documento", mostrar "Documento manual"
    if (source.import_method_reference && source.import_method_reference.toLowerCase().includes("documento")) {
      return "Documento manual";
    }
    return "Archivo (se subirá después)";
  }
  if (source.source_type === "nps" || source.source_type === "csat") {
    // Si import_method_reference contiene "documento", mostrar "Documento manual"
    if (source.import_method_reference && source.import_method_reference.toLowerCase().includes("documento")) {
      return "Documento manual";
    }
    return "Archivo (se subirá después)";
  }
  return "Sin detalles";
}

export function DataSourceList({ sources, onEdit }: DataSourceListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!confirm("¿Estás seguro de que quieres eliminar esta fuente de datos?")) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase.from("data_sources").delete().eq("id", id);
      if (error) throw error;
      router.refresh();
      window.location.reload();
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la fuente de datos");
    } finally {
      setDeletingId(null);
    }
  };

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.map((source, index) => {
        const gradientIndex = index % gradients.length;
        const gradient = gradients[gradientIndex];
        const borderColor = borderColors[gradientIndex];
        const { icon: Icon, label } = getSourceIcon(source);
        const details = getSourceDetails(source);
        const relativeTime = getRelativeTime(source.created_at);
        const isNew = new Date(source.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;

        return (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative group rounded-xl bg-gradient-to-br ${gradient} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden`}
          >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Header: Botones de acción */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(source);
                  }}
                  className="p-2 rounded-lg text-neutral-400 hover:text-[#8A2BE2] hover:bg-purple-50/80 transition-colors z-20"
                  title="Editar"
                  type="button"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => handleDelete(source.id, e)}
                disabled={deletingId === source.id}
                className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50/80 transition-colors disabled:opacity-50 z-20 relative"
                title="Eliminar"
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 pr-20">
              {/* Sección principal: Icono y título */}
              <div className="flex items-center gap-4 mb-4">
                {/* Icono destacado - más grande */}
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm shadow-md border border-white/50">
                  <Icon className="w-7 h-7 text-neutral-900" />
                </div>

                {/* Título */}
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-xl font-bold text-neutral-900 leading-tight"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    {label}
                  </h3>
                </div>
              </div>

              {/* Detalles */}
              <div className="mb-5">
                <p 
                  className="text-sm text-neutral-600 leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {details}
                </p>
              </div>

              {/* Footer: Metadatos */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/30">
                <span 
                  className="text-xs text-neutral-500 font-medium"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {relativeTime}
                </span>
                {isNew && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-neutral-400/50" />
                    <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-[#C2185B] to-[#FF8C00] text-white text-xs font-semibold rounded-full shadow-md">
                      Nuevo
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

