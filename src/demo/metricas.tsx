import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlobalBackground from '../components/GlobalBackground';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

const MetricasPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'casos' | 'nps' | 'csat'>('casos');
    
    // Obtener métricas de casos desde localStorage
    const getCasesMetrics = () => {
        const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        
        // Datos ficticios para el demo
        const fakeData = {
            // Gráfico 1: Volumen de Casos Escalados (30 días)
            volumeTrend: [
                { date: '1 Oct', casos: 35 },
                { date: '5 Oct', casos: 32 },
                { date: '10 Oct', casos: 28 },
                { date: '15 Oct', casos: 25 },
                { date: '20 Oct', casos: 18 },
                { date: '25 Oct', casos: 12 },
                { date: '30 Oct', casos: 8 }
            ],
            // Gráfico 1 NPS: Tendencia del NPS (mejorando)
            npsTrend: [
                { date: '1 Oct', nps: 28 },
                { date: '5 Oct', nps: 32 },
                { date: '10 Oct', nps: 38 },
                { date: '15 Oct', nps: 42 },
                { date: '20 Oct', nps: 45 },
                { date: '25 Oct', nps: 48 },
                { date: '30 Oct', nps: 52 }
            ],
            // Gráfico 2 NPS: NPS Actual (KPI)
            currentNps: {
                score: 45,
                previousMonth: 40,
                change: 5
            },
            // Gráfico 3 NPS: Distribución de Clientes
            customerDistribution: [
                { type: 'Promotores', percentage: 60, count: 744 },
                { type: 'Pasivos', percentage: 25, count: 310 },
                { type: 'Detractores', percentage: 15, count: 186 }
            ],
            totalResponses: 1240,
            // Gráfico 1 CSAT: Satisfacción por Canal
            satisfactionByChannel: [
                { channel: 'Chat en Vivo', csat: 95 },
                { channel: 'Email', csat: 75 },
                { channel: 'Llamada', csat: 88 },
                { channel: 'Redes Sociales', csat: 82 }
            ],
            // Gráfico 2 CSAT: CSAT General (KPI)
            generalCSAT: {
                score: 92,
                previousMonth: 90,
                change: 2,
                satisfiedCustomers: 'clientes satisfechos'
            },
            // Gráfico 3 CSAT: Tópicos Frecuentes
            frequentTopics: [
                { word: 'Rápido', count: 45, positive: true, rotation: 0 },
                { word: 'Amable', count: 38, positive: true, rotation: 90 },
                { word: 'Solucionado', count: 42, positive: true, rotation: 0 },
                { word: 'Fácil', count: 35, positive: true, rotation: 0 },
                { word: 'Excelente', count: 28, positive: true, rotation: -15 },
                { word: 'Profesional', count: 25, positive: true, rotation: 15 },
                { word: 'Eficiente', count: 22, positive: true, rotation: 0 },
                { word: 'Claro', count: 20, positive: true, rotation: 90 },
                { word: 'Útil', count: 18, positive: true, rotation: 0 },
                { word: 'Espera', count: 18, positive: false, rotation: 0 },
                { word: 'Confuso', count: 12, positive: false, rotation: -10 },
                { word: 'Lento', count: 15, positive: false, rotation: 90 },
                { word: 'Repetir', count: 8, positive: false, rotation: 0 },
                { word: 'Complicado', count: 6, positive: false, rotation: 15 },
                { word: 'Demora', count: 5, positive: false, rotation: -20 }
            ],
            // Gráfico 2: Principales Motivos de Escalación
            escalationReasons: [
                { reason: 'Falla Técnica', percentage: 40, count: 48 },
                { reason: 'Problema de Pago', percentage: 30, count: 36 },
                { reason: 'Solicitud Especial', percentage: 20, count: 24 },
                { reason: 'Sin respuesta', percentage: 10, count: 12 }
            ],
            // Gráfico 3: Estado Actual de Casos Escalados
            currentStatus: [
                { status: 'En Progreso', count: 15, color: 'blue' },
                { status: 'Pendiente de Info', count: 8, color: 'yellow' },
                { status: 'Sin Asignar', count: 3, color: 'red' }
            ]
        };
        
        return {
            ...fakeData,
            incidents: incidents.slice(0, 5) // Solo mostrar 5 casos reales
        };
    };


    const casesMetrics = getCasesMetrics();

    return (
        <div className="h-full w-full p-0 m-0 relative">
            <div className="absolute inset-0">
                <GlobalBackground />
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
                {/* Navigation Tabs */}
                <div className="p-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('casos')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === 'casos'
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            Casos Escalados
                        </button>
                        <button
                            onClick={() => setActiveTab('nps')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === 'nps'
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            NPS
                        </button>
                        <button
                            onClick={() => setActiveTab('csat')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === 'csat'
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            CSAT
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-2">
                    {activeTab === 'casos' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full grid grid-cols-5 gap-3"
                        >
                            {/* GRÁFICO 1 (GRANDE - IZQUIERDA): Volumen de Casos Escalados */}
                            <div className="col-span-3 rounded-xl p-3">
                                <h3 className="text-sm font-semibold text-white mb-2">Volumen de Casos Escalados (Últimos 30 Días)</h3>
                                <div className="h-[calc(100%-2rem)]">
                                    <Line
                                        data={{
                                            labels: casesMetrics.volumeTrend.map(item => item.date),
                                            datasets: [
                                                {
                                                    label: 'Casos Escalados',
                                                    data: casesMetrics.volumeTrend.map(item => item.casos),
                                                    borderColor: 'rgba(255, 133, 19, 1)',
                                                    backgroundColor: 'rgba(255, 133, 19, 0.2)',
                                                    borderWidth: 3,
                                                    fill: true,
                                                    tension: 0.4,
                                                    pointBackgroundColor: 'rgba(255, 133, 19, 1)',
                                                    pointBorderColor: 'rgba(255, 255, 255, 1)',
                                                    pointBorderWidth: 2,
                                                    pointRadius: 6,
                                                    pointHoverRadius: 8
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: false
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    ticks: {
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        font: {
                                                            size: 10
                                                        }
                                                    },
                                                    grid: {
                                                        color: 'rgba(255, 255, 255, 0.1)'
                                                    }
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    max: 40,
                                                    ticks: {
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        font: {
                                                            size: 12
                                                        }
                                                    },
                                                    grid: {
                                                        color: 'rgba(255, 255, 255, 0.1)'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Columna derecha con dos gráficos apilados */}
                            <div className="col-span-2 flex flex-col gap-3 h-full">
                                {/* GRÁFICO 2 (DERECHA-ARRIBA): Principales Motivos de Escalación */}
                                <div className="flex-1 rounded-xl p-3 min-h-0">
                                    <h3 className="text-sm font-semibold text-white mb-2">Principales Motivos de Escalación</h3>
                                    <div className="h-[calc(100%-3rem)] flex items-center justify-center">
                                        <Doughnut
                                            data={{
                                                labels: casesMetrics.escalationReasons.map(item => item.reason),
                                                datasets: [
                                                    {
                                                        data: casesMetrics.escalationReasons.map(item => item.percentage),
                                                        backgroundColor: [
                                                            'rgba(239, 68, 68, 0.8)',   // Rojo para Falla Técnica
                                                            'rgba(245, 158, 11, 0.8)', // Amarillo para Problema de Pago
                                                            'rgba(59, 130, 246, 0.8)', // Azul para Solicitud Especial
                                                            'rgba(156, 163, 175, 0.8)' // Gris para Sin respuesta
                                                        ],
                                                        borderColor: [
                                                            'rgba(239, 68, 68, 1)',
                                                            'rgba(245, 158, 11, 1)',
                                                            'rgba(59, 130, 246, 1)',
                                                            'rgba(156, 163, 175, 1)'
                                                        ],
                                                        borderWidth: 2,
                                                        hoverOffset: 4
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                cutout: '40%',
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                        align: 'center',
                                                        labels: {
                                                            color: 'rgba(255, 255, 255, 0.9)',
                                                            font: {
                                                                size: 11
                                                            },
                                                            padding: 8,
                                                            usePointStyle: true,
                                                            boxWidth: 8,
                                                            boxHeight: 8
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* GRÁFICO 3 (DERECHA-ABAJO): Estado Actual de Casos Escalados */}
                                <div className="flex-1 rounded-xl p-3 min-h-0">
                                    <h3 className="text-sm font-semibold text-white mb-2">Estado Actual de Casos Escalados</h3>
                                    <div className="h-[calc(100%-3rem)] flex items-center justify-center">
                                        <Bar
                                            data={{
                                                labels: casesMetrics.currentStatus.map(item => item.status),
                                                datasets: [
                                                    {
                                                        data: casesMetrics.currentStatus.map(item => item.count),
                                                        backgroundColor: [
                                                            'rgba(59, 130, 246, 0.8)',  // Azul para En Progreso
                                                            'rgba(245, 158, 11, 0.8)', // Amarillo para Pendiente de Info
                                                            'rgba(239, 68, 68, 0.8)'   // Rojo para Sin Asignar
                                                        ],
                                                        borderColor: [
                                                            'rgba(59, 130, 246, 1)',
                                                            'rgba(245, 158, 11, 1)',
                                                            'rgba(239, 68, 68, 1)'
                                                        ],
                                                        borderWidth: 2,
                                                        borderRadius: 8,
                                                        borderSkipped: false,
                                                    }
                                                ]
                                            }}
                                            options={{
                                                indexAxis: 'y',
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        beginAtZero: true,
                                                        max: 20,
                                                        ticks: {
                                                            color: 'rgba(255, 255, 255, 0.7)',
                                                            font: {
                                                                size: 10
                                                            }
                                                        },
                                                        grid: {
                                                            color: 'rgba(255, 255, 255, 0.1)'
                                                        }
                                                    },
                                                    y: {
                                                        ticks: {
                                                            color: 'rgba(255, 255, 255, 0.7)',
                                                            font: {
                                                                size: 12
                                                            }
                                                        },
                                                        grid: {
                                                            display: false
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'nps' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full grid grid-cols-5 gap-3"
                        >
                            {/* GRÁFICO 1 (GRANDE - IZQUIERDA): Tendencia del NPS */}
                            <div className="col-span-3 rounded-xl p-3">
                                <h3 className="text-sm font-semibold text-white mb-2">Tendencia del NPS (Últimos 30 Días)</h3>
                                <div className="h-[calc(100%-2rem)]">
                                    <Line
                                        data={{
                                            labels: casesMetrics.npsTrend.map(item => item.date),
                                            datasets: [
                                                {
                                                    label: 'NPS Score',
                                                    data: casesMetrics.npsTrend.map(item => item.nps),
                                                    borderColor: 'rgba(34, 197, 94, 1)',
                                                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                                    borderWidth: 3,
                                                    fill: true,
                                                    tension: 0.4,
                                                    pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                                                    pointBorderColor: 'rgba(255, 255, 255, 1)',
                                                    pointBorderWidth: 2,
                                                    pointRadius: 6,
                                                    pointHoverRadius: 8
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: false
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    ticks: {
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        font: {
                                                            size: 10
                                                        }
                                                    },
                                                    grid: {
                                                        color: 'rgba(255, 255, 255, 0.1)'
                                                    }
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    max: 80,
                                                    ticks: {
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        font: {
                                                            size: 12
                                                        }
                                                    },
                                                    grid: {
                                                        color: 'rgba(255, 255, 255, 0.1)'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Columna derecha con dos gráficos apilados */}
                            <div className="col-span-2 flex flex-col gap-3 h-full">
                                {/* GRÁFICO 2 (DERECHA-ARRIBA): NPS Actual (KPI) */}
                                <div className="flex-1 rounded-xl p-3 min-h-0">
                                    <h3 className="text-sm font-semibold text-white mb-2">NPS Actual (Este Mes)</h3>
                                    <div className="h-[calc(100%-3rem)] flex flex-col items-center justify-center">
                                        <div className="text-6xl font-bold text-green-400 mb-2">
                                            +{casesMetrics.currentNps.score}
                                        </div>
                                        <div className="text-white/60 text-sm text-center">
                                            vs +{casesMetrics.currentNps.previousMonth} el mes pasado
                                        </div>
                                        <div className="flex items-center mt-2">
                                            <span className="text-green-400 text-lg">▲</span>
                                            <span className="text-green-400 text-sm ml-1">+{casesMetrics.currentNps.change}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* GRÁFICO 3 (DERECHA-ABAJO): Distribución de Clientes */}
                                <div className="flex-1 rounded-xl p-3 min-h-0">
                                    <h3 className="text-sm font-semibold text-white mb-2">Distribución de Clientes</h3>
                                    <div className="h-[calc(100%-3rem)] flex items-center justify-center">
                                        <Doughnut
                                            data={{
                                                labels: casesMetrics.customerDistribution.map(item => item.type),
                                                datasets: [
                                                    {
                                                        data: casesMetrics.customerDistribution.map(item => item.percentage),
                                                        backgroundColor: [
                                                            'rgba(34, 197, 94, 0.8)',  // Verde para Promotores
                                                            'rgba(245, 158, 11, 0.8)', // Amarillo para Pasivos
                                                            'rgba(239, 68, 68, 0.8)'   // Rojo para Detractores
                                                        ],
                                                        borderColor: [
                                                            'rgba(34, 197, 94, 1)',
                                                            'rgba(245, 158, 11, 1)',
                                                            'rgba(239, 68, 68, 1)'
                                                        ],
                                                        borderWidth: 2,
                                                        hoverOffset: 4
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                cutout: '40%',
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                        align: 'center',
                                                        labels: {
                                                            color: 'rgba(255, 255, 255, 0.9)',
                                                            font: {
                                                                size: 11
                                                            },
                                                            padding: 8,
                                                            usePointStyle: true,
                                                            boxWidth: 8,
                                                            boxHeight: 8
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="text-center mt-2">
                                        <div className="text-white/60 text-xs">
                                            {casesMetrics.totalResponses.toLocaleString()} Respuestas
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'csat' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full grid grid-cols-5 gap-3"
                        >
                            {/* GRÁFICO 1 (GRANDE - IZQUIERDA): Satisfacción por Canal */}
                            <div className="col-span-3 rounded-xl p-3">
                                <h3 className="text-sm font-semibold text-white mb-2">Satisfacción por Canal (CSAT %)</h3>
                                <div className="h-[calc(100%-2rem)]">
                                    <Bar
                                        data={{
                                            labels: casesMetrics.satisfactionByChannel.map(item => item.channel),
                                            datasets: [
                                                {
                                                    label: 'CSAT %',
                                                    data: casesMetrics.satisfactionByChannel.map(item => item.csat),
                                                    backgroundColor: [
                                                        'rgba(34, 197, 94, 0.8)',  // Verde para Chat en Vivo
                                                        'rgba(239, 68, 68, 0.8)', // Rojo para Email (área de oportunidad)
                                                        'rgba(59, 130, 246, 0.8)', // Azul para Llamada
                                                        'rgba(245, 158, 11, 0.8)'  // Amarillo para Redes Sociales
                                                    ],
                                                    borderColor: [
                                                        'rgba(34, 197, 94, 1)',
                                                        'rgba(239, 68, 68, 1)',
                                                        'rgba(59, 130, 246, 1)',
                                                        'rgba(245, 158, 11, 1)'
                                                    ],
                                                    borderWidth: 2,
                                                    borderRadius: 6,
                                                    borderSkipped: false,
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: false
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    ticks: {
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        font: {
                                                            size: 10
                                                        }
                                                    },
                                                    grid: {
                                                        color: 'rgba(255, 255, 255, 0.1)'
                                                    }
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    max: 100,
                                                    ticks: {
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        font: {
                                                            size: 12
                                                        },
                                                        callback: function(value) {
                                                            return value + '%';
                                                        }
                                                    },
                                                    grid: {
                                                        color: 'rgba(255, 255, 255, 0.1)'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Columna derecha con dos gráficos apilados */}
                            <div className="col-span-2 flex flex-col gap-3 h-full">
                                {/* GRÁFICO 2 (DERECHA-ARRIBA): CSAT General (KPI) */}
                                <div className="flex-1 rounded-xl p-3 min-h-0">
                                    <h3 className="text-sm font-semibold text-white mb-2">CSAT General (Últimos 30 días)</h3>
                                    <div className="h-[calc(100%-3rem)] flex flex-col items-center justify-center">
                                        <div className="text-6xl font-bold text-blue-400 mb-2">
                                            {casesMetrics.generalCSAT.score}%
                                        </div>
                                        <div className="text-white/60 text-sm text-center">
                                            de {casesMetrics.generalCSAT.satisfiedCustomers}
                                        </div>
                                        <div className="text-white/60 text-xs text-center mt-1">
                                            vs {casesMetrics.generalCSAT.previousMonth}% el mes pasado
                                        </div>
                                        <div className="flex items-center mt-2">
                                            <span className="text-green-400 text-lg">▲</span>
                                            <span className="text-green-400 text-sm ml-1">+{casesMetrics.generalCSAT.change}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* GRÁFICO 3 (DERECHA-ABAJO): Tópicos Frecuentes */}
                                <div className="flex-1 rounded-xl p-3 min-h-0">
                                    <h3 className="text-sm font-semibold text-white mb-2">Tópicos Frecuentes en Respuestas</h3>
                                    <div className="h-[calc(100%-3rem)] relative">
                                        {/* Palabras grandes centrales */}
                                        <div 
                                            className="absolute text-2xl font-bold text-green-400"
                                            style={{ left: '35%', top: '45%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Rápido
                                        </div>
                                        <div 
                                            className="absolute text-2xl font-bold text-green-400"
                                            style={{ left: '65%', top: '55%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Solucionado
                                        </div>

                                        {/* Palabras medianas */}
                                        <div 
                                            className="absolute text-lg font-semibold text-blue-400"
                                            style={{ left: '20%', top: '30%', transform: 'translate(-50%, -50%) rotate(90deg)' }}
                                        >
                                            Amable
                                        </div>
                                        <div 
                                            className="absolute text-lg font-semibold text-blue-400"
                                            style={{ left: '80%', top: '70%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Fácil
                                        </div>
                                        <div 
                                            className="absolute text-lg font-semibold text-blue-400"
                                            style={{ left: '50%', top: '75%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Excelente
                                        </div>

                                        {/* Palabras pequeñas positivas */}
                                        <div 
                                            className="absolute text-sm font-medium text-orange-400"
                                            style={{ left: '15%', top: '60%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Profesional
                                        </div>
                                        <div 
                                            className="absolute text-sm font-medium text-orange-400"
                                            style={{ left: '85%', top: '25%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Eficiente
                                        </div>
                                        <div 
                                            className="absolute text-sm font-medium text-orange-400"
                                            style={{ left: '75%', top: '85%', transform: 'translate(-50%, -50%) rotate(90deg)' }}
                                        >
                                            Claro
                                        </div>
                                        <div 
                                            className="absolute text-sm font-medium text-orange-400"
                                            style={{ left: '25%', top: '80%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Útil
                                        </div>

                                        {/* Palabras negativas pequeñas */}
                                        <div 
                                            className="absolute text-xs text-red-400"
                                            style={{ left: '10%', top: '45%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Espera
                                        </div>
                                        <div 
                                            className="absolute text-xs text-red-400"
                                            style={{ left: '90%', top: '45%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Confuso
                                        </div>
                                        <div 
                                            className="absolute text-xs text-red-400"
                                            style={{ left: '45%', top: '20%', transform: 'translate(-50%, -50%) rotate(90deg)' }}
                                        >
                                            Lento
                                        </div>
                                        <div 
                                            className="absolute text-xs text-red-400"
                                            style={{ left: '55%', top: '85%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Repetir
                                        </div>
                                        <div 
                                            className="absolute text-xs text-gray-400"
                                            style={{ left: '30%', top: '15%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Complicado
                                        </div>
                                        <div 
                                            className="absolute text-xs text-gray-400"
                                            style={{ left: '70%', top: '90%', transform: 'translate(-50%, -50%)' }}
                                        >
                                            Demora
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MetricasPanel;
