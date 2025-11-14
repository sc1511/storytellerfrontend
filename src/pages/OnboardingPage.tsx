import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';

// De Scène Componenten
import { WhisperingForest } from '../components/onboarding/WhisperingForest';
import { BridgeOfTimes } from '../components/onboarding/BridgeOfTimes';
import { MirrorOfSelfExpression } from '../components/onboarding/MirrorOfSelfExpression';

// State & Types
import { useProfileStore } from '../store/profileStore';
import type { ChildProfile, AvatarCustomization } from '../types';
import { storyAPI } from '../services/api';

type Scene = 'forest' | 'bridge' | 'mirror';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { addProfile, currentProfile, updateProfile } = useProfileStore();

  // Start bij forest - intro is nu op homepage
  const [scene, setScene] = useState<Scene>('forest');
  
  // VISION: We slaan de data op in één state-object, wat schoner is.
  // BELANGRIJK: Tijdens onboarding kiest het KIND zelf naam, leeftijd en avatar
  // De parent leeftijd wordt NIET gebruikt - alleen als fallback voor displayName als die al bestaat
  const [profileData, setProfileData] = useState(() => {
    if (currentProfile) {
      return {
        name: currentProfile.name || '',
        age: '', // ALTIJD leeg tijdens onboarding - kind kiest zelf!
        language: currentProfile.language || 'nl' as 'en' | 'nl',
        avatarCustomization: currentProfile.avatarCustomization || null,
      };
    }
    return {
      name: '', // Leeg - kind kiest zelf
      age: '', // Leeg - kind kiest zelf tijdens onboarding
      language: 'nl' as 'en' | 'nl', // Default, kind kan dit aanpassen
      avatarCustomization: null as AvatarCustomization | null, // Leeg - kind kiest zelf
    };
  });

  // Update profileData wanneer currentProfile verandert (bij terugkeren)
  // BELANGRIJK: Tijdens onboarding overschrijf NIETS - kind kiest zelf alles!
  useEffect(() => {
    // Alleen updaten als we bij forest zijn (eerste stap)
    // Tijdens onboarding (forest, bridge, mirror) mag currentProfile NIET profileData overschrijven
    if (currentProfile && scene === 'forest') {
      setProfileData((prev) => ({
        name: currentProfile.name || prev.name,
        age: '', // ALTIJD leeg tijdens onboarding - kind kiest zelf!
        language: currentProfile.language || prev.language || 'nl' as 'en' | 'nl',
        avatarCustomization: currentProfile.avatarCustomization || prev.avatarCustomization,
      }));
    }
  }, [currentProfile, scene]);

  // Helper function to get avatar emoji from customization
  const getAvatarEmoji = (customization: AvatarCustomization | null): string => {
    if (!customization) return '🦊';
    
    const hairStyles = [
      { id: 'short', emoji: '👦' },
      { id: 'curly', emoji: '👨‍🦱' },
      { id: 'long', emoji: '👩' },
      { id: 'braids', emoji: '👧' },
      { id: 'ponytail', emoji: '🧑' },
      { id: 'afro', emoji: '👨‍🦲' },
    ];
    
    return hairStyles.find((s) => s.id === customization.hairStyle)?.emoji || '👤';
  };

  // Handle previous scene - ga terug naar vorige stap
  const handlePreviousScene = () => {
    if (scene === 'bridge') {
      handleNextScene('forest');
    } else if (scene === 'mirror') {
      handleNextScene('bridge');
    } else if (scene === 'forest') {
      // Als we bij forest zijn en terug gaan, ga naar homepage
      navigate('/home');
    }
  };

  // Direct scene change - no transition blocks
  const handleNextScene = (newScene: Scene) => {
    setScene(newScene);
  };

  const handleCompleteOnboarding = (languageOverride?: 'en' | 'nl') => {
    // Use languageOverride if provided, otherwise use profileData.language
    const finalLanguage = languageOverride || profileData.language || 'nl';
    
    console.log('handleCompleteOnboarding called', { 
      hasAvatar: !!profileData.avatarCustomization, 
      hasName: !!profileData.name,
      profileData,
      finalLanguage
    });
    
    if (!profileData.avatarCustomization || !profileData.name) {
      console.warn('Cannot complete onboarding: missing avatar or name', {
        avatarCustomization: profileData.avatarCustomization,
        name: profileData.name
      });
      return;
    }

    // If there's an existing profile, update it instead of creating a new one
    // This allows users to change their displayName, avatar, and age
    if (currentProfile) {
      const { updateProfile } = useProfileStore.getState();
      // Update in local store
      updateProfile(currentProfile.id, {
        displayName: profileData.name, // Store as displayName (for stories)
        age: profileData.age,
        avatar: getAvatarEmoji(profileData.avatarCustomization),
        avatarCustomization: profileData.avatarCustomization,
        language: finalLanguage, // Use finalLanguage instead of profileData.language
      });
      
      // Also save to database (async, don't wait)
      if (currentProfile.id) {
        storyAPI.updateChildProfile(currentProfile.id, {
          display_name: profileData.name,
          age: profileData.age,
          language: finalLanguage, // Use finalLanguage instead of profileData.language
          avatar_customization: profileData.avatarCustomization,
        }).catch((error) => {
          console.error('Failed to save display_name to database:', error);
          // Don't block navigation if database save fails
        });
      }
    } else {
      // Create a new profile if none exists
      const newProfile: ChildProfile = {
        id: uuidv4(),
        name: '', // Will be set from database after login
        displayName: profileData.name, // Display name chosen by child
        age: profileData.age,
        avatar: getAvatarEmoji(profileData.avatarCustomization), // Emoji fallback
        avatarCustomization: profileData.avatarCustomization, // Full customization data
        language: finalLanguage, // Use finalLanguage instead of profileData.language
        created_at: new Date().toISOString(),
        total_stories: 0,
      };

      addProfile(newProfile);
    }

    // Navigate to generate page after onboarding complete
    navigate('/generate');
  };

  return (
    <div className="min-h-screen overflow-x-visible overflow-y-visible" style={{ position: 'relative', backgroundColor: '#000000' }}>
      <div 
        className="onboarding-container min-h-screen overflow-x-visible overflow-y-visible relative" 
        style={{ 
          backgroundColor: '#000000',
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          height: 'auto',
        }}
      >

        {/* 
          VISION: Tijdens transitioning tonen we de nieuwe scene al, maar de blokjes liggen eroverheen.
          De blokjes vagen weg om de nieuwe scene te onthullen.
        */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            className="scene-content w-full h-full relative"
            style={{ 
              backgroundColor: 'transparent',
              zIndex: 1,
              position: 'relative',
            }}
          >
            {scene === 'forest' && (
              <WhisperingForest
                onNameSubmit={(name) => {
                  console.log('Display name submitted:', name);
                  setProfileData((prev) => ({ ...prev, name }));
                  // Direct opslaan in store als displayName (voor verhalen)
                  // De originele 'name' (van ouder) blijft voor login validatie
                  if (currentProfile) {
                    updateProfile(currentProfile.id, { displayName: name });
                  }
                  handleNextScene('bridge');
                }}
              />
            )}

            {scene === 'bridge' && (
              <BridgeOfTimes
                onAgeSelect={(age) => {
                  setProfileData((prev) => ({ ...prev, age }));
                  // Direct opslaan in store zodat leeftijd behouden blijft bij terugkeren
                  if (currentProfile) {
                    updateProfile(currentProfile.id, { age });
                  }
                  handleNextScene('mirror');
                }}
                currentAge={profileData.age}
              />
            )}

            {scene === 'mirror' && (
              <MirrorOfSelfExpression
                onAvatarComplete={(customization) => {
                  console.log('Avatar completed:', customization);
                  setProfileData((prev) => ({ ...prev, avatarCustomization: customization }));
                  // Direct opslaan in store zodat avatar behouden blijft bij terugkeren
                  if (currentProfile) {
                    updateProfile(currentProfile.id, { 
                      avatarCustomization: customization,
                      avatar: getAvatarEmoji(customization)
                    });
                  }
                }}
                onLanguageSelect={(language) => {
                  console.log('Language selected:', language, 'Current profileData:', profileData);
                  setProfileData((prev) => ({ ...prev, language }));
                  // Direct opslaan in store zodat taal behouden blijft bij terugkeren
                  if (currentProfile) {
                    updateProfile(currentProfile.id, { language });
                  }
                  // After language selection, complete onboarding with wave transition
                  // Pass language directly to avoid async state update issue
                  handleCompleteOnboarding(language);
                }}
                onBack={handlePreviousScene}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
