"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, X } from "lucide-react";

const fontFamily =
  'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif';

interface FirstReportReadyBannerProps {
  onViewReport?: () => void;
  onDismiss?: () => void;
}

export function FirstReportReadyBanner({ onViewReport, onDismiss }: FirstReportReadyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleCta = () => {
    onViewReport?.();
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8A2BE2]/08 via-[#C2185B]/06 to-[#8A2BE2]/08 border border-[#8A2BE2]/20 shadow-lg shadow-[#8A2BE2]/05">
            {/* Subtle gradient orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8A2BE2]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C2185B]/08 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6">
              <div className="flex items-start gap-4 pr-8 sm:pr-0">
                <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-[#8A2BE2] to-[#C2185B] shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2
                    className="text-lg sm:text-xl font-bold text-neutral-900 mb-0.5"
                    style={{ fontFamily, letterSpacing: "-0.02em" }}
                  >
                    Tu primer reporte está listo
                  </h2>
                  <p
                    className="text-sm text-neutral-600"
                    style={{ fontFamily }}
                  >
                    Así te ven tus usuarios. Revisa el análisis y actúa sobre lo que importa.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <motion.button
                  onClick={handleCta}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#8A2BE2] to-[#C2185B] rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  style={{ fontFamily }}
                >
                  Ver mi reporte
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
                <button
                  onClick={handleDismiss}
                  aria-label="Cerrar"
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
