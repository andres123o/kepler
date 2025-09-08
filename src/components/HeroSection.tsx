import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  // Estados para el modal y el formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. ESTADO Y REFERENCIAS PARA EL AUDIO
  // 'isPlaying' nos dice si la música está sonando o no
  const [isPlaying, setIsPlaying] = useState(false);
  // 'audioRef' nos da una referencia directa al elemento de audio para controlarlo
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/agent'); // <-- La ruta a la que quieres navegar
  };

  // La URL de tu audio
  const audioUrl = "https://res.cloudinary.com/dmyq0gr14/video/upload/v1756488962/KAROL_G_-_Viajando_Por_El_Mundo_Visualizer_ft._Manu_Chao_tzvqmg.mp3";

  // Usamos useEffect para inicializar el audio de forma segura una sola vez
  useEffect(() => {
    // Creamos la instancia del audio y la guardamos en la referencia
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true; // Para que la canción se repita

    // Función de limpieza: se ejecuta cuando el componente se "desmonta"
    // Esto es importante para evitar que la música siga sonando si el usuario cambia de página
    return () => {
      audioRef.current?.pause();
    };
  }, []); 

  // --- NUEVA FUNCIÓN PARA MANEJAR EL CLIC EN "START CREATING" ---
  const handleStartCreatingClick = () => {
    // 1. Revisa si ya existen datos del usuario en el localStorage.
    const userData = localStorage.getItem('userData');

    // 2. Si existen, navega directamente a la página del agente.
    if (userData) {
      navigate('/agent');
    } else {
      // 3. Si no existen, abre el modal para iniciar sesión.
      setIsModalOpen(true);
    }
  };

  // Función para manejar el envío del formulario del modal
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


  // 2. FUNCIÓN PARA CONTROLAR PLAY/PAUSE
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    // Invertimos el estado actual
    setIsPlaying(!isPlaying);
  };

  return (
    <>  
      <section className="relative mx-auto mt-28 mb-8 flex h-[70vh] w-[100vw] max-w-7xl items-center justify-center text-center overflow-hidden rounded-3xl">
        {/* Gradientes y capas de fondo (tu código original) */}
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

        {/* ================================================================ */}
        {/* ==========> 3. REPRODUCTOR DE AUDIO EN LA ESQUINA <========== */}
        {/* ================================================================ */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          {/* Etiqueta con el nombre de la canción */}
          <div 
            className={`
              transition-all duration-500 ease-in-out
              ${isPlaying ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}
              overflow-hidden
            `}
          >
            <div className="bg-black/20 backdrop-blur-md rounded-full px-4 py-2">
              <p className="text-white text-xs font-semibold whitespace-nowrap">
                KAROL G, Manu Chao - Viajando Por El Mundo
              </p>
            </div>
          </div>

          {/* Botón de Play/Pause */}
          <button
            onClick={togglePlayPause}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110 focus:outline-none ${!isPlaying ? 'animate-bounce-subtle' : ''}`}
          >
            {isPlaying ? (
              // Icono de Pausa
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
              </svg>
            ) : (
              // Icono de Play
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 4.31A1 1 0 018 5.14v9.72a1 1 0 01-1.7.71l-5-4.86a1 1 0 010-1.42l5-4.86z" transform="translate(4,0)" />
              </svg>
            )}
          </button>
          {!isPlaying && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none" />
          )}
        </div>

        {/* Contenido principal (tu código original) */}
        <div className="relative z-10 px-6">
          <h1 className="text-[48px] sm:text-[64px] md:text-[80px] font-bold tracking-tight text-white">
            Crea con IA
          </h1>
          <p className="text-white/95 text-[16px] sm:text-[18px] md:text-[20px] font-light mb-10 max-w-2xl mx-auto">
            Reemplacemos el miedo a usar la IA con el miedo a no vivir.
          </p>
          
          <div className="relative z-10 px-6">
            <div className="flex justify-center">
              <button onClick={handleStartCreatingClick} className="relative inline-flex items-center justify-center h-14 px-8 rounded-full text-slate-900 font-semibold uppercase bg-white/95 hover:bg-white transition-all duration-300 hover:scale-105">
                <span className="mr-2">Empieza a crear</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Modal */}
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} isLoading={isLoading} error={error} />}
    </>
  );
};

// Componente del Modal con el nuevo fondo interno
const LoginModal = ({ onClose, onSubmit, isLoading, error }: { onClose: () => void, onSubmit: (data: any) => void, isLoading: boolean, error: string }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [work, setWork] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, work });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-[fade-in_300ms_ease-out]">
      {/* PASO 1: 
        - Agregamos 'overflow-hidden' para que el fondo respete los bordes redondeados.
        - Quitamos 'bg-black/20' porque ya no es necesario.
      */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 shadow-2xl m-4 animate-[slide-up-fade_400ms_ease-out] overflow-hidden">
        
        {/* PASO 2: 
          - Pegamos aquí las 4 capas de fondo del HeroSection.
          - Estas capas se posicionarán correctamente dentro del modal.
        */}
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

        {/* PASO 3: 
          - Envolvemos todo el contenido en un div con 'relative' y 'z-10'.
          - Esto asegura que el formulario y los botones queden por ENCIMA del nuevo fondo.
        */}
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