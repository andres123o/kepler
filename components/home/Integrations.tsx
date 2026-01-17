"use client";

import { 
  MessageSquare, 
  Star, 
  FileText, 
  Headphones, 
  Link2, 
  Upload,
  Zap,
  BarChart3,
  Users,
  FileDown,
  CheckCircle2,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const integrationCategories = [
  {
    id: "social",
    title: "Redes Sociales",
    icon: MessageSquare,
    description: "Recopilamos automáticamente comentarios y menciones mediante scraping.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-200/40",
    items: [
      {
        name: "Redes sociales",
        method: "Usuario o URL",
        description: "Proporciona el nombre de usuario o la URL del perfil y nosotros nos encargamos del resto"
      }
    ]
  },
  {
    id: "reviews",
    title: "Ratings y Stores",
    icon: Star,
    description: "Monitoreamos automáticamente las reseñas y calificaciones de tu aplicación en las principales tiendas.",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-200/40",
    items: [
      {
        name: "Apps y Stores",
        method: "Link de la app",
        description: "Proporciona el enlace de tu aplicación y nosotros recopilamos todas las reseñas y calificaciones"
      }
    ]
  },
  {
    id: "surveys",
    title: "NPS y CSAT",
    icon: FileText,
    description: "Importa tus encuestas de satisfacción desde cualquier formato. Próximamente podrás crear y gestionar encuestas directamente desde la plataforma.",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-200/40",
    items: [
      {
        name: "Subir archivos",
        method: "Cualquier tipo",
        description: "Importa archivos de encuestas en cualquier formato: CSV, Excel, PDF, JSON y más"
      },
      {
        name: "Crear encuestas",
        method: "Próximamente",
        description: "Próximamente: crea encuestas personalizadas, gestiona resultados, visualiza métricas y alimenta el modelo de IA en un solo lugar"
      }
    ]
  },
  {
    id: "support",
    title: "Tickets de Soporte",
    icon: Headphones,
    description: "Importa tickets manualmente desde archivos o conéctate directamente con tu herramienta de soporte para sincronización automática.",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-200/40",
    items: [
      {
        name: "Subir archivos",
        method: "Cualquier tipo",
        description: "Importa tickets desde archivos en cualquier formato: CSV, Excel, JSON y más"
      },
      {
        name: "Zendesk, HubSpot u otros",
        method: "Conexión",
        description: "Conéctate directamente con Zendesk, HubSpot u otras herramientas de soporte para sincronización automática de tickets"
      }
    ]
  }
];

const currentIntegrations = [
  { 
    name: "Notion", 
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    status: "active" 
  },
  { 
    name: "Figma", 
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    status: "active" 
  },
  { 
    name: "Slack", 
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    status: "active" 
  },
  { 
    name: "Jira", 
    iconUrl: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/jira.svg",
    status: "active" 
  },
  { 
    name: "Gmail", 
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
    status: "active" 
  }
];

const features = [
  {
    icon: FileDown,
    title: "Reportes descargables",
    description: "Si no tienes canales de comunicación interna como Notion, Slack o Gmail, descarga reportes en PDF para enviarlos manualmente a tus equipos"
  },
  {
    icon: BarChart3,
    title: "Ver en la plataforma",
    description: "O bien, permite que tus equipos accedan directamente a la plataforma para ver los reportes, métricas e insights en tiempo real"
  },
  {
    icon: Users,
    title: "Múltiples perfiles",
    description: "Gestiona varios perfiles por empresa y visualiza los resultados de cada uno desde un solo lugar, facilitando el acceso a diferentes equipos"
  }
];

export function Integrations() {
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
            <Link2 className="w-8 h-8 text-neutral-900" strokeWidth={2} />
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
            De dónde vienen tus datos
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
            Descubre las herramientas y métodos que utilizamos para obtener y procesar el feedback de tus usuarios. Desde scraping automatizado hasta integraciones directas, capturamos datos desde cada canal donde interactúan con tu marca.
          </motion.p>
        </div>

        {/* Categorías de integraciones */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-20">
          {integrationCategories.map((category, index) => {
            const Icon = category.icon;
            const isSocial = category.id === "social";
            const isReviews = category.id === "reviews";
            const isSurveys = category.id === "surveys";
            const isSupport = category.id === "support";
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl border p-6 md:p-8 overflow-hidden ${
                  (isSocial || isSupport)
                    ? 'border-neutral-200/50' 
                    : (isReviews || isSurveys)
                    ? 'border-neutral-700/50' 
                    : `${category.borderColor} bg-gradient-to-br ${category.color} backdrop-blur-sm`
                }`}
                style={(isSocial || isSupport) ? {
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
                } : (isReviews || isSurveys) ? {
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
                } : {}}
              >
                {/* Texturas para Redes Sociales y Tickets de Soporte (mismo estilo que BrainAnimation) */}
                {(isSocial || isSupport) && (
                  <>
                    {/* Textura granular/arenosa más densa - Exactamente como BrainAnimation */}
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
                    {/* Capa adicional de textura arenosa - Exactamente como BrainAnimation */}
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
                    {/* Capa adicional de profundidad con más tonos - Exactamente como BrainAnimation */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `
                          radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,182,217,0.6) 0%, transparent 50%),
                          radial-gradient(ellipse 70% 50% at 80% 40%, rgba(255,211,140,0.5) 0%, transparent 50%)
                        `,
                      }}
                    />
                  </>
                )}

                {/* Texturas para Rating y Stores y NPS y CSAT (estilo oscuro como "Cómo funciona") */}
                {(isReviews || isSurveys) && (
                  <>
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
                  </>
                )}
                {/* Título */}
                <div className="mb-6 relative z-10">
                  <h3 
                    className={`text-xl md:text-2xl font-bold mb-2 ${(isSocial || isReviews || isSurveys || isSupport) ? 'text-white' : 'text-neutral-900'}`}
                    style={{ 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {category.title}
                  </h3>
                  <p 
                    className={`text-sm md:text-base ${(isSocial || isReviews || isSurveys || isSupport) ? 'text-neutral-200' : 'text-neutral-600'}`}
                    style={{ 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {category.description}
                  </p>
                </div>

                {/* Items de integración */}
                <div className="space-y-3 relative z-10">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`flex items-start gap-3 p-3 rounded-lg backdrop-blur-sm border ${
                        (isSocial || isSupport)
                          ? 'bg-white/10 border-white/20' 
                          : (isReviews || isSurveys)
                          ? 'bg-white/5 border-white/10' 
                          : 'bg-white/40 border-white/60'
                      }`}
                    >
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${(isSocial || isReviews || isSurveys || isSupport) ? 'text-green-400' : 'text-green-600'}`} strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className={`text-sm font-semibold ${(isSocial || isReviews || isSurveys || isSupport) ? 'text-white' : 'text-neutral-900'}`}
                            style={{ 
                              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            }}
                          >
                            {item.name}
                          </span>
                          <span 
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              (isSocial || isReviews || isSurveys || isSupport)
                                ? 'bg-white/10 text-neutral-200 border border-white/20' 
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                            style={{ 
                              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            }}
                          >
                            {item.method}
                          </span>
                        </div>
                        <p 
                          className={`text-xs ${(isSocial || isReviews || isSurveys || isSupport) ? 'text-neutral-300' : 'text-neutral-600'}`}
                          style={{ 
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Integraciones actuales */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 
            className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6 text-center"
            style={{ 
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Integraciones disponibles
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {currentIntegrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-neutral-200/60 shadow-sm"
              >
                <div className="relative w-5 h-5 flex-shrink-0">
                  <Image
                    src={integration.iconUrl}
                    alt={`${integration.name} logo`}
                    fill
                    className="object-contain"
                    sizes="20px"
                    unoptimized
                  />
                </div>
                <span 
                  className="text-sm font-semibold text-neutral-900"
                  style={{ 
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {integration.name}
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={2.5} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Características adicionales */}
        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-white/40 backdrop-blur-sm border border-white/60 flex-1 min-w-[280px] max-w-[320px]"
              >
                <div className="inline-flex p-3 rounded-xl bg-neutral-900/5 mb-4">
                  <Icon className="w-6 h-6 text-neutral-900" strokeWidth={2} />
                </div>
                <h4 
                  className="text-lg font-bold text-neutral-900 mb-2"
                  style={{ 
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {feature.title}
                </h4>
                <p 
                  className="text-sm text-neutral-600 leading-relaxed"
                  style={{ 
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Contexto de negocio */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-8 md:p-12 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700"
        >
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex p-3 rounded-xl bg-white/10 mb-6">
              <Zap className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h3 
              className="text-2xl md:text-3xl font-bold text-white mb-4"
              style={{ 
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              Contexto de negocio integrado
            </h3>
            <p 
              className="text-base md:text-lg text-neutral-300 mb-6 leading-relaxed"
              style={{ 
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Integra métricas de negocio, metas, misión, visión, deadlines y guidelines directamente desde Notion, 
              o permite que cada responsable de área suba la información mediante voz, documentos o texto directo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Métricas de negocio", "Metas", "Misión", "Visión", "Deadlines", "Guidelines"].map((item, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium"
                  style={{ 
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sección sutil de Seguridad y Privacidad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-neutral-500" strokeWidth={2} />
              <p 
                className="text-sm text-neutral-600"
                style={{ 
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Todas las integraciones están protegidas con encriptación de extremo a extremo
              </p>
            </div>
            <button
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors underline underline-offset-4"
              style={{ 
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Ver más sobre seguridad
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

