"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Users, TrendingDown, Calendar, Loader2, AlertCircle, Eye, X, Instagram, Linkedin, Smartphone, FileText, MessageSquare, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

interface InsightsPanelProps {
  organizationId: string;
}

export function InsightsPanel({ organizationId }: InsightsPanelProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('organization_id', organizationId)
        .order('generated_at', { ascending: false });
      
      if (!error && data) {
        setInsights(data);
      }
      setLoading(false);
    }
    
    fetchInsights();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 
            className="text-3xl font-bold text-neutral-900 mb-2"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Historial de insights
          </h2>
          <p 
            className="text-neutral-600"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Aquí verás todos los insights generados por IA
          </p>
        </div>
        
        <div className="bg-transparent rounded-xl border border-neutral-200/50 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500 text-lg mb-2">No hay insights aún</p>
          <p className="text-neutral-400 text-sm">
            Inicia tu primer análisis desde el dashboard principal
          </p>
        </div>
      </div>
    );
  }

  // Si hay un insight seleccionado, mostrar el reporte completo in-page
  if (selectedInsight) {
  return (
      <div className="max-w-5xl mx-auto">
        {/* Botón para volver */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setSelectedInsight(null)}
          className="flex items-center gap-2 mb-6 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Volver al historial</span>
        </motion.button>

        {/* Reporte completo in-page - usando la misma estructura que el dashboard */}
        <InsightFullView insight={selectedInsight} />
      </div>
    );
  }

  return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 
            className="text-3xl font-bold text-neutral-900 mb-2"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Historial de insights
          </h2>
          <p 
            className="text-neutral-600"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {insights.length} insight{insights.length !== 1 ? 's' : ''} generado{insights.length !== 1 ? 's' : ''} por IA
          </p>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <InsightCompactCard 
              key={insight.id} 
              insight={insight} 
              index={index}
              onView={() => setSelectedInsight(insight)}
            />
          ))}
        </div>
      </div>
  );
}

/**
 * Componente para mostrar un insight compacto (solo título + fecha + botón Ver)
 */
function InsightCompactCard({ insight, index, onView }: { insight: any; index: number; onView: () => void }) {
  // Parsear detailed_analysis (Markdown del agente)
  const markdownContent = insight.detailed_analysis || insight.summary || '';
  
  // Extraer título del markdown si existe
  const titleMatch = markdownContent.match(/\*\*🎯 Foco del Día \(P0\): (.+?)\*\*/);
  const title = titleMatch ? titleMatch[1] : insight.title;
  
  // Extraer acciones
  const actionMatches = markdownContent.match(/\*\*\[(UX\/UI|Backend|Ops\/Process)[^\]]+\]\*\*:\s*(.+?)(?=\n|$)/g);
  const actions = actionMatches?.map((match: string) => {
    const typeMatch = match.match(/\*\*\[(.+?)[^\]]+\]\*\*/);
    const descMatch = match.match(/\]:\s*(.+?)(?=\n|$)/);
    return {
      type: typeMatch ? typeMatch[1] : "UX/UI",
      description: descMatch ? descMatch[1].trim() : "",
    };
  }) || [];
  
  // Extraer dueño
  const ownerMatch = markdownContent.match(/\*\*Dueño:\*\*\s*`(.+?)`\s*\(@(.+?)\)/);
  const owner = ownerMatch ? {
    squad: ownerMatch[1],
    responsible: ownerMatch[2],
  } : null;
  
  // Extraer análisis DELTA
  const impactMatch = markdownContent.match(/\*\*Impacto:\*\*\s*(.+?)(?=\n)/);
  const violationMatch = markdownContent.match(/\*\*Violación:\*\*\s*(.+?)(?=\n)/);
  
  // Prioridad visual
  const priorityColors = {
    critical: "from-red-500/10 to-red-600/10 border-red-200/50",
    high: "from-orange-500/10 to-orange-600/10 border-orange-200/50",
    medium: "from-yellow-500/10 to-yellow-600/10 border-yellow-200/50",
    low: "from-blue-500/10 to-blue-600/10 border-blue-200/50",
  };
  
  const priorityColor = priorityColors[insight.priority as keyof typeof priorityColors] || priorityColors.medium;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl bg-gradient-to-br ${priorityColor} border p-4 hover:shadow-md transition-all group cursor-pointer`}
      onClick={onView}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Icono y título */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-gradient-to-br from-[#8A2BE2]/10 to-[#C2185B]/10 rounded-lg flex-shrink-0">
            <Target className="w-4 h-4 text-[#8A2BE2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              className="text-base font-semibold text-neutral-900 line-clamp-1 group-hover:text-[#8A2BE2] transition-colors"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 600,
              }}
            >
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
              <Calendar className="w-3 h-3" />
              {new Date(insight.generated_at).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Botón Ver */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#8A2BE2] to-[#C2185B] rounded-lg hover:shadow-lg transition-all flex-shrink-0"
        >
          <Eye className="w-4 h-4" />
          Ver
        </motion.button>
      </div>
    </motion.div>
  );
}

/**
 * Vista completa in-page del reporte (reemplaza el modal)
 */
function InsightFullView({ insight }: { insight: any }) {
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

/**
 * Modal para mostrar datos de una fuente específica
 */
interface SourceDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: string;
  sourceLabel: string;
  data: any[];
}

function SourceDataModal({ isOpen, onClose, sourceType, sourceLabel, data }: SourceDataModalProps) {
  if (!isOpen) return null;

  // Renderizar tabla según el tipo de fuente (misma lógica que en DashboardContent)
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
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        
        if (columns.length === 0) {
          return (
            <div className="text-center py-12 text-neutral-500">
              No hay columnas detectadas en los datos.
            </div>
          );
        }

        const formatColumnName = (col: string) => {
          return col
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        };

        const renderCellValue = (value: any, columnName: string) => {
          if (value === null || value === undefined || value === '') {
            return <span className="text-neutral-400">-</span>;
          }
          
          const lowerCol = columnName.toLowerCase();
          if ((lowerCol.includes('score') || lowerCol.includes('rating') || lowerCol.includes('nps') || lowerCol.includes('csat')) && !isNaN(Number(value))) {
            const numValue = Number(value);
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
            } catch {}
          }
          
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


