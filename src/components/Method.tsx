import React from 'react';

// 1. Nuevo componente para el fondo complejo, extraído del HeroSection
// Acepta una 'imageUrl' para ser reutilizable en cada tarjeta.
const CardBackground: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  return (
    <>
      {/* Capa 1: Gradiente de color base */}
      <div 
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }}
      />
      {/* Capa 2: Patrón de líneas diagonales */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-color-burn"
        style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }}
      />
      {/* Capa 3: Textura de ruido/posterizado */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='posterize'%3E%3CfeGaussianBlur stdDeviation='0.5'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23posterize)' fill='%23fff' opacity='0.1'/%3E%3C/svg%3E")`, mixBlendMode: 'overlay' }}
      />
      {/* Capa 4: Imagen de fondo específica de la tarjeta */}
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


const MethodSection: React.FC = () => {
  const steps = [
      {
        number: '01',
        title: 'Unifica',
        description: 'Toda la comunicación de tus clientes en un solo panel. Adiós al caos de cambiar de pestañas, hola a la claridad.',
        imageUrl: 'https://res.cloudinary.com/dmyq0gr14/image/upload/v1756505290/ilustracion-de-hawai-en-estilo-comico-retro_1_bbrnqq.jpg'
      },
      {
        number: '02', 
        title: 'Comprende',
        description: 'Describe la encuesta que necesitas con tus palabras y nuestra IA la crea al instante. Con tu branding',
        imageUrl: 'https://res.cloudinary.com/dmyq0gr14/image/upload/v1756495493/Dimensiones_personalizadas_ugncat.jpg'
      },
      {
        number: '03',
        title: 'Optimiza', 
        description: 'Analiza las respuestas y el rendimiento de tu equipo con métricas claras. Toma buenas decisiones.',
        imageUrl: 'https://res.cloudinary.com/dmyq0gr14/image/upload/v1756505436/escena-de-verano-del-estilo-de-vida-de-los-dibujos-animados_we0fan.jpg'
      }
    ];

  return (
    <section className="relative w-full py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            El método
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          El proceso para convertir cada interacción con el cliente en una oportunidad de crecimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {/* Contenedor principal de la tarjeta. Sirve como máscara para el fondo. */}
              <div 
                className="relative z-10 rounded-2xl p-8 border border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-white/10 hover:-translate-y-1 h-[280px] flex flex-col justify-end overflow-hidden"
              >
                {/* 2. Usamos el nuevo componente de fondo aquí, pasándole la imagen de cada paso */}
                <CardBackground imageUrl={step.imageUrl} />
                
                {/* Número grande como elemento visual principal */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10rem] md:text-[12rem] font-extrabold text-white/20 opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:text-white/30 z-20 select-none pointer-events-none">
                    {step.number}
                </div>
                
                {/* Título y descripción - z-index alto para estar sobre todo */}
                <div className="relative z-30"> 
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-white/80 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
};

export default MethodSection;