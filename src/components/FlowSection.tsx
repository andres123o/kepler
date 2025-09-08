import React from 'react';

const FlowSection: React.FC = () => {
  const aiTools = [
    {
      name: 'N8N',
      logo: 'https://res.cloudinary.com/dmyq0gr14/image/upload/v1756486355/N8N-removebg-preview_ly7xd3.png',
    },
    {
      name: 'Lovable',
      logo: 'https://res.cloudinary.com/dmyq0gr14/image/upload/v1756485505/lovable-light-png_br2n10.png',
    },
    {
      name: 'Make',
      logo: 'https://res.cloudinary.com/dmyq0gr14/image/upload/v1756485872/logo-preview-removebg-preview_o4paoh.png',
    }
  ];

  return (
    <section className="relative w-full py-16 px-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        {/* Título simple y directo */}
        <div className="text-center mb-12">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-200 uppercase tracking-widest font-medium">
            DESARROLLADO POR MCP INTEGRACIONES CON
          </p>
        </div>

        {/* Grid de logos minimalista */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 max-w-6xl mx-auto">
          {aiTools.map((tool, index) => (
            <div 
              key={index}
              className="group flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <img 
                src={tool.logo} 
                alt={tool.name}
                className="h-8 md:h-10 max-w-[120px] object-contain  opacity-100 hover:grayscale-0 hover:opacity-90 transition-all duration-300 brightness-125"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlowSection;