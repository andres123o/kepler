"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PageLoader } from "@/components/shared/PageLoader";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google") => {
    setError("");
    setIsOAuthLoading(true);

    try {
      // Determinar la URL base: usar variable de entorno, o detectar producción, o usar origin actual
      let baseUrl = window.location.origin;
      if (process.env.NEXT_PUBLIC_APP_URL) {
        baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      } else if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        // En producción, usar la URL de producción
        baseUrl = 'https://www.iskepler.com';
      }
      
      const redirectUrl = `${baseUrl}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF7] flex items-center justify-center px-4 py-12">
      <AnimatePresence>
        {(isLoading || isOAuthLoading) && <PageLoader />}
      </AnimatePresence>
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
            Iniciar sesión
          </h1>
          <p 
            className="text-muted-foreground"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Accede a tu cuenta para continuar
          </p>
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
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
                placeholder="Tu contraseña"
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
              Iniciar sesión
            </Button>
          </form>

          <p
            className="text-center text-[13px] text-neutral-500 mt-6"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            <Link
              href="/forgot-password"
              className="text-neutral-500 hover:text-neutral-800 transition-colors duration-200"
            >
              ¿Olvidaste tu <span className="font-semibold">contraseña</span>?
            </Link>
            <span className="mx-2" aria-hidden>·</span>
            <span className="text-neutral-500">¿No tienes una cuenta?</span>{" "}
            <Link
              href="/register"
              className="text-neutral-500 hover:text-neutral-800 transition-colors duration-200 font-semibold"
            >
              Regístrate
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
