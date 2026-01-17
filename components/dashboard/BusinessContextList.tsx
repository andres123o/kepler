"use client";

import { Trash2, Edit2, Target, Lightbulb, TrendingUp, BarChart3, Rocket, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface BusinessContext {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface BusinessContextListProps {
  contexts: BusinessContext[];
  onEdit?: (context: BusinessContext) => void;
}

// Gradientes inspirados en la landing (púrpura, rosa/magenta, naranja, violeta, azul oscuro)
// Basados en: #4A0072, #C2185B, #FF8C00, rgba(138, 43, 226), rgba(25, 25, 112)
const gradients = [
  "from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15", // Púrpura oscuro → Violeta → Rosa magenta
  "from-[#C2185B]/15 via-[#FF8C00]/15 to-[#FF4500]/15", // Rosa magenta → Naranja → Naranja rojizo
  "from-[#8A2BE2]/15 via-[#4A0072]/15 to-[#191970]/15", // Violeta → Púrpura oscuro → Azul oscuro
  "from-[#FF8C00]/15 via-[#FF6347]/15 to-[#C2185B]/15", // Naranja → Rojo coral → Rosa magenta
  "from-[#191970]/15 via-[#4A0072]/15 to-[#8A2BE2]/15", // Azul oscuro → Púrpura → Violeta
  "from-[#C2185B]/15 via-[#8A2BE2]/15 to-[#4A0072]/15", // Rosa magenta → Violeta → Púrpura
  "from-[#FF8C00]/15 via-[#FFB347]/15 to-[#FF6347]/15", // Naranja → Naranja claro → Rojo coral
  "from-[#4A0072]/15 via-[#C2185B]/15 to-[#FF8C00]/15", // Púrpura → Rosa → Naranja
];

const borderColors = [
  "border-[#8A2BE2]/30",
  "border-[#FF8C00]/30",
  "border-[#4A0072]/30",
  "border-[#FF6347]/30",
  "border-[#191970]/30",
  "border-[#C2185B]/30",
  "border-[#FFB347]/30",
  "border-[#8A2BE2]/30",
];

// Función para detectar el tipo de contexto y devolver el icono
function getContextIcon(name: string, content: string): { icon: any; label: string } {
  const text = (name + " " + content).toLowerCase();
  
  if (text.includes("misión") || text.includes("mission")) {
    return { icon: Target, label: "Misión" };
  }
  if (text.includes("visión") || text.includes("vision")) {
    return { icon: Lightbulb, label: "Visión" };
  }
  if (text.includes("métrica") || text.includes("metric") || text.includes("kpi")) {
    return { icon: BarChart3, label: "Métricas" };
  }
  if (text.includes("objetivo") || text.includes("goal") || text.includes("target")) {
    return { icon: TrendingUp, label: "Objetivos" };
  }
  if (text.includes("estrategia") || text.includes("strategy")) {
    return { icon: Rocket, label: "Estrategia" };
  }
  return { icon: FileText, label: "Contexto" };
}

// Función para calcular tiempo relativo
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

// Función para truncar texto
function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

// Función para contar palabras
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Función para determinar si es nuevo (últimas 24 horas)
function isNew(date: string): boolean {
  const now = new Date();
  const created = new Date(date);
  const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffInHours < 24;
}

// Función para obtener tamaño del contenido
function getContentSize(wordCount: number): { label: string; color: string } {
  if (wordCount < 50) return { label: "Corto", color: "text-blue-600 bg-blue-50" };
  if (wordCount < 150) return { label: "Medio", color: "text-green-600 bg-green-50" };
  return { label: "Largo", color: "text-purple-600 bg-purple-50" };
}

export function BusinessContextList({ contexts, onEdit }: BusinessContextListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!confirm("¿Estás seguro de que quieres eliminar este contexto?")) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("business_context")
        .delete()
        .eq("id", id);

      if (error) throw error;

      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar el contexto");
    } finally {
      setDeletingId(null);
    }
  };


  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalWords = contexts.reduce((sum, ctx) => sum + countWords(ctx.content), 0);
    const avgWords = contexts.length > 0 ? Math.round(totalWords / contexts.length) : 0;
    const newestContext = contexts.length > 0 
      ? contexts.reduce((newest, ctx) => 
          new Date(ctx.created_at) > new Date(newest.created_at) ? ctx : newest
        )
      : null;

    return {
      total: contexts.length,
      totalWords,
      avgWords,
      newestContext,
    };
  }, [contexts]);

  if (contexts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Widget de Estadísticas con colores de la landing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-gradient-to-br from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10 rounded-xl border border-[#8A2BE2]/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#8A2BE2] to-[#C2185B] rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total de contextos</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FF8C00]/10 via-[#FF6347]/10 to-[#C2185B]/10 rounded-xl border border-[#FF8C00]/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#FF8C00] to-[#FF6347] rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Palabras totales</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalWords.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#191970]/10 via-[#4A0072]/10 to-[#8A2BE2]/10 rounded-xl border border-[#191970]/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#191970] to-[#4A0072] rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Promedio por contexto</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.avgWords}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contexts.map((context, index) => {
          const gradient = gradients[index % gradients.length];
          const borderColor = borderColors[index % borderColors.length];
          const { icon: Icon, label } = getContextIcon(context.name, context.content);
          const wordCount = countWords(context.content);
          const contentSize = getContentSize(wordCount);
          const relativeTime = getRelativeTime(context.created_at);
          const isNewContext = isNew(context.created_at);
          const isHovered = hoveredId === context.id;

          return (
            <motion.div
              key={context.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredId(context.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative group rounded-2xl border ${borderColor} bg-gradient-to-br ${gradient} p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Badge "Nuevo" con colores de la landing */}
              {isNewContext && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#C2185B] to-[#FF8C00] text-white text-xs font-semibold rounded-full shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    Nuevo
                  </span>
                </div>
              )}

              {/* Header con Icono */}
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40">
                    <Icon className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <h4
                      className="text-lg font-bold text-neutral-900 mb-1 line-clamp-1"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      {context.name}
                    </h4>
                    <span className="text-xs text-neutral-500 font-medium">{label}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2 z-20 pointer-events-auto">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(context);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isHovered
                          ? "opacity-100 bg-purple-50 text-[#8A2BE2] hover:bg-purple-100"
                          : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-[#8A2BE2]"
                      }`}
                      title="Editar"
                      type="button"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(context.id, e)}
                    disabled={deletingId === context.id}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isHovered
                        ? "opacity-100 bg-red-50 text-red-600 hover:bg-red-100"
                        : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600"
                    } disabled:opacity-50`}
                    title="Eliminar"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview del contenido */}
              <p
                className="text-sm text-neutral-600 mb-4 line-clamp-3 leading-relaxed relative z-10"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {truncateText(context.content, 120)}
              </p>

              {/* Footer con badges */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Badge de tamaño */}
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${contentSize.color}`}>
                    {contentSize.label}
                  </span>
                  
                  {/* Badge de palabras */}
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600">
                    {wordCount} palabras
                  </span>
                </div>

                {/* Fecha relativa */}
                <span
                  className="text-xs text-neutral-400 font-medium whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {relativeTime}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
