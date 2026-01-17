"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, TrendingUp, ArrowRight, Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    id: "hobby",
    name: "Hobby",
    tagline: "Prueba la magia",
    description: "14 días gratis, luego $7.99/mes",
    icon: Sparkles,
    popular: false,
  },
  {
    id: "startup",
    name: "Startup",
    tagline: "El más popular",
    description: "$39/mes",
    icon: Rocket,
    popular: true,
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Para escalar",
    description: "$99/mes",
    icon: TrendingUp,
    popular: false,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get("plan") || "hobby";
  
  const [selectedPlan, setSelectedPlan] = useState(selectedPlanId);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const supabase = createClient();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("No se pudo crear el usuario");
      }

      // 2. Verificar si necesita confirmar email
      if (authData.user && !authData.session) {
        // Email confirmation está habilitado
        // El perfil se crea automáticamente por el trigger
        // La organización se creará cuando confirme el email (en el callback o al iniciar sesión)
        setError("");
        setIsLoading(false);
        alert("¡Registro exitoso! Por favor, revisa tu correo y haz clic en el enlace de confirmación para activar tu cuenta. Luego podrás iniciar sesión.");
        router.push("/login");
        return;
      }

      // 3. Si tiene sesión activa (sin confirmación de email), crear organización
      if (authData.session && authData.user) {
        // El perfil ya fue creado por el trigger con el full_name del metadata
        // No necesitamos actualizarlo manualmente

        // Crear organización con el plan seleccionado
        const trialEndsAt = selectedPlan === "hobby" 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const { error: orgError } = await supabase
          .from("organizations")
          // @ts-ignore - Supabase client types issue in client components
          .insert({
            name: fullName ? `${fullName}'s Organization` : "Mi Organización",
            slug: `${authData.user.id}-${Date.now()}`,
            owner_id: authData.user.id,
            plan: selectedPlan as "hobby" | "startup" | "growth",
            trial_ends_at: trialEndsAt,
            subscription_status: selectedPlan === "hobby" ? "trial" : "active",
          } as any);

        if (orgError) {
          // Si la org ya existe, no es problema (puede pasar si se registra dos veces)
          if (!orgError.message.includes("duplicate") && !orgError.message.includes("unique")) {
            throw orgError;
          }
        }

        // Redirigir al dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "google") => {
    setError("");
    setIsOAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?plan=${selectedPlan}`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF7] flex items-center justify-center px-4 pt-32 pb-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 
            className="text-3xl font-bold text-neutral-900 mb-2"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Crear cuenta
          </h1>
          <p 
            className="text-muted-foreground mb-1"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Plan: {plans.find(p => p.id === selectedPlan)?.name}
          </p>
          <button
            onClick={() => {
              router.push("/price");
            }}
            className="text-xs text-neutral-500 hover:text-neutral-700 underline underline-offset-2 transition-colors"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Cambiar plan
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-neutral-200/50 p-6 md:p-8 bg-white/60 backdrop-blur-sm"
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label 
                htmlFor="fullName"
                className="block text-sm font-semibold text-neutral-900 mb-2"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-semibold text-neutral-900 mb-2"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password"
                className="block text-sm font-semibold text-neutral-900 mb-2"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || isOAuthLoading}
              className="w-full rounded-full bg-neutral-900 text-white font-semibold py-6 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <p 
            className="text-center text-sm text-neutral-600 mt-6"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-neutral-900 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
