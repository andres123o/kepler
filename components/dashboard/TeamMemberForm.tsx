"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "./DashboardContext";

interface TeamMemberFormProps {
  organizationId: string;
  onCancel?: () => void;
  showFormOnly?: boolean;
}

export function TeamMemberForm({ organizationId, onCancel, showFormOnly = false }: TeamMemberFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { setActivePanel } = useDashboard();
  const [isOpen, setIsOpen] = useState(showFormOnly || !!onCancel);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "member" as "admin" | "member",
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

      // Buscar el perfil del usuario por email
      // Nota: Solo podemos agregar usuarios que ya tienen cuenta en el sistema
      // En producción, esto debería enviar una invitación por email
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email.trim().toLowerCase())
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!existingProfile) {
        throw new Error("Este usuario no tiene una cuenta en el sistema. Por favor, pídele que se registre primero o envía una invitación.");
      }

      const profileId = (existingProfile as any).id;

      // Verificar si el miembro ya existe en la organización
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("user_id", profileId)
        .single();

      if (existingMember) {
        throw new Error("Este usuario ya es miembro de la organización");
      }

      // Insertar miembro en la organización
      const { error: insertError } = await supabase
        .from("organization_members")
        // @ts-ignore - Supabase client types issue with generic table
        .insert({
          organization_id: organizationId,
          user_id: profileId,
          role: formData.role,
        });

      if (insertError) {
        throw insertError;
      }

      // Verificar si es el primer miembro para marcar el paso 2 como completado
      const { data: existingMembers } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organizationId);

      if (existingMembers && existingMembers.length === 1) {
        // Es el primer miembro, marcar paso 2 como completado
        const { data: existingProgress } = await supabase
          .from("onboarding_progress")
          .select("id")
          .eq("organization_id", organizationId)
          .maybeSingle();

        if (existingProgress) {
          // Actualizar progreso existente
          await supabase
            .from("onboarding_progress")
            // @ts-ignore - Supabase client types issue with generic table
            .update({
              step_2_completed: true,
              step_2_completed_at: new Date().toISOString(),
            })
            .eq("organization_id", organizationId);
        } else {
          // Crear registro de progreso
          await supabase
            .from("onboarding_progress")
            // @ts-ignore - Supabase client types issue with generic table
            .insert({
              organization_id: organizationId,
              step_2_completed: true,
              step_2_completed_at: new Date().toISOString(),
            });
        }
      }

      // Limpiar formulario y cerrar
      setFormData({ email: "", full_name: "", role: "member" });
      setIsOpen(false);
      
      // Si es el primer miembro, cambiar al panel dashboard y refrescar
      if (existingMembers && existingMembers.length === 1) {
        setActivePanel('dashboard');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        router.refresh();
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el miembro");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !showFormOnly && !onCancel) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors shadow-sm hover:shadow-md"
        style={{
          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl" />

        <div className="relative z-10 flex items-center gap-2">
          <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
          <span className="text-sm font-semibold text-white transition-colors">
            Agregar miembro
          </span>
        </div>
      </motion.button>
    );
  }

  return (
    <div className="bg-transparent rounded-xl border border-neutral-200/50 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-neutral-900 mb-2"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Email del miembro
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ejemplo@empresa.com"
            required
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-semibold text-neutral-900 mb-2"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Nombre completo
          </label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Juan Pérez"
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-semibold text-neutral-900 mb-2"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Rol
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "member" })}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            <option value="member">Miembro</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              "Agregar miembro"
            )}
          </button>
          {(onCancel || !showFormOnly) && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setFormData({ email: "", full_name: "", role: "member" });
                setError("");
                if (onCancel) {
                  onCancel();
                }
              }}
              disabled={isLoading}
              className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

