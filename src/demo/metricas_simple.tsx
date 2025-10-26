import React from 'react';
import GlobalBackground from '../components/GlobalBackground';

const MetricasPanel: React.FC = () => {
    return (
        <div className="h-full w-full p-0 m-0 relative">
            <div className="absolute inset-0">
                <GlobalBackground />
            </div>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-1">Resumen - Últimos 30 Días</h2>
                </div>

                {/* Grid de Métricas - Sin scroll */}
                <div className="w-full max-w-5xl grid grid-cols-3 gap-6">
                    
                    {/* Total Casos - Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-6xl font-bold text-white mb-2">55</p>
                        <p className="text-xs text-white/60 mb-3 uppercase tracking-wide">Total Casos</p>
                        <div className="space-y-2">
                            <div>
                                <p className="text-2xl font-bold text-orange-400">15</p>
                                <p className="text-xs text-white/50">Abiertos</p>
                            </div>
                            <div className="border-t border-white/10 pt-2">
                                <p className="text-2xl font-bold text-green-400">40</p>
                                <p className="text-xs text-white/50">Cerrados</p>
                            </div>
                        </div>
                    </div>

                    {/* Cumplimiento SLA - Card destacada */}
                    <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-2xl p-6 text-center">
                        <p className="text-xs text-white/60 mb-2 uppercase tracking-widest">SLA</p>
                        <p className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-3">
                            89%
                        </p>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: '89%' }} />
                        </div>
                        <div className="border-t border-white/20 pt-3">
                            <p className="text-xs text-white/50 mb-1">Casos en SLA</p>
                            <p className="text-2xl font-bold text-white">49 de 55</p>
                        </div>
                    </div>

                    {/* Tiempo Promedio - Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-white/60 mb-3 uppercase tracking-wide">⏱️ Tiempo Promedio</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-3xl font-bold text-white">18 min</p>
                                <p className="text-xs text-white/50">Primera Respuesta</p>
                            </div>
                            <div className="border-t border-white/10 pt-3">
                                <p className="text-3xl font-bold text-white">3.2 hrs</p>
                                <p className="text-xs text-white/50">Resolución</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Métricas secundarias - Abajo */}
                <div className="w-full max-w-5xl grid grid-cols-2 gap-6 mt-6">
                    
                    {/* Canales Más Usados */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
                        <p className="text-xs text-white/60 mb-4 uppercase tracking-widest">📱 Canales</p>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-white mb-1">30</p>
                                <p className="text-xs text-white/50">WhatsApp</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-white mb-1">10</p>
                                <p className="text-xs text-white/50">Email</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-white mb-1">10</p>
                                <p className="text-xs text-white/50">Instagram</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-white mb-1">5</p>
                                <p className="text-xs text-white/50">Web</p>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <p className="text-xs text-white/60 mb-4 uppercase tracking-widest">📊 Insights</p>
                        <div className="space-y-4">
                            <div className="bg-orange-500/10 border-l-4 border-orange-500 p-3 rounded">
                                <p className="text-sm font-semibold text-white mb-1">⚠️ Alerta Detectada</p>
                                <p className="text-xs text-white/70">26 casos de Retiro Fallido subieron 15% → hay bug en gateway</p>
                            </div>
                            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3 rounded">
                                <p className="text-sm font-semibold text-white mb-1">📈 Tendencia</p>
                                <p className="text-xs text-white/70">Pagos vía WhatsApp aumentaron 20% en últimos 7 días</p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default MetricasPanel;

