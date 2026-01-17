"use client";

import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface PremiumSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  label?: string;
  className?: string;
}

export function PremiumSelect({
  value,
  onChange,
  options,
  placeholder = "Selecciona...",
  required = false,
  label,
  className = "",
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false });
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Calcular posición del dropdown
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Altura estimada: cada opción ~48px + padding
      const itemHeight = 48;
      const padding = 16;
      const estimatedHeight = Math.min(options.length * itemHeight + padding, 240);
      const minSpace = 80; // espacio mínimo requerido
      
      // Decidir si abrir hacia arriba
      const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow && spaceAbove > minSpace;
      
      // Calcular posición top
      let topPosition: number;
      if (openUpward) {
        topPosition = rect.top - estimatedHeight - 8;
        // Asegurar que no se salga por arriba
        if (topPosition < 8) {
          topPosition = 8;
        }
      } else {
        topPosition = rect.bottom + 8;
        // Asegurar que no se salga por abajo
        if (topPosition + estimatedHeight > viewportHeight - 8) {
          topPosition = viewportHeight - estimatedHeight - 8;
        }
      }
      
      setPosition({
        top: topPosition,
        left: rect.left,
        width: rect.width,
        openUpward,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen, options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectRef.current &&
        !selectRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Pequeño delay para evitar que se cierre inmediatamente al abrir
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 10);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-semibold text-neutral-900 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => {
          const willOpen = !isOpen;
          setIsOpen(willOpen);
          if (willOpen) {
            // Calcular posición inmediatamente después de abrir
            requestAnimationFrame(() => {
              updatePosition();
            });
          }
        }}
        className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm text-left flex items-center justify-between hover:border-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className={selectedOption ? "text-neutral-900 font-medium" : "text-neutral-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para cerrar al hacer click fuera */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9998] bg-transparent"
              style={{ pointerEvents: "auto" }}
            />
            {/* Dropdown con posición fija */}
            <motion.div
              initial={{ opacity: 0, y: position.openUpward ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: position.openUpward ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                zIndex: 9999,
                pointerEvents: "auto",
              }}
              className="bg-white rounded-xl border border-neutral-200 shadow-2xl overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
                      value === option.value
                        ? "bg-gradient-to-r from-[#4A0072]/10 to-[#C2185B]/10 text-neutral-900 font-semibold"
                        : "text-neutral-700"
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

