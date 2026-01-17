"use client";

import { motion } from "framer-motion";
import { 
  Target, 
  Lightbulb, 
  Zap, 
  Shield,
  Rocket,
  CheckCircle2
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Precisión",
    description: "Análisis basado en contexto real, sin alucinaciones"
  },
  {
    icon: Shield,
    title: "Transparencia",
    description: "Sabes exactamente cómo se procesan tus datos"
  },
  {
    icon: Zap,
    title: "Rapidez",
    description: "Insights accionables en minutos, no en días"
  },
  {
    icon: Rocket,
    title: "Ejecución",
    description: "No solo análisis, también acciones directas"
  }
];

export function About() {
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
            <Lightbulb className="w-8 h-8 text-neutral-900" strokeWidth={2} />
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
            Resolviendo un problema real
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Nuestra misión es hacer más fácil y rápido el entendimiento de la voz de tus usuarios, 
            no solo entender qué dicen, sino saber qué hacer con esa información.
          </motion.p>
        </div>

        {/* El Problema */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl border border-neutral-200/50 p-8 md:p-12 lg:p-16 overflow-hidden"
              style={{
                backgroundColor: '#2E003E',
                position: 'relative',
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
              {/* Texturas granulares */}
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 0.5px, transparent 0),
                    radial-gradient(circle at 3px 3px, rgba(255,200,180,0.3) 0.5px, transparent 0),
                    radial-gradient(circle at 5px 5px, rgba(255,180,160,0.25) 0.5px, transparent 0),
                    radial-gradient(circle at 7px 7px, rgba(0,0,0,0.08) 0.5px, transparent 0)
                  `,
                  backgroundSize: '8px 8px, 12px 12px, 16px 16px, 20px 20px',
                }}
              />
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px),
                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,200,180,0.08) 2px, rgba(255,200,180,0.08) 4px)
                  `,
                  backgroundSize: '4px 4px',
                }}
              />
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,182,217,0.6) 0%, transparent 50%),
                    radial-gradient(ellipse 70% 50% at 80% 40%, rgba(255,211,140,0.5) 0%, transparent 50%)
                  `,
                }}
              />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                  <h3 
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4"
                    style={{ 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    El problema que vimos
                  </h3>
                  <p 
                    className="text-base md:text-lg text-neutral-200 leading-relaxed max-w-3xl mx-auto"
                    style={{ 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    Al trabajar en startups y conocer el ecosistema, identificamos un patrón recurrente: 
                    las empresas luchan con análisis manual y separado de la voz del cliente.
                  </p>
                </div>

                {/* Grid de problemas */}
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {/* Columna izquierda - Problemas principales */}
                  <div className="space-y-3">
                    {[
                      "Métricas vanas que no generan acciones",
                      "Análisis manual que consume tiempo valioso",
                      "Falta de visibilidad real del cliente",
                      "Dificultad para ejecutar recomendaciones directas"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="text-red-400 text-xl font-bold">×</span>
                        </div>
                        <span 
                          className="text-sm md:text-base text-neutral-200 leading-relaxed"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Columna derecha - Manifestaciones */}
                  <div className="space-y-3">
                    {[
                      { label: "Análisis disperso en múltiples herramientas", color: "bg-red-500" },
                      { label: "Métricas que no conectan con el negocio", color: "bg-yellow-500" },
                      { label: "Tiempo perdido en análisis manual", color: "bg-orange-500" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`}></div>
                        <span 
                          className="text-sm md:text-base text-neutral-200 leading-relaxed"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Nuestros Valores */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 md:mb-24"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h3 
                className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4"
                style={{ 
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                Nuestros valores
              </h3>
              <p 
                className="text-base text-neutral-600 max-w-2xl mx-auto"
                style={{ 
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Los principios que guían cada decisión y cada línea de código
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative rounded-2xl border border-neutral-700/50 p-6 md:p-8 overflow-hidden text-center"
                    style={{
                      backgroundColor: '#0a0a0a',
                      position: 'relative',
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
                    {/* Efecto shimmer */}
                    <div 
                      className="absolute inset-0 opacity-15"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmerCapsule 8s linear infinite',
                        pointerEvents: 'none',
                      }}
                    />
                    {/* Textura granular */}
                    <div 
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 0.5px, transparent 0),
                          radial-gradient(circle at 3px 3px, rgba(255,255,255,0.1) 0.5px, transparent 0),
                          radial-gradient(circle at 5px 5px, rgba(255,255,255,0.08) 0.5px, transparent 0)
                        `,
                        backgroundSize: '8px 8px, 12px 12px, 16px 16px',
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="inline-flex p-3 rounded-xl bg-white/10 border border-white/20 mb-4">
                        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <h4 
                        className="text-lg font-semibold text-white mb-2"
                        style={{ 
                          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {value.title}
                      </h4>
                      <p 
                        className="text-sm text-neutral-300"
                        style={{ 
                          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        }}
                      >
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto pt-16 md:pt-10"
        >
          <h3 
            className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Únete a empresas que entienden mejor a sus usuarios
          </h3>
          <p 
            className="text-base md:text-lg text-neutral-600 mb-6"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Comienza tu prueba gratuita de 14 días y descubre cómo Kepler puede transformar 
            la forma en que escuchas y actúas sobre el feedback de tus usuarios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/price"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
              style={{ 
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Ver planes
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/60 text-neutral-900 font-semibold border border-neutral-200/60 hover:bg-white/80 transition-colors"
              style={{ 
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Hablar con nosotros
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

