"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Loader2, User, Briefcase, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "./DashboardContext";

interface TeamContextFormProps {
  organizationId: string;
  onCancel?: () => void;
  showFormOnly?: boolean; // Si es true, siempre muestra el formulario (para primera vez)
  existingContext?: any; // Si se proporciona, el formulario está en modo edición
}

export function TeamContextForm({ organizationId, onCancel, showFormOnly = false, existingContext }: TeamContextFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { setActivePanel } = useDashboard();
  // Si hay onCancel o showFormOnly, el formulario debe estar abierto desde el inicio
  const [isOpen, setIsOpen] = useState(showFormOnly || !!onCancel || !!existingContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: existingContext?.name || "",
    email: existingContext?.email || "",
    expertise: existingContext?.expertise || "",
    responsible_for: existingContext?.responsible_for || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No estás autenticado");
      }

      // Insertar o actualizar contexto del equipo
      if (existingContext?.id) {
        // Modo edición: actualizar
        const { error: updateError } = await supabase
          .from("team_context")
          .update({
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            expertise: formData.expertise.trim(),
            responsible_for: formData.responsible_for.trim(),
          })
          .eq("id", existingContext.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Modo creación: insertar
        const { error: insertError } = await supabase
          .from("team_context")
          .insert({
            organization_id: organizationId,
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            expertise: formData.expertise.trim(),
            responsible_for: formData.responsible_for.trim(),
            created_by: user.id,
          });

        if (insertError) {
          throw insertError;
        }

        // Verificar si es el primer contexto de equipo para marcar el paso 2 como completado
        const { data: existingContexts } = await supabase
          .from("team_context")
          .select("id")
          .eq("organization_id", organizationId);

        if (existingContexts && existingContexts.length === 1) {
        // Es el primer contexto, marcar paso 2 como completado
        const { data: existingProgress } = await supabase
          .from("onboarding_progress")
          .select("id")
          .eq("organization_id", organizationId)
          .maybeSingle();

        if (existingProgress) {
          // Actualizar progreso existente
          await supabase
            .from("onboarding_progress")
            .update({
              step_2_completed: true,
              step_2_completed_at: new Date().toISOString(),
            })
            .eq("organization_id", organizationId);
        } else {
          // Crear registro de progreso
          await supabase
            .from("onboarding_progress")
            .insert({
              organization_id: organizationId,
              step_2_completed: true,
              step_2_completed_at: new Date().toISOString(),
            });
        }
      }
      }

      // Limpiar formulario y cerrar
      setFormData({ name: "", email: "", expertise: "", responsible_for: "" });
      setIsOpen(false);
      
      // Refrescar página
      if (existingContext?.id) {
        // Modo edición: solo refrescar
        router.refresh();
        window.location.reload();
      } else {
        // Modo creación: verificar si es el primer contexto
        const { data: existingContexts } = await supabase
          .from("team_context")
          .select("id")
          .eq("organization_id", organizationId);
        
        if (existingContexts && existingContexts.length === 1) {
          setActivePanel('dashboard');
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          router.refresh();
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el contexto del equipo");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !showFormOnly && !onCancel) {
    return null; // No mostrar nada si no está abierto y no es showFormOnly
  }

  return (
    <div className="bg-transparent rounded-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card: Información básica */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
              <User className="w-5 h-5 text-neutral-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-900 text-lg">Información básica</h3>
              <p className="text-sm text-neutral-600">
                Nombre y contacto del miembro del equipo
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Andrés Felipe"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Correo (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ejemplo@empresa.com"
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Card: Especialidad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#C2185B]/10 via-[#FF8C00]/10 to-[#FF4500]/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
              <Briefcase className="w-5 h-5 text-neutral-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-900 text-lg">Especialidad</h3>
              <p className="text-sm text-neutral-600">
                Qué hace, quién es y para qué es bueno
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              Especialidad/Experto de <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              placeholder="Describe qué hace, quién es y para qué es bueno. Ej: Experto en análisis de datos, especializado en métricas de producto y experiencia de usuario..."
              required
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            />
          </div>
        </motion.div>

        {/* Card: Responsabilidades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#191970]/10 via-[#4A0072]/10 to-[#8A2BE2]/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
              <Target className="w-5 h-5 text-neutral-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-900 text-lg">Responsabilidades</h3>
              <p className="text-sm text-neutral-600">
                De qué es responsable dentro de la empresa
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              Responsable de <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.responsible_for}
              onChange={(e) => setFormData({ ...formData, responsible_for: e.target.value })}
              placeholder="Describe de qué es responsable dentro de la empresa. Ej: Responsable del área de producto, encargado de la experiencia del usuario y métricas de retención..."
              required
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            />
          </div>
        </motion.div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="btn-black-always flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              existingContext ? "Actualizar miembro" : "Guardar miembro"
            )}
          </motion.button>
          {(onCancel || !showFormOnly) && (
            <motion.button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setFormData({ name: "", email: "", expertise: "", responsible_for: "" });
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

