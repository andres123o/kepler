import React from 'react';

const FooterSection: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Gradiente sutil en el borde superior */}      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Logo y mensaje principal (sin cambios) */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="mb-6 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-180">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-white/90 font-light text-center mb-2">
            Deja de crear listas de tareas pendientes.
          </p>
          <p className="text-xl md:text-2xl font-light text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
              Empieza a construir tu vida.
            </span>
          </p>
        </div>

        {/* Links minimalistas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 max-w-2xl mx-auto">
          <a href="#" className="group text-center">
            {/* CAMBIO: Texto a blanco/opaco y más grande */}
            <span className="text-white/80 hover:text-white transition-colors duration-300 text-base">
              Documentación
            </span>
            <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-500 mx-auto mt-1" />
          </a>
          
          <a href="#" className="group text-center">
            {/* CAMBIO: Texto a blanco/opaco y más grande */}
            <span className="text-white/80 hover:text-white transition-colors duration-300 text-base">
              Comunidad
            </span>
            <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-500 mx-auto mt-1" />
          </a>
          
          <a href="#" className="group text-center">
            {/* CAMBIO: Texto a blanco/opaco y más grande */}
            <span className="text-white/80 hover:text-white transition-colors duration-300 text-base">
              GitHub
            </span>
            <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-500 mx-auto mt-1" />
          </a>
          
          <a href="#" className="group text-center">
            {/* CAMBIO: Texto a blanco/opaco y más grande */}
            <span className="text-white/80 hover:text-white transition-colors duration-300 text-base">
              Twitter
            </span>
            <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-500 mx-auto mt-1" />
          </a>
        </div>

        {/* Separador con animación */}
        <div className="relative h-8 mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-xs h-px bg-white/10" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-black px-4">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-75" />
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        {/* CAMBIO: Texto a un gris más claro y más grande */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>© {currentYear} Crea con IA. El tiempo ahorrado es vida ganada..</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition-colors duration-300">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Terms
            </a>
            <div className="flex items-center space-x-2">
              <span>Hecho con</span>
              <div className="relative group">
                <span className="text-red-500 animate-pulse cursor-pointer">♥</span>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded px-2 py-1 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  y mucho café.
                </div>
              </div>
              <span>en Bogotá</span>
            </div>
          </div>
        </div>

        {/* Easter egg (sin cambios) */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors duration-1000 cursor-default select-none">
            Has llegado hasta el final. Ahora ve y crea algo hermoso.
          </p>
        </div>
      </div>

      <style>{`
        .delay-75 {
          animation-delay: 75ms;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </footer>
  );
};

export default FooterSection;