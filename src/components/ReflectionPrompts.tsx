import React, { useState, useEffect } from 'react';

const ReflectionPrompts: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const prompts = [
    "What would you do with 10 extra hours this week?",
    "Your future self is already thanking you",
    "Every automation is a step toward freedom",
    "Imagine never doing this manually again",
    "You're not just saving time, you're creating life",
    "What dream have you postponed for 'lack of time'?",
    "This could be running while you sleep",
    "Freedom starts with one less repetitive task"
  ];

  useEffect(() => {
    const showPrompt = () => {
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setCurrentPrompt(randomPrompt);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Mostrar prompt cada 2 minutos
    const interval = setInterval(showPrompt, 120000);
    
    // Mostrar primer prompt después de 30 segundos
    const initialTimeout = setTimeout(showPrompt, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  if (!currentPrompt || !isVisible) return null;

  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-30 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10  rounded-full px-6 py-3 border border-white/20">
        <p className="text-white/90 text-sm font-light">
          <span className="text-orange-400 mr-2">✨</span>
          {currentPrompt}
        </p>
      </div>
    </div>
  );
};

export default ReflectionPrompts;