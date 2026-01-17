"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, TrendingUp, Target, Zap, Shield, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const benefits = [
  {
    icon: Clock,
    title: "Ahorra tiempo valioso",
    description: "Reduce horas de análisis manual. Automatiza la recopilación y procesamiento de feedback, liberando a tu equipo para enfocarse en lo que realmente importa.",
    highlight: "10x más rápido",
    metric: "80% menos tiempo",
    color: "from-blue-500/20 to-purple-500/20",
    animation: { 
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      y: [0, -8, 0]
    },
  },
  {
    icon: TrendingUp,
    title: "Mejora continua",
    description: "Toma decisiones basadas en datos reales. Identifica tendencias y oportunidades antes que la competencia, maximizando tu ventaja competitiva.",
    highlight: "ROI medible",
    metric: "+35% eficiencia",
    color: "from-green-500/20 to-emerald-500/20",
    animation: { 
      y: [0, -10, 0],
      scale: [1, 1.15, 1],
      rotate: [0, 5, -5, 0]
    },
  },
  {
    icon: Target,
    title: "Mayor satisfacción",
    description: "Responde proactivamente a las necesidades de tus usuarios. Reduce churn y aumenta la retención con insights accionables en tiempo real.",
    highlight: "+40% retención",
    metric: "95% satisfacción",
    color: "from-orange-500/20 to-red-500/20",
    animation: { 
      rotate: [0, 15, -15, 0],
      scale: [1, 1.2, 1],
      x: [0, 5, -5, 0]
    },
  },
  {
    icon: Zap,
    title: "Acción inmediata",
    description: "No más dashboards pasivos. Recibe insights accionables asignados directamente a tu equipo, con priorización inteligente y contexto empresarial.",
    highlight: "Tiempo real",
    metric: "0 segundos delay",
    color: "from-yellow-500/20 to-amber-500/20",
    animation: { 
      y: [0, -12, 0],
      rotate: [0, -15, 15, 0],
      scale: [1, 1.25, 1]
    },
  },
  {
    icon: Shield,
    title: "Sin alucinaciones",
    description: "Análisis basado en contexto empresarial real. Evita decisiones erróneas por falta de contexto, garantizando precisión y confiabilidad.",
    highlight: "100% preciso",
    metric: "99.9% precisión",
    color: "from-indigo-500/20 to-blue-500/20",
    animation: { 
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      y: [0, -5, 0]
    },
  },
];

