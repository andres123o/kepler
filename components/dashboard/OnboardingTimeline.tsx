"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { 
  Building2, 
  Users, 
  Database, 
  MessageSquare,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

interface OnboardingProgress {
  step_1_completed?: boolean;
  step_2_completed?: boolean;
  step_3_completed?: boolean;
  step_4_completed?: boolean;
}

interface OnboardingTimelineProps {
  progress?: OnboardingProgress | null;
  onStepClick?: (step: string) => void;
}

const steps = [
  {
    number: 1,
    icon: Building2,
    title: "Configura tu negocio",
    description: "Comparte la misión, visión, métricas clave y objetivos de tu empresa. Esto ayuda a la IA a entender el contexto y generar insights más precisos y relevantes.",
    benefits: [
      "Insights alineados con tus objetivos",
      "Análisis contextualizado",
      "Recomendaciones más precisas"
    ],
    cta: "Comenzar",
    panel: "business"
  },
  {
    number: 2,
    icon: Users,
    title: "Define tu equipo",
    description: "Agrega a los miembros de tu equipo y sus roles. Así podremos asignar automáticamente las tareas y reportes a las personas correctas.",
    benefits: [
      "Asignación automática de tareas",
      "Reportes personalizados por rol",
      "Mejor colaboración en equipo"
    ],
    cta: "Agregar equipo",
    panel: "team"
  },
  {
    number: 3,
    icon: Database,
    title: "Conecta tus fuentes de datos",
    description: "Elige cómo quieres ingresar los datos: conecta APIs (Zendesk, HubSpot), sube documentos manualmente o configura integraciones automáticas.",
    benefits: [
      "Múltiples formas de ingreso",
      "Integración con tus herramientas",
      "Procesamiento automático"
    ],
    cta: "Conectar datos",
    panel: "data"
  },
  {
    number: 4,
    icon: MessageSquare,
    title: "Elige cómo recibir reportes",
    description: "Selecciona cómo quieres recibir los insights: directamente en la plataforma, por Slack, por correo electrónico o una combinación de opciones.",
    benefits: [
      "Reportes donde los necesitas",
      "Notificaciones personalizadas",
      "Comparte fácilmente con tu equipo"
    ],
    cta: "Configurar",
    panel: "communication"
  }
];

