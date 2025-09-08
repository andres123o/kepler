import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  // Nuevo estado para controlar la visibilidad del panel de feedback
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para abrir/cerrar el panel de feedback
  const toggleFeedbackPanel = () => {
    setIsFeedbackOpen(!isFeedbackOpen);
  };

  return (
    <header className={`fixed top-4 left-0 right-0 z-50 px-6 transition-all duration-300 ${className}`}>
      <div className="relative max-w-7xl mx-auto">
        {/* Contenedor principal del header */}
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled || isFeedbackOpen
            ? 'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg'
            : 'bg-transparent'
        }`}>
          {/* Logo y Nombre del Proyecto */}
          <a href="/" className="flex items-center px-4 py-2">
            <img
              src="https://res.cloudinary.com/dmyq0gr14/image/upload/v1756477610/bdb7e186-ae74-4f96-b8cc-87899e487a38-removebg-preview_fsurl6.png"
              alt="Kepler Logo"
              className="h-4 w-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-300 transform scale-200"
            />
            <span className="ml-4 text-2xl font-light text-white tracking-widest">
              Kepler
            </span>
          </a>

          {/* Botón de Feedback */}
          <div className="flex items-center gap-6 px-4 py-2">
            <button
              onClick={toggleFeedbackPanel}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-300 text-sm font-medium"
            >
              Feedback
            </button>
          </div>
        </div>

        {/* Panel de Feedback Desplegable */}
        <FeedbackPanel isOpen={isFeedbackOpen} />
      </div>
    </header>
  );
};

// Componente para el panel de feedback
const FeedbackPanel: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || 'null');
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsLoading(true);
    setMessage('');
    const WEBHOOK_URL = 'https://primary-production-a44da.up.railway.app/webhook/6d46822f-5cab-4cd8-9245-0395d82f7358';

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, feedback }),
      });

      if (!response.ok) throw new Error('No se pudo enviar el feedback.');
      
      setMessage('¡Feedback enviado correctamente! Gracias.');
      setFeedback('');
      setTimeout(() => setMessage(''), 3000); // Limpia el mensaje después de 3s

    } catch (error) {
      setMessage('Se ha producido un error. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute left-0 right-0 top-full mt-2 overflow-hidden transition-all duration-500 ease-in-out"
      style={{ maxHeight: isOpen ? `${panelRef.current?.scrollHeight}px` : '0px' }}
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6">
        {userData ? (
          <form onSubmit={handleSubmit}>
            <h3 className="text-white font-semibold text-center mb-4">Comparte tus opiniones con nosotros.</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={`Hola ${userData.name}, ¿en qué estás pensando?`}
              className="w-full h-24 bg-white/5 p-3 rounded-lg text-white placeholder-white/40 border-2 border-transparent focus:outline-none focus:border-white/30 transition duration-300 resize-none"
              required
            />
            <div className="flex items-center justify-between mt-4">
               <p className="text-sm text-green-400 h-4">{message}</p>
               <button type="submit" disabled={isLoading} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-wait">
                {isLoading ? 'Enviando...' : 'Enviar comentarios'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-white/70 text-center text-sm">
            Inicie sesión primero para enviar sus comentarios.
          </p>
        )}
      </div>
    </div>
  );
};

export default Header;