export function Benefits() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % benefits.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + benefits.length) % benefits.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Auto-play cada 10 segundos
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % benefits.length);
      }, 10000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  return (
    <section className="relative overflow-hidden bg-[#FFFEF7] pt-8 md:pt-12 pb-8 md:pb-12">
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
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Beneficios que transforman tu negocio
          </h2>
          <p 
            className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            No solo procesamos feedback, generamos resultados medibles que impactan directamente en tu crecimiento
          </p>
        </div>

        {/* Carrusel Premium */}
        <div className="relative mb-12 md:mb-16 px-4 md:px-0">
          {/* Botones de navegación - Fuera de la card, más separados, sobre el fondo general */}
          <button
            onClick={prevSlide}
            className="absolute left-0 md:-left-8 top-1/2 -translate-y-1/2 flex items-center justify-center z-10 group"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-neutral-900 group-hover:translate-x-[-2px] transition-transform" strokeWidth={2.5} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 md:-right-8 top-1/2 -translate-y-1/2 flex items-center justify-center z-10 group"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-neutral-900 group-hover:translate-x-[2px] transition-transform" strokeWidth={2.5} />
          </button>

          {/* Contenedor del carrusel - Más grande y alto */}
          <div className="relative overflow-visible rounded-2xl max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative"
              >
                <div className="bg-white/40 backdrop-blur-[40px] backdrop-saturate-200 rounded-2xl border border-white/60 p-10 md:p-12 lg:p-16 shadow-2xl min-h-[400px] md:min-h-[450px]">
                  {/* Badge contador de slide */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-3 left-6 px-3 py-1.5 rounded-full bg-neutral-900/90 backdrop-blur-sm text-white text-xs font-semibold shadow-lg z-20"
                  >
                    {currentIndex + 1} / {benefits.length}
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start md:items-center">
                    {/* Lado izquierdo - Icono y métricas - Centrado y ordenado */}
                    <div className="flex flex-col items-center space-y-6 md:space-y-8">
                      {/* Card del icono - Con animación */}
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="relative backdrop-blur-[30px] backdrop-saturate-150 rounded-2xl border border-white/50 p-8 md:p-10 shadow-xl overflow-visible"
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
                        {/* Badge de highlight - Con pulso */}
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-bold shadow-lg z-20"
                        >
                          {benefits[currentIndex].highlight}
                        </motion.div>
                        
                        {/* Icono animado con Framer Motion */}
                        <motion.div
                          animate={benefits[currentIndex].animation}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center relative"
                        >
                          {(() => {
                            const Icon = benefits[currentIndex].icon;
                            return (
                              <motion.div
                                animate={{ 
                                  filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="relative"
                              >
                                {/* Efecto de glow animado */}
                                <motion.div
                                  animate={{ 
                                    opacity: [0.3, 0.6, 0.3],
                                    scale: [1, 1.3, 1]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute inset-0 bg-white/30 blur-xl rounded-full"
                                />
                                <Icon className="w-12 h-12 md:w-14 md:h-14 text-white relative z-10 drop-shadow-2xl" strokeWidth={2.5} />
                              </motion.div>
                            );
                          })()}
                        </motion.div>
                      </motion.div>

                      {/* Métrica destacada - Con animación de entrada */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-sm"
                      >
                        <div className="text-center">
                          <motion.p
                            key={benefits[currentIndex].metric}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-2xl md:text-3xl font-bold text-white mb-1"
                            style={{
                              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                              fontWeight: 700,
                            }}
                          >
                            {benefits[currentIndex].metric}
                          </motion.p>
                          <p 
                            className="text-xs text-neutral-300"
                            style={{
                              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            }}
                          >
                            Mejora promedio
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Lado derecho - Contenido - Mejor estructura y orden */}
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="space-y-5 md:space-y-6"
                    >
                      {/* Badge de categoría */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100/80 backdrop-blur-sm border border-neutral-200/60">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span 
                          className="text-xs font-medium text-neutral-700"
                          style={{
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          Beneficio verificado
                        </span>
                      </div>

                      {/* Título - Con mejor jerarquía */}
                      <div>
                        <h3 
                          className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 mb-4 leading-tight"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            letterSpacing: '-0.02em'
                          }}
                        >
                          {benefits[currentIndex].title}
                        </h3>
                      </div>

                      {/* Descripción - Mejor estructura */}
                      <div className="space-y-2">
                        <p 
                          className="text-sm md:text-base text-neutral-600 leading-relaxed"
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {benefits[currentIndex].description}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Botón de pausa/play */}
            <button
              onClick={togglePause}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 flex items-center justify-center z-10"
              aria-label={isPaused ? "Reanudar" : "Pausar"}
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-neutral-900 ml-0.5" strokeWidth={2.5} />
              ) : (
                <Pause className="w-5 h-5 text-neutral-900" strokeWidth={2.5} />
              )}
            </button>
          </div>

          {/* Indicadores de puntos - Con mejor diseño */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {benefits.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-10 h-2 bg-neutral-900 shadow-md'
                    : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400 hover:w-6'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA destacado - Optimizado */}
        <div className="relative py-12 md:py-16">
          <div className="container relative px-4 mx-auto max-w-7xl">
            {/* Grid: 50/50 Contenido izquierda, Imagen derecha - Misma altura que Hero */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch min-h-[80vh]">
              {/* Columna izquierda - Contenido */}
              <div className="flex flex-col justify-center">
                {/* Título principal - Mismo tamaño que otros títulos */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 leading-tight"
                  style={{ 
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  ¿Listo para transformar el feedback en resultados?
                </motion.h2>

                {/* Descripción - Mismo tamaño que otros subtítulos */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-lg md:text-xl text-neutral-600 mb-6 md:mb-8 leading-relaxed"
                  style={{ 
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Comienza gratis hoy y experimenta cómo la IA puede revolucionar la forma en que entiendes a tus usuarios
                </motion.p>

                {/* Botones */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col sm:flex-row items-start gap-4"
                >
                  {/* Botón principal */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button 
                      size="lg" 
                      asChild 
                      className="group relative bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-6 text-base font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <Link href="/register" className="relative z-10 flex items-center gap-2">
                        <span>Comenzar gratis</span>
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                        </motion.div>
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Botón secundario */}
                  <motion.div
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button 
                      size="lg" 
                      variant="ghost" 
                      asChild
                      className="px-8 py-6 text-base font-semibold rounded-full border-2 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300"
                    >
                      <Link href="/login">
                        Ver demo
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

              {/* Columna derecha - Imagen ocupando 100% */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative hidden md:flex items-center justify-center h-full"
              >
                <div 
                  className="relative w-full h-full rounded-2xl border border-neutral-700/50 shadow-lg overflow-hidden"
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
                  {/* Efecto shimmer sutil */}
                  <div 
                    className="absolute inset-0 opacity-15 z-10"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmerCapsule 8s linear infinite',
                      pointerEvents: 'none',
                    }}
                  />
                  
                  {/* Degradado sutil */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-40 z-10"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, transparent 60%)',
                    }}
                  />

                  {/* Textura granular/arenosa más densa - Adaptada para fondo negro */}
                  <div 
                    className="absolute inset-0 opacity-40 z-10"
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
                    className="absolute inset-0 opacity-20 z-10"
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
                    className="absolute inset-0 opacity-15 z-10"
                    style={{
                      background: `
                        radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%),
                        radial-gradient(ellipse 70% 50% at 80% 40%, rgba(255,255,255,0.06) 0%, transparent 50%)
                      `,
                    }}
                  />

                  {/* Imagen */}
                  <div className="relative w-full h-full z-0">
                    <Image
                      src="https://res.cloudinary.com/dmyq0gr14/image/upload/v1765766282/Gemini_Generated_Image_q9w8yjq9w8yjq9w8_bpuvtz.png"
                      alt="Transforma el feedback en resultados"
                      fill
                      className="object-cover"
                      sizes="50vw"
                      priority
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
