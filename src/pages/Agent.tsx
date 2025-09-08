import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import FooterSection from '../components/Foter';
import WorkspaceMain from '../components/ChatAgent';
import CelebrationOverlay from '../components/CelebrationOverlay';
import MusicPlayerSection from '../components/PlayLoad'

const CreateWorkspace: React.FC = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(0);


  // Simular completación de workflow para demo
  useEffect(() => {
    const handleWorkflowComplete = (event: CustomEvent) => {
      const timeSaved = event.detail.timeSaved || 3.5;
      setLastSavedTime(timeSaved);
      setShowCelebration(true);
      setWorkflowCompleted(true);
      setTotalSessionTime(prev => prev + timeSaved);
    };

    window.addEventListener('workflowComplete' as any, handleWorkflowComplete);
    return () => {
      window.removeEventListener('workflowComplete' as any, handleWorkflowComplete);
    };
  }, []);


  return (
    <div id="workspace-container" className="">

      {/* Layout principal */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Life Mode Bar - Sticky top */}
        <Header />
        
        {/* Workspace principal */}
        <div className="">
          <WorkspaceMain />
        </div>
      </div>

      
      {/* Celebration Overlay */}
      <CelebrationOverlay 
        show={showCelebration}
        timeSaved={lastSavedTime}
        onClose={() => setShowCelebration(false)}
      />

      <MusicPlayerSection />

      <FooterSection />
    </div>
  );
};

export default CreateWorkspace;