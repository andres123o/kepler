"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Calendar, 
  Shield, 
  Settings as SettingsIcon,
  Plus,
  Edit2,
  Save,
  X,
  Loader2
} from "lucide-react";
import { TeamMemberForm } from "./TeamMemberForm";
import { TeamMemberList } from "./TeamMemberList";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SettingsPanelProps {
  organization: any;
  organizationMembers?: any[];
}

export function SettingsPanel({ organization, organizationMembers = [] }: SettingsPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orgFormData, setOrgFormData] = useState({
    name: organization?.name || "",
  });

  const handleSaveOrg = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        // @ts-ignore - Supabase client types issue with generic table
        .update({ name: orgFormData.name.trim() })
        .eq("id", organization.id);

      if (error) throw error;

      setIsEditingOrg(false);
      router.refresh();
      window.location.reload();
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Error al actualizar la organización");
    } finally {
      setIsSaving(false);
    }
  };

  // Calcular días restantes de prueba
  const getTrialDaysRemaining = () => {
    if (!organization?.trial_ends_at) return null;
    const trialEnd = new Date(organization.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const isTrialActive = organization?.subscription_status === "trial" && trialDaysRemaining && trialDaysRemaining > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 
          className="text-3xl font-bold text-neutral-900 mb-2"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          Configuración
        </h2>
        <p 
          className="text-neutral-600"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Gestiona la configuración de tu organización, plan, miembros y más.
        </p>
      </div>

      {/* Sección 1: Información de la Organización */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-[#4A0072] to-[#8A2BE2] rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h3 
            className="text-xl font-bold text-neutral-900"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Información de la Organización
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre de la organización */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-neutral-700">Nombre de la organización</label>
              {!isEditingOrg && (
                <button
                  onClick={() => setIsEditingOrg(true)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-white/50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {isEditingOrg ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={orgFormData.name}
                  onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                />
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleSaveOrg}
                    disabled={isSaving || !orgFormData.name.trim()}
                    whileHover={{ scale: isSaving ? 1 : 1.02 }}
                    whileTap={{ scale: isSaving ? 1 : 0.98 }}
                    className="btn-black-always flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={() => {
                      setIsEditingOrg(false);
                      setOrgFormData({ name: organization?.name || "" });
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <p 
                className="text-lg font-semibold text-neutral-900"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {organization?.name || "Sin nombre"}
              </p>
            )}
          </div>

          {/* Plan */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#C2185B]/15 via-[#FF8C00]/15 to-[#FF4500]/15 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-neutral-600" />
              <label className="text-sm font-semibold text-neutral-700">Plan actual</label>
            </div>
            <p 
              className="text-lg font-semibold text-neutral-900 capitalize"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {organization?.plan || "hobby"}
            </p>
            <button className="mt-3 text-sm text-neutral-600 hover:text-neutral-900 font-medium">
              Ver planes disponibles →
            </button>
          </div>

          {/* Estado de suscripción */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#191970]/15 via-[#4A0072]/15 to-[#8A2BE2]/15 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-neutral-600" />
              <label className="text-sm font-semibold text-neutral-700">Estado</label>
            </div>
            <p 
              className="text-lg font-semibold text-neutral-900 capitalize"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {organization?.subscription_status || "trial"}
            </p>
          </div>

          {/* Prueba gratuita */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#FF8C00]/15 via-[#FF6347]/15 to-[#C2185B]/15 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-neutral-600" />
              <label className="text-sm font-semibold text-neutral-700">Prueba gratuita</label>
            </div>
            {isTrialActive ? (
              <>
                <p 
                  className="text-lg font-semibold text-neutral-900"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {trialDaysRemaining} {trialDaysRemaining === 1 ? "día" : "días"} restantes
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Hasta {organization?.trial_ends_at ? new Date(organization.trial_ends_at).toLocaleDateString('es-ES') : "N/A"}
                </p>
              </>
            ) : (
              <p 
                className="text-lg font-semibold text-neutral-900"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {organization?.trial_ends_at 
                  ? new Date(organization.trial_ends_at).toLocaleDateString('es-ES')
                  : "N/A"
                }
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sección 2: Miembros del Equipo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#8A2BE2] to-[#C2185B] rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 
              className="text-xl font-bold text-neutral-900"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Miembros del Equipo
            </h3>
          </div>
          {!isAddingMember && organizationMembers.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddingMember(true)}
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl" />
              <div className="relative z-10 flex items-center gap-2">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-sm font-semibold">Invitar miembro</span>
              </div>
            </motion.button>
          )}
        </div>

        {/* Formulario o Lista */}
        {isAddingMember || organizationMembers.length === 0 ? (
          <TeamMemberForm 
            organizationId={organization.id}
            onCancel={() => setIsAddingMember(false)}
            showFormOnly={organizationMembers.length === 0}
          />
        ) : (
          <TeamMemberList members={organizationMembers} />
        )}
      </motion.div>

      {/* Sección 3: Otras configuraciones (placeholder para futuro) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-[#191970] to-[#4A0072] rounded-lg">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <h3 
            className="text-xl font-bold text-neutral-900"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Otras Configuraciones
          </h3>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-br from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10 p-6 backdrop-blur-sm">
          <p className="text-sm text-neutral-600">
            Más opciones de configuración estarán disponibles próximamente.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

