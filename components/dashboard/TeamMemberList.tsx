"use client";

import { Trash2, User, Shield, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

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

interface TeamMemberListProps {
  members: TeamMember[];
}

// Gradientes del arcoíris (mismos que business_context)
const gradients = [
  "from-[#4A0072]/10 via-[#C2185B]/10 to-[#FF8C00]/10",
  "from-[#191970]/10 via-blue-500/10 to-cyan-500/10",
  "from-[#FF8C00]/10 via-amber-500/10 to-red-500/10",
  "from-green-500/10 via-emerald-500/10 to-teal-500/10",
  "from-[#8A2BE2]/10 via-purple-500/10 to-fuchsia-500/10",
  "from-rose-500/10 via-pink-500/10 to-purple-500/10",
  "from-indigo-500/10 via-blue-500/10 to-cyan-500/10",
  "from-yellow-500/10 via-amber-500/10 to-orange-500/10",
];

const borderColors = [
  "border-[#8A2BE2]/20",
  "border-blue-200/20",
  "border-orange-200/20",
  "border-green-200/20",
  "border-violet-200/20",
  "border-pink-200/20",
  "border-indigo-200/20",
  "border-yellow-200/20",
];

// Función para obtener tiempo relativo
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

export function TeamMemberList({ members }: TeamMemberListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este miembro del equipo?")) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", id);

      if (error) throw error;

      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar el miembro");
    } finally {
      setDeletingId(null);
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = members.length;
    const admins = members.filter(m => m.role === 'admin').length;
    const regularMembers = members.filter(m => m.role === 'member').length;
    return { total, admins, regularMembers };
  }, [members]);

  if (members.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Widget de Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-gradient-to-br from-[#4A0072]/10 to-[#C2185B]/10 rounded-xl border border-[#8A2BE2]/20 p-4 backdrop-blur-sm">
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

        <div className="bg-gradient-to-br from-[#191970]/10 to-cyan-500/10 rounded-xl border border-blue-200/20 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Administradores</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.admins}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200/20 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Miembros</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.regularMembers}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => {
          const gradient = gradients[index % gradients.length];
          const borderColor = borderColors[index % borderColors.length];
          const isHovered = hoveredId === member.id;
          // Supabase devuelve profiles como un objeto o array, dependiendo de la consulta
          const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
          const displayName = profile?.full_name || profile?.email || "Sin nombre";
          const displayEmail = profile?.email || "Sin email";
          const relativeTime = getRelativeTime(member.created_at);

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative group rounded-2xl border ${borderColor} bg-gradient-to-br ${gradient} p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Header con Icono y Rol */}
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40">
                    {member.role === 'admin' ? (
                      <Shield className="w-5 h-5 text-neutral-700" />
                    ) : (
                      <User className="w-5 h-5 text-neutral-700" />
                    )}
                  </div>
                  <div>
                    <h4
                      className="text-lg font-bold text-neutral-900 mb-1 line-clamp-1"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      {displayName}
                    </h4>
                    <p
                      className="text-xs text-neutral-500 flex items-center gap-1"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      <Mail className="w-3 h-3" />
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badge de Rol */}
              <div className="mb-4 relative z-10">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  member.role === 'admin' 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-blue-600 bg-blue-50'
                }`}>
                  {member.role === 'admin' ? 'Administrador' : 'Miembro'}
                </span>
              </div>

              {/* Footer con Tiempo y Botón Eliminar */}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs text-neutral-500">
                  {relativeTime}
                </span>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleDelete(member.id)}
                  disabled={deletingId === member.id}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

