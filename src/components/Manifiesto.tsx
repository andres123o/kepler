import React, { useEffect, useState, useRef } from 'react';

// El componente CardBackground se mantiene igual
const CardBackground: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  return (
    <>
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
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply'
        }}
      />
    </>
  );
};

// Componente de Tarjeta con la nueva lógica de animación por tiempo
const ManifestoCard: React.FC<{ item: any }> = ({ item }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Cuando la tarjeta es visible, activa un temporizador de 3 segundos
          const timer = setTimeout(() => {
            setIsRevealed(true);
          }, 4000); // 3 segundos de retraso
          
          observer.unobserve(entry.target); // Dejar de observar para que no se repita

          // Limpieza del temporizador si el componente se desmonta
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div ref={cardRef}>
      {/* CORREGIDO: Eliminados los efectos hover:shadow y hover:-translate-y */}
      <div className="relative rounded-2xl p-8 border border-white/10 transition-all duration-500 overflow-hidden">
        <CardBackground imageUrl={item.imageUrl} />
        <div className="relative z-10">
          <div className="text-4xl md:text-5xl font-light text-white/90 mb-2">
            {item.number}
          </div>
          <div className="relative h-6 overflow-hidden">
            {/* Texto normal */}
            <p className={`absolute inset-0 text-white transition-transform duration-700 ease-out ${isRevealed ? '-translate-y-full' : 'translate-y-0'}`}>
              {item.label}
            </p>
            {/* Texto que se revela con el temporizador */}
            <p className={`absolute inset-0 text-white transition-transform duration-700 ease-out ${isRevealed ? 'translate-y-0' : 'translate-y-full'}`}>
              {item.truth}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManifestoSection: React.FC = () => {
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  // TEXTOS REFINADOS: Título principal más emotivo
  const fullText = "El tiempo es la única moneda que importa.";
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTitleVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    const element = document.getElementById('manifesto-wrapper');
    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  useEffect(() => {
    if (isTitleVisible && typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isTitleVisible, typedText]);

  // TEXTOS REFINADOS: Datos de las tarjetas más genuinos
  const cardData = [
    { 
      number: "+5", 
      label: "Tools en tu stack",
      truth: "Ventanas abiertas",
      imageUrl: "https://res.cloudinary.com/dmyq0gr14/image/upload/v1756505290/ilustracion-de-hawai-en-estilo-comico-retro_1_bbrnqq.jpg"
    },
    { 
      number: "+500", 
      label: "Horas en tareas manuales",
      truth: "Donde mueren las grandes ideas.",
      imageUrl: "https://res.cloudinary.com/dmyq0gr14/image/upload/v1756495493/Dimensiones_personalizadas_ugncat.jpg"
    },
    { 
      number: "∞", 
      label: "Procesos y tareas repetitivas",
      truth: "Potencial de tu equipo evaporado",
      imageUrl: "https://res.cloudinary.com/dmyq0gr14/image/upload/v1756505436/escena-de-verano-del-estilo-de-vida-de-los-dibujos-animados_we0fan.jpg"
    }
  ];

  return (
    <div id="manifesto-wrapper" className="relative w-full min-h-screen">
      <div className="relative w-full h-[200px] md:h-[240px] flex items-center justify-center px-6">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-thin text-white text-center">
          <span className="inline-block">
            {typedText}
            <span className={`inline-block w-1 h-12 md:h-16 bg-white ml-1 ${typedText.length === fullText.length ? 'animate-blink' : ''}`} />
          </span>
        </h2>
      </div>

      <section id="manifesto-section" className="relative w-full flex items-start justify-center px-6">
        <div className="relative z-10 w-[70%] mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
            {cardData.map((item, index) => (
              <ManifestoCard key={index} item={item} />
            ))}
          </div>

          {/* TEXTOS REFINADOS: El manifiesto */}
          <div className={`space-y-4 mb-20 ${isTitleVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <p className="text-lg md:text-xl text-gray-400 font-light">
              Creamos esto porque
            </p>
            <p className="text-xl md:text-3xl text-white font-light">
              el verdadero trabajo no es gestionar el caos.
            </p>
            <p className="text-2xl md:text-4xl font-light">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
              Es crear las condiciones para que la magia ocurra.
              </span>
            </p>
          </div>

          {/* TEXTOS REFINADOS: El CTA Final */}
          <div className={`${isTitleVisible ? 'animate-fade-in-delayed' : 'opacity-0'}`}>
            <p className="text-gray-600 text-sm mt-4">
              Dale a tu equipo una sola herramienta, no mil tareas.
            </p>
          </div>
        </div>
      </section>

      {/* Los estilos para las animaciones de fade-in y blink se mantienen igual */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delayed {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blink { animation: blink 1s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; animation-delay: 0.5s; }
        .animate-fade-in-delayed { animation: fade-in-delayed 1s ease-out forwards; animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default ManifestoSection;
