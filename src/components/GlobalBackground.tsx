import React, { useEffect, useRef } from 'react';

const GlobalBackground: React.FC = () => {
  const starsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = starsContainerRef.current;
    if (!container) return;

    const numberOfStars = 50;
    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('div');
      
      const distance = Math.random();
      let sizePx = 2;
      let starClass = 'stars-medium';
      
      if (distance < 0.4) {
        sizePx = 1;
        starClass = 'stars-far';
      } else if (distance < 0.75) {
        sizePx = 1.5;
        starClass = 'stars-medium';
      } else {
        sizePx = 2.5;
        starClass = 'stars-near';
      }

      // Position across the viewport
      const left = Math.random() * 100;
      const top = Math.random() * 100;

      star.className = `absolute rounded-full bg-white ${starClass}`;
      star.style.left = left + '%';
      star.style.top = top + '%';
      star.style.width = `${sizePx}px`;
      star.style.height = `${sizePx}px`;

      // Occasionally make a star brighter
      if (Math.random() > 0.9) {
        star.className = `absolute rounded-full bg-white stars-bright`;
        star.style.width = '3px';
        star.style.height = '3px';
        star.style.boxShadow = '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.3)';
      }

      container.appendChild(star);
    }

    return () => {
      if (starsContainerRef.current) starsContainerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div ref={starsContainerRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full bg-white/15 blur-sm animate-float"
          style={{ width: 4, height: 4, top: '20%', left: '10%', animationDuration: '25s', animationDelay: '0s' }}
        />
        <div
          className="absolute rounded-full bg-white/15 blur-sm animate-float"
          style={{ width: 3, height: 3, top: '60%', left: '80%', animationDuration: '30s', animationDelay: '5s' }}
        />
        <div
          className="absolute rounded-full bg-white/15 blur-sm animate-float"
          style={{ width: 5, height: 5, top: '40%', left: '30%', animationDuration: '22s', animationDelay: '10s' }}
        />
        <div
          className="absolute rounded-full bg-white/15 blur-sm animate-float"
          style={{ width: 2, height: 2, top: '70%', left: '50%', animationDuration: '28s', animationDelay: '15s' }}
        />
        <div
          className="absolute rounded-full bg-white/15 blur-sm animate-float"
          style={{ width: 3, height: 3, top: '30%', left: '70%', animationDuration: '26s', animationDelay: '20s' }}
        />
      </div>
    </div>
  );
};

export default GlobalBackground;


