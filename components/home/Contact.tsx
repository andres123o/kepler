"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Send,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Aquí se conectará el backend después
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

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
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex p-3 rounded-xl bg-neutral-900/5 mb-6"
          >
            <MessageSquare className="w-8 h-8 text-neutral-900" strokeWidth={2} />
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
            Hablemos
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
            ¿Tienes preguntas? Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Información de contacto - Gradiente del Hero */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-neutral-200/50 p-6 md:p-8 overflow-hidden"
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
            
            <div className="relative z-10 space-y-6">
              <div>
                <h3 
                  className="text-xl md:text-2xl font-bold text-white mb-4"
                  style={{ 
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Información de contacto
                </h3>
                <p 
                  className="text-base text-neutral-200 mb-6"
                  style={{ 
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Puedes contactarnos a través del formulario o directamente por email.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white/10">
                    <Mail className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 
                      className="text-sm font-semibold text-neutral-200 mb-1"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Email
                    </h4>
                    <a 
                      href="mailto:soporte@kepler.ai"
                      className="text-base text-white hover:text-neutral-200 transition-colors"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      soporte@kepler.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white/10">
                    <Clock className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 
                      className="text-sm font-semibold text-neutral-200 mb-1"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Tiempo de respuesta
                    </h4>
                    <p 
                      className="text-base text-white"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Generalmente respondemos en menos de 24 horas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulario - Fondo negro */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-neutral-700/50 p-6 md:p-8 overflow-hidden"
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
                  radial-gradient(circle at 5px 5px, rgba(255,255,255,0.08) 0.5px, transparent 0),
                  radial-gradient(circle at 7px 7px, rgba(0,0,0,0.1) 0.5px, transparent 0)
                `,
                backgroundSize: '8px 8px, 12px 12px, 16px 16px, 20px 20px',
              }}
            />
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
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%),
                  radial-gradient(ellipse 70% 50% at 80% 40%, rgba(255,255,255,0.06) 0%, transparent 50%)
                `,
              }}
            />
            
            <div className="relative z-10">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="inline-flex p-3 rounded-xl bg-green-500/20 border border-green-500/30 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" strokeWidth={2} />
                  </div>
                  <h3 
                    className="text-xl font-bold text-white mb-2"
                    style={{ 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    ¡Mensaje enviado!
                  </h3>
                  <p 
                    className="text-sm text-neutral-300"
                    style={{ 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    Te responderemos pronto
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label 
                      htmlFor="name"
                      className="block text-sm font-semibold text-white mb-2"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="email"
                      className="block text-sm font-semibold text-white mb-2"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="subject"
                      className="block text-sm font-semibold text-white mb-2"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Asunto
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      <option value="" className="bg-neutral-900 text-white">Selecciona un asunto</option>
                      <option value="soporte" className="bg-neutral-900 text-white">Soporte técnico</option>
                      <option value="ventas" className="bg-neutral-900 text-white">Ventas y precios</option>
                      <option value="integraciones" className="bg-neutral-900 text-white">Integraciones</option>
                      <option value="otro" className="bg-neutral-900 text-white">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label 
                      htmlFor="message"
                      className="block text-sm font-semibold text-white mb-2"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all resize-none"
                      style={{ 
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-white text-neutral-900 font-semibold py-6 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        Enviar mensaje
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

