"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User } from "lucide-react";
import { motion } from "framer-motion";

export type TeamContextFormPayload = {
  organization_id: string;
  nombre: string;
  rol: string | null;
  foco: string | null;
  id?: string;
};

interface TeamContextFormProps {
  organizationId: string;
  onCancel?: () => void;
  showFormOnly?: boolean;
  existingContext?: any;
  /** Conectar al backend: POST /api/team-context (o equivalente) */
  onSave?: (payload: TeamContextFormPayload) => Promise<void>;
}

export function TeamContextForm({ organizationId, onCancel, showFormOnly = false, existingContext, onSave }: TeamContextFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(showFormOnly || !!onCancel || !!existingContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre: existingContext?.nombre ?? existingContext?.name ?? "",
    rol: existingContext?.rol ?? "",
    foco: existingContext?.foco ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload: TeamContextFormPayload = {
        organization_id: organizationId,
        nombre: formData.nombre.trim(),
        rol: formData.rol.trim() || null,
        foco: formData.foco.trim() || null,
      };
      if (existingContext?.id) payload.id = existingContext.id;

      if (onSave) {
        await onSave(payload);
      }

      setFormData({ nombre: "", rol: "", foco: "" });
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar el miembro del equipo");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !showFormOnly && !onCancel) {
    return null;
  }

  return (
    <div className="bg-transparent rounded-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
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
                Nombre, rol y foco del miembro del equipo
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Andrés Felipe"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Rol
              </label>
              <input
                type="text"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                placeholder="Ej: Product Manager, Designer..."
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Foco
              </label>
              <input
                type="text"
                value={formData.foco}
                onChange={(e) => setFormData({ ...formData, foco: e.target.value })}
                placeholder="Ej: Experiencia de usuario, Métricas de producto..."
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
            </div>
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
                setFormData({ nombre: "", rol: "", foco: "" });
                setError("");
                if (onCancel) onCancel();
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
