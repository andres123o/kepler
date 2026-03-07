"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, FileText, Target } from "lucide-react";
import { motion } from "framer-motion";

export type BusinessContextFormPayload = {
  organization_id: string;
  name: string;
  content: string;
  id?: string;
};

interface BusinessContextFormProps {
  organizationId: string;
  onCancel?: () => void;
  showFormOnly?: boolean;
  existingContext?: any;
  /** Conectar al backend: POST /api/business-context (o equivalente) */
  onSave?: (payload: BusinessContextFormPayload) => Promise<void>;
}

export function BusinessContextForm({ organizationId, onCancel, showFormOnly = false, existingContext, onSave }: BusinessContextFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(showFormOnly || !!onCancel || !!existingContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: existingContext?.name || "",
    content: existingContext?.content || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload: BusinessContextFormPayload = {
        organization_id: organizationId,
        name: formData.name.trim(),
        content: formData.content.trim(),
      };
      if (existingContext?.id) payload.id = existingContext.id;

      if (onSave) {
        await onSave(payload);
      }

      setFormData({ name: "", content: "" });
      setIsOpen(false);
      if (onCancel) onCancel();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar el contexto");
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
        className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-300 shadow-sm hover:shadow-md"
        style={{
          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl" />
        
        <div className="relative z-10 flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-sm font-semibold">
            Nuevo contexto
          </span>
        </div>
      </motion.button>
    );
  }

  return (
    <div className="bg-transparent rounded-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card: Información del contexto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/50 backdrop-blur-sm">
              <FileText className="w-5 h-5 text-neutral-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-neutral-900 text-lg">Información del contexto</h3>
              <p className="text-sm text-neutral-600">
                Nombre y contenido del contexto de negocio
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Nombre contexto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Misión, Visión Q1 2024, Métricas clave..."
                required
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">
                Texto <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Describe la misión, visión, métricas, objetivos o cualquier contexto relevante de tu negocio..."
                required
                rows={6}
                className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
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
              existingContext?.id ? "Actualizar contexto" : "Guardar contexto"
            )}
          </motion.button>
          {(onCancel || !showFormOnly) && (
            <motion.button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setFormData({ name: "", content: "" });
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

