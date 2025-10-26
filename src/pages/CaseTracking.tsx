import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GlobalBackground from '../components/GlobalBackground';

interface CaseData {
  id: number;
  ticket_number: string;
  cx_agent: string;
  priority: 'Alto' | 'Medio' | 'Bajo';
  customer_name: string;
  customer_email: string;
  country: string;
  report_description: string;
  status: 'En progreso' | 'Gestionado' | 'Pendiente';
  channel: string;
  incident_type: string;
  createdAt: Date | string;
}

const CaseTracking: React.FC = () => {
  const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del caso desde localStorage
    const loadCaseData = () => {
      const stored = localStorage.getItem('incidents');
      if (stored) {
        const incidents = JSON.parse(stored);
        const foundCase = incidents.find((inc: CaseData) => inc.ticket_number === ticketNumber);
        
        if (foundCase) {
          setCaseData(foundCase);
        }
      }
      setLoading(false);
    };

    loadCaseData();

    // Escuchar cambios en localStorage para actualizar en tiempo real
    const handleStorageChange = () => {
      loadCaseData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadCaseData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadCaseData);
    };
  }, [ticketNumber]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En progreso': return 'from-yellow-500 to-orange-500';
      case 'Gestionado': return 'from-green-500 to-emerald-500';
      case 'Pendiente': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case 'En progreso': return '5-10 min';
      case 'Gestionado': return 'Resuelto';
      case 'Pendiente': return '5-10 min';
      default: return 'TBD';
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/60">Cargando tu caso...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Caso no encontrado</h1>
          <p className="text-white/60">El caso que buscas no existe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white overflow-auto flex items-center justify-center px-6">
      <GlobalBackground />
      
      <div className="relative z-10 w-full max-w-md space-y-6 py-8">
        
        {/* Header - Centered */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Tu Caso
          </h1>
          <p className="text-4xl font-bold text-white/80">#{caseData.ticket_number}</p>
          <p className="text-white/60 text-sm pt-2">Estamos trabajando en resolver tu caso</p>
        </div>

        {/* Status Card - Centered */}
        <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="absolute inset-0 opacity-30" style={{
            background: 'linear-gradient(135deg, rgb(255, 133, 19) 0%, rgb(228, 113, 51) 20%, rgb(241, 100, 75) 40%, rgb(212, 87, 106) 60%, #b84378 80%, rgb(211, 38, 127) 100%)'
          }} />
          
          <div className="relative z-10 space-y-6">
            {/* Status Text - Centered */}
            <div className="text-center space-y-2">
              <p className="text-xs text-white/60 uppercase tracking-widest">Estado Actual</p>
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${getStatusColor(caseData.status)} bg-clip-text text-transparent`}>
                {caseData.status}
              </h2>
            </div>
            
            {/* Divider */}
            <div className="border-t border-white/10" />
            
            {/* Details - Centered */}
            <div className="space-y-4 text-center">
              <div>
                <p className="text-xs text-white/50 mb-1">Creado</p>
                <p className="font-medium">{new Date(caseData.createdAt).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Tiempo estimado</p>
                <p className="font-medium text-xl">{getEstimatedTime(caseData.status)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description - Centered */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">📋</span>
            <h3 className="text-lg font-semibold text-center">Descripción del Caso</h3>
          </div>
          <p className="text-white/80 leading-relaxed text-center">{caseData.report_description}</p>
        </div>

        {/* Agent Info - Centered */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-2xl border-3 border-white/20">
              {caseData.cx_agent.charAt(0)}
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{caseData.cx_agent}</p>
              <p className="text-sm text-white/60">Agente de Atención</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CaseTracking;

