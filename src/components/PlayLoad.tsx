import React, { useState, useRef, useEffect } from 'react';

// Estilos para las animaciones personalizadas
const animationStyles = `
  @keyframes animated-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient-flow {
    background-size: 200% 200%;
    animation: animated-gradient 15s ease infinite;
  }
  @keyframes dance {
    0%, 100% { transform: scaleY(0.2); }
    50% { transform: scaleY(1.0); }
  }
  .animate-dance {
    animation: dance 1.2s ease-in-out infinite;
  }
`;

// La lista de reproducción
const playlist = [
  { name: 'KAROL G, Manu Chao - Viajando Por El Mundo', url: 'https://res.cloudinary.com/dmyq0gr14/video/upload/v1756488962/KAROL_G_-_Viajando_Por_El_Mundo_Visualizer_ft._Manu_Chao_tzvqmg.mp3' },
  { name: 'UWAIE - Kapo', url: 'https://res.cloudinary.com/dmyq0gr14/video/upload/v1756593034/UWAIE_-_Kapo_Video_Oficial_rfgcs3.mp3' },
  { name: 'OHNANA - Kapo', url: 'https://res.cloudinary.com/dmyq0gr14/video/upload/v1756593032/OHNANA_-_Kapo_Video_Oficial_jig1wu.mp3' },
  { name: 'Beéle - frente al mar', url: 'https://res.cloudinary.com/dmyq0gr14/video/upload/v1756593029/Be%C3%A9le_-_Frente_al_Mar_Video_Oficial_umu2jj.mp3' },
  { name: 'La Bachata - MTZ Manuel Turizo', url: 'https://res.cloudinary.com/dmyq0gr14/video/upload/v1756593029/La_Bachata_-_MTZ_Manuel_Turizo_Video_Oficial_wf85we.mp3' },
];

const MusicPlayerSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.src = playlist[currentTrackIndex].url;
        audioRef.current.load();
        
        if (isPlaying) {
            audioRef.current.play().catch(error => console.error("Error playing audio:", error));
        }
    } else {
      audioRef.current = new Audio(playlist[currentTrackIndex].url);
      audioRef.current.loop = false;
    }

    const handleTrackEnd = () => playNext();
    const audioElement = audioRef.current;
    audioElement.addEventListener('ended', handleTrackEnd);

    return () => {
      audioElement.removeEventListener('ended', handleTrackEnd);
    };
  }, [currentTrackIndex]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(error => console.error("Error playing audio:", error));
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    if (!isPlaying) setIsPlaying(true);
  };

  const playPrevious = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
    if (!isPlaying) setIsPlaying(true);
  };


  return (
    <>
      <style>{animationStyles}</style>
      <section className="relative mx-auto my-16 flex h-[45vh] w-full max-w-7xl items-center justify-center text-center overflow-hidden rounded-3xl">
        {/* Capas de fondo animadas (sin cambios) */}
        <div 
          className="absolute inset-0 animate-gradient-flow"
          style={{ background: 'linear-gradient(to right, rgb(255, 133, 19), rgb(228, 113, 51), rgb(241, 100, 75), rgb(212, 87, 106), #b84378, rgb(211, 38, 127))' }}
        />
        <div 
          className="absolute inset-0 opacity-30 mix-blend-color-burn"
          style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }}
        />
        <div 
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/dmyq0gr14/image/upload/v1756495493/Dimensiones_personalizadas_ugncat.jpg)',
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply'
          }}
        />

        {/* Contenido principal (sin cambios) */}
        <div className="relative z-10 px-6 flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Encuentra tu ritmo
          </h2>
          <p className="text-white/80 text-md sm:text-lg font-light mt-2 mb-8 max-w-lg mx-auto">
            Tómate un momento. Dale play y deja que la inspiración fluya a través de ti.
          </p>

          {/* ================================================================ */}
          {/* ==========> 1. CONTENEDOR PRINCIPAL DEL REPRODUCTOR (COLUMNA) <========== */}
          {/* ================================================================ */}
          <div className="flex flex-col items-center">
            
            {/* Fila 1: Visualizadores y Controles */}
            <div className="flex items-center gap-4">
              
              {/* Visualizador Izquierdo */}
              <div className="flex items-center justify-center gap-1 h-12 w-12">
                {[0.4, 0.7, 0.5].map((h, i) => (
                  <div key={i} className={`w-1.5 bg-white/30 rounded-full ${isPlaying ? 'animate-dance' : 'scale-y-[0.2]'}`}
                    style={{ height: `${h * 2.5}rem`, animationDelay: `${i * 0.15}s`, transition: 'transform 0.3s ease' }}
                  ></div>
                ))}
              </div>

              {/* Controles de Navegación */}
              <div className="flex items-center gap-4">
                <button
                  onClick={playPrevious}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white/70 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="relative">
                  <button onClick={togglePlayPause} className={`relative flex h-16 w-16 items-center justify-center rounded-full text-white border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110 focus:outline-none ${!isPlaying ? 'animate-pulse' : ''}`}>
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" /></svg>
                    ) : (
                      <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.018 14.385A1.5 1.5 0 012.5 13.132V6.868a1.5 1.5 0 012.482-1.283l6.088 3.132a1.5 1.5 0 010 2.566l-6.088 3.132z" /></svg>
                    )}
                  </button>
                  {!isPlaying && (<div className="absolute -inset-1 rounded-full bg-white/10 animate-ping pointer-events-none" />)}
                </div>
                <button onClick={playNext} className="flex h-12 w-12 items-center justify-center rounded-full text-white/70 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white focus:outline-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Visualizador Derecho (para simetría) */}
              <div className="flex items-center justify-center gap-1 h-12 w-12">
                {[0.5, 0.8, 0.3].map((h, i) => (
                  <div key={i} className={`w-1.5 bg-white/30 rounded-full ${isPlaying ? 'animate-dance' : 'scale-y-[0.2]'}`}
                    style={{ height: `${h * 2.5}rem`, animationDelay: `${(i + 2) * 0.15}s`, transition: 'transform 0.3s ease' }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Fila 2: Nombre de la canción */}
            <div className={`transition-opacity duration-500 ease-in-out mt-4 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              <div className="bg-black/20 backdrop-blur-md rounded-full px-5 py-2">
                <p className="text-white text-xs font-semibold whitespace-nowrap">{playlist[currentTrackIndex].name}</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default MusicPlayerSection;

