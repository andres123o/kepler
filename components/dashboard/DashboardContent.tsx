"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, Loader2, Instagram, Linkedin, Smartphone, Database, MessageSquare, Info, CheckCircle2, X, Upload, Link2, Target, Users, TrendingDown, Calendar, Clock, ChevronRight, Mail, Send, Star, Eye, Brain, Zap, BarChart3, Search, FileSearch, Lightbulb } from "lucide-react";
import { FileUploadModal } from "./FileUploadModal";
import { useDashboard } from "./DashboardContext";
import { runCompleteAnalysis } from "@/app/actions/run-analysis";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { sendInsightByEmail } from "@/app/actions/send-insight-email";
import { createClient } from "@/lib/supabase/client";

interface DashboardContentProps {
  organization: any;
  insights?: any[];
  dataSources?: any[];
  businessContexts?: any[];
}

// Mensajes dinámicos para el loader
const analysisMessages = [
  { icon: Search, text: "Recopilando datos de tus fuentes...", subtext: "Conectando con Instagram, Play Store y más" },
  { icon: FileSearch, text: "Procesando archivos y feedback...", subtext: "Analizando tickets, NPS y encuestas CSAT" },
  { icon: Brain, text: "Aplicando inteligencia artificial...", subtext: "Identificando patrones y tendencias" },
  { icon: BarChart3, text: "Detectando clusters de problemas...", subtext: "Agrupando feedback similar" },
  { icon: Zap, text: "Priorizando hallazgos críticos...", subtext: "Calculando impacto en el negocio" },
  { icon: Lightbulb, text: "Generando recomendaciones...", subtext: "Creando plan de acción personalizado" },
];

