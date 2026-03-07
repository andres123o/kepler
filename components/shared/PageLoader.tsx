"use client";

import { motion } from "framer-motion";

/**
 * Loader premium para transiciones de página (login → dashboard, navegación).
 * Colores del proyecto, sutil y elegante, con movimiento de anillos y pulso.
 */
export function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFFEF7] dark:bg-neutral-900"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8A2BE2]/[0.05] dark:bg-[#8A2BE2]/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C2185B]/[0.05] dark:bg-[#C2185B]/10 blur-3xl" />
      </div>

      <motion.div
        className="relative flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="relative flex h-14 w-14 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-neutral-200/80 dark:border-neutral-700"
            style={{
              borderTopColor: "rgba(138, 43, 226, 0.6)",
              borderRightColor: "rgba(194, 24, 91, 0.4)",
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute h-8 w-8 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: "rgba(138, 43, 226, 0.45)",
              borderLeftColor: "rgba(194, 24, 91, 0.35)",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-neutral-900/70 dark:bg-white/80"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.p
          className="text-sm font-medium text-neutral-500 dark:text-neutral-400"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Cargando...
        </motion.p>
      </motion.div>
    </div>
  );
}
