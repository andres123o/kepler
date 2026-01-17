"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Sparkles, 
  Rocket, 
  TrendingUp,
  Zap,
  Users,
  FileText,
  Link2,
  Headphones,
  ArrowRight
} from "lucide-react";

const plans = [
  {
    id: "hobby",
    name: "Hobby",
    tagline: "Prueba la magia",
    description: "Perfecto para empezar y descubrir el poder de los insights con IA",
    price: {
      trial: "$0",
      monthly: "$7.99",
      period: "14 días gratis, luego",
      billing: "/mes"
    },
    features: [
      "1 Usuario",
      "50 tickets/feedback procesados al mes",
      "Subida de archivos manual (CSV)",
      "Análisis básico con IA",
      "Reportes en plataforma",
      "Soporte por email"
    ],
    limitations: [
      "Sin integraciones automáticas",
      "Sin asignación de tareas"
    ],
    cta: "Comenzar prueba gratuita",
    popular: false,
    icon: Sparkles,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-200/40"
  },
  {
    id: "startup",
    name: "Startup",
    tagline: "El más popular",
    description: "Ideal para pequeños equipos que ya tienen clientes y soporte",
    price: {
      monthly: "$39",
      billing: "/mes"
    },
    features: [
      "Hasta 5 Usuarios",
      "1,000 tickets/feedback procesados al mes",
      "Integraciones básicas (Zendesk, Notion)",
      "Asignación de tareas a responsables",
      "Reportes PDF descargables",
      "Contexto de negocio básico",
      "Soporte prioritario"
    ],
    limitations: [],
    cta: "Comenzar ahora",
    popular: true,
    icon: Rocket,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-200/40",
    badge: "Más popular"
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Para escalar",
    description: "Para startups en crecimiento o agencias que necesitan más potencia",
    price: {
      monthly: "$99",
      billing: "/mes"
    },
    features: [
      "Usuarios ilimitados",
      "5,000+ tickets procesados al mes",
      "Todas las integraciones",
      "Prioridad en el procesamiento",
      "Múltiples perfiles",
      "Contexto de negocio completo",
      "Reportes avanzados personalizados",
      "Soporte dedicado"
    ],
    limitations: [],
    cta: "Comenzar ahora",
    popular: false,
    icon: TrendingUp,
    gradient: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-200/40"
  }
];

export function Pricing() {
  return (
    <section className="relative overflow-hidden bg-[#FFFEF7] pt-16 md:pt-24 pb-20 md:pb-32">
      {/* Degradado de fondo sutil */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 0, 0, 0.02) 0%, transparent 50%)',
        }}
      />

      <div className="container relative px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex p-3 rounded-xl bg-neutral-900/5 mb-6"
          >
            <Zap className="w-8 h-8 text-neutral-900" strokeWidth={2} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Planes que crecen contigo
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Elige el plan perfecto para tu equipo. Empieza gratis y escala cuando lo necesites.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative ${isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Badge para plan popular */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span 
                      className="px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        backgroundColor: '#2E003E',
                        background: `
                          linear-gradient(
                            115deg,
                            #4A0072 0%,
                            #C2185B 50%,
                            #FF8C00 100%
                          )
                        `,
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div
                  className={`relative rounded-2xl border p-6 md:p-8 h-full flex flex-col transition-all ${
                    isPopular
                      ? 'border-purple-300 bg-white shadow-2xl scale-105'
                      : 'border-neutral-200/60 bg-white/60 hover:bg-white/80 hover:border-neutral-300 hover:shadow-lg'
                  }`}
                >
                  {/* Icono y nombre */}
                  <div className="mb-6">
                    <div className={`inline-flex p-3 rounded-xl mb-4 ${
                      isPopular 
                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-200/40' 
                        : 'bg-neutral-900/5'
                    }`}>
                      <Icon className={`w-6 h-6 ${isPopular ? 'text-purple-600' : 'text-neutral-900'}`} strokeWidth={2} />
                    </div>
                    <h3 
                      className={`text-2xl md:text-3xl font-bold mb-2 ${isPopular ? 'text-neutral-900' : 'text-neutral-900'}`}
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {plan.name}
                    </h3>
                    <p 
                      className="text-sm font-semibold text-neutral-500 mb-1"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      {plan.tagline}
                    </p>
                    <p 
                      className="text-sm text-neutral-600"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      {plan.description}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="mb-6">
                    {plan.price.trial && (
                      <div className="mb-2">
                        <span 
                          className="text-4xl md:text-5xl font-bold text-neutral-900"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                          }}
                        >
                          {plan.price.trial}
                        </span>
                        <span 
                          className="text-sm text-neutral-500 ml-2"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {plan.price.period}
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline">
                      <span 
                        className="text-4xl md:text-5xl font-bold text-neutral-900"
                        style={{ 
                          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          fontWeight: 700,
                        }}
                      >
                        {plan.price.monthly}
                      </span>
                      <span 
                        className="text-lg text-neutral-600 ml-2"
                        style={{ 
                          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        }}
                      >
                        {plan.price.billing}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mb-6 rounded-full font-semibold py-6 text-base transition-all ${
                      isPopular
                        ? 'text-white shadow-lg hover:shadow-xl'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                    style={isPopular ? { 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      backgroundColor: '#2E003E',
                      background: `
                        linear-gradient(
                          115deg,
                          #4A0072 0%,
                          #C2185B 50%,
                          #FF8C00 100%
                        )
                      `,
                    } : {
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {/* Features */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 mt-0.5 ${isPopular ? 'text-purple-600' : 'text-green-600'}`}>
                            <Check className="w-5 h-5" strokeWidth={2.5} />
                          </div>
                          <span 
                            className="text-sm text-neutral-700 leading-relaxed"
                            style={{ 
                              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            }}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Limitations (solo para Hobby) */}
                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t border-neutral-200">
                        <p 
                          className="text-xs font-semibold text-neutral-500 mb-2"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          No incluye:
                        </p>
                        <div className="space-y-2">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <div key={limitationIndex} className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5 text-neutral-400">
                                <span className="text-xs">×</span>
                              </div>
                              <span 
                                className="text-xs text-neutral-500 leading-relaxed"
                                style={{ 
                                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                }}
                              >
                                {limitation}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Nota adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p 
            className="text-sm text-neutral-500"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Todos los planes incluyen cancelación en cualquier momento. Sin compromisos a largo plazo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