export function OnboardingTimeline({ progress, onStepClick }: OnboardingTimelineProps) {
  const completedSteps: number[] = [];
  if (progress?.step_1_completed) completedSteps.push(1);
  if (progress?.step_2_completed) completedSteps.push(2);
  if (progress?.step_3_completed) completedSteps.push(3);
  if (progress?.step_4_completed) completedSteps.push(4);

  // Ref para el paso activo (para hacer scroll automático)
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Determinar cuál es el paso activo
  const step1Done = progress?.step_1_completed === true;
  const step2Done = progress?.step_2_completed === true;
  const step3Done = progress?.step_3_completed === true;
  const step4Done = progress?.step_4_completed === true;
  
  let activeStepNumber = 1;
  if (step1Done && !step2Done) activeStepNumber = 2;
  else if (step2Done && !step3Done) activeStepNumber = 3;
  else if (step3Done && !step4Done) activeStepNumber = 4;
  else if (!step1Done) activeStepNumber = 1;

  // Hacer scroll al paso activo cuando se carga el componente
  useEffect(() => {
    if (activeStepRef.current) {
      // Pequeño delay para asegurar que el DOM esté renderizado
      const timer = setTimeout(() => {
        activeStepRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [activeStepNumber]);

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 
          className="text-4xl font-bold text-neutral-900 mb-4"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          ¡Bienvenido a Kepler! 🚀
        </h2>
        <p 
          className="text-lg text-neutral-600 max-w-2xl mx-auto"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Sigue estos 4 pasos simples para comenzar a generar insights poderosos con IA. 
          <span className="font-semibold text-neutral-900"> Solo toma unos minutos.</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          
          // Determinar si está completado directamente desde progress
          const step1Done = progress?.step_1_completed === true;
          const step2Done = progress?.step_2_completed === true;
          const step3Done = progress?.step_3_completed === true;
          const step4Done = progress?.step_4_completed === true;
          
          let isCompleted = false;
          if (step.number === 1) {
            isCompleted = step1Done;
          } else if (step.number === 2) {
            isCompleted = step2Done;
          } else if (step.number === 3) {
            isCompleted = step3Done;
          } else if (step.number === 4) {
            isCompleted = step4Done;
          }
          
          // Lógica explícita paso a paso para determinar si está activo o bloqueado
          let isActive = false;
          let isLocked = false;
          
          if (isCompleted) {
            // Paso completado: mostrar como completado, no activo ni bloqueado
            isActive = false;
            isLocked = false;
          } else {
            // Paso no completado: determinar si está activo o bloqueado según el progreso
            if (step.number === 1) {
              // Paso 1: activo solo si step_1 NO está completado
              isActive = !step1Done;
              isLocked = false; // El paso 1 nunca está bloqueado
            } else if (step.number === 2) {
              // Paso 2: activo si step_1 está completado Y step_2 NO está completado
              isActive = step1Done && !step2Done;
              isLocked = !isActive; // Bloqueado si no está activo
            } else if (step.number === 3) {
              // Paso 3: activo si step_2 está completado Y step_3 NO está completado
              isActive = step2Done && !step3Done;
              isLocked = !isActive; // Bloqueado si no está activo
            } else if (step.number === 4) {
              // Paso 4: activo si step_3 está completado Y step_4 NO está completado
              isActive = step3Done && !step4Done;
              isLocked = !isActive; // Bloqueado si no está activo
            }
          }
          
          return (
            <motion.div
              key={step.number}
              ref={step.number === activeStepNumber ? activeStepRef : null}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-8 top-20 w-0.5 ${
                    isCompleted ? 'bg-neutral-900' : completedSteps.includes(steps[index - 1]?.number) ? 'bg-neutral-900' : 'bg-neutral-200'
                  }`}
                  style={{ height: 'calc(100% + 2rem)' }}
                />
              )}

              <div className={`relative flex gap-6 ${isLocked ? 'opacity-40' : ''}`}>
                {/* Número e icono */}
                <div className="flex-shrink-0">
                  <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-neutral-900/80 text-white border-2 border-neutral-900' 
                      : isActive
                      ? 'bg-neutral-900 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-400 border-2 border-neutral-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
                    ) : (
                      <>
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-neutral-900/20 animate-pulse" />
                        )}
                        <span 
                          className={`text-xl font-bold relative z-10 ${
                            isActive ? 'text-white' : 'text-neutral-400'
                          }`}
                          style={{
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {step.number}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 pb-8">
                  <div className={`bg-transparent rounded-2xl border p-6 transition-all ${
                    isCompleted 
                      ? 'border-neutral-300 bg-neutral-50/50' 
                      : isActive
                      ? 'border-neutral-900/30 hover:border-neutral-900/50'
                      : 'border-neutral-200/50'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isCompleted 
                            ? 'bg-neutral-900/10' 
                            : isActive
                            ? 'bg-neutral-900/10'
                            : 'bg-neutral-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            isCompleted 
                              ? 'text-neutral-900' 
                              : isActive
                              ? 'text-neutral-900'
                              : 'text-neutral-400'
                          }`} strokeWidth={2} />
                        </div>
                        <div>
                          <h3 
                            className={`text-xl font-bold mb-1 ${
                              isCompleted 
                                ? 'text-neutral-700' 
                                : isActive
                                ? 'text-neutral-900'
                                : 'text-neutral-400'
                            }`}
                            style={{
                              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                              fontWeight: 700,
                            }}
                          >
                            {step.title}
                            {isCompleted && (
                              <span className="ml-2 text-sm font-normal text-neutral-500">✓ Completado</span>
                            )}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p 
                      className={`mb-4 leading-relaxed ${
                        isCompleted 
                          ? 'text-neutral-500' 
                          : isActive
                          ? 'text-neutral-600'
                          : 'text-neutral-400'
                      }`}
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      {step.description}
                    </p>

                    {/* Benefits - Solo mostrar si está completado o activo */}
                    {!isLocked && (
                      <div className="mb-6">
                        <ul className="space-y-2">
                          {step.benefits.map((benefit, i) => (
                            <li key={i} className={`flex items-center gap-2 text-sm ${
                              isCompleted 
                                ? 'text-neutral-500' 
                                : 'text-neutral-600'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                isCompleted 
                                  ? 'bg-neutral-400' 
                                  : 'bg-neutral-500'
                              }`} />
                              <span
                                style={{
                                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                }}
                              >
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Button - Solo mostrar si está activo */}
                    {isActive && (
                      <button
                        onClick={() => onStepClick?.(step.panel)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors shadow-sm hover:shadow-md"
                        style={{
                          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        }}
                      >
                        {step.cta}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Mensaje para pasos bloqueados */}
                    {isLocked && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-400 rounded-xl text-sm font-medium">
                        <span>Completa el paso anterior para continuar</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