// Componente de Loader Mejorado
function AnalysisLoader({ isVisible }: { isVisible: boolean }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessageIndex(0);
      setProgress(0);
      return;
    }

    // Cambiar mensaje cada 4 segundos
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % analysisMessages.length);
    }, 4000);

    // Simular progreso suave
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        // Progreso más rápido al inicio, más lento al final
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : prev < 80 ? 1 : 0.5;
        return Math.min(prev + increment, 95);
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const CurrentIcon = analysisMessages[currentMessageIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-md mx-4"
      >
        {/* Anillo animado exterior */}
        <div className="relative mb-8">
          {/* Ondas de pulso */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8A2BE2]/20 to-[#C2185B]/20"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ width: 120, height: 120, margin: -20 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8A2BE2]/20 to-[#C2185B]/20"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            }}
            style={{ width: 120, height: 120, margin: -20 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8A2BE2]/20 to-[#C2185B]/20"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 1,
            }}
            style={{ width: 120, height: 120, margin: -20 }}
          />

          {/* Círculo principal con gradiente rotativo */}
          <div className="relative w-20 h-20">
            {/* Anillo de progreso */}
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              {/* Fondo del anillo */}
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#e5e5e5"
                strokeWidth="4"
                fill="none"
              />
              {/* Progreso */}
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 226" }}
                animate={{ strokeDasharray: `${progress * 2.26} 226` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8A2BE2" />
                  <stop offset="100%" stopColor="#C2185B" />
                </linearGradient>
              </defs>
            </svg>

            {/* Icono central animado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                transition={{ duration: 0.3 }}
                className="p-3 rounded-xl bg-gradient-to-br from-[#8A2BE2] to-[#C2185B]"
              >
                <CurrentIcon className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Porcentaje */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span 
            className="text-3xl font-bold bg-gradient-to-r from-[#8A2BE2] to-[#C2185B] bg-clip-text text-transparent"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {Math.round(progress)}%
          </span>
        </motion.div>

        {/* Mensaje principal animado */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h3 
              className="text-lg font-semibold text-neutral-900 mb-1"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {analysisMessages[currentMessageIndex].text}
            </h3>
            <p 
              className="text-sm text-neutral-500"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {analysisMessages[currentMessageIndex].subtext}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 mt-6">
          {analysisMessages.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentMessageIndex 
                  ? 'w-6 bg-gradient-to-r from-[#8A2BE2] to-[#C2185B]' 
                  : index < currentMessageIndex 
                    ? 'w-1.5 bg-[#8A2BE2]/50' 
                    : 'w-1.5 bg-neutral-200'
              }`}
            />
          ))}
        </div>

        {/* Mensaje de calma */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xs text-neutral-400 text-center max-w-xs"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Esto puede tomar entre 30 segundos y 2 minutos dependiendo de la cantidad de datos. No cierres esta ventana.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export function DashboardContent({ organization, insights = [], dataSources = [], businessContexts = [] }: DashboardContentProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>("");
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showAllSourcesModal, setShowAllSourcesModal] = useState(false);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isProcessingFirstAnalysis, setIsProcessingFirstAnalysis] = useState(false);
  const { setActivePanel } = useDashboard();
  const router = useRouter();
  const supabase = createClient();

  // Filtrar fuentes de redes sociales
  const instagramSources = dataSources.filter(
    (source) => source.source_type === "social" && source.social_platform === "instagram"
  );
  
  const linkedInSources = dataSources.filter(
    (source) => source.source_type === "social" && source.social_platform === "linkedin"
  );
  
  const playStoreSources = dataSources.filter(
    (source) => source.source_type === "app_store" && source.app_store_type === "play_store"
  );

  // Fuentes que requieren archivos (NPS, CSAT, Tickets con método file)
  const fileSources = dataSources.filter(
    (source) => 
      source.source_type === "nps" || 
      source.source_type === "csat" || 
      (source.source_type === "tickets" && (source.tickets_method === "file" || source.import_method_reference?.includes("archivo")))
  );

  // Fuentes que requieren archivos pero no los tienen
  const missingFileSources = useMemo(() => {
    return fileSources
      .filter((source) => !source.file_path || !source.file_name)
      .map((source) => ({
        id: source.id,
        sourceName: source.source_name || (source.source_type === "nps" ? "NPS" : source.source_type === "csat" ? "CSAT" : "Tickets"),
        sourceType: source.source_type,
        sourceId: source.id,
      }));
  }, [fileSources]);
  
  const hasSocialSources = instagramSources.length > 0 || linkedInSources.length > 0 || playStoreSources.length > 0;
  const hasDataSources = dataSources.length > 0;

  // Detectar si es primer login (no hay insights y hay data sources)
  useEffect(() => {
    if (insights.length === 0 && dataSources.length > 0 && businessContexts.length > 0) {
      setIsFirstLogin(true);
      setIsProcessingFirstAnalysis(true);
      
      // Polling para verificar si el análisis está listo (cada 5 segundos, máximo 3 minutos)
      let pollCount = 0;
      const maxPolls = 36; // 3 minutos (36 * 5 segundos)
      
      const pollInterval = setInterval(async () => {
        pollCount++;
        
        try {
          const { data: latestInsights } = await supabase
            .from('insights')
            .select('*')
            .eq('organization_id', organization.id)
            .order('generated_at', { ascending: false })
            .limit(1);
          
          if (latestInsights && latestInsights.length > 0) {
            // Análisis listo!
            const firstInsight = latestInsights[0] as any;
            if (firstInsight?.id) {
              setIsProcessingFirstAnalysis(false);
              setIsFirstLogin(false);
              clearInterval(pollInterval);
              // Refrescar y luego seleccionar el insight
              router.refresh();
              // Esperar un momento para que el refresh complete y luego seleccionar
              setTimeout(() => {
                setSelectedInsightId(firstInsight.id);
              }, 500);
            }
          } else if (pollCount >= maxPolls) {
            // Tiempo máximo alcanzado
            setIsProcessingFirstAnalysis(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error verificando insights:', error);
          if (pollCount >= maxPolls) {
            setIsProcessingFirstAnalysis(false);
            clearInterval(pollInterval);
          }
        }
      }, 5000); // Verificar cada 5 segundos
      
      // Limpiar intervalo al desmontar
      return () => clearInterval(pollInterval);
    } else {
      setIsFirstLogin(false);
      setIsProcessingFirstAnalysis(false);
    }
  }, [insights.length, dataSources.length, businessContexts.length, organization.id, router, supabase]);

  // Ordenar insights por fecha (más reciente primero)
  const sortedInsights = useMemo(() => {
    return [...insights].sort((a, b) => {
      const dateA = new Date(a.generated_at || a.created_at).getTime();
      const dateB = new Date(b.generated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  }, [insights]);

  // Insight activo (el seleccionado o el más reciente por defecto)
  const activeInsight = useMemo(() => {
    if (selectedInsightId) {
      return sortedInsights.find(insight => insight.id === selectedInsightId) || sortedInsights[0] || null;
    }
    return sortedInsights[0] || null;
  }, [selectedInsightId, sortedInsights]);

  // Insights anteriores (para preview e historial)
  const previousInsights = useMemo(() => {
    if (!activeInsight) return [];
    return sortedInsights.filter(insight => insight.id !== activeInsight.id).slice(0, 5);
  }, [activeInsight, sortedInsights]);

  // Actualizar selectedInsightId cuando cambian los insights
  useEffect(() => {
    if (sortedInsights.length > 0 && !selectedInsightId) {
      setSelectedInsightId(sortedInsights[0].id);
    }
  }, [sortedInsights, selectedInsightId]);

  // Función para obtener icono y detalles de fuente
  const getSourceIcon = (source: any) => {
    if (source.source_type === "social") {
      if (source.social_platform === "instagram") {
        return { 
          icon: Instagram, 
          label: "Instagram", 
          color: "from-pink-500/15 to-purple-500/15"
        };
      }
      return { 
        icon: Linkedin, 
        label: "LinkedIn", 
        color: "from-blue-500/15 to-blue-600/15"
      };
    }
    if (source.source_type === "app_store") {
      return { 
        icon: Smartphone, 
        label: "Play Store", 
        color: "from-green-500/15 to-green-600/15"
      };
    }
    if (source.source_type === "tickets") {
      return { 
        icon: MessageSquare, 
        label: "Tickets", 
        color: "from-orange-500/15 to-orange-600/15"
      };
    }
    return { 
      icon: Database, 
      label: source.source_name || "Fuente", 
      color: "from-neutral-500/15 to-neutral-600/15"
    };
  };

  const handleStartAnalysis = () => {
    // Si faltan archivos, mostrar modal primero
    if (missingFileSources.length > 0) {
      setShowFileUploadModal(true);
      return;
    }

    // Si todo está bien, iniciar análisis completo
    startCompleteAnalysis();
  };

  const startCompleteAnalysis = (parsedData?: { nps?: any[]; csat?: any[]; tickets?: any[]; rawData?: { nps?: any[]; csat?: any[]; tickets?: any[] } }) => {
    setStatus("🔄 Iniciando análisis completo...");
    
    startTransition(async () => {
      try {
        setStatus("🔄 Procesando archivos y recopilando datos...");
        
        const result = await runCompleteAnalysis(organization.id, parsedData, parsedData?.rawData);
        
        if (result.success) {
          setStatus(`✅ Análisis completado exitosamente. Insight guardado.`);
          
          // Refrescar para mostrar el nuevo insight
          router.refresh();
          
          // Log de metadata
          if (result.metadata) {
            console.log('📊 Metadata del análisis:', {
              archivosProcesados: result.metadata.filesProcessed,
              scrapersEjecutados: result.metadata.scrapersExecuted,
              itemsAnalizados: result.metadata.itemsAnalyzed,
              clustersDetectados: result.metadata.clustersDetected,
              tiempoProcesamiento: `${(result.metadata.processingTime / 1000).toFixed(1)}s`,
            });
          }
        } else {
          setStatus(`❌ Error: ${result.error || "Error desconocido"}`);
        }
      } catch (error: any) {
        console.error("❌ Error en análisis:", error);
        setStatus(`❌ Error: ${error.message || "Error al ejecutar el análisis"}`);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Loader de análisis mejorado */}
      <AnimatePresence>
        {isPending && <AnalysisLoader isVisible={isPending} />}
      </AnimatePresence>

      {/* Modal de subida de archivos */}
      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        onComplete={(parsedData) => {
          setShowFileUploadModal(false);
          // Iniciar análisis completo con datos parseados
          startCompleteAnalysis(parsedData);
        }}
        missingFiles={missingFileSources}
      />

      {/* Mini Modal - Todas las fuentes de datos */}
      <AnimatePresence>
        {showAllSourcesModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllSourcesModal(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-20 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200/60 p-6 max-w-md w-full max-h-[600px] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3
                    className="text-lg font-bold text-neutral-900"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    Todas las fuentes
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {dataSources.length} fuente{dataSources.length !== 1 ? 's' : ''} conectada{dataSources.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowAllSourcesModal(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de fuentes */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {dataSources.map((source, index) => {
                  const { icon: Icon, label, color } = getSourceIcon(source);
                  const hasFile = source.file_path && source.file_name;
                  
                  return (
                    <motion.div
                      key={source.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${color} border border-neutral-200/50 hover:shadow-md transition-all group`}
                    >
                      <div className="p-2 bg-white/60 backdrop-blur-sm rounded-lg">
                        <Icon className="w-4 h-4 text-neutral-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold text-neutral-800"
                          style={{
                            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {label}
                        </p>
                        {source.source_type === "nps" || source.source_type === "csat" ? (
                          <p className="text-xs text-neutral-600 mt-0.5">
                            {hasFile ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Archivo subido
                              </span>
                            ) : source.import_method_reference === "Se subirá archivo cuando se genere el análisis" ? (
                              <span className="text-neutral-600 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Subida manual
                              </span>
                            ) : (
                              <span className="text-orange-600 flex items-center gap-1">
                                <Upload className="w-3 h-3" />
                                Pendiente de subir
                              </span>
                            )}
                          </p>
                        ) : source.source_type === "tickets" ? (
                          <p className="text-xs text-neutral-600 mt-0.5">
                            {source.import_method_reference === "file" || source.tickets_method === "file" ? (
                              hasFile ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Archivo subido
                                </span>
                              ) : source.import_method_reference === "Se subirá archivo cuando se genere el análisis" || source.import_method_reference === "Usuario importará data desde un archivo después" ? (
                                <span className="text-neutral-600 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Subida manual
                                </span>
                              ) : (
                                <span className="text-orange-600 flex items-center gap-1">
                                  <Upload className="w-3 h-3" />
                                  Archivo pendiente de subir
                                </span>
                              )
                            ) : (
                              <span className="text-blue-600 flex items-center gap-1">
                                <Link2 className="w-3 h-3" />
                                Conectado por API
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {source.social_username || source.app_url || "Configurada"}
                          </p>
                        )}
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <motion.button
                  onClick={() => {
                    setShowAllSourcesModal(false);
                    setActivePanel("data");
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Gestionar fuentes
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header con título y widget sutil de fuentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 relative"
      >
        {/* Widget elegante de fuentes - Esquina superior derecha */}
        {hasDataSources && (
          <motion.button
            onClick={() => setShowAllSourcesModal(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="absolute top-0 right-0 z-10 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-white to-neutral-50/90 backdrop-blur-sm border border-neutral-200/60 shadow-sm hover:shadow-md hover:border-neutral-300/80 transition-all cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2]/20 to-[#C2185B]/20 rounded-lg blur-sm group-hover:blur-none transition-all" />
              <div className="relative p-1.5 bg-gradient-to-br from-[#8A2BE2]/10 to-[#C2185B]/10 rounded-lg">
                <Database className="w-4 h-4 text-[#8A2BE2] group-hover:text-[#C2185B] transition-colors" />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span 
                className="text-xs font-semibold text-neutral-900 leading-tight"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Fuentes conectadas
              </span>
              <span 
                className="text-xs font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {dataSources.length} activa{dataSources.length !== 1 ? 's' : ''} • Ver todas
              </span>
            </div>
          </motion.button>
        )}

        {/* Título principal */}
        <div className="pr-0 md:pr-20">
          <h1 
            className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2 leading-tight"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Hola, {organization?.name || "usuario"}
          </h1>
          <p 
            className="text-lg text-neutral-600"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Genera insights inteligentes que mejoran tu producto
          </p>
        </div>

        {/* Widget elegante en móvil */}
        {hasDataSources && (
          <motion.button
            onClick={() => setShowAllSourcesModal(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 md:hidden flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-white to-neutral-50/90 backdrop-blur-sm border border-neutral-200/60 shadow-sm hover:shadow-md hover:border-neutral-300/80 transition-all cursor-pointer group w-full"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2]/20 to-[#C2185B]/20 rounded-lg blur-sm group-hover:blur-none transition-all" />
              <div className="relative p-1.5 bg-gradient-to-br from-[#8A2BE2]/10 to-[#C2185B]/10 rounded-lg">
                <Database className="w-4 h-4 text-[#8A2BE2] group-hover:text-[#C2185B] transition-colors" />
              </div>
            </div>
            <div className="flex flex-col items-start flex-1">
              <span 
                className="text-xs font-semibold text-neutral-900 leading-tight"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Fuentes conectadas
              </span>
              <span 
                className="text-xs font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {dataSources.length} activa{dataSources.length !== 1 ? 's' : ''} • Ver todas
              </span>
            </div>
          </motion.button>
        )}

        {/* Status message - Solo mostrar errores, el progreso se muestra en el loader */}
        {status && status.startsWith('❌') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200"
          >
            <p 
              className="text-sm text-red-700"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {status}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Área principal - Mostrar insight completo o estado vacío */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        {activeInsight ? (
          // Mostrar reporte completo
          <FullInsightReport 
            insight={activeInsight}
            previousInsights={previousInsights}
            onSelectInsight={setSelectedInsightId}
            onCreateNew={handleStartAnalysis}
            isPending={isPending}
            hasSources={hasSocialSources || hasDataSources}
            organizationId={organization.id}
          />
        ) : isProcessingFirstAnalysis ? (
          // Estado de procesamiento del primer análisis (loader pequeño)
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
              <div>
                <h3 
                  className="text-xl font-semibold text-neutral-900 mb-2"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Preparando tu primer análisis
                </h3>
                <p 
                  className="text-sm text-neutral-500"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Estamos recopilando datos y generando insights automáticamente...
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          // Estado vacío: título y botón solamente
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h3 
              className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              Tu primer análisis
            </h3>
            
            {/* Botón de análisis */}
            <motion.button
              onClick={handleStartAnalysis}
              disabled={isPending || (!hasSocialSources && !hasDataSources)}
              whileHover={{ scale: isPending || (!hasSocialSources && !hasDataSources) ? 1 : 1.02 }}
              whileTap={{ scale: isPending || (!hasSocialSources && !hasDataSources) ? 1 : 0.98 }}
              className="btn-black-always flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
                  <Sparkles className="w-5 h-5" />
                  <span>Iniciar Análisis de Voz de Cliente</span>
            </motion.button>
            
            {!hasSocialSources && !hasDataSources && (
              <p className="text-sm text-neutral-500 mt-6">
                Necesitas agregar al menos una fuente de datos primero
              </p>
            )}

            {missingFileSources.length > 0 && (
              <p className="text-sm text-orange-600 mt-6 flex items-center justify-center gap-2">
                <Info className="w-4 h-4" />
                {missingFileSources.length} archivo(s) pendiente(s) de subir
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Reportes anteriores - Al final, después del reporte principal */}
      {sortedInsights.length > 1 && previousInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-12"
        >
          <div className="mb-6">
            <h3 
              className="text-lg font-bold text-neutral-900"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
              }}
            >
              Reportes anteriores
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previousInsights.slice(0, 3).map((insight, index) => (
              <InsightPreviewCard
                key={insight.id}
                insight={insight}
                onClick={() => setSelectedInsightId(insight.id)}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Componente para preview de insight (tarjeta pequeña)
 */
function InsightPreviewCard({ insight, onClick, index }: { insight: any; onClick: () => void; index: number }) {
  const markdownContent = insight.detailed_analysis || insight.summary || '';
  const titleMatch = markdownContent.match(/(?:\*\*)?🎯\s*Foco del Día\s*\(P0\):\s*(.+?)(?:\*\*|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : insight.title;

  const priorityColors = {
    critical: "border-red-200/50 bg-red-50/30",
    high: "border-orange-200/50 bg-orange-50/30",
    medium: "border-yellow-200/50 bg-yellow-50/30",
    low: "border-blue-200/50 bg-blue-50/30",
  };
  
  const priorityColor = priorityColors[insight.priority as keyof typeof priorityColors] || priorityColors.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`rounded-xl border ${priorityColor} p-4 cursor-pointer hover:shadow-md transition-all group`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 
            className="text-sm font-semibold text-neutral-900 line-clamp-2 group-hover:text-[#8A2BE2] transition-colors"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
            <Calendar className="w-3 h-3" />
            {new Date(insight.generated_at || insight.created_at).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric'
            })}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#8A2BE2] transition-colors flex-shrink-0 ml-2" />
      </div>
    </motion.div>
  );
}

/**
 * Componente para mostrar reporte completo de insight
 */
// Tipos para los datos crudos
interface SourceDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: string;
  sourceLabel: string;
  data: any[];
}

// Modal para mostrar datos de una fuente específica
function SourceDataModal({ isOpen, onClose, sourceType, sourceLabel, data }: SourceDataModalProps) {
  if (!isOpen) return null;

  // Renderizar tabla según el tipo de fuente
  const renderTable = () => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-neutral-500">
          No hay datos disponibles para mostrar.
        </div>
      );
    }

    switch (sourceType) {
      case 'instagram':
      case 'linkedin':
        return (
          <table className="w-full">
            <thead className="sticky top-0 bg-neutral-50 z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b border-neutral-200">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b border-neutral-200">Comentario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b border-neutral-200">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-neutral-700 font-medium whitespace-nowrap">
                    {item.username || 'Anónimo'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 max-w-md">
                    <p className="line-clamp-3">{item.text}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'playstore':
        return (
          <table className="w-full">
            <thead className="sticky top-0 bg-neutral-50 z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b border-neutral-200">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b border-neutral-200">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b border-neutral-200">Reseña</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b border-neutral-200">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 font-medium whitespace-nowrap">
                    {item.userName || 'Anónimo'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 max-w-md">
                    <p className="line-clamp-3">{item.reviewText}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                    {item.datePublished ? new Date(item.datePublished).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      // NPS, CSAT, Tickets - Tabla DINÁMICA que detecta columnas automáticamente
      case 'nps':
      case 'csat':
      case 'tickets':
      default: {
        // Detectar columnas dinámicamente del primer elemento
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        
        if (columns.length === 0) {
          return (
            <div className="text-center py-12 text-neutral-500">
              No hay columnas detectadas en los datos.
            </div>
          );
        }

        // Función para formatear el nombre de columna para mostrar
        const formatColumnName = (col: string) => {
          return col
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        };

        // Función para renderizar el valor de una celda
        const renderCellValue = (value: any, columnName: string) => {
          if (value === null || value === undefined || value === '') {
            return <span className="text-neutral-400">-</span>;
          }
          
          // Detectar si es un número que parece score/rating
          const lowerCol = columnName.toLowerCase();
          if ((lowerCol.includes('score') || lowerCol.includes('rating') || lowerCol.includes('nps') || lowerCol.includes('csat')) && !isNaN(Number(value))) {
            const numValue = Number(value);
            // NPS: 0-10, CSAT: 1-5
            const isNPS = numValue >= 0 && numValue <= 10;
            const isCSAT = numValue >= 1 && numValue <= 5;
            
            if (isNPS || isCSAT) {
              const bgColor = isNPS
                ? (numValue >= 9 ? 'bg-green-100 text-green-700' : numValue >= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')
                : (numValue >= 4 ? 'bg-green-100 text-green-700' : numValue >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700');
              
              return (
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${bgColor}`}>
                  {numValue}
                </span>
              );
            }
          }
          
          // Detectar si es una fecha
          if (lowerCol.includes('date') || lowerCol.includes('fecha') || lowerCol.includes('timestamp') || lowerCol.includes('created') || lowerCol.includes('time')) {
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                return (
                  <span className="text-neutral-500 text-xs">
                    {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                );
              }
            } catch {
              // No es una fecha válida, mostrar como texto
            }
          }
          
          // Detectar si es un status/estado
          if (lowerCol.includes('status') || lowerCol.includes('estado')) {
            const statusStr = String(value).toLowerCase();
            const statusColor = 
              statusStr.includes('open') || statusStr.includes('nuevo') || statusStr.includes('abierto') ? 'bg-blue-100 text-blue-700' :
              statusStr.includes('progress') || statusStr.includes('proceso') || statusStr.includes('pending') ? 'bg-yellow-100 text-yellow-700' :
              statusStr.includes('closed') || statusStr.includes('cerrado') || statusStr.includes('resolved') || statusStr.includes('resuelto') ? 'bg-green-100 text-green-700' :
              'bg-neutral-100 text-neutral-600';
            
            return (
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                {String(value)}
              </span>
            );
          }
          
          // Texto largo (comentarios, descripciones)
          const strValue = String(value);
          if (strValue.length > 100) {
            return <p className="line-clamp-3 text-sm text-neutral-600">{strValue}</p>;
          }
          
          return <span className="text-sm text-neutral-700">{strValue}</span>;
        };

        return (
          <table className="w-full">
            <thead className="sticky top-0 bg-neutral-50 z-10">
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col}
                    className="text-left px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b border-neutral-200 whitespace-nowrap"
                  >
                    {formatColumnName(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 max-w-md">
                      {renderCellValue(item[col], col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200/60 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#8A2BE2]/10 to-[#C2185B]/10 rounded-xl">
              <Eye className="w-5 h-5 text-[#8A2BE2]" />
            </div>
            <div>
              <h3
                className="text-lg font-bold text-neutral-900"
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 700,
                }}
              >
                Datos de {sourceLabel}
              </h3>
              <p className="text-sm text-neutral-500">
                {data.length} registro{data.length !== 1 ? 's' : ''} obtenido{data.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Container with scroll */}
        <div className="flex-1 overflow-auto">
          {renderTable()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
          <p className="text-xs text-neutral-500">
            Mostrando {data.length} de {data.length} registros
          </p>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-xl transition-colors"
          >
            Cerrar
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

function FullInsightReport({ 
  insight, 
  previousInsights, 
  onSelectInsight, 
  onCreateNew,
  isPending,
  hasSources,
  organizationId
}: { 
  insight: any; 
  previousInsights: any[];
  onSelectInsight: (id: string) => void;
  onCreateNew: () => void;
  isPending: boolean;
  hasSources: boolean;
  organizationId: string;
}) {
  const { setActivePanel } = useDashboard();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string>("");
  
  // Estado para el modal de datos de fuente
  const [sourceDataModal, setSourceDataModal] = useState<{
    isOpen: boolean;
    sourceType: string;
    sourceLabel: string;
    data: any[];
  }>({
    isOpen: false,
    sourceType: '',
    sourceLabel: '',
    data: [],
  });
  
  const markdownContent = insight.detailed_analysis || insight.summary || '';
  
  const titleMatch = markdownContent.match(/(?:\*\*)?🎯\s*Foco del Día\s*\(P0\):\s*(.+?)(?:\*\*|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : insight.title;

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailError("");
    setEmailSent(false);

    try {
      const result = await sendInsightByEmail(insight.id, organizationId);
      
      if (result.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        setEmailError(result.error || "Error al enviar el email");
        setTimeout(() => setEmailError(""), 5000);
      }
    } catch (error: any) {
      setEmailError(error.message || "Error al enviar el email");
      setTimeout(() => setEmailError(""), 5000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const priorityColors = {
    critical: "from-red-500/10 to-red-600/10 border-red-200/50",
    high: "from-orange-500/10 to-orange-600/10 border-orange-200/50",
    medium: "from-yellow-500/10 to-yellow-600/10 border-yellow-200/50",
    low: "from-blue-500/10 to-blue-600/10 border-blue-200/50",
  };
  
  const priorityColor = priorityColors[insight.priority as keyof typeof priorityColors] || priorityColors.medium;

  // Obtener conteos y datos crudos desde generation_metadata
  const sourceCounts = insight.generation_metadata?.sourceCounts || {};
  const rawData = insight.generation_metadata?.rawData || {};
  
  // Handler para abrir el modal con los datos de una fuente
  const handleOpenSourceData = (type: string, label: string) => {
    const data = rawData[type] || [];
    setSourceDataModal({
      isOpen: true,
      sourceType: type,
      sourceLabel: label,
      data,
    });
  };
  
  // Crear array de fuentes con conteos para mostrar en cápsulas
  const sourceCapsules = useMemo(() => {
    const capsules = [];
    
    if (sourceCounts.instagram && sourceCounts.instagram > 0) {
      capsules.push({
        type: 'instagram',
        icon: Instagram,
        label: 'Instagram',
        count: sourceCounts.instagram,
        hasData: rawData.instagram && rawData.instagram.length > 0,
      });
    }
    
    if (sourceCounts.linkedin && sourceCounts.linkedin > 0) {
      capsules.push({
        type: 'linkedin',
        icon: Linkedin,
        label: 'LinkedIn',
        count: sourceCounts.linkedin,
        hasData: rawData.linkedin && rawData.linkedin.length > 0,
      });
    }
    
    if (sourceCounts.playstore && sourceCounts.playstore > 0) {
      capsules.push({
        type: 'playstore',
        icon: Smartphone,
        label: 'Play Store',
        count: sourceCounts.playstore,
        hasData: rawData.playstore && rawData.playstore.length > 0,
      });
    }
    
    if (sourceCounts.nps && sourceCounts.nps > 0) {
      capsules.push({
        type: 'nps',
        icon: FileText,
        label: 'NPS',
        count: sourceCounts.nps,
        hasData: rawData.nps && rawData.nps.length > 0,
      });
    }
    
    if (sourceCounts.csat && sourceCounts.csat > 0) {
      capsules.push({
        type: 'csat',
        icon: FileText,
        label: 'CSAT',
        count: sourceCounts.csat,
        hasData: rawData.csat && rawData.csat.length > 0,
      });
    }
    
    if (sourceCounts.tickets && sourceCounts.tickets > 0) {
      capsules.push({
        type: 'tickets',
        icon: MessageSquare,
        label: 'Tickets',
        count: sourceCounts.tickets,
        hasData: rawData.tickets && rawData.tickets.length > 0,
      });
    }
    
    return capsules;
  }, [sourceCounts, rawData]);

  return (
    <div className="space-y-4">
      {/* Botones arriba */}
      <div className="flex items-center justify-end gap-3">
        {/* Botón "Enviar Reporte" */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleSendEmail}
          disabled={isSendingEmail}
          whileHover={{ scale: isSendingEmail ? 1 : 1.02 }}
          whileTap={{ scale: isSendingEmail ? 1 : 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {isSendingEmail ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : emailSent ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Enviado</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar Reporte</span>
            </>
          )}
        </motion.button>

        {/* Botón "Nuevo análisis" */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onCreateNew}
          disabled={isPending || !hasSources}
          whileHover={{ scale: isPending || !hasSources ? 1 : 1.02 }}
          whileTap={{ scale: isPending || !hasSources ? 1 : 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#8A2BE2] to-[#C2185B] hover:shadow-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
              <Sparkles className="w-4 h-4" />
              <span>Nuevo análisis</span>
        </motion.button>
      </div>

      {/* Mensaje de error de email */}
      {emailError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {emailError}
        </motion.div>
      )}

      {/* Contenido completo del reporte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white border border-neutral-200/50 p-8 md:p-12 shadow-sm"
      >
        {/* Cápsulas de fuentes - Pegadas al techo de la card */}
        {sourceCapsules.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {sourceCapsules.map((capsule, index) => {
              const Icon = capsule.icon;
              const isClickable = capsule.hasData;
              return (
                <motion.button
                  key={capsule.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={isClickable ? { scale: 1.03, y: -1 } : undefined}
                  whileTap={isClickable ? { scale: 0.98 } : undefined}
                  onClick={() => isClickable && handleOpenSourceData(capsule.type, capsule.label)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 border shadow-sm transition-all ${
                    isClickable 
                      ? 'border-neutral-200 hover:border-[#8A2BE2]/30 hover:shadow-md hover:bg-gradient-to-r hover:from-[#8A2BE2]/5 hover:to-[#C2185B]/5 cursor-pointer group' 
                      : 'border-neutral-200 cursor-default opacity-70'
                  }`}
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                  title={isClickable ? `Ver ${capsule.count} registros de ${capsule.label}` : `${capsule.count} registros de ${capsule.label}`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isClickable ? 'text-neutral-700 group-hover:text-[#8A2BE2]' : 'text-neutral-500'}`} />
                  <span className={`text-sm font-semibold transition-colors ${isClickable ? 'text-neutral-900 group-hover:text-[#8A2BE2]' : 'text-neutral-700'}`}>{capsule.count}</span>
                  <span className="text-xs text-neutral-600">{capsule.label}</span>
                  {isClickable && (
                    <Eye className="w-3 h-3 text-neutral-400 group-hover:text-[#8A2BE2] transition-colors ml-1" />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Título del reporte como H1 */}
        <h1 
          className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h1>
        
        {/* Fecha y prioridad */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Calendar className="w-4 h-4" />
            {new Date(insight.generated_at || insight.created_at).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            insight.priority === 'critical' ? 'bg-red-100 text-red-700' :
            insight.priority === 'high' ? 'bg-orange-100 text-orange-700' :
            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {insight.priority === 'critical' ? 'Crítico' :
             insight.priority === 'high' ? 'Alto' :
             insight.priority === 'medium' ? 'Medio' : 'Bajo'}
          </span>
        </div>
        
        <MarkdownRenderer content={markdownContent} className="text-neutral-900" />
        
        {/* Botón "Ver todos" al final del reporte */}
        <div className="mt-8 pt-6 border-t border-neutral-200/50 flex justify-center">
          <motion.button
            onClick={() => setActivePanel("insights")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Ver todos los reportes
          </motion.button>
        </div>
      </motion.div>

      {/* Modal de datos de fuente */}
      <AnimatePresence>
        {sourceDataModal.isOpen && (
          <SourceDataModal
            isOpen={sourceDataModal.isOpen}
            onClose={() => setSourceDataModal({ ...sourceDataModal, isOpen: false })}
            sourceType={sourceDataModal.sourceType}
            sourceLabel={sourceDataModal.sourceLabel}
            data={sourceDataModal.data}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
