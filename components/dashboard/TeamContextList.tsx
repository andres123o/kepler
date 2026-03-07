"use client";

import { Trash2, Edit2, User, Briefcase, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface TeamContext {
  id: string;
  nombre: string;
  rol: string | null;
  foco: string | null;
  created_at: string;
}

interface TeamContextListProps {
  contexts: TeamContext[];
  onEdit?: (context: TeamContext) => void;
  /** Conectar al backend: DELETE /api/team-context/:id (o equivalente) */
  onDelete?: (id: string) => Promise<void>;
}

const gradients = [
  "from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15",
  "from-[#C2185B]/15 via-[#FF8C00]/15 to-[#FF4500]/15",
  "from-[#8A2BE2]/15 via-[#4A0072]/15 to-[#191970]/15",
  "from-[#FF8C00]/15 via-[#FF6347]/15 to-[#C2185B]/15",
  "from-[#191970]/15 via-[#4A0072]/15 to-[#8A2BE2]/15",
  "from-[#C2185B]/15 via-[#8A2BE2]/15 to-[#4A0072]/15",
];

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMinutes < 1) return "Hace segundos";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
}

function isNew(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffHours < 24;
}

export function TeamContextList({ contexts, onEdit, onDelete }: TeamContextListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!confirm("¿Estás seguro de que quieres eliminar este miembro del equipo?")) return;

    setDeletingId(id);
    try {
      if (onDelete) await onDelete(id);
      router.refresh();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar el miembro");
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => ({ total: contexts.length }), [contexts]);

  if (contexts.length === 0) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-gradient-to-br from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#8A2BE2] to-[#C2185B] rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total de miembros</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {contexts.map((context, index) => {
          const gradient = gradients[index % gradients.length];
          const relativeTime = getRelativeTime(context.created_at);
          const isNewContext = isNew(context.created_at);
          const nombre = context.nombre ?? (context as any).name ?? "";

          return (
            <motion.div
              key={context.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group rounded-2xl bg-gradient-to-br ${gradient} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                {isNewContext && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-[#C2185B] to-[#FF8C00] text-white text-xs font-semibold rounded-full shadow-lg">
                    Nuevo
                  </span>
                )}
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(context);
                    }}
                    className="p-2 rounded-lg text-neutral-400 hover:text-[#8A2BE2] hover:bg-purple-50/80 transition-colors z-20 relative"
                    title="Editar"
                    type="button"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(context.id, e)}
                  disabled={deletingId === context.id}
                  className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50/80 transition-colors disabled:opacity-50 z-20 relative"
                  title="Eliminar"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10 pr-20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm shadow-md border border-white/50">
                    <User className="w-7 h-7 text-neutral-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-neutral-900 mb-1.5 leading-tight">
                      {nombre}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {context.rol && (
                    <div>
                      <p className="text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Rol
                      </p>
                      <p className="text-sm text-neutral-600 leading-relaxed">{context.rol}</p>
                    </div>
                  )}
                  {context.foco && (
                    <div>
                      <p className="text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        Foco
                      </p>
                      <p className="text-sm text-neutral-600 leading-relaxed">{context.foco}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/30">
                  <span className="text-xs text-neutral-500 font-medium">{relativeTime}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
