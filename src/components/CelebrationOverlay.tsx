import React, { useEffect, useState } from 'react';

interface CelebrationOverlayProps {
  show: boolean;
  timeSaved: number;
  onClose: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ show, timeSaved, onClose }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const suggestions = [
    "That's enough time to watch a sunset",
    "You could read 5 chapters of that book",
    "Perfect for a long coffee with a friend",
    "Time for that workout you've been planning",
    "Enough to cook a real dinner tonight",
    "You just earned a guilt-free Netflix episode",
    "That's a whole afternoon with your family",
    "Time to finally start that side project"
  ];

  const [suggestion] = useState(suggestions[Math.floor(Math.random() * suggestions.length)]);

  useEffect(() => {

    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setParticles(newParticles);
    }    

    // ===> CAMBIO 1: Se ha desactivado el cierre automático para depuración <===
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [show, onClose]);

  // ===> CAMBIO 2: Se ha desactivado la condición que oculta el componente <===
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 animate-fall"
            style={{
              left: `${particle.x}%`,
              top: `-10px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className={`w-full h-full rounded-full ${
              particle.id % 3 === 0 ? 'bg-orange-400' : 
              particle.id % 3 === 1 ? 'bg-pink-400' : 'bg-purple-400'
            }`} />
          </div>
        ))}
      </div>

      {/* Celebration Message */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        {/* ===> CAMBIO AQUÍ: Fondo del modal actualizado <=== */}
        <div className="bg-slate-950 rounded-2xl p-8 border border-white/20 text-center animate-scale-in">
          {/* ===> CAMBIO AQUÍ: Gradiente del icono actualizado <=== */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Main Message */}
          <h2 className="text-3xl font-bold text-white mb-2">
            You just bought back
          </h2>
          <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 mb-6">
            {timeSaved || 3.5} hours {/* Muestra un valor por defecto para depurar */}
          </p>
          <p className="text-lg text-white/80 mb-2">of your life</p>

          {/* Suggestion */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-orange-400 text-sm font-medium mb-1">✨ Suggestion</p>
            <p className="text-white/90">{suggestion}</p>
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-medium hover:scale-105 transition-transform"
          >
            Keep Creating Freedom
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fall {
          animation: fall linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CelebrationOverlay;

