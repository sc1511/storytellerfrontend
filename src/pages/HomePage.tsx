import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IntroScene } from '../components/onboarding/IntroScene';
import { StoryLibraryModal } from '../components/story/StoryLibraryModal';
import { useProfileStore } from '../store/profileStore';

/**
 * HomePage - De intro pagina met PLAY en LIBRARY buttons
 * Losgekoppeld van onboarding flow
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { currentProfile } = useProfileStore();
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const handlePlay = () => {
    // Always go to onboarding when clicking PLAY
    navigate('/onboarding');
  };

  const handleLibrary = () => {
    setShowLibraryModal(true);
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ position: 'relative', backgroundColor: '#000000' }}>
      <IntroScene onComplete={handlePlay} onLibrary={handleLibrary} />
      
      {/* Story Library Modal */}
      <StoryLibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      />
    </div>
  );
}

