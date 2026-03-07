"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setIsLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar la contraseña");
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
            Nueva contraseña
          </h1>
          <p className="text-muted-foreground" style={fontStyle}>
            Elige una contraseña segura para tu cuenta
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 mb-2" style={fontStyle}>
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={fontStyle}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-neutral-900 mb-2" style={fontStyle}>
                Repetir contraseña
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                style={fontStyle}
                placeholder="Repite la contraseña"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-neutral-900 text-white font-semibold py-6 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={fontStyle}
            >
              {isLoading ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </form>

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
