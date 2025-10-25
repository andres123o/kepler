import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const navigate = useNavigate();

  const audioUrl = "https://res.cloudinary.com/dmyq0gr14/video/upload/v1756488962/KAROL_G_-_Viajando_Por_El_Mundo_Visualizer_ft._Manu_Chao_tzvqmg.mp3";

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true;

    return () => {
      audioRef.current?.pause();
    };
  }, []); 

  // Animación automática de paneles
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPanel((prev) => (prev + 1) % 3);
    }, 10000); // Cambia cada 6 segundos

    return () => clearInterval(interval);
  }, []);

  const handleStartCreatingClick = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      navigate('/agent');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleFormSubmit = async (formData: { name: string, email: string, work: string }) => {
    setError('');
    const { name, email, work } = formData;

    if (!name || !email || !work) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true);
    const WEBHOOK_URL = 'https://primary-production-a44da.up.railway.app/webhook/f3ef75f3-1780-4b55-b39f-dfde6b84f6ab';

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.');
      }

      localStorage.setItem('userData', JSON.stringify(formData));
      navigate('/agent');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>  
      <section className="relative mx-auto mt-20 mb-8 flex h-[80vh] w-[100vw] max-w-7xl overflow-hidden rounded-3xl">
        
        {/* REPRODUCTOR DE AUDIO
        <div className="absolute bottom-8 left-8 z-20 flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-white border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus:outline-none"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 4.31A1 1 0 018 5.14v9.72a1 1 0 01-1.7.71l-5-4.86a1 1 0 010-1.42l5-4.86z" transform="translate(4,0)" />
              </svg>
            )}
          </button>

          <div 
            className={`
              transition-all duration-500 ease-in-out
              ${isPlaying ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}
              overflow-hidden
            `}
          >
            <div className="bg-white/5 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
              <p className="text-white/70 text-xs font-medium whitespace-nowrap">
                Viajando Por El Mundo
              </p>
            </div>
          </div>
        </div> */}

        {/* LAYOUT DE DOS COLUMNAS */}
        <div className="relative z-10 w-full h-full flex items-center">
           
          {/* COLUMNA IZQUIERDA - PANELES ANIMADOS */}
          <div className="w-1/2 h-full flex items-center justify-center px-12">
            <div className="relative w-full max-w-2xl h-[550px]">
              
              
              {/* PANEL 1 - DASHBOARD DE CASOS */}
              <div 
                className={`absolute inset-0 transition-all duration-700 ${
                  currentPanel === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div 
                  className="relative border border-white/20 rounded-3xl p-8 h-full overflow-hidden"
                >
                  {/* Gradientes y capas de fondo */}
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-30 mix-blend-color-burn"
                    style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='posterize'%3E%3CfeGaussianBlur stdDeviation='0.5'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23posterize)' fill='%23fff' opacity='0.1'/%3E%3C/svg%3E")`, mixBlendMode: 'overlay' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{ 
                      backgroundImage: 'url(https://res.cloudinary.com/dmyq0gr14/image/upload/f_auto,q_auto,w_1920,c_fill/v1756495637/ilustracion-de-hawai-en-estilo-comico-retro_bg0093.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      mixBlendMode: 'multiply'
                    }}
                  />
                  
                  {/* Contenido del panel */}
                  <div className="relative z-10 h-full">
                    {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                        <span className="text-white font-bold text-sm">K</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">Panel de Casos</div>
                        <div className="text-white/60 text-xs">Vista general de tickets</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats compactos */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
                      <div className="text-white/70 text-xs mb-0.5">Total</div>
                      <div className="text-white text-lg font-bold">247</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
                      <div className="text-white/70 text-xs mb-0.5">Activos</div>
                      <div className="text-white text-lg font-bold">183</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
                      <div className="text-white/70 text-xs mb-0.5">Alta</div>
                      <div className="text-white text-lg font-bold">24</div>
                    </div>
                  </div>

                  {/* Tabla de prioridades */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 mb-3">
                    <div className="text-white text-xs font-semibold mb-2">Distribución por Prioridad</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <span className="text-white/80 text-xs">Alta</span>
                        </div>
                        <span className="text-white text-xs font-medium">24 casos</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <span className="text-white/80 text-xs">Media</span>
                        </div>
                        <span className="text-white text-xs font-medium">89 casos</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-white/80 text-xs">Baja</span>
                        </div>
                        <span className="text-white text-xs font-medium">70 casos</span>
                      </div>
                    </div>
                  </div>

                  {/* Tickets recientes */}
                  <div className="space-y-1.5">
                    <div className="text-white/70 text-xs font-semibold mb-1.5">Últimos Tickets</div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs font-medium">Problema con facturación</span>
                        <span className="text-xs text-white bg-white/20 px-2 py-0.5 rounded-full">Alta</span>
                      </div>
                      <div className="text-white/50 text-[10px]">Cliente: María González • Hace 2h</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs font-medium">Consulta sobre integración</span>
                        <span className="text-xs text-white bg-white/20 px-2 py-0.5 rounded-full">Media</span>
                      </div>
                      <div className="text-white/50 text-[10px]">Cliente: Tech Corp SAS • Hace 4h</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs font-medium">Feedback producto</span>
                        <span className="text-xs text-white bg-white/20 px-2 py-0.5 rounded-full">Baja</span>
                      </div>
                      <div className="text-white/50 text-[10px]">Cliente: Startup XYZ • Hace 6h</div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* PANEL 2 - GENERADOR DE FORMULARIOS CON IA */}
              {/* PANEL 2 - GENERADOR DE FORMULARIOS CON IA */}
              <div 
                className={`absolute inset-0 transition-all duration-700 ${
                  currentPanel === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div 
                  className="relative border border-white/20 rounded-3xl p-8 h-full overflow-hidden"
                >
                  {/* Gradientes y capas de fondo */}
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-30 mix-blend-color-burn"
                    style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='posterize'%3E%3CfeGaussianBlur stdDeviation='0.5'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23posterize)' fill='%23fff' opacity='0.1'/%3E%3C/svg%3E")`, mixBlendMode: 'overlay' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{ 
                      backgroundImage: 'url(https://res.cloudinary.com/dmyq0gr14/image/upload/f_auto,q_auto,w_1920,c_fill/v1756495637/ilustracion-de-hawai-en-estilo-comico-retro_bg0093.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      mixBlendMode: 'multiply'
                    }}
                  />
                  
                  {/* Contenido del panel */}
                  <div className="relative z-10 h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">Generador IA</div>
                          <div className="text-white/60 text-xs">Crea formularios al instante</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                      </div>
                    </div>

                    {/* Input de prompt */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 mb-5">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-white/70 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-white text-xs mb-1 font-medium">Prompt:</div>
                          <div className="text-white/80 text-xs">"Formulario de incidentes técnicos"</div>
                        </div>
                      </div>
                    </div>

                    {/* CAMBIO DE UI/UX: Contenedor para escalar la vista previa */}
                    <div className="">
                      {/* Formulario generado - Estilo Typeform */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-white text-xs font-semibold">Vista Previa del Formulario</span>
                          <span className="text-green-300 text-xs flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Generado
                          </span>
                        </div>
                        
                        {/* Pregunta estilo Typeform */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                          {/* Número de pregunta y flecha */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-400 text-lg font-bold">1</span>
                              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="text-white text-base font-medium mb-4">¿En qué país ocurrió el incidente?</div>
                              
                              {/* CAMBIO DE UI/UX: Opciones más pequeñas */}
                              <div className="space-y-2">
                                <div className="group bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 rounded-lg p-2 transition-all cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded border-2 border-white/40 flex items-center justify-center text-white text-[10px] font-bold group-hover:border-white/60 transition-all">
                                      A
                                    </div>
                                    <span className="text-white text-xs">Colombia</span>
                                  </div>
                                </div>
                                
                                <div className="group bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 rounded-lg p-2 transition-all cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded border-2 border-white/40 flex items-center justify-center text-white text-[10px] font-bold group-hover:border-white/60 transition-all">
                                      B
                                    </div>
                                    <span className="text-white text-xs">Perú</span>
                                  </div>
                                </div>
                                
                                <div className="group bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-white/40 rounded-lg p-2 transition-all cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded border-2 border-white/40 flex items-center justify-center text-white text-[10px] font-bold group-hover:border-white/60 transition-all">
                                      C
                                    </div>
                                    <span className="text-white text-xs">Chile</span>
                                  </div>
                                </div>
                              </div>

                              {/* CAMBIO DE UI/UX: Botón OK más pequeño y con nuevo color */}
                              <div className="mt-4 flex justify-end">
                                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all">
                                  OK
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL 3 - DASHBOARD DE MÉTRICAS */}
              <div 
                className={`absolute inset-0 transition-all duration-700 ${
                  currentPanel === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div 
                  className="relative border border-white/20 rounded-3xl p-8 h-full overflow-hidden"
                >
                  {/* Gradientes y capas de fondo */}
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-30 mix-blend-color-burn"
                    style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='posterize'%3E%3CfeGaussianBlur stdDeviation='0.5'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23posterize)' fill='%23fff' opacity='0.1'/%3E%3C/svg%3E")`, mixBlendMode: 'overlay' }}
                  />
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{ 
                      backgroundImage: 'url(https://res.cloudinary.com/dmyq0gr14/image/upload/f_auto,q_auto,w_1920,c_fill/v1756495637/ilustracion-de-hawai-en-estilo-comico-retro_bg0093.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      mixBlendMode: 'multiply'
                    }}
                  />
                  
                  {/* Contenido del panel */}
                  <div className="relative z-10 h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">Analytics CX</div>
                        <div className="text-white/60 text-xs">Métricas en tiempo real</div>
                      </div>
                    </div>
                  </div>

                  {/* KPIs principales */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <div className="text-white/70 text-xs mb-1">NPS Score</div>
                      <div className="text-white text-3xl font-bold mb-1">8.4</div>
                      <div className="text-green-300 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        +0.3 este mes
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <div className="text-white/70 text-xs mb-1">CSAT</div>
                      <div className="text-white text-3xl font-bold mb-1">92%</div>
                      <div className="text-green-300 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        +5% vs anterior
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de línea para tickets */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-4">
                    <div className="text-white text-xs font-semibold mb-4">Tickets por Día (Últimos 7 días)</div>
                    <div className="relative h-24">
                      {/* Línea de gráfico SVG */}
                      <svg className="w-full h-full" viewBox="0 0 200 80">
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
                          </linearGradient>
                        </defs>
                        {/* Línea principal */}
                        <path 
                          d="M10,60 Q30,45 50,50 T90,35 T130,40 T170,25" 
                          stroke="url(#lineGradient)" 
                          strokeWidth="2" 
                          fill="none"
                        />
                        {/* Puntos de datos */}
                        <circle cx="10" cy="60" r="2" fill="white" />
                        <circle cx="30" cy="45" r="2" fill="white" />
                        <circle cx="50" cy="50" r="2" fill="white" />
                        <circle cx="70" cy="35" r="2" fill="white" />
                        <circle cx="90" cy="35" r="2" fill="white" />
                        <circle cx="130" cy="40" r="2" fill="white" />
                        <circle cx="170" cy="25" r="2" fill="white" />
                      </svg>
                      {/* Labels de días */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-white/60 text-[10px]">
                        <span>Lun</span>
                        <span>Mar</span>
                        <span>Mié</span>
                        <span>Jue</span>
                        <span>Vie</span>
                        <span>Sáb</span>
                        <span>Dom</span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas adicionales */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <div className="text-white/70 text-[10px] mb-1">Tiempo Resp.</div>
                      <div className="text-white text-lg font-bold">2.4h</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <div className="text-white/70 text-[10px] mb-1">Resueltos</div>
                      <div className="text-white text-lg font-bold">89%</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <div className="text-white/70 text-[10px] mb-1">Reabiert.</div>
                      <div className="text-white text-lg font-bold">3%</div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - LA PROMESA */}
          <div className="w-1/2 h-full flex items-center justify-start px-16">
            <div className="max-w-xl">
              <h1 className="text-6xl font-bold tracking-tight text-white mb-4 leading-[1.1]">
                Unifica tu CX.
                <br />
                <span className="text-white/60">Simplifica tu flow.</span>
              </h1>

              <p className="text-white/50 text-lg font-light mb-10 leading-relaxed max-w-md">
                Centraliza 5+ herramientas en una sola plataforma. 
                Tu equipo enfocado en lo que importa.
              </p>
               
              <button 
                onClick={handleStartCreatingClick}
                className="group relative inline-flex items-center justify-center h-12 px-8 rounded-full text-white font-medium bg-white/10 border border-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:scale-[1.02] focus:outline-none"
              >
                <span className="mr-2">Solicita una demo</span>
                <svg 
                  className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
 
              {/* ==========> INICIO: Nueva Sección de Música <========== */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-white/40 text-sm font-light mb-4 max-w-xs">
                  Prueba nuestra demo y descubre cómo suenan tus días sin caos operativo.
                </p>
                <div className="flex items-center gap-3">
                  {/* Botón de Play/Pause */}
                  <button
                    onClick={togglePlayPause} // Asume que tienes una función togglePlayPause en tu componente
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full text-white border-2 border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110 focus:outline-none`}
                  >
                    {/* Animación de "Ping" que se muestra solo cuando está en pausa */}
                    {!isPlaying && (
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none" />
                    )}
                    
                    {isPlaying ? ( // Asume que tienes un estado isPlaying
                      // Icono de Pausa
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
                      </svg>
                    ) : (
                      // Icono de Play (CORREGIDO: apunta a la derecha)
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 5.5v11a1.5 1.5 0 002.482 1.12l8-5.5a1.5 1.5 0 000-2.24l-8-5.5A1.5 1.5 0 007 5.5z" />
                      </svg>
                    )}
                  </button>

                  {/* Etiqueta con el nombre de la canción (a la derecha) */}
                  <div 
                    className={`
                      transition-all duration-500 ease-in-out
                      ${isPlaying ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}
                      overflow-hidden
                    `}
                  >
                    {/* CORREGIDO: Estilo de fondo consistente con el botón "Solicita una demo" */}
                    <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <p className="text-white/80 text-xs font-semibold whitespace-nowrap">
                        KAROL G, Manu Chao - Viajando Por El Mundo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* ==========> FIN: Nueva Sección de Música <========== */}

            </div>
          </div>

        </div>
      </section>

      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} isLoading={isLoading} error={error} />}
    </>
  );
};

const LoginModal = ({ onClose, onSubmit, isLoading, error }: { onClose: () => void, onSubmit: (data: any) => void, isLoading: boolean, error: string }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [work, setWork] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, work });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 shadow-2xl m-4 overflow-hidden">
        
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }}
        />
        <div 
          className="absolute inset-0 opacity-30 mix-blend-color-burn"
          style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }}
        />
        <div 
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='posterize'%3E%3CfeGaussianBlur stdDeviation='0.5'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23posterize)' fill='%23fff' opacity='0.1'/%3E%3C/svg%3E")`, mixBlendMode: 'overlay' }}
        />
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            backgroundImage: 'url(https://res.cloudinary.com/dmyq0gr14/image/upload/v1756505436/escena-de-verano-del-estilo-de-vida-de-los-dibujos-animados_we0fan.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'multiply'
          }}
        />

        <div className="relative z-10 p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white text-3xl font-light">&times;</button>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Start your journey</h2>
            <p className="text-white/60 text-sm">Let's create something amazing together.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 px-5 py-3 rounded-full text-white placeholder-white/40 border-2 border-transparent focus:outline-none focus:border-white/30 transition duration-300" required />
            <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 px-5 py-3 rounded-full text-white placeholder-white/40 border-2 border-transparent focus:outline-none focus:border-white/30 transition duration-300" required />
            <input type="text" placeholder="Where you work" value={work} onChange={(e) => setWork(e.target.value)} className="w-full bg-white/5 px-5 py-3 rounded-full text-white placeholder-white/40 border-2 border-transparent focus:outline-none focus:border-white/30 transition duration-300" required />
            <button type="submit" disabled={isLoading} className="w-full h-14 px-8 rounded-full text-slate-900 font-semibold uppercase bg-white/95 hover:bg-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center">
              {isLoading ? 'Submitting...' : 'Continue'}
            </button>
            {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;