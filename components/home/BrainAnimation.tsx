"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Brain, MessageSquare, Star, ThumbsUp, Store, Twitter, Facebook, Instagram, Ticket, HelpCircle, BarChart3, TrendingUp, Zap, Smartphone, ShoppingBag, Linkedin, Github, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

// Muchas palabras, números, frases de clientes y datos desordenados para el efecto embudo
const disorderedWords = [
    "muy lento", "no funciona", "error 404", "ayuda", "urgente",
    "pantalla blanca", "no carga", "excelente", "pésimo", "caro",
    "barato", "complicado", "fácil", "intuitivo", "confuso",
    "bug", "falla", "se rompió", "ticket #403", "ID:992",
    "NPS 0", "NPS 10", "CSAT 1", "odio esto", "me encanta",
    "sin acceso", "password mal", "login error", "servidor caído", "lento",
    "rápido", "fea interfaz", "bonito", "útil", "inútil",
    "falta botón", "letra chica", "no leo", "color feo", "brillante",
    "modo oscuro", "v2.0", "beta", "alpha", "test",
    "prod", "dev", "null", "undefined", "NaN",
    "quiero cancelar", "reembolso", "cobro doble", "estafa", "fraude",
    "seguro", "confiable", "recomendado", "nunca más", "volveré",
    "soporte", "chat", "bot tonto", "humano", "teléfono",
    "email", "spam", "basura", "importante", "prioridad",
    "baja", "alta", "media", "blocker", "crítico",
    "feature request", "mejora", "idea", "sugerencia", "queja",
    "felicitación", "saludos", "gracias", "adiós", "hola",
    "tarde", "temprano", "ayer", "hoy", "mañana",
    "lunes", "viernes", "enero", "diciembre", "2025",
    "sin respuesta", "esperando", "pendiente", "resuelto", "cerrado",
    "abierto", "en proceso", "revisando", "aprobado", "rechazado",
    "factura", "recibo", "pago falló", "tarjeta", "banco"
  ];

// Frases que salen del cerebro
const orderedPhrases = [
    "Simplificar la navegación.",
    "Cerrar brecha funcional.",
    "Optimizar tiempo carga.",
    "Restaurar flujo anterior.",
    "Corregir bug crítico.",
    "Ajustar vista móvil.",
    "Refactorizar código legado.",
    "Mejorar manejo errores.",
    "Automatizar proceso manual.",
    "Limpiar base datos.",
    "Actualizar librerías viejas.",
    "Estandarizar interfaz visual.",
    "Acelerar respuesta API.",
    "Validar datos entrada.",
    "Implementar caché local.",
    "Integrar pasarela pagos.",
    "Aumentar cobertura tests.",
    "Migrar infraestructura nube.",
    "Configurar alertas sistema.",
    "Rediseñar panel usuario.",
    "Optimizar consultas SQL.",
    "Documentar endpoints API.",
    "Habilitar modo oscuro.",
    "Reforzar seguridad login.",
  ];

export function BrainAnimation() {
  const [animationKey, setAnimationKey] = useState(0);
  const [hoveredCapsule, setHoveredCapsule] = useState<'feedback' | 'insights' | null>(null);
  
  // Constantes de animación
  const duration = 8; // Duración de cada frase en segundos
  const spacing = 2.5; // Espacio entre frases en segundos
  const totalPhrases = orderedPhrases.length;
  const totalCycleTime = (totalPhrases * spacing) + duration;
  
  // Reiniciar animaciones periódicamente para evitar desincronización
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, totalCycleTime * 1000); // Reiniciar cada ciclo completo
    
    return () => clearInterval(interval);
  }, [totalCycleTime]);

  return (
    <div className="w-[90%] mx-auto">
      {/* Card grande que contiene toda la animación */}
      <div 
        className="relative rounded-3xl border border-neutral-200/50 p-8 md:p-12 lg:p-16 overflow-hidden"
        style={{
          position: 'relative',
        }}
      >
        {/* Card en forma de cápsula - Esquina derecha */}
        <div 
          className="group absolute top-6 right-6 z-40 cursor-pointer"
          style={{
            animation: hoveredCapsule === 'insights' ? 'none' : 'float 3s ease-in-out infinite',
          }}
          onMouseEnter={() => setHoveredCapsule('insights')}
          onMouseLeave={() => setHoveredCapsule(null)}
        >
          <div 
            className="relative px-6 py-3 rounded-full bg-[#FFFEF7] shadow-lg overflow-hidden"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(#FFFEF7, #FFFEF7), linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: hoveredCapsule === 'insights' ? 'none' : 'shimmerCapsule 3s linear infinite',
              backgroundSize: '200% 100%',
            }}
          >
            {/* Efecto shimmer que recorre continuamente */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                backgroundSize: '200% 100%',
                animation: hoveredCapsule === 'insights' ? 'none' : 'shimmerCapsule 2s linear infinite',
                pointerEvents: 'none',
              }}
            />
            
            {/* Puntos indicadores animados */}
            <div className="absolute -top-2 -right-2 flex gap-1">
              <span 
                className="w-1.5 h-1.5 rounded-full bg-neutral-900" 
                style={{ 
                  animation: hoveredCapsule === 'insights' ? 'none' : 'pulse 2s ease-in-out infinite',
                  animationDelay: '0s',
                  opacity: hoveredCapsule === 'insights' ? 0.3 : 1
                }} 
              />
              <span 
                className="w-1.5 h-1.5 rounded-full bg-neutral-900" 
                style={{ 
                  animation: hoveredCapsule === 'insights' ? 'none' : 'pulse 2s ease-in-out infinite',
                  animationDelay: '0.2s',
                  opacity: hoveredCapsule === 'insights' ? 0.3 : 1
                }} 
              />
              <span 
                className="w-1.5 h-1.5 rounded-full bg-neutral-900" 
                style={{ 
                  animation: hoveredCapsule === 'insights' ? 'none' : 'pulse 2s ease-in-out infinite',
                  animationDelay: '0.4s',
                  opacity: hoveredCapsule === 'insights' ? 0.3 : 1
                }} 
              />
            </div>

            <span className="text-base font-semibold text-neutral-900 relative z-10 flex items-center justify-end gap-2">
              <ChevronLeft 
                className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all duration-300"
                style={{
                  transform: hoveredCapsule === 'insights' ? 'rotate(-90deg)' : 'rotate(0deg)',
                }}
                strokeWidth={2.5}
              />
              <span>Insights accionables</span>
            </span>
          </div>
        </div>

        {/* Card en forma de cápsula - Esquina izquierda */}
        <div 
          className="group absolute top-6 left-6 z-40 cursor-pointer"
          style={{
            animation: hoveredCapsule === 'feedback' ? 'none' : 'float 3s ease-in-out infinite',
          }}
          onMouseEnter={() => setHoveredCapsule('feedback')}
          onMouseLeave={() => setHoveredCapsule(null)}
        >
          <div 
            className="relative px-6 py-3 rounded-full bg-[#FFFEF7] shadow-lg overflow-hidden"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(#FFFEF7, #FFFEF7), linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: hoveredCapsule === 'feedback' ? 'none' : 'shimmerCapsule 3s linear infinite',
              backgroundSize: '200% 100%',
            }}
          >
            {/* Efecto shimmer que recorre continuamente */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                backgroundSize: '200% 100%',
                animation: hoveredCapsule === 'feedback' ? 'none' : 'shimmerCapsule 2s linear infinite',
                pointerEvents: 'none',
              }}
            />
            
            {/* Puntos indicadores animados */}
            <div className="absolute -top-2 -left-2 flex gap-1">
              <span 
                className="w-1.5 h-1.5 rounded-full bg-neutral-900" 
                style={{ 
                  animation: hoveredCapsule === 'feedback' ? 'none' : 'pulse 2s ease-in-out infinite',
                  animationDelay: '0s',
                  opacity: hoveredCapsule === 'feedback' ? 0.3 : 1
                }} 
              />
              <span 
                className="w-1.5 h-1.5 rounded-full bg-neutral-900" 
                style={{ 
                  animation: hoveredCapsule === 'feedback' ? 'none' : 'pulse 2s ease-in-out infinite',
                  animationDelay: '0.2s',
                  opacity: hoveredCapsule === 'feedback' ? 0.3 : 1
                }} 
              />
              <span 
                className="w-1.5 h-1.5 rounded-full bg-neutral-900" 
                style={{ 
                  animation: hoveredCapsule === 'feedback' ? 'none' : 'pulse 2s ease-in-out infinite',
                  animationDelay: '0.4s',
                  opacity: hoveredCapsule === 'feedback' ? 0.3 : 1
                }} 
              />
            </div>

            <span className="text-base font-semibold text-neutral-900 relative z-10 flex items-center gap-2">
              <span>Feedback</span>
              <ChevronRight 
                className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all duration-300"
                style={{
                  transform: hoveredCapsule === 'feedback' ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
                strokeWidth={2.5}
              />
            </span>
          </div>
        </div>

        {/* Mesh Gradient - Lavanda/Violeta izquierda, Naranja derecha */}
        <div 
          className="absolute inset-0"
          style={{
            /* Fondo base oscuro por seguridad */
            backgroundColor: '#2E003E',
            background: `
              /* CAPA 1 (SUPERIOR) - EL SOL/FUEGO (Agresivo) */
              /* Naranja rojizo quemado, muy intenso, como un sol poniente */
              radial-gradient(
                ellipse 80% 80% at 100% 0%,
                rgba(255, 69, 0, 0.9) 0%,   /* Rojo Naranja Intenso */
                rgba(255, 140, 0, 0.7) 40%, /* Naranja fuerte */
                transparent 80%
              ),
          
              /* CAPA 2 - ZONA INFERIOR DERECHA (Sombra de Paisaje) */
              /* Azul noche profundo para dar contraste con el naranja */
              radial-gradient(
                ellipse 60% 60% at 90% 100%,
                rgba(25, 25, 112, 0.6) 0%, /* Azul Medianoche */
                transparent 70%
              ),
          
              /* CAPA 3 - ZONA IZQUIERDA (Cielo Profundo) */
              /* Violeta eléctrico en lugar de lavanda pálido */
              radial-gradient(
                ellipse 70% 90% at 10% 40%,
                rgba(138, 43, 226, 0.8) 0%, /* Azul Violeta vibrante */
                rgba(75, 0, 130, 0.5) 60%,  /* Índigo */
                transparent 90%
              ),
          
              /* CAPA BASE - EL LIENZO (Atardecer) */
              /* Gradiente lineal que va de la noche (izquierda) al atardecer (derecha) */
              linear-gradient(
                115deg,
                #4A0072 0%,    /* Violeta oscuro profundo */
                #C2185B 50%,   /* Magenta oscuro/Baya */
                #FF8C00 100%   /* Naranja Oscuro */
              )
            `,
            width: '100%',
            minHeight: '600px',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Textura granular/arenosa más densa */}
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
        {/* Capa adicional de textura arenosa */}
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
        
        
        
        {/* Capa adicional de profundidad con más tonos */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,182,217,0.6) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 80% 40%, rgba(255,211,140,0.5) 0%, transparent 50%)
            `,
          }}
        />
        <div className="relative z-10 w-full h-[400px] flex items-center justify-center">
        {/* Lado Izquierdo: Embudo de palabras multicolor entrando */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-full overflow-visible">
          {disorderedWords.map((word, index) => {
            // Colores arcoíris
            const rainbowColors = [
              '#FF0000', // rojo
              '#FF7F00', // naranja
              '#FFFF00', // amarillo
              '#00FF00', // verde
              '#0000FF', // azul
              '#4B0082', // índigo
              '#9400D3', // violeta
              '#FF1493', // rosa
              '#00CED1', // turquesa
              '#FFD700', // dorado
            ];
            const color = rainbowColors[index % rainbowColors.length];
            
            // Posición vertical aleatoria para crear efecto embudo (dispersas arriba y abajo)
            const startY = (Math.random() - 0.3) * 300; // -150px a +150px desde el centro
            const randomRotate = Math.random() * 45 - 22.5; // -22.5 a 22.5 grados
            
            // Tamaño más grande y variado
            const sizes = ['text-sm', 'text-base', 'text-lg'];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            
            // Posición X inicial (más a la izquierda) y final (hacia el cerebro en el centro)
            const startX = -350 - Math.random() * 100; // Empiezan más a la izquierda
            const endX = 400; // Terminan cerca del cerebro (centro del contenedor)
            
            return (
              <motion.div
                key={`${word}-${index}-${animationKey}`}
                initial={{ 
                  x: startX,
                  y: startY,
                  opacity: 0,
                  rotate: randomRotate,
                  scale: 1
                }}
                animate={{ 
                  x: [startX, endX, endX + 0],
                  y: [startY, 200, 200], // Convergen más abajo (100px desde el centro) donde está el cerebro
                  opacity: [0, 1, 1, 0.7, 0],
                  rotate: [randomRotate, randomRotate * 0.5, 0], // Se endereza al acercarse
                  scale: [1, 0.9, 0.6] // Se hace más pequeño al acercarse (efecto embudo)
                }}
                transition={{
                  duration: 2.5,
                  delay: index * 0.08,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeIn"
                }}
                className={`${size} font-bold absolute`}
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  color: color,
                  textShadow: `2px 2px 4px rgba(0,0,0,0.2)`,
                  fontWeight: 700,
                }}
              >
                {word}
              </motion.div>
            );
          })}
        </div>

        {/* Centro: Cerebro Estático */}
        <div className="relative z-50 flex items-center justify-center">
          <div className="relative">
            {/* Cerebro con efecto de brillo */}
            <div className="relative">
              {/* Fondo blanco circular detrás del cerebro */}
              <div 
                className="absolute inset-0 rounded-full bg-[#FFFEF7] z-0"
                style={{
                  width: '220px',
                  height: '220px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <Brain 
                  className="w-32 h-32 md:w-40 md:h-40 text-neutral-800 dark:text-neutral-200 drop-shadow-lg"
                  strokeWidth={2}
                />
              </motion.div>
              {/* Efecto de pulso alrededor del cerebro */}
              
            
            </div>
          </div>
        </div>

        {/* CTA debajo del cerebro - Elegante y premium, sin fondo */}
        <div className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Link 
            href="/register"
            className="group inline-flex flex-col items-center gap-3 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span 
                className="text-sm md:text-base font-semibold text-white transition-all duration-300 group-hover:scale-110"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  letterSpacing: '0.02em',
                }}
              >
                Comenzar gratis
              </span>
              <ChevronRight 
                className="w-4 h-4 md:w-5 md:h-5 text-white opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                strokeWidth={2.5}
              />
            </div>
            {/* Línea inferior con efecto de crecimiento */}
            <div className="w-full h-0.5 bg-white/60 group-hover:bg-white transition-all duration-300 group-hover:scale-110 origin-center" />
          </Link>
        </div>

            {/* Lado Derecho: Frases saliendo secuencialmente del cerebro */}
            <div className="absolute inset-y-0 left-1/2 -right-8 md:-right-12 lg:-right-16 overflow-hidden z-0 flex items-center">
            {orderedPhrases.map((phrase, index) => {
              const initialDelay = index * spacing;
              // Cada frase necesita esperar el tiempo restante del ciclo después de completar su animación
              // Para mantener el espaciado correcto: tiempo total - (delay inicial + duración)
              const repeatDelay = totalCycleTime - initialDelay - duration;
              
              return (
              <motion.div
                key={`phrase-${index}-${phrase}-${animationKey}`}
                initial={{ 
                  x: -500, // Empieza oculta a la izquierda
                  opacity: 1, 
                  scale: 1.5 
                }}
                animate={{ 
                  x: 2000, // Se mueve completamente hacia la derecha
                  opacity: 1, 
                  scale: 1.5 
                }}
                transition={{
                  duration: duration,
                  delay: initialDelay,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: Math.max(0, repeatDelay) // Asegurar que no sea negativo
                }}
                className="text-lg md:text-2xl lg:text-3xl font-black px-4 absolute whitespace-nowrap"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#ffffff',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {phrase}
              </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Modales fuera del contenedor con overflow-hidden */}
      <AnimatePresence>
        {/* Modal Feedback (Izquierda) */}
        {hoveredCapsule === 'feedback' && (
          <motion.div
            initial={{ y: -15, scale: 0.92 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, scale: 0.95 }}
            transition={{ 
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
              scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
            }}
            className="absolute top-70 left-6 z-[100]"
            onMouseEnter={() => setHoveredCapsule('feedback')}
            onMouseLeave={() => setHoveredCapsule(null)}
          >
            <motion.div 
              className="bg-white/8 backdrop-blur-[50px] backdrop-saturate-150 rounded-2xl border border-white/40 p-4 shadow-2xl w-[85vw] max-w-[1200px]"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(50px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ 
                opacity: { duration: 0.3, ease: 'easeOut' },
                backdropFilter: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-black mb-0.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Feedback
                  </h3>
                  <p className="text-xs text-black" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Entrada de datos desde todos tus canales
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-black" />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {/* Columna 1: Métricas */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center">
                      <BarChart3 className="w-3 h-3 text-black" />
                    </div>
                    Métricas
                  </h4>
                  <div className="space-y-1.5">
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">NPS</div>
                      <div className="text-xs text-black">Satisfacción del cliente</div>
                    </div>
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">CSAT</div>
                      <div className="text-xs text-black">Calificación de servicio</div>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Tiendas */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center">
                      <Store className="w-3 h-3 text-black" />
                    </div>
                    Tiendas
                  </h4>
                  <div className="space-y-1.5">
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/35 flex items-center justify-center">
                        <Smartphone className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-black">App Store</div>
                        <div className="text-xs text-black">Reviews de usuarios iOS</div>
                      </div>
                    </div>
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/35 flex items-center justify-center">
                        <ShoppingBag className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-black">Play Store</div>
                        <div className="text-xs text-black">Reviews de usuarios Android</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 3: Redes Sociales */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center">
                      <MessageSquare className="w-3 h-3 text-black" />
                    </div>
                    Redes Sociales
                  </h4>
                  <div className="space-y-1.5">
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/35 flex items-center justify-center">
                        <Twitter className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-black">X, Facebook, Instagram</div>
                        <div className="text-xs text-black">Voz pública y comentarios</div>
                      </div>
                    </div>
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/35 flex items-center justify-center">
                        <Linkedin className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-black">TikTok, LinkedIn, GitHub</div>
                        <div className="text-xs text-black">Contenido profesional y técnico</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 4: Tickets de Soporte */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center">
                      <Ticket className="w-3 h-3 text-black" />
                    </div>
                    Tickets
                  </h4>
                  <div className="space-y-1.5">
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/35 flex items-center justify-center">
                        <Ticket className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-black">Soporte</div>
                        <div className="text-xs text-black">Tickets de soporte</div>
                      </div>
                    </div>
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/35 flex items-center justify-center">
                        <HelpCircle className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-black">Reportes</div>
                        <div className="text-xs text-black">Incidencias reportadas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Insights (Derecha) */}
        {hoveredCapsule === 'insights' && (
          <motion.div
            initial={{ y: -15, scale: 0.92 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, scale: 0.95 }}
            transition={{ 
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
              scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
            }}
            className="absolute top-70 right-6 z-[100]"
            onMouseEnter={() => setHoveredCapsule('insights')}
            onMouseLeave={() => setHoveredCapsule(null)}
          >
            <motion.div 
              className="bg-white/8 backdrop-blur-[50px] backdrop-saturate-150 rounded-2xl border border-white/40 p-4 shadow-2xl w-[85vw] max-w-[1200px]"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(50px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ 
                opacity: { duration: 0.3, ease: 'easeOut' },
                backdropFilter: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-black mb-0.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Insights Accionables
                  </h3>
                  <p className="text-xs text-black" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Análisis basado en contexto empresarial que genera reportes, sugerencias e insights accionables automáticamente para cada equipo
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-black" />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {/* Columna 1: Procesamiento Inteligente */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-black" />
                    </div>
                    Procesamiento
                  </h4>
                  <div className="space-y-1.5">
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">Contexto Empresarial</div>
                      <div className="text-xs text-black">Metas, growth, diseño, producto</div>
                    </div>
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">Evita Alucinación</div>
                      <div className="text-xs text-black">Contexto para análisis robusto</div>
                    </div>
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">Detección de Patrones</div>
                      <div className="text-xs text-black">Análisis de voz del cliente</div>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Priorización Inteligente */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center">
                      <BarChart3 className="w-3 h-3 text-black" />
                    </div>
                    Priorización
                  </h4>
                  <div className="space-y-1.5">
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">Impacto y Urgencia</div>
                      <div className="text-xs text-black">Según deadlines y metas</div>
                    </div>
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">Ahorro de Tiempo</div>
                      <div className="text-xs text-black">Ahorramos tiempo de análisis manual</div>
                    </div>
                  </div>
                </div>

                {/* Columna 3: Asignación Automática */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center">
                      <Brain className="w-3 h-3 text-black" />
                    </div>
                    Asignación
                  </h4>
                  <div className="space-y-1.5">
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">Asignación Automática</div>
                      <div className="text-xs text-black">Al profesional encargado</div>
                    </div>
                  </div>
                </div>

                {/* Columna 4: Distribución y Entrega */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-5 h-5 rounded-lg bg-white/30 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-black" />
                    </div>
                    Distribución
                  </h4>
                  <div className="space-y-1.5">
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">Integración Directa</div>
                      <div className="text-xs text-black">A Slack, Notion, Jira, Figma</div>
                    </div>
                    <div className="bg-white/25 rounded-lg p-2 border border-white/20">
                      <div className="text-sm font-bold text-black">Reporte Interno</div>
                      <div className="text-xs text-black">Canal de comunicación del equipo</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


