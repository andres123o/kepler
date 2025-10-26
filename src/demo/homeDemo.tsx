import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CasesPanel from './panelCases';
// import FormulariosPanel from './formularios'; // Deshabilitado temporalmente
import MetricasPanel from './metricas_simple';

// --- ICONOS ---
// Estos componentes SVG son para los iconos de la interfaz.
const CaseIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
// const FormIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>; // Deshabilitado temporalmente
const MetricsIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const SoonIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

const HomeDemo: React.FC = () => {
    const [showDashboard, setShowDashboard] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activePanel, setActivePanel] = useState<'casos' | 'metricas'>('casos');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const audioUrl = "https://res.cloudinary.com/dmyq0gr14/video/upload/v1756488962/KAROL_G_-_Viajando_Por_El_Mundo_Visualizer_ft._Manu_Chao_tzvqmg.mp3";

    useEffect(() => {
        // Inicializa el audio
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true;

        // Temporizador para la animación principal
        const timer = setTimeout(() => {
            setShowDashboard(true);
        }, 4000); // Duración del título en pantalla

        return () => {
            clearTimeout(timer);
            audioRef.current?.pause();
        };
    }, []);

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
    const userInitial = userData?.name.charAt(0).toUpperCase() || 'A';

    const handleAvatarClick = () => {
        const incident = {
            ticket_number: "CO-01420",
            cx_agent: "Alejandra",
            priority: "Alto",
            customer_name: "Andrés Cristancho",
            customer_email: "andres@gmail.com",
            country: "COL",
            report_description: "El usuario no logra ver el botón de transferir sus ahorros a su cuenta de banco.",
            status: "En progreso",
            channel: "WhatsApp",
            incident_type: "Falla in-app"
        };
        
        if ((window as any).handleVoiceAgentWebhook) {
            (window as any).handleVoiceAgentWebhook(incident);
        }
    };

    return (
        <div className="h-screen w-full text-white flex overflow-hidden">
            <AnimatePresence>
                {!showDashboard && (
                    <motion.div
                        key="title"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 1, ease: 'easeOut' } }}
                        exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.7, ease: 'easeInOut' } }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] text-center">
                            <span className="animate-gradient-text">Menos caos en CX,</span><br />
                            <span className="text-white/60">más foco en estrategia.</span>
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDashboard && (
                    <>
                        {/* --- BARRA LATERAL FLOTANTE (SIN FONDO) --- */}
                        <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                            className="w-64 flex-shrink-0 p-6 flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-12">
                                <img src="https://res.cloudinary.com/dmyq0gr14/image/upload/v1756477610/bdb7e186-ae74-4f96-b8cc-87899e487a38-removebg-preview_fsurl6.png" alt="Kepler Logo" className="h-5 w-auto" />
                                <span className="text-2xl font-light tracking-widest">Kepler</span>
                            </div>
                            <nav className="flex flex-col gap-2">
                                <button 
                                    onClick={() => setActivePanel('casos')}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-semibold ${
                                        activePanel === 'casos' 
                                            ? 'text-white/80 bg-white/5 hover:bg-white/10 hover:text-white' 
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <CaseIcon /> Casos Escalados
                                </button>
                                {/* Botón de formularios deshabilitado temporalmente */}
                                {/* <button 
                                    onClick={() => setActivePanel('formularios')}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                        activePanel === 'formularios' 
                                            ? 'text-white/80 bg-white/5 hover:bg-white/10 hover:text-white font-semibold' 
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <FormIcon /> Formularios
                                </button> */}
                                <button 
                                    onClick={() => setActivePanel('metricas')}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                        activePanel === 'metricas' 
                                            ? 'text-white/80 bg-white/5 hover:bg-white/10 hover:text-white font-semibold' 
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <MetricsIcon /> Métricas
                                </button>
                                <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/40 cursor-not-allowed hover:bg-white/5 hover:text-white/60 transition-colors"><SoonIcon /> Próximamente</a>
                            </nav>
                            <div className="mt-auto">
                                <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                                    <h4 className="text-sm font-semibold mb-1">¿Necesitas ayuda?</h4>
                                    <p className="text-xs text-white/50 mb-3">Nuestro equipo de soporte está 24/7 para ti.</p>
                                    <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white text-xs font-bold py-2 rounded-md transition-opacity">Contactar</button>
                                </div>
                            </div>
                        </motion.div>

                        {/* --- CONTENIDO PRINCIPAL --- */}
                        <motion.main
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: 'easeInOut' }}
                            className="flex-grow pt-8 pr-8 pb-8 h-screen overflow-hidden"
                        >
                            <header className="flex items-center justify-between pl-8">
                                {/* Módulo de música */}
                                <div className="flex items-center gap-3 relative z-50">
                                    <button
                                        onClick={togglePlayPause}
                                        className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-full text-white border-2 border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110 focus:outline-none`}
                                    >
                                        {!isPlaying && (
                                            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none" />
                                        )}
                                        {isPlaying ? (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 5.5v11a1.5 1.5 0 002.482 1.12l8-5.5a1.5 1.5 0 000-2.24l-8-5.5A1.5 1.5 0 007 5.5z" /></svg>
                                        )}
                                    </button>
                                    <div className={`relative z-50 transition-all duration-500 ease-in-out ${isPlaying ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'} overflow-hidden`}>
                                        <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                            <p className="text-white/80 text-xs font-semibold whitespace-nowrap">KAROL G, Manu Chao - Viajando Por El Mundo</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Perfil de usuario */}
                                <div className="flex items-center gap-4">
                                    <button className="text-white/60 hover:text-white transition-colors">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    </button>
                                    <button 
                                        onClick={handleAvatarClick}
                                        className="w-9 h-9 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm border-2 border-slate-950"
                                    >
                                        {userInitial}
                                    </button>
                                </div>
                            </header>

                            {/* --- CONTENIDO DEL MÓDULO (INICIA ALINEADO CON EL PRIMER BOTÓN) --- */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ delay: 0.7, duration: 0.5 }} 
                                className="mt-[30px] rounded-2xl h-[calc(100%-63px)] overflow-hidden"
                            >
                                <AnimatePresence mode="wait">
                                    {activePanel === 'casos' && (
                                        <motion.div
                                            key="casos"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="w-full h-full"
                                        >
                                            <CasesPanel />
                                        </motion.div>
                                    )}
                                    {/* Panel de formularios deshabilitado temporalmente */}
                                    {/* {activePanel === 'formularios' && (
                                        <motion.div
                                            key="formularios"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="w-full h-full"
                                        >
                                            <FormulariosPanel />
                                        </motion.div>
                                    )} */}
                                    {activePanel === 'metricas' && (
                                        <motion.div
                                            key="metricas"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="w-full h-full"
                                        >
                                            <MetricasPanel />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.main>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomeDemo;