"use client";

import { Database, Brain, Zap, Rocket } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    number: "01",
    icon: Database,
    technicalTitle: "Ingesta de Datos",
    technicalDescription: "Múltiples canales (NPS, CSAT, reviews, tickets, redes sociales)",
    valueTitle: "Conecta tus fuentes",
    valueDescription: "Integración simple con todas tus fuentes de feedback",
  },
  {
    number: "02",
    icon: Brain,
    technicalTitle: "Procesamiento Inteligente",
    technicalDescription: "IA analiza con contexto empresarial",
    valueTitle: "Configura tu contexto",
    valueDescription: "Metas, equipos, deadlines",
  },
  {
    number: "03",
    icon: Zap,
    technicalTitle: "Generación de Insights",
    technicalDescription: "Detecta patrones y prioriza",
    valueTitle: "Recibe insights accionables",
    valueDescription: "Automático y personalizado",
  },
  {
    number: "04",
    icon: Rocket,
    technicalTitle: "Asignación y Distribución",
    technicalDescription: "Envía a responsables y herramientas",
    valueTitle: "Ejecuta con tu equipo",
    valueDescription: "Integración con herramientas",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-[#FFFEF7] pt-8 md:pt-12 pb-16 md:pb-24">
      {/* Degradado de fondo sutil */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 0, 0, 0.02) 0%, transparent 50%)',
        }}
      />

      <div className="container relative px-4 mx-auto max-w-7xl">
        {/* Header - Fuera de la card */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Cómo funciona
          </h2>
          <p 
            className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Transforma el feedback de tus usuarios en acciones concretas en cuatro pasos simples
          </p>
        </div>

        {/* Card negra grande con todo el contenido - Estilo similar al Hero */}
        <div 
          id="how-it-works-card" 
          className="relative rounded-3xl border border-neutral-700/50 p-8 md:p-12 lg:p-16 shadow-2xl w-[90%] mx-auto overflow-hidden"
          style={{
            position: 'relative',
            backgroundColor: '#0a0a0a',
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
              radial-gradient(ellipse 50% 80% at 0% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
              radial-gradient(ellipse 50% 80% at 100% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)
            `,
            backgroundSize: '100% 100%, 100% 100%, 100% 100%',
            backgroundRepeat: 'no-repeat',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Efecto shimmer sutil - Similar al Hero */}
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmerCapsule 8s linear infinite',
              pointerEvents: 'none',
            }}
          />
          
          {/* Degradado sutil dentro de la card - Similar al Hero */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-40"
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, transparent 60%)',
            }}
          />
          
          {/* Efecto de borde brillante sutil */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-20"
            style={{
              border: '1px solid transparent',
              backgroundImage: 'linear-gradient(#0a0a0a, #0a0a0a), linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              WebkitBackgroundClip: 'padding-box, border-box',
            }}
          />

          {/* Textura granular/arenosa más densa - Adaptada para fondo negro */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 0.5px, transparent 0),
                radial-gradient(circle at 3px 3px, rgba(255,255,255,0.1) 0.5px, transparent 0),
                radial-gradient(circle at 5px 5px, rgba(255,255,255,0.08) 0.5px, transparent 0),
                radial-gradient(circle at 7px 7px, rgba(0,0,0,0.1) 0.5px, transparent 0)
              `,
              backgroundSize: '8px 8px, 12px 12px, 16px 16px, 20px 20px',
            }}
          />
          
          {/* Capa adicional de textura arenosa - Adaptada para fondo negro */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)
              `,
              backgroundSize: '4px 4px',
            }}
          />
          
          {/* Capa adicional de profundidad con más tonos - Adaptada para fondo negro */}
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%),
                radial-gradient(ellipse 70% 50% at 80% 40%, rgba(255,255,255,0.06) 0%, transparent 50%)
              `,
            }}
          />

          {/* Steps - Estructura consistente: icono izquierda, contenido derecha */}
          <div className="relative z-10">
            {/* Línea conectora vertical fija */}
            <div className="hidden md:block absolute left-8 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neutral-700 via-neutral-600 to-transparent" />

            <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <div
                  key={index}
                  className="relative flex flex-col md:flex-row items-start gap-6 md:gap-8"
                >
                  {/* Icono y número - Siempre a la izquierda */}
                  <div className="flex-shrink-0 relative z-10">
                    <div 
                      className="relative backdrop-blur-[30px] backdrop-saturate-150 rounded-2xl border border-white/50 p-6 md:p-8 shadow-lg overflow-visible"
                      style={{
                        backgroundColor: '#2E003E',
                        background: `
                          radial-gradient(
                            ellipse 80% 80% at 100% 0%,
                            rgba(255, 69, 0, 0.9) 0%,
                            rgba(255, 140, 0, 0.7) 40%,
                            transparent 80%
                          ),
                          radial-gradient(
                            ellipse 60% 60% at 90% 100%,
                            rgba(25, 25, 112, 0.6) 0%,
                            transparent 70%
                          ),
                          radial-gradient(
                            ellipse 70% 90% at 10% 40%,
                            rgba(138, 43, 226, 0.8) 0%,
                            rgba(75, 0, 130, 0.5) 60%,
                            transparent 90%
                          ),
                          linear-gradient(
                            115deg,
                            #4A0072 0%,
                            #C2185B 50%,
                            #FF8C00 100%
                          )
                        `,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      {/* Badge de número - Posicionado para verse completo */}
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg z-20">
                        <span 
                          className="text-neutral-900 text-sm font-bold"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {step.number}
                        </span>
                      </div>
                      
                      {/* Icono - Directamente en la card, sin sub-card, en blanco */}
                      <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </div>

                  {/* Contenido - Siempre a la derecha, agrupado visualmente, altura igual a la card del icono */}
                  <div className="flex-1 pt-2">
                    {/* Contenedor principal que agrupa ambos textos - Altura fija igual a la card del icono */}
                    <div className="bg-neutral-800/50 backdrop-blur-[25px] backdrop-saturate-150 rounded-2xl border border-neutral-700/50 p-4 md:p-6 space-y-3 shadow-lg h-full flex flex-col justify-center">
                      {/* Aspecto técnico - Principal */}
                      <div className="space-y-1.5">
                        <h3 
                          className="text-lg md:text-xl font-bold text-white"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                          }}
                        >
                          {step.technicalTitle}
                        </h3>
                        <p 
                          className="text-xs md:text-sm text-neutral-300 leading-relaxed"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {step.technicalDescription}
                        </p>
                      </div>

                      {/* Separador visual sutil */}
                      <div className="h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent" />

                      {/* Aspecto de valor - Complementario */}
                      <div className="space-y-1.5">
                        <h4 
                          className="text-base md:text-lg font-semibold text-white"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 600,
                          }}
                        >
                          {step.valueTitle}
                        </h4>
                        <p 
                          className="text-xs md:text-sm text-neutral-400 leading-relaxed"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {step.valueDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


