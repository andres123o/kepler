"use client";

import { BrainAnimation } from "./BrainAnimation";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#FFFEF7] pt-8 pb-8 md:pt-12 md:pb-12">
      {/* Degradado de fondo sutil */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #FFFEF7 0%, #FFFEF7 100%)',
        }}
      />

      <div className="container relative px-4 mx-auto max-w-7xl">
        <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
          {/* Fila 1: Texto centrado */}
          <div className="text-center mb-12">
            <h1 
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-neutral-900"
        style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              La forma más rápida de
          </h1>
            <p 
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-neutral-900"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              entender a tus usuarios.
            </p>
          </div>

          {/* Fila 2: Animación centrada (ocupando ambas columnas) */}
          <div className="w-full flex items-center justify-center min-h-[300px] md:min-h-[400px] mb-12">
            <BrainAnimation />
          </div>
        </div>
      </div>
    </section>
  );
}
