"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const getBaseUrl = () => {
    if (typeof window === "undefined") return "";
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (window.location.hostname !== "localhost" && !window.location.hostname.includes("127.0.0.1")) return "https://www.iskepler.com";
    return window.location.origin;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const redirectTo = `${getBaseUrl()}/auth/callback?next=/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setIsLoading(false);
    }
  };

  const fontStyle = {
    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  };

  return (
    <div className="min-h-screen bg-[#FFFEF7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2" style={{ ...fontStyle, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Recuperar contraseña
          </h1>
          <p className="text-muted-foreground" style={fontStyle}>
            {sent ? "Revisa tu correo y usa el enlace para elegir una nueva contraseña." : "Indica tu email y te enviamos un enlace para restablecerla."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-neutral-200/50 p-6 md:p-8 bg-white/60 backdrop-blur-sm"
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          {sent ? (
            <p className="text-center text-sm text-neutral-600 mb-6" style={fontStyle}>
              Si no ves el correo, revisa la carpeta de spam.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2" style={fontStyle}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  style={fontStyle}
                  placeholder="tu@email.com"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-neutral-900 text-white font-semibold py-6 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={fontStyle}
              >
                {isLoading ? "Enviando…" : "Enviar enlace"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-neutral-600 mt-6" style={fontStyle}>
            <Link href="/login" className="text-neutral-900 font-semibold hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
