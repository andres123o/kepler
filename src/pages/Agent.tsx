import Header from '../components/Header';
import FooterSection from '../components/Foter';
import WorkspaceMain from '../components/ChatAgent';
import MusicPlayerSection from '../components/PlayLoad'

const CreateWorkspace: React.FC = () => {

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

      <MusicPlayerSection />

      <FooterSection />
    </div>
  );
};

export default CreateWorkspace;