"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  HelpCircle, 
  Database, 
  Brain, 
  Zap, 
  Rocket,
  MessageSquare,
  Star,
  FileText,
  Headphones
} from "lucide-react";

const faqs = [
  {
    id: 1,
    category: "Funcionamiento",
    question: "¿Cómo funciona el proceso de análisis de feedback?",
    answer: "El proceso se divide en cuatro pasos: primero, conectas tus fuentes de feedback (redes sociales, reviews, tickets, encuestas). Segundo, configuras el contexto de tu negocio (metas, misión, visión, deadlines). Tercero, nuestra IA procesa y genera insights accionables detectando patrones y priorizando. Cuarto, los insights se asignan automáticamente a los responsables y se distribuyen a tus herramientas de trabajo.",
    icon: Brain
  },
  {
    id: 2,
    category: "Integraciones",
    question: "¿Qué fuentes de datos puedo conectar?",
    answer: "Puedes conectar múltiples fuentes: redes sociales mediante scraping (solo necesitas el usuario o URL), ratings y stores de aplicaciones (con el link de la app), encuestas NPS y CSAT (subiendo archivos de cualquier formato), y tickets de soporte (subiendo archivos o conectándote con Zendesk, HubSpot u otras herramientas). También puedes conectar Notion, Figma, Slack, Jira y Gmail para compartir resultados.",
    icon: Database
  },
  {
    id: 3,
    category: "Integraciones",
    question: "¿Cómo funciona el scraping de redes sociales?",
    answer: "Recopilamos automáticamente comentarios y menciones mediante scraping. Solo necesitas proporcionar el nombre de usuario o la URL del perfil de la red social y nosotros nos encargamos del resto. El proceso es completamente automatizado y no requiere configuración adicional.",
    icon: MessageSquare
  },
  {
    id: 4,
    category: "Funcionamiento",
    question: "¿Qué es el contexto de negocio y por qué es importante?",
    answer: "El contexto de negocio incluye métricas, metas, misión, visión, deadlines y guidelines de tu empresa. Puedes conectarlo desde Notion o cada responsable de área puede subir la información mediante voz, documentos o texto directo. Este contexto permite que la IA analice el feedback con conocimiento real de tu negocio, evitando alucinaciones y generando insights más precisos y accionables.",
    icon: Brain
  },
  {
    id: 5,
    category: "Resultados",
    question: "¿Cómo puedo compartir los reportes con mi equipo?",
    answer: "Tienes tres opciones: si tienes integraciones con Notion, Slack o Gmail, los reportes se comparten automáticamente. Si no tienes estos canales, puedes descargar reportes en formato PDF para enviarlos manualmente, o permitir que tu equipo acceda directamente a la plataforma para ver los resultados, métricas e insights en tiempo real.",
    icon: Zap
  },
  {
    id: 6,
    category: "Integraciones",
    question: "¿Puedo crear encuestas directamente desde la plataforma?",
    answer: "Actualmente puedes importar archivos de encuestas en cualquier formato (CSV, Excel, PDF, JSON). La funcionalidad para crear encuestas personalizadas directamente desde la plataforma está en desarrollo. Próximamente podrás crear encuestas, gestionar resultados, visualizar métricas y alimentar el modelo de IA en un solo lugar.",
    icon: FileText
  },
  {
    id: 7,
    category: "Resultados",
    question: "¿Puedo gestionar múltiples perfiles desde una cuenta?",
    answer: "Sí, puedes gestionar varios perfiles por empresa desde un solo lugar. Esto permite que diferentes equipos o áreas de tu organización tengan sus propios perfiles y visualicen los resultados específicos de cada uno, facilitando la organización y el análisis segmentado del feedback.",
    icon: Rocket
  }
];

const categories = ["Todas", "Funcionamiento", "Integraciones", "Resultados"];

export function FAQs() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const filteredFaqs = selectedCategory === "Todas" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section className="relative overflow-hidden bg-[#FFFEF7] pt-16 md:pt-24 pb-20 md:pb-32">
      {/* Degradado de fondo sutil */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0, 0, 0, 0.02) 0%, transparent 50%)',
        }}
      />

      <div className="container relative px-4 mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex p-3 rounded-xl bg-neutral-900/5 mb-6"
          >
            <HelpCircle className="w-8 h-8 text-neutral-900" strokeWidth={2} />
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
            Preguntas frecuentes
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
            Resolvemos las dudas más comunes sobre cómo funciona nuestra plataforma
          </motion.p>
        </div>

        {/* Filtros de categorías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white/60 text-neutral-700 hover:bg-white/80 border border-neutral-200/60'
              }`}
              style={{ 
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQs */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openId === faq.id;

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div
                  className={`relative rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                    isOpen
                      ? 'border-neutral-900 bg-white shadow-lg'
                      : 'border-neutral-200/60 bg-white/60 hover:bg-white/80 hover:border-neutral-300'
                  }`}
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                >
                  {/* Contenido */}
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        isOpen 
                          ? 'bg-neutral-900' 
                          : 'bg-neutral-900/5'
                      }`}>
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${
                          isOpen ? 'text-white' : 'text-neutral-900'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <span 
                              className="text-xs font-semibold text-neutral-500 mb-2 block"
                              style={{ 
                                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                              }}
                            >
                              {faq.category}
                            </span>
                            <h3 
                              className={`text-lg md:text-xl font-bold mb-2 ${
                                isOpen ? 'text-neutral-900' : 'text-neutral-900'
                              }`}
                              style={{ 
                                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 700,
                                letterSpacing: '-0.01em'
                              }}
                            >
                              {faq.question}
                            </h3>
                          </div>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            <ChevronDown className={`w-5 h-5 ${
                              isOpen ? 'text-neutral-900' : 'text-neutral-400'
                            }`} strokeWidth={2} />
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p 
                                className="text-base text-neutral-600 leading-relaxed mt-4 pt-4 border-t border-neutral-200"
                                style={{ 
                                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                }}
                              >
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

