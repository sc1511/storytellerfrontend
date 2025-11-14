import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useStoryStore } from '../store/storyStore';
import { useProfileStore } from '../store/profileStore';
import { storyAPI } from '../services/api';
import { AvatarVideo } from '../components/avatar/AvatarVideo';
import { StoryLibraryModal } from '../components/story/StoryLibraryModal';
import { detectAvatarId } from '../lib/avatarVideos';
import { createConfettiBurst } from '../lib/reward-animations';
import { NeonIconButton } from '../components/ui/NeonIconButton';
import type { StoryChoice, AdvancedVocabularyWord } from '../types';

// CSS to hide scrollbars
const hideScrollbarStyle = {
  scrollbarWidth: 'none' as const, // Firefox
  msOverflowStyle: 'none' as const, // IE and Edge
};

// Add style tag to hide webkit scrollbars
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .story-text-container::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    .story-text-container {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
  `;
  if (!document.head.querySelector('style[data-story-scrollbar]')) {
    style.setAttribute('data-story-scrollbar', 'true');
    document.head.appendChild(style);
  }
}

// K-pop Dark Neon Color Palette (from StoryGeneratorPage)
const KPOP_COLORS = {
  neonPink: '#FF10F0',
  neonBlue: '#00F0FF',
  neonPurple: '#B026FF',
  neonCyan: '#00FFFF',
  neonMagenta: '#FF00FF',
  darkBg: '#0a0a1a',
  darkBgSecondary: '#1a1a2e',
  darkBgTertiary: '#16213e',
  neonYellow: '#FFD700',
};

// Child-Friendly WebBook Color Palette (for story containers)
const BOOK_COLORS = {
  // Warm, friendly colors
  cream: '#FFF9F0',
  warmWhite: '#FFFFFF',
  softYellow: '#FFE5B4',
  skyBlue: '#B8E6FF',
  softPink: '#FFD6E8',
  lightGreen: '#D4F4DD',
  lavender: '#E6D9F5',
  peach: '#FFE0CC',
  // Text colors
  textDark: '#2D3436',
  textMedium: '#636E72',
  // Accent colors
  accentBlue: '#4A90E2',
  accentPurple: '#9B59B6',
  accentOrange: '#E67E22',
  accentGreen: '#6BCF7F',
  // Borders and shadows
  borderLight: '#E0E0E0',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
};

// Helper function to get the correct avatar path based on profile
const getAvatarPath = (avatarId: string | undefined, variant: 'book' | 'cat' | 'normal' | 'welldone' = 'book'): string => {
  if (!avatarId) {
    // Default fallback - use cat variant for numbered avatars
    return '/avatar1/avatar1cat-unscreen.gif';
  }

  // Handle Stitch avatar
  if (avatarId === 'stitch') {
    if (variant === 'welldone') {
      return '/stitch/stitch-bravo-unscreen.gif';
    } else if (variant === 'book') {
      return '/stitch/stitch-readingbook-unscreen.gif';
    } else if (variant === 'cat') {
      // Stitch doesn't have cat variant, use talking as fallback
      return '/stitch/stitch-talking-unscreen.gif';
    } else {
      // Normal/intro variant (happy)
      return '/stitch/stitch_happy-unscreen.gif';
    }
  }

  // Handle Spiderman avatar
  if (avatarId === 'spiderman') {
    if (variant === 'welldone') {
      return '/spiderman/spiderman-bravo-unscreen.gif';
    } else if (variant === 'book') {
      return '/spiderman/spiderman-readingbook-unscreen.gif';
    } else if (variant === 'cat') {
      // Spiderman doesn't have cat variant, use talking as fallback
      return '/spiderman/spiderman-talking-unscreen.gif';
    } else {
      // Normal/intro variant
      return '/spiderman/spiderman-intro-unscreen.gif';
    }
  }

  // Handle numbered avatars (avatar1, avatar2, avatar4, avatar5, avatar6)
  // Use CAT variant for these avatars (as requested)
  if (avatarId.match(/^avatar[1-6]$/)) {
    if (variant === 'cat' || variant === 'book' || variant === 'welldone') {
      // Use cat variant for numbered avatars (they don't have welldone, so use cat)
      return `/${avatarId}/${avatarId}cat-unscreen.gif`;
    } else {
      return `/${avatarId}/${avatarId}-unscreen.gif`;
    }
  }

  // Handle color avatars (avatarbrown, avatarpink, avatarpurple)
  if (avatarId === 'avatarbrown' || avatarId === 'avatarpink' || avatarId === 'avatarpurple') {
    if (variant === 'welldone') {
      return `/${avatarId}/${avatarId}-welldone${avatarId === 'avatarpurple' ? '' : '-2--'}unscreen.gif`;
    } else if (variant === 'book') {
      return `/${avatarId}/${avatarId}-readingbook-2--unscreen.gif`;
    } else if (variant === 'cat') {
      // Color avatars don't have cat variants, use talking as fallback
      if (avatarId === 'avatarpink') {
        return `/${avatarId}/${avatarId}-talking-3--unscreen.gif`;
      }
      return `/${avatarId}/${avatarId}-talking-2--unscreen.gif`;
    } else {
      // Normal/intro variant
      if (avatarId === 'avatarpurple') {
        return `/${avatarId}/${avatarId}-intro-unscreen.gif`;
      }
      return `/${avatarId}/${avatarId}-intro-2--unscreen.gif`;
    }
  }

  // Fallback to default - use cat variant for numbered avatars
  return '/avatar1/avatar1cat-unscreen.gif';
};

// Avatar messages voor verschillende momenten tijdens het lezen
const AVATAR_MESSAGES = {
  reading: [
    "Ogen op het verhaal, de magie begint.",
    "Lezen = level up. Jij doet dit!",
    "Zet je leesbril aan, we duiken erin.",
    "Ik voel al spanning in dit hoofdstuk.",
    "Elk woord brengt ons dichter bij het avontuur.",
    "Lees rustig, maar met stijl natuurlijk.",
    "Jij en ik, dit verhaal… perfecte combo.",
  ],
  wordClicked: [
    "Slim! Dat woord is interessant, hè?",
    "Kijk jou, woordenjager!",
    "Nice! Zo leer je als een echte pro.",
    "Dat woord heeft kracht. Klik en ontdek!",
    "Wow, jij hebt oog voor detail.",
    "Nog een nieuw woord in jouw collectie!",
    "Elke klik maakt je slimmer. Lekker bezig.",
    "Taalgoeroe in the making!",
    "Dat woord? Goeie keuze.",
    "Ik wist dat jij nieuwsgierig was!",
  ],
  definitionShown: [
    "Bam! Weer een woord erbij.",
    "Ha, wist ik al. Maar nu jij ook!",
    "Slimmer met elke klik.",
    "Zo hoort het! Jij leert supersnel.",
    "Nieuwe kennis, unlocked.",
    "Dat ga jij onthouden, ik voel het.",
    "Weer een stap dichter bij de story-master titel.",
    "Dat ging vlot, good job!",
    "Ik zeg het je: jij leest met brains.",
    "Altijd leuk als woorden geheimen prijsgeven.",
  ],
  testPrompt: [
    "Voordat je verdergaat, eerst even een testje.",
    "Even checken wat je weet voordat we doorgaan.",
    "Stop! Eerst een snelle test voordat je verder klikt.",
    "Eerst een mini-test, dan kun je verder.",
    "Voor je verder mag, kijken we of je hebt opgelet.",
    "Niet stressen, maar eerst een korte test.",
    "Even bewijzen dat je dit snapt voordat we verdergaan.",
    "Klik straks pas weer — eerst deze test!",
    "Eerst testen, dan verder knallen.",
    "Laat even zien dat je er klaar voor bent, dan kun je door.",
  ],
  testCompleted: [
    "Nice! Jij leest met power.",
    "Knap gedaan, ik zei het toch?",
    "Topwerk, jij bent een echte story master.",
    "Dat ging supersnel, wow.",
    "Lezen + denken = jij.",
    "Zo hoort het, blijven groeien.",
    "Ik ben onder de indruk.",
    "Je maakt leren cool.",
    "Weer een level omhoog.",
    "Sterk werk, legend.",
  ],
  choicePrompt: [
    "Oké, jouw beurt! Wat doe je nu?",
    "Denk goed na… wat lijkt jou leuk om te doen?",
    "Jij beslist hoe het verdergaat!",
    "Wat past het best bij jouw verhaal?",
    "Spannend moment — wat kies jij?",
    "Volg je gevoel… wat doe je?",
    "Kies wat jij het liefst wilt dat er gebeurt!",
    "Wat voelt goed? Dat is vast de juiste keuze.",
    "Even nadenken… wat zou jij doen?",
    "Jij bepaalt! Hoe gaat het nu verder?",
  ],
  completion: [
    "Bravo! Wat een geweldig verhaal!",
    "Well done! Jij bent een echte verhalenverteller!",
    "Fantastisch! Dit verhaal was top!",
    "Geweldig gedaan! Je hebt het verhaal tot leven gebracht!",
    "Super! Wat een mooi avontuur!",
  ],
  testEncouragement: [
    "Wil je nog een laatste test doen? Dan kunnen je ouders zien hoe goed je het verhaal begreep! 😊",
    "Laat zien wat je geleerd hebt! Doe nog een test! 🎯",
    "Je bent bijna klaar! Doe nog een laatste test om te laten zien hoe goed je het verhaal kent! ⭐",
    "Test tijd! Laat zien hoe goed je het verhaal begreep! 🚀",
    "Nog één test en je bent helemaal klaar! Kom op, je kunt het! 💪",
  ],
};

export default function StoryReaderPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const currentSession = useStoryStore((state) => state.currentSession);
  const loadSession = useStoryStore((state) => state.loadSession);
  const addStorySegment = useStoryStore((state) => state.addStorySegment);
  const setLoading = useStoryStore((state) => state.setLoading);
  const setError = useStoryStore((state) => state.setError);
  const isLoading = useStoryStore((state) => state.isLoading);
  const error = useStoryStore((state) => state.error);
  const currentProfile = useProfileStore((state) => state.currentProfile);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [avatarPlayed, setAvatarPlayed] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; definition: string; x: number; y: number } | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [comprehensionAnswers, setComprehensionAnswers] = useState<{ [questionIndex: number]: number }>({});
  const [showComprehensionResults, setShowComprehensionResults] = useState(false);
  const [showComprehensionTest, setShowComprehensionTest] = useState(false);
  const [comprehensionAttempts, setComprehensionAttempts] = useState<{ [segmentIndex: number]: number }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testCompletedForSegment, setTestCompletedForSegment] = useState<{ [segmentIndex: number]: boolean }>({});
  const [showStoryCompletedModal, setShowStoryCompletedModal] = useState(false);
  const [focusModeCurrentPage, setFocusModeCurrentPage] = useState(0);
  const [focusModePages, setFocusModePages] = useState<string[]>([]);
  const [isEndingStory, setIsEndingStory] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarMessageType, setAvatarMessageType] = useState<'reading' | 'wordClicked' | 'definitionShown' | 'testPrompt' | 'testCompleted' | 'completion' | 'choicePrompt' | 'testEncouragement' | null>(null);
  const [showAvatarBubble, setShowAvatarBubble] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [wordClickCount, setWordClickCount] = useState(0);
  const [showAvatarBubbleNextToTest, setShowAvatarBubbleNextToTest] = useState(false);
  const [showAvatarBubbleAboveLargeAvatar, setShowAvatarBubbleAboveLargeAvatar] = useState(false);
  const [showAvatarBubbleInTestModal, setShowAvatarBubbleInTestModal] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const completionBubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Load session if we have sessionId but no currentSession
  useEffect(() => {
    if (sessionId) {
      const sessions = useStoryStore.getState().sessions;
      const session = sessions.find((s) => s.session_id === sessionId);
      
      if (session) {
        // Check if session has comprehension questions, if not, reload from API
        const hasQuestions = session.story_segments.some(seg => seg.comprehension_questions && seg.comprehension_questions.length > 0);
        
        // Only reload from API if questions are missing
        if (!hasQuestions) {
          setLoading(true);
          storyAPI.getStorySession(sessionId)
            .then((sessionFromApi) => {
              useStoryStore.getState().setCurrentSession(sessionFromApi);
              useStoryStore.setState((state) => ({
                sessions: state.sessions.map((s) =>
                  s.session_id === sessionFromApi.session_id ? sessionFromApi : s
                ),
              }));
              setLoading(false);
            })
            .catch((error) => {
              // Fallback to store session if API fails
              useStoryStore.getState().setCurrentSession(session);
              setLoading(false);
            });
        } else {
          // Use session from store if it has questions
        useStoryStore.getState().setCurrentSession(session);
        }
      } else {
        // Try to load from API if not in store
        setLoading(true);
        storyAPI.getStorySession(sessionId)
          .then((sessionFromApi) => {
            useStoryStore.getState().setCurrentSession(sessionFromApi);
            useStoryStore.setState((state) => ({
              sessions: [...state.sessions, sessionFromApi],
            }));
            setLoading(false);
          })
          .catch((error) => {
            // Log technical details to console only
            console.error('Failed to load session (technical):', {
              message: error instanceof Error ? error.message : 'Unknown error',
              code: (error as any)?.code,
              status: (error as any)?.response?.status,
            });
            setLoading(false);
            // User-friendly error for children
            setError('Verhaal niet gevonden. Ga terug naar de bibliotheek! 📚');
          });
      }
    }
  }, [sessionId, navigate]);

  // Load test completion status from API when session is loaded
  useEffect(() => {
    if (currentSession && currentProfile && currentSession.session_id) {
      const childName = currentProfile.displayName || currentProfile.name;
      if (childName) {
        // Load comprehension results to check which segments have completed tests
        storyAPI.getComprehensionResults(childName, 30) // Get last 30 days
          .then((response) => {
            if (response.success && response.data) {
              // Filter results for this session
              const sessionResults = response.data.filter((result: any) => 
                result.session_id === currentSession.session_id
              );
              
              // Build completion map
              const completedMap: { [segmentIndex: number]: boolean } = {};
              sessionResults.forEach((result: any) => {
                const segmentSeq = result.segment_sequence || result.segmentSequence || 1;
                // Find segment index by sequence
                const segmentIndex = currentSession.story_segments.findIndex(
                  (seg: any) => (seg.sequence || 0) === segmentSeq
                );
                if (segmentIndex >= 0) {
                  completedMap[segmentIndex] = true;
                }
              });
              
              // Update test completion status
              setTestCompletedForSegment(completedMap);
            }
          })
          .catch((error) => {
            // Silently fail - don't show error to user
            console.error('Error loading test completion status:', error);
          });
      }
    }
  }, [currentSession?.session_id, currentProfile?.id]);

  // Avatar: keep visible, don't hide it
  // Removed the logic that hides the avatar - it should stay visible

  // Redirect if no profile (ProtectedRoute should handle this, but keep as fallback)
  if (!currentProfile) {
    navigate('/login', { replace: true });
    return null;
  }

  // Allow reading stories even without avatar - avatar is optional for story reading

  // Redirect if no session (after useEffect has tried to load it)
  if (!currentSession && sessionId) {
    // Give useEffect a chance to redirect, but if we're still here, show loading
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: KPOP_COLORS.darkBg }}>
        <LoadingSpinner size="lg" text="Verhaal laden..." />
      </div>
    );
  }

  // If no sessionId at all, redirect to generate
  if (!sessionId) {
    navigate('/generate', { replace: true });
      return null;
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: KPOP_COLORS.darkBg }}>
        <LoadingSpinner size="lg" text="Verhaal laden..." />
      </div>
    );
  }

  const currentSegment = currentSession.story_segments[currentSegmentIndex];
  const isLastSegment = currentSegmentIndex === currentSession.story_segments.length - 1;
  const progress = ((currentSegmentIndex + 1) / currentSession.story_segments.length) * 100;
  
  // Check if story is completed - show modal if needed
  useEffect(() => {
    if (currentSession.completed && !showStoryCompletedModal) {
      // Small delay to ensure the last segment is rendered
      const timer = setTimeout(() => {
        setShowStoryCompletedModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSession.completed, showStoryCompletedModal]);
  
  // Automatically show avatar and bubble when completion modal opens
  useEffect(() => {
    if (showStoryCompletedModal && currentProfile?.avatarCustomization) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        // Check if last segment has comprehension questions
        const lastSegment = currentSession.story_segments[currentSession.story_segments.length - 1];
        const hasTestQuestions = lastSegment?.comprehension_questions && Array.isArray(lastSegment.comprehension_questions) && lastSegment.comprehension_questions.length > 0;
        const isTestCompleted = testCompletedForSegment[currentSession.story_segments.length - 1] || false;
        
        // If there are test questions and test is not completed, show encouragement message
        let messageType: 'completion' | 'testEncouragement' = 'completion';
        if (hasTestQuestions && !isTestCompleted) {
          messageType = 'testEncouragement';
        }
        
        const message = getRandomAvatarMessage(messageType);
        setAvatarMessage(message);
        setAvatarMessageType(messageType);
        setShowAvatarBubble(true);
        // Keep avatar and bubble visible for 20 seconds
        setTimeout(() => {
          setShowAvatarBubble(false);
          setTimeout(() => {
            setAvatarMessage(null);
            setAvatarMessageType(null);
          }, 300);
        }, 20000);
      }, 300);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [showStoryCompletedModal, currentProfile, currentSession, testCompletedForSegment]);
  
  // Show reading message when segment changes
  useEffect(() => {
    if (currentSegment && !focusMode && !showComprehensionTest && !isLoading) {
      const timer = setTimeout(() => {
        const message = getRandomAvatarMessage('reading');
        setAvatarMessage(message);
        setAvatarMessageType('reading');
        setShowAvatarBubble(true);
        setTimeout(() => {
          setShowAvatarBubble(false);
          setTimeout(() => {
            setAvatarMessage(null);
            setAvatarMessageType(null);
          }, 300);
        }, 20000); // Longer duration: 20 seconds
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentSegmentIndex, focusMode, showComprehensionTest, isLoading, currentSegment]);
  
  // Show definition shown message when word definition appears
  useEffect(() => {
    if (selectedWord && selectedWord.definition) {
      // Show message immediately when definition appears (no delay)
        const message = getRandomAvatarMessage('definitionShown');
        setAvatarMessage(message);
        setAvatarMessageType('definitionShown');
        setShowAvatarBubble(true);
      
      // Keep bubble visible for 30 seconds so child can read it
      const hideTimer = setTimeout(() => {
          setShowAvatarBubble(false);
          setTimeout(() => {
            setAvatarMessage(null);
            setAvatarMessageType(null);
          }, 300);
      }, 30000); // 30 seconds - long enough to read
      
      return () => clearTimeout(hideTimer);
    } else {
      // Don't hide immediately when selectedWord becomes null
      // Let the timeout handle it, or keep it visible if user clicks away
      // Only clear if we're explicitly hiding
    }
  }, [selectedWord]);
  
  // Show test prompt message when test opens
  useEffect(() => {
    if (showComprehensionTest && !showComprehensionResults) {
      // Show immediately when modal opens (no delay)
      const message = getRandomAvatarMessage('testPrompt');
      setAvatarMessage(message);
      setAvatarMessageType('testPrompt');
      setShowAvatarBubbleInTestModal(true);
      // Keep visible longer in modal (30 seconds)
      const hideTimer = setTimeout(() => {
        setShowAvatarBubbleInTestModal(false);
        setTimeout(() => {
          setAvatarMessage(null);
          setAvatarMessageType(null);
        }, 300);
      }, 30000);
      
      return () => {
        clearTimeout(hideTimer);
      };
    } else {
      // Hide bubble when modal closes or results are shown
      setShowAvatarBubbleInTestModal(false);
    }
  }, [showComprehensionTest, showComprehensionResults]);
  
  // Show test completed message when test is completed
  useEffect(() => {
    if (showComprehensionResults && testCompletedForSegment[currentSegmentIndex]) {
      const timer = setTimeout(() => {
        const message = getRandomAvatarMessage('testCompleted');
        setAvatarMessage(message);
        setAvatarMessageType('testCompleted');
        setShowAvatarBubble(true);
        setTimeout(() => {
          setShowAvatarBubble(false);
          setTimeout(() => {
            setAvatarMessage(null);
            setAvatarMessageType(null);
          }, 300);
        }, 20000); // Longer duration: 20 seconds
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showComprehensionResults, testCompletedForSegment, currentSegmentIndex]);

  // Trigger confetti when score is 3/3
  useEffect(() => {
    if (showComprehensionResults && resultsContainerRef.current && currentSegment?.comprehension_questions) {
      const questions = currentSegment.comprehension_questions;
      const correctCount = questions.filter((q, qIndex) => 
        comprehensionAnswers[qIndex] === q.correct_answer
      ).length;
      const total = questions.length;
      
      if (correctCount === total && total > 0) {
        // Small delay to ensure container is rendered
        const timer = setTimeout(() => {
          if (resultsContainerRef.current) {
            createConfettiBurst(resultsContainerRef.current);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [showComprehensionResults, comprehensionAnswers, currentSegment]);
  
  // Show story end message when story is completed
  useEffect(() => {
    if (currentSession.completed && isLastSegment) {
      const timer = setTimeout(() => {
        const message = getRandomAvatarMessage('completion');
        setAvatarMessage(message);
        setAvatarMessageType('completion');
        setShowAvatarBubble(true);
        setTimeout(() => {
          setShowAvatarBubble(false);
          setTimeout(() => {
            setAvatarMessage(null);
            setAvatarMessageType(null);
          }, 300);
        }, 20000); // Longer duration: 20 seconds
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentSession.completed, isLastSegment]);
  
  // Split story text into pages for focus mode
  useEffect(() => {
    if (focusMode && currentSegment?.story_text) {
      let storyText = currentSegment.story_text;
      
      // Remove analytics section
      const analyticsMarkers = [
        '## **ANALYTICS RAPPORT**',
        '## ANALYTICS RAPPORT',
        '**ANALYTICS RAPPORT**',
        'ANALYTICS RAPPORT',
        '## **ANALYTICS**',
        '## ANALYTICS',
        '**ANALYTICS**',
        'ANALYTICS',
        '---\n\n## **ANALYTICS',
        '---\n\n## ANALYTICS',
      ];
      
      for (const marker of analyticsMarkers) {
        const index = storyText.indexOf(marker);
        if (index !== -1) {
          storyText = storyText.substring(0, index).trim();
          break;
        }
      }
      
      storyText = storyText.replace(/\n\n---\n\n\*\*ANALYTICS.*$/s, '');
      storyText = storyText.replace(/\n\n---\n\n## \*\*ANALYTICS.*$/s, '');
      
      // Split text into pages based on approximate character count
      // Each page should fit in the available height (approximately 600-800 characters per page)
      const wordsPerPage = 150; // Approximate words per page for focus mode
      const words = storyText.split(/\s+/);
      const pages: string[] = [];
      
      for (let i = 0; i < words.length; i += wordsPerPage) {
        const pageWords = words.slice(i, i + wordsPerPage);
        pages.push(pageWords.join(' '));
      }
      
      // If no pages created, create at least one
      if (pages.length === 0) {
        pages.push(storyText);
      }
      
      setFocusModePages(pages);
      setFocusModeCurrentPage(0);
    } else {
      setFocusModePages([]);
      setFocusModeCurrentPage(0);
    }
  }, [focusMode, currentSegment?.story_text, currentSegmentIndex]);

  // Helper function to get random avatar message
  const getRandomAvatarMessage = (type: keyof typeof AVATAR_MESSAGES): string => {
    const messages = AVATAR_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Show avatar message with bubble
  const showAvatarMessage = (type: 'reading' | 'wordClicked' | 'definitionShown' | 'testPrompt' | 'testCompleted' | 'completion' | 'choicePrompt' | 'testEncouragement') => {
    const message = getRandomAvatarMessage(type);
    setAvatarMessage(message);
    setAvatarMessageType(type);
    setShowAvatarBubble(true);
    
    // Auto-hide after longer duration for word-related messages
    const duration = (type === 'wordClicked' || type === 'definitionShown') ? 30000 : 20000; // 30 seconds for word clicks/definitions
    setTimeout(() => {
      setShowAvatarBubble(false);
      setTimeout(() => {
        setAvatarMessage(null);
        setAvatarMessageType(null);
      }, 300);
    }, duration);
  };

  // Get advanced vocabulary words with definitions
  const getVocabularyMap = (): Map<string, string> => {
    const vocabMap = new Map<string, string>();
    const metrics = currentSegment?.metrics;
    
    if (metrics?.vocabulary?.advanced_vocabulary) {
      const vocab = metrics.vocabulary.advanced_vocabulary;
      vocab.forEach((item) => {
        if (typeof item === 'string') {
          // If it's just a string, use the word itself
          vocabMap.set(item.toLowerCase(), '');
        } else if (item && typeof item === 'object' && 'word' in item && 'definition' in item) {
          // If it's an object with word and definition
          vocabMap.set((item as AdvancedVocabularyWord).word.toLowerCase(), (item as AdvancedVocabularyWord).definition);
        }
      });
    }
    
    return vocabMap;
  };

  // Parse story text and make vocabulary words clickable
  const renderStoryWithClickableWords = (text: string) => {
    const vocabMap = getVocabularyMap();
    if (vocabMap.size === 0) {
      return text; // No vocabulary words, return as is
    }

    // Create regex pattern for all vocabulary words (case-insensitive, whole word)
    const words = Array.from(vocabMap.keys());
    const pattern = new RegExp(`\\b(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add clickable word
      const matchedWord = match[0];
      const wordKey = matchedWord.toLowerCase();
      const definition = vocabMap.get(wordKey) || '';

      parts.push(
        <span
          key={`word-${match.index}`}
          onClick={(e) => {
            if (definition) {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              const viewportWidth = window.innerWidth;
              // Position tooltip above word, or below if near top of screen
              // In focus mode, adjust positioning to account for centered layout
              const tooltipY = rect.top < viewportHeight / 2 ? rect.bottom + 10 : rect.top - 10;
              // Ensure tooltip doesn't go off screen horizontally
              const tooltipX = Math.max(150, Math.min(rect.left + rect.width / 2, viewportWidth - 150));
              setSelectedWord({
                word: matchedWord,
                definition: definition,
                x: tooltipX,
                y: tooltipY,
              });
              
              // Show avatar message when word is clicked
              showAvatarMessage('wordClicked');
              setWordClickCount(prev => prev + 1);
            }
          }}
          style={{
            color: BOOK_COLORS.accentBlue,
            cursor: definition ? 'pointer' : 'default',
            textDecoration: definition ? 'underline' : 'none',
            textDecorationStyle: 'dotted',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (definition) {
              e.currentTarget.style.color = BOOK_COLORS.accentPurple;
              e.currentTarget.style.textDecoration = 'underline';
            }
          }}
          onMouseLeave={(e) => {
            if (definition) {
              e.currentTarget.style.color = BOOK_COLORS.accentBlue;
              e.currentTarget.style.textDecoration = 'underline';
              e.currentTarget.style.textDecorationStyle = 'dotted';
            }
          }}
        >
          {matchedWord}
        </span>
      );

      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Get story title from metadata
  const storyTitle = currentSession.metadata?.character 
    ? `${currentProfile?.name || 'Jij'} en de ${currentSession.metadata.character}`
    : 'Je Verhaal';


  const handleEndStory = async () => {
    if (currentSession.completed) {
      return;
    }

    // Check if comprehension test is required and completed
    const questions = currentSegment?.comprehension_questions;
    const hasQuestions = !focusMode && questions && Array.isArray(questions) && questions.length > 0;
    const currentAttempts = comprehensionAttempts[currentSegmentIndex] || 0;
    const maxAttempts = 2;
    const hasReachedMaxAttempts = currentAttempts >= maxAttempts;
    
    // Don't require test if max attempts reached
    if (hasQuestions && !testCompletedForSegment[currentSegmentIndex] && !hasReachedMaxAttempts) {
      alert('Je moet eerst de begripstest invullen voordat je het verhaal kunt beëindigen! 😊');
      setShowComprehensionTest(true);
      return;
    }

    if (!window.confirm('Weet je zeker dat je het verhaal wilt beëindigen? Dit is het laatste deel!')) {
      return;
    }

    setIsEndingStory(true);
    setLoading(true);
    setError(null);
    
    try {
      const response = await storyAPI.continueStory({
        session_id: currentSession.session_id,
        choice_made: 'END_STORY - Eindig het verhaal met een mooie conclusie',
        language: currentSession.metadata.language || 'nl',
        age: currentSession.metadata.age || '6-8',
        end_story: true, // Flag om aan te geven dat dit het laatste verhaal is
      });

      // IMPORTANT: Add comprehension questions to CURRENT segment (the one we just read)
      // BEFORE adding the new segment
      const currentSessionState = useStoryStore.getState().currentSession;
      if (currentSessionState && currentSegmentIndex < currentSessionState.story_segments.length) {
        const currentSegmentToUpdate = currentSessionState.story_segments[currentSegmentIndex];
        if (currentSegmentToUpdate && response.comprehension_questions) {
          // Update current segment with comprehension questions
          const updatedSegments = [...currentSessionState.story_segments];
          updatedSegments[currentSegmentIndex] = {
            ...currentSegmentToUpdate,
            comprehension_questions: response.comprehension_questions
          };
          
          const sessionWithQuestions = {
            ...currentSessionState,
            story_segments: updatedSegments
          };
          
          useStoryStore.getState().setCurrentSession(sessionWithQuestions);
          useStoryStore.setState((state) => ({
            sessions: state.sessions.map((s) =>
              s.session_id === sessionWithQuestions.session_id ? sessionWithQuestions : s
            ),
          }));
        }
      }

      // Now add the new segment (without comprehension questions, they're already on the current one)
      addStorySegment(response);
      
      // Get the updated session to know the total number of segments
      const updatedSession = useStoryStore.getState().currentSession;
      const totalSegments = updatedSession?.story_segments.length || 0;
      
      // If this is the conclusion, navigate to the last segment (the one we just added)
      if (response.is_conclusion && totalSegments > 0) {
        setCurrentSegmentIndex(totalSegments - 1);
      } else {
      setCurrentSegmentIndex((prev) => prev + 1);
      }
      
      // Reset comprehension answers when moving to a new segment
      setComprehensionAnswers({});
      setShowComprehensionResults(false);
      setCurrentQuestionIndex(0);
      // Reset test completion status for new segment
      setTestCompletedForSegment({
        ...testCompletedForSegment,
        [currentSegmentIndex]: false, // Mark current segment as not completed (we're moving to next)
      });
      
      // Check if story is completed (ending)
      if (response.is_conclusion) {
        // Show completion modal after a short delay
        setTimeout(() => {
          setShowStoryCompletedModal(true);
        }, 500);
      }
    } catch (error) {
      // Log technical details to console only
      console.error('Error ending story (technical):', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        status: (error as any)?.response?.status,
      });
      // User-friendly error for children
      const errorMessage = 'Oeps! Er ging iets mis. Probeer het opnieuw! 😊';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
      setIsEndingStory(false);
    }
  };

  const handleChoice = async (choice: { label: string; description: string } | string) => {
    if (currentSession.completed || isLoading) {
      return;
    }

    // Check if comprehension test is required and completed
    const questions = currentSegment?.comprehension_questions;
    const hasQuestions = !focusMode && questions && Array.isArray(questions) && questions.length > 0;
    const currentAttempts = comprehensionAttempts[currentSegmentIndex] || 0;
    const maxAttempts = 2;
    const hasReachedMaxAttempts = currentAttempts >= maxAttempts;
    
    // Don't auto-show test if max attempts reached
    if (hasQuestions && !testCompletedForSegment[currentSegmentIndex] && !hasReachedMaxAttempts) {
      // Show avatar bubble to guide the child
      const message = getRandomAvatarMessage('testPrompt');
      setAvatarMessage(message);
      setAvatarMessageType('testPrompt');
      setShowAvatarBubbleNextToTest(true);
      setTimeout(() => {
        setShowAvatarBubbleNextToTest(false);
        setTimeout(() => {
          setAvatarMessage(null);
          setAvatarMessageType(null);
        }, 300);
      }, 20000); // Longer duration: 20 seconds
      // DON'T open the test modal automatically - let child click "TEST JE BEGRIP" button
      return;
    }

    const choiceDescription = typeof choice === 'string' ? choice : choice.description || choice.label;
    const choiceLabel = typeof choice === 'string' ? '' : choice.label || '';

    setLoading(true);
    setError(null);
    
    try {
      const response = await storyAPI.continueStory({
        session_id: currentSession.session_id,
        choice_made: choiceLabel ? `${choiceLabel} - ${choiceDescription}` : choiceDescription,
        language: currentSession.metadata.language || 'nl',
        age: currentSession.metadata.age || '6-8',
        end_story: false,
      });

      // IMPORTANT: Add comprehension questions to CURRENT segment (the one we just read)
      // BEFORE adding the new segment
      const currentSessionState = useStoryStore.getState().currentSession;
      if (currentSessionState && currentSegmentIndex < currentSessionState.story_segments.length) {
        const currentSegmentToUpdate = currentSessionState.story_segments[currentSegmentIndex];
        if (currentSegmentToUpdate && response.comprehension_questions) {
          // Update current segment with comprehension questions
          const updatedSegments = [...currentSessionState.story_segments];
          updatedSegments[currentSegmentIndex] = {
            ...currentSegmentToUpdate,
            comprehension_questions: response.comprehension_questions
          };
          
          const sessionWithQuestions = {
            ...currentSessionState,
            story_segments: updatedSegments
          };
          
          useStoryStore.getState().setCurrentSession(sessionWithQuestions);
          useStoryStore.setState((state) => ({
            sessions: state.sessions.map((s) =>
              s.session_id === sessionWithQuestions.session_id ? sessionWithQuestions : s
            ),
          }));
        }
      }

      // Now add the new segment (without comprehension questions, they're already on the current one)
      addStorySegment(response);
      
      setCurrentSegmentIndex((prev) => prev + 1);
      // Reset comprehension answers when moving to a new segment
      setComprehensionAnswers({});
      setShowComprehensionResults(false);
      setCurrentQuestionIndex(0);
      // Reset test completion status for new segment
      setTestCompletedForSegment({
        ...testCompletedForSegment,
        [currentSegmentIndex]: false, // Mark current segment as not completed (we're moving to next)
      });
      
      // Check if story is completed (ending)
      if (response.is_conclusion) {
        // Show completion modal after a short delay
        setTimeout(() => {
          setShowStoryCompletedModal(true);
        }, 500);
      }
    } catch (error) {
      // Log technical details to console only
      console.error('Error continuing story (technical):', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        status: (error as any)?.response?.status,
      });
      // User-friendly error for children
      const errorMessage = 'Oeps! Er ging iets mis. Probeer het opnieuw! 😊';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNextSegment = () => {
    if (currentSegmentIndex < currentSession.story_segments.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1);
      // Reset comprehension answers when changing segments
      setComprehensionAnswers({});
      setShowComprehensionResults(false);
      setShowComprehensionTest(false);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePreviousSegment = () => {
    // Block navigation to previous segments - only allow going to last segment if story is not completed
    // If story is completed, don't allow any navigation
    if (currentSession.completed) {
      return; // Story is completed, no navigation allowed
    }
    
    // Only allow navigation to the last segment (if not already there)
    const lastSegmentIndex = currentSession.story_segments.length - 1;
    if (currentSegmentIndex < lastSegmentIndex) {
      // Navigate to last segment
      setCurrentSegmentIndex(lastSegmentIndex);
      setComprehensionAnswers({});
      setShowComprehensionResults(false);
      setShowComprehensionTest(false);
      setCurrentQuestionIndex(0);
    }
    // If already at last segment, do nothing (can't go back)
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {/* Background Video */}
        <video
          src={isEndingStory ? "/kidssendstory.mp4" : "/kidsreadingtablet.mp4"}
          autoPlay
          loop
          muted
          playsInline
          className="absolute"
          style={{ 
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 1,
            opacity: isEndingStory ? 0.6 : 0.4,
            filter: 'brightness(0.9)',
            minWidth: '100%',
            minHeight: '100%',
          }}
        />
        
        {/* Loading Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
          {/* Spinner */}
          <div
            className="w-24 h-24 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"
            role="status"
            aria-label="Loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
          
          {/* Text - Changes based on isEndingStory */}
          <p 
            className="text-2xl font-bold text-white"
            style={{
              fontFamily: "'Comfortaa', sans-serif",
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(176, 38, 255, 0.5)',
              letterSpacing: '0.05em',
            }}
          >
            {isEndingStory ? 'Je verhaal wordt beëindigd...' : 'Je verhaal wordt voortgezet...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="h-screen overflow-x-hidden overflow-y-hidden relative flex flex-col" 
      style={{ 
        background: focusMode 
          ? BOOK_COLORS.cream 
          : `linear-gradient(135deg, ${KPOP_COLORS.darkBg} 0%, ${KPOP_COLORS.darkBgSecondary} 50%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
        fontFamily: "'Comfortaa', 'Baloo 2', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Ambient background video (from StoryGeneratorPage) - Hidden in focus mode */}
      {!focusMode && (
      <video
        src="/kidscreatingstorycatreading.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-10 pointer-events-none z-0"
        style={{ zIndex: 0 }}
      />
      )}
      
      {/* Korean Letters Background - Scattered and Glowing (from StoryGeneratorPage) - Hidden in focus mode */}
      {!focusMode && (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(20)].map((_, i) => {
          const koreanWords = ['이야기', '상상', '모험', '마법', '별', '우주', '꿈', '환상', '신비', '기적'];
          const word = koreanWords[i % koreanWords.length];
          const colors = [KPOP_COLORS.neonPink, KPOP_COLORS.neonBlue, KPOP_COLORS.neonPurple, KPOP_COLORS.neonCyan];
          const color = colors[i % colors.length];
          return (
            <div
              key={`korean-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${20 + Math.random() * 40}px`,
                fontFamily: "'Noto Sans KR', sans-serif",
                fontWeight: 900,
                color: color,
                opacity: 0.15 + Math.random() * 0.1,
                textShadow: `
                  0 0 10px ${color}66,
                  0 0 20px ${color}44,
                  0 0 30px ${color}22
                `,
                transform: `rotate(${Math.random() * 360}deg)`,
                pointerEvents: 'none',
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
      )}
      
      {/* Background particles / Stars - Hidden in focus mode */}
      {!focusMode && (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(40)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: ['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5],
              boxShadow: `0 0 ${4 + Math.random() * 6}px ${['#FF10F0', '#00F0FF', '#B026FF', '#00FFFF', '#FFD700'][i % 5]}`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>
      )}

      {/* Top Header Bar - Neon style from StoryGeneratorPage - Verberg wanneer modal open is */}
      {!focusMode && !showComprehensionTest && (
      <div 
        className="flex-shrink-0 flex items-center justify-between px-4 py-2 relative z-20"
        style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary}88 0%, ${KPOP_COLORS.darkBgTertiary}88 100%)`,
          borderBottom: `2px solid ${KPOP_COLORS.neonPurple}44`,
        }}
      >
        <div className="flex items-center gap-3" style={{ marginRight: 'auto', maxWidth: 'calc(100% - 14rem)' }}>
          <button
            onClick={() => navigate('/generate')}
            className="px-4 py-2 rounded-3xl font-black text-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
              border: `3px solid ${KPOP_COLORS.neonPink}`,
              boxShadow: `0 0 15px ${KPOP_COLORS.neonPink}66, 0 0 30px ${KPOP_COLORS.neonPink}44`,
              color: KPOP_COLORS.neonPink,
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              letterSpacing: '0.1em',
              textShadow: `0 0 8px ${KPOP_COLORS.neonPink}, 0 0 16px ${KPOP_COLORS.neonPink}66`,
              fontSize: '0.875rem',
              minWidth: 'auto',
              minHeight: 'auto',
            }}
            title="Nieuw verhaal maken"
          >
            NIEUW VERHAAL
          </button>

          <button
            onClick={() => setShowLibraryModal(true)}
            className="px-4 py-2 rounded-3xl font-black text-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
              border: `3px solid ${KPOP_COLORS.neonPurple}`,
              boxShadow: `0 0 15px ${KPOP_COLORS.neonPurple}66, 0 0 30px ${KPOP_COLORS.neonPurple}44`,
              color: KPOP_COLORS.neonPurple,
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              letterSpacing: '0.1em',
              textShadow: `0 0 8px ${KPOP_COLORS.neonPurple}, 0 0 16px ${KPOP_COLORS.neonPurple}66`,
              fontSize: '0.875rem',
              minWidth: 'auto',
              minHeight: 'auto',
            }}
            title="Mijn verhalen"
          >
            📚 MIJN VERHALEN
          </button>
            </div>
          </div>
      )}



      {/* Main Content Area - WebBook Style */}
      {focusMode ? (
        /* Focus Mode - Full Screen Story with Pagination */
        <div className="flex-1 flex items-center justify-center p-4 relative z-10" style={{ overflow: 'hidden', minHeight: 0 }}>
          <div 
            className="w-full max-w-5xl flex flex-col rounded-3xl p-6"
          style={{
              background: BOOK_COLORS.warmWhite,
              border: `4px solid ${BOOK_COLORS.borderLight}`,
              boxShadow: `0 8px 24px ${BOOK_COLORS.shadowLight}, inset 0 0 0 1px ${BOOK_COLORS.borderLight}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
              overflow: 'hidden',
              minHeight: 0,
              maxHeight: 'calc(100vh - 100px)',
              zIndex: 1,
          }}
        >
            {/* Exit Focus Mode Button - Top Right */}
            <button
              onClick={() => setFocusMode(false)}
              className="absolute top-4 right-4 px-4 py-2 rounded-2xl font-bold text-sm transition-all hover:scale-110 active:scale-95 z-50"
              style={{
                background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                border: `3px solid ${KPOP_COLORS.neonPink}`,
                boxShadow: `0 0 15px ${KPOP_COLORS.neonPink}66, 0 0 30px ${KPOP_COLORS.neonPink}44`,
                color: KPOP_COLORS.neonPink,
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                letterSpacing: '0.1em',
                textShadow: `0 0 8px ${KPOP_COLORS.neonPink}, 0 0 16px ${KPOP_COLORS.neonPink}66`,
                fontSize: '0.875rem',
                minWidth: 'auto',
                minHeight: 'auto',
                zIndex: 50,
                position: 'absolute',
                pointerEvents: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${KPOP_COLORS.neonPink}, 0 0 40px ${KPOP_COLORS.neonPink}66`;
                e.currentTarget.style.textShadow = `0 0 12px ${KPOP_COLORS.neonPink}, 0 0 24px ${KPOP_COLORS.neonPink}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 15px ${KPOP_COLORS.neonPink}66, 0 0 30px ${KPOP_COLORS.neonPink}44`;
                e.currentTarget.style.textShadow = `0 0 8px ${KPOP_COLORS.neonPink}, 0 0 16px ${KPOP_COLORS.neonPink}66`;
              }}
            >
              📖 Verkleinen
            </button>
            
            {/* Story Title - Larger in focus mode - Neon style */}
          <h1 
              className="text-2xl font-bold mb-3 flex-shrink-0"
            style={{
                color: '#2D3436',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
                letterSpacing: '0.15em',
                lineHeight: '1.2',
                textAlign: 'center',
                textShadow: `0 0 8px ${KPOP_COLORS.neonPurple}88, 0 0 16px ${KPOP_COLORS.neonPurple}66, 2px 2px 4px rgba(0,0,0,0.3)`,
            }}
          >
            {storyTitle}
          </h1>

            {/* Story Text Container - Fixed height, no overflow */}
          <div 
            ref={textRef} 
            id="story-text-container"
              className="story-text-container flex-1"
            style={{
                overflow: 'hidden',
                padding: '24px',
                backgroundColor: BOOK_COLORS.warmWhite,
                position: 'relative',
                zIndex: 1,
                width: '100%',
                minHeight: 0,
                maxHeight: 'calc(100vh - 250px)',
                borderRadius: '12px',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                ...hideScrollbarStyle,
            }}
          >
            {(() => {
                if (focusModePages.length === 0) {
                return (
                  <div style={{ 
                    color: BOOK_COLORS.accentOrange,
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    fontFamily: "'Comfortaa', sans-serif",
                  }}>
                    ⚠️ Geen verhaal tekst gevonden
                  </div>
                );
              }
              
                const currentPageText = focusModePages[focusModeCurrentPage] || '';
                const renderedText = renderStoryWithClickableWords(currentPageText);
              
              return (
                <div
                  style={{
                    color: BOOK_COLORS.textDark,
                    fontFamily: "'Comfortaa', 'Baloo 2', sans-serif",
                      fontSize: '20px',
                      lineHeight: '1.8',
                    fontWeight: 400,
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    margin: 0,
                    padding: 0,
                    display: 'block',
                    visibility: 'visible',
                    opacity: 1,
                    position: 'relative',
                    backgroundColor: 'transparent',
                    width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                  }}
                >
                  {renderedText}
                </div>
              );
            })()}
          </div>

            {/* Page Navigation - Bottom of focus mode container */}
            {focusModePages.length > 1 && (
              <div className="flex items-center justify-between mt-4 flex-shrink-0" style={{ padding: '0 8px' }}>
                <button
                  onClick={() => setFocusModeCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={focusModeCurrentPage === 0}
                  className="px-6 py-2 rounded-2xl font-bold text-base transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: focusModeCurrentPage === 0 
                      ? BOOK_COLORS.borderLight 
                      : BOOK_COLORS.accentBlue,
                    border: `3px solid ${focusModeCurrentPage === 0 
                      ? BOOK_COLORS.borderLight 
                      : BOOK_COLORS.accentBlue}`,
                    color: BOOK_COLORS.warmWhite,
                    fontFamily: "'Comfortaa', sans-serif",
                    fontWeight: 700,
                    boxShadow: focusModeCurrentPage === 0 
                      ? 'none' 
                      : `0 4px 16px ${BOOK_COLORS.accentBlue}66`,
                    minWidth: 'auto',
                    minHeight: 'auto',
                  }}
                >
                  ← Vorige
                </button>
                
                <div 
                  className="px-4 py-2 rounded-xl"
                  style={{
                    background: BOOK_COLORS.cream,
                    border: `2px solid ${BOOK_COLORS.borderLight}`,
                    fontFamily: "'Comfortaa', sans-serif",
                    fontWeight: 600,
                    color: BOOK_COLORS.textDark,
                    fontSize: '14px',
                  }}
                >
                  Pagina {focusModeCurrentPage + 1} van {focusModePages.length}
                </div>
                
                <button
                  onClick={() => setFocusModeCurrentPage((prev) => Math.min(focusModePages.length - 1, prev + 1))}
                  disabled={focusModeCurrentPage === focusModePages.length - 1}
                  className="px-6 py-2 rounded-2xl font-bold text-base transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: focusModeCurrentPage === focusModePages.length - 1 
                      ? BOOK_COLORS.borderLight 
                      : BOOK_COLORS.accentPurple,
                    border: `3px solid ${focusModeCurrentPage === focusModePages.length - 1 
                      ? BOOK_COLORS.borderLight 
                      : BOOK_COLORS.accentPurple}`,
                    color: BOOK_COLORS.warmWhite,
                    fontFamily: "'Comfortaa', sans-serif",
                    fontWeight: 700,
                    boxShadow: focusModeCurrentPage === focusModePages.length - 1 
                      ? 'none' 
                      : `0 4px 16px ${BOOK_COLORS.accentPurple}66`,
                    minWidth: 'auto',
                    minHeight: 'auto',
                  }}
                >
                  Volgende →
                </button>
              </div>
            )}
        </div>
        </div>
      ) : (
        /* Normal Mode - Story and Choices Side by Side */
        <div className="flex-1 flex gap-3 px-4 py-1 relative z-10" style={{ overflow: 'hidden', flex: '1 1 auto', minHeight: 0, alignSelf: 'stretch', maxHeight: 'none', height: 'auto' }}>
          {/* Left Panel - Story Text (Book Page) */}
          <div 
            className="flex-1 flex flex-col rounded-3xl p-1"
            style={{
              background: BOOK_COLORS.warmWhite,
              border: `4px solid ${BOOK_COLORS.borderLight}`,
              boxShadow: `0 8px 24px ${BOOK_COLORS.shadowLight}, inset 0 0 0 1px ${BOOK_COLORS.borderLight}`,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 0,
              flex: '1 1 auto',
              alignSelf: 'stretch',
              height: '100%',
            }}
          >
            {/* Story Title - Neon style */}
            <h1 
              className="text-base font-bold mb-0.5"
              style={{
                color: '#2D3436',
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                letterSpacing: '0.15em',
                flexShrink: 0,
                lineHeight: '1.1',
                textAlign: 'center',
                textShadow: `0 0 6px ${KPOP_COLORS.neonPurple}88, 0 0 12px ${KPOP_COLORS.neonPurple}66, 1px 1px 2px rgba(0,0,0,0.3)`,
              }}
            >
              {storyTitle}
            </h1>

            {/* Story Text - Fully visible, no scrolling, NO SCROLLBAR - Book page style */}
            <div 
              ref={textRef} 
              id="story-text-container"
              className="story-text-container"
          style={{
                flex: '1 1 auto',
                overflow: 'hidden',
                overflowY: 'hidden',
                overflowX: 'hidden',
                padding: '6px',
                paddingBottom: '6px',
                backgroundColor: BOOK_COLORS.warmWhite,
                border: `2px dashed ${BOOK_COLORS.borderLight}`,
                position: 'relative',
                zIndex: 1,
                width: '100%',
                minHeight: 0,
                borderRadius: '12px',
                ...hideScrollbarStyle,
              }}
            >
              {(() => {
                let storyText = currentSegment?.story_text || '';
                
                // Remove analytics section
                const analyticsMarkers = [
                  '## **ANALYTICS RAPPORT**',
                  '## ANALYTICS RAPPORT',
                  '**ANALYTICS RAPPORT**',
                  'ANALYTICS RAPPORT',
                  '## **ANALYTICS**',
                  '## ANALYTICS',
                  '**ANALYTICS**',
                  'ANALYTICS',
                  '---\n\n## **ANALYTICS',
                  '---\n\n## ANALYTICS',
                ];
                
                for (const marker of analyticsMarkers) {
                  const index = storyText.indexOf(marker);
                  if (index !== -1) {
                    storyText = storyText.substring(0, index).trim();
                    break;
                  }
                }
                
                storyText = storyText.replace(/\n\n---\n\n\*\*ANALYTICS.*$/s, '');
                storyText = storyText.replace(/\n\n---\n\n## \*\*ANALYTICS.*$/s, '');
                
                if (!storyText || storyText.length === 0) {
                  return (
                    <div style={{ 
                      color: BOOK_COLORS.accentOrange,
                      padding: '20px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: "'Comfortaa', sans-serif",
                    }}>
                      ⚠️ Geen verhaal tekst gevonden
                    </div>
                  );
                }
                
                const renderedText = renderStoryWithClickableWords(storyText);
                
                return (
                  <div
                    style={{
                      color: BOOK_COLORS.textDark,
                      fontFamily: "'Comfortaa', 'Baloo 2', sans-serif",
                      fontSize: '16px',
                      lineHeight: '1.6',
                      fontWeight: 400,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      margin: 0,
                      padding: 0,
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1,
                      position: 'relative',
                      backgroundColor: 'transparent',
                      width: '100%',
                      height: 'auto',
                      minHeight: 'auto',
                    }}
                  >
                    {renderedText}
                  </div>
                );
              })()}
            </div>

            {/* Comprehension Test Button and Focus Mode Button - Side by side */}
            {(() => {
              const questions = currentSegment?.comprehension_questions;
              const hasQuestions = !focusMode && questions && Array.isArray(questions) && questions.length > 0;
              
              // Check if questions are actually choices (safety check)
              const firstQuestion = Array.isArray(questions) && questions.length > 0 ? questions[0] : null;
              const hasQuestionField = firstQuestion && ('question' in firstQuestion || 'text' in firstQuestion);
              const looksLikeChoice = firstQuestion && ('description' in firstQuestion || 'label' in firstQuestion);
              const isValidQuestions = hasQuestions && (!looksLikeChoice || hasQuestionField);
              
              return (
                <div className="w-full flex justify-center items-center gap-3 my-3">
                  {/* Focus Mode Button - Text vergroten */}
                  <button
                    onClick={() => setFocusMode(!focusMode)}
                    className="px-4 py-2 rounded-3xl font-black text-sm transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                      border: `3px solid ${focusMode ? KPOP_COLORS.neonCyan : KPOP_COLORS.neonYellow}`,
                      boxShadow: focusMode 
                        ? `0 0 15px ${KPOP_COLORS.neonCyan}66, 0 0 30px ${KPOP_COLORS.neonCyan}44`
                        : `0 0 15px ${KPOP_COLORS.neonYellow}66, 0 0 30px ${KPOP_COLORS.neonYellow}44`,
                      color: focusMode ? KPOP_COLORS.neonCyan : KPOP_COLORS.neonYellow,
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: 900,
                      letterSpacing: '0.1em',
                      textShadow: focusMode 
                        ? `0 0 8px ${KPOP_COLORS.neonCyan}, 0 0 16px ${KPOP_COLORS.neonCyan}66`
                        : `0 0 8px ${KPOP_COLORS.neonYellow}, 0 0 16px ${KPOP_COLORS.neonYellow}66`,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 'auto',
                      minHeight: 'auto',
                    }}
                    title={focusMode ? "Normale weergave" : "Focus modus"}
                  >
                    {focusMode ? '📖 Verkleinen' : '🔍 Vergroten'}
                  </button>
                  
                  {/* Comprehension Test Button - Only show if not reached max attempts */}
                  {(() => {
                    const currentAttempts = comprehensionAttempts[currentSegmentIndex] || 0;
                    const maxAttempts = 2;
                    const hasReachedMaxAttempts = currentAttempts >= maxAttempts;
                    const canTakeTest = isValidQuestions && !hasReachedMaxAttempts;
                    
                    if (!canTakeTest && hasReachedMaxAttempts) {
                      return (
                        <div className="px-6 py-3 rounded-3xl font-bold text-base text-center"
                          style={{
                            background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                            border: `3px solid ${KPOP_COLORS.neonPurple}`,
                            boxShadow: `0 0 15px ${KPOP_COLORS.neonPurple}66, 0 0 30px ${KPOP_COLORS.neonPurple}44`,
                            color: KPOP_COLORS.neonPurple,
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textShadow: `0 0 8px ${KPOP_COLORS.neonPurple}66`,
                            minWidth: 'auto',
                            minHeight: 'auto',
                          }}
                        >
                          ✅ Test al 2x gedaan - Goed gedaan!
                        </div>
                      );
                    }
                    
                    // Check if test is already completed for this segment
                    const isTestAlreadyCompleted = testCompletedForSegment[currentSegmentIndex] || false;
                    const hasQuestions = currentSegment?.comprehension_questions && 
                                       Array.isArray(currentSegment.comprehension_questions) && 
                                       currentSegment.comprehension_questions.length > 0;
                    
                    // Only show button if there are questions AND test is not already completed
                    // OR if it's the last segment and story is not completed (allow retaking last test)
                    const isLastSegment = currentSegmentIndex === currentSession.story_segments.length - 1;
                    const canShowTestButton = hasQuestions && (!isTestAlreadyCompleted || (isLastSegment && !currentSession.completed));
                    
                    if (!canShowTestButton) {
                      return null; // Don't show button if test is already completed (except last segment if story not completed)
                    }
                    
                    return (
                    <div className="relative flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowComprehensionTest(true);
                      setCurrentQuestionIndex(0);
                      setComprehensionAnswers({});
                      setShowComprehensionResults(false);
                          // Avatar message will be shown via useEffect
                    }}
                        className="px-6 py-3 rounded-3xl font-black text-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                          border: `3px solid ${KPOP_COLORS.neonYellow}`,
                          boxShadow: `0 0 15px ${KPOP_COLORS.neonYellow}66, 0 0 30px ${KPOP_COLORS.neonYellow}44`,
                      color: KPOP_COLORS.neonYellow,
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: 900,
                          letterSpacing: '0.1em',
                          textShadow: `0 0 8px ${KPOP_COLORS.neonYellow}, 0 0 16px ${KPOP_COLORS.neonYellow}66`,
                          minWidth: 'auto',
                          minHeight: 'auto',
                    }}
                  >
                    📚 TEST JE BEGRIP
                  </button>
                      
                      {/* Avatar with Text Bubble - Next to TEST JE BEGRIP button */}
                      {showAvatarBubbleNextToTest && avatarMessage && currentProfile?.avatarCustomization && (
                        <div 
                          className="flex flex-row items-center gap-3"
                          style={{
                            zIndex: 1000,
                            position: 'relative',
                            pointerEvents: 'auto',
                          }}
                        >
                          {/* Talking Avatar */}
                          <div 
                            className="relative"
                            style={{
                              width: detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '80px' : '60px',
                              height: detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '80px' : '60px',
                              backgroundColor: 'transparent',
                              flexShrink: 0,
                            }}
                          >
                            <AvatarVideo
                              customization={currentProfile.avatarCustomization}
                              context="talking"
                              autoplay
                              loop
                              muted
                              className="w-full h-full"
                            />
                          </div>
                          
                          {/* Text Bubble */}
                          <div
                            className="relative px-4 py-2 rounded-xl shadow-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                              border: `2px solid ${KPOP_COLORS.neonPink}44`,
                              boxShadow: `
                                0 0 15px ${KPOP_COLORS.neonPink}44,
                                0 0 30px ${KPOP_COLORS.neonPurple}33,
                                inset 0 0 15px ${KPOP_COLORS.neonPink}22
                              `,
                              maxWidth: '250px',
                              minWidth: '150px',
                              maxHeight: '100px',
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              zIndex: 1001,
                              position: 'relative',
                              pointerEvents: 'auto',
                              opacity: showAvatarBubbleNextToTest ? 1 : 0,
                              transition: 'opacity 0.3s ease',
                            }}
                          >
                            <p
                              style={{
                                color: KPOP_COLORS.neonPink,
                                fontFamily: "'Comfortaa', sans-serif",
                                fontSize: '13px',
                                fontWeight: 600,
                                lineHeight: '1.4',
                                margin: 0,
                                textShadow: `0 0 8px ${KPOP_COLORS.neonPink}66`,
                              }}
                            >
                              {avatarMessage}
                            </p>
                          </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
              );
            })()}
          </div>
          {/* Left Panel closing div - Story Text container ends here */}
            
          {/* Comprehension Test Modal/Popup - Outside Left Panel, inside parent flex container */}
          {showComprehensionTest && (() => {
              // Get comprehension_questions EXACTLY like we do with next_choices
              // No extra parsing, no filtering - just use what's in the segment
              const questions = currentSegment?.comprehension_questions;
              
              // DEBUG: Check if questions are actually choices
              const firstQuestion = Array.isArray(questions) && questions.length > 0 ? questions[0] : null;
              const hasQuestionField = firstQuestion && ('question' in firstQuestion || 'text' in firstQuestion);
              const hasOptionsField = firstQuestion && ('options' in firstQuestion || 'choices' in firstQuestion);
              const looksLikeChoice = firstQuestion && ('description' in firstQuestion || 'label' in firstQuestion);
              
              // SAFETY CHECK: If questions look like choices (have description/label but no question field), don't render them
              if (Array.isArray(questions) && questions.length > 0 && looksLikeChoice && !hasQuestionField) {
                return null;
                }
              
              // Same check as next_choices: if it exists and has items, show it
              if (focusMode || !questions || !Array.isArray(questions) || questions.length === 0) {
                return null;
              }
              
              return (
                <>
                  {/* Modal Overlay - Boven ALLE elementen - Hoogste z-index */}
                  <div
                    onClick={(e) => {
                      // Sluit alleen als je op de overlay klikt (niet op de modal content)
                      if (e.target === e.currentTarget) {
                        setShowComprehensionTest(false);
                      }
                    }}
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(8px)',
                      zIndex: 999999,
                      paddingTop: '10rem',
                      paddingBottom: '4rem',
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  >
                    {/* Modal Content - Compact, no scrolling */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="relative w-full max-w-2xl flex flex-col rounded-3xl"
                style={{
                  background: BOOK_COLORS.warmWhite,
                        border: `3px solid ${BOOK_COLORS.borderLight}`,
                        boxShadow: `0 12px 40px rgba(0, 0, 0, 0.3)`,
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 14rem)',
                        zIndex: 1000000,
                        position: 'relative',
                      }}
                    >
                      {/* Close Button - Altijd sluitbaar - Neon K-pop stijl - Klein en in hoek */}
                      <button
                        onClick={() => {
                          setShowComprehensionTest(false);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        style={{
                          zIndex: 1000001,
                          background: 'transparent',
                          border: `1.5px solid ${KPOP_COLORS.neonPink}`,
                          color: KPOP_COLORS.neonPink,
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: `0 0 8px ${KPOP_COLORS.neonPink}66, 0 0 16px ${KPOP_COLORS.neonPink}44`,
                          padding: 0,
                          minWidth: 'auto',
                          minHeight: 'auto',
                          position: 'absolute',
                          pointerEvents: 'auto',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 12px ${KPOP_COLORS.neonPink}, 0 0 24px ${KPOP_COLORS.neonPink}66`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 8px ${KPOP_COLORS.neonPink}66, 0 0 16px ${KPOP_COLORS.neonPink}44`;
                        }}
                        title="Sluiten"
                      >
                        ✕
                      </button>

                      {/* Decorative top border */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: `linear-gradient(90deg, ${BOOK_COLORS.accentBlue} 0%, ${BOOK_COLORS.accentPurple} 50%, ${BOOK_COLORS.accentBlue} 100%)`,
                        borderRadius: '20px 20px 0 0',
                      }} />

                      {/* Content - No scrolling, compact */}
                      <div
                        className="flex-1 px-6 py-5 relative"
                        style={{
                          overflow: 'visible',
                          zIndex: 10001,
                          position: 'relative',
                          pointerEvents: 'auto',
                }}
              >
              <h3 
                className="text-xl font-bold mb-4 text-center relative"
                style={{
                            color: BOOK_COLORS.textDark,
                            fontFamily: "'Comfortaa', sans-serif",
                  fontWeight: 700,
                            marginTop: '8px',
                            marginRight: '2.5rem',
                            zIndex: 20,
                            position: 'relative',
                }}
              >
                          📚 Test je begrip ({currentQuestionIndex + 1}/{questions.length})
              </h3>
              
              {/* Avatar with Text Bubble - IN THE MODAL */}
              {showAvatarBubbleInTestModal && avatarMessage && avatarMessageType === 'testPrompt' && currentProfile?.avatarCustomization && (
                <div 
                  className="flex flex-row items-center justify-center gap-3 mb-4"
                  style={{
                    zIndex: 10002,
                    position: 'relative',
                    pointerEvents: 'auto',
                  }}
                >
                  {/* Talking Avatar */}
                  <div 
                    className="relative"
                    style={{
                      width: detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '80px' : '60px',
                      height: detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '80px' : '60px',
                      backgroundColor: 'transparent',
                      flexShrink: 0,
                    }}
                  >
                    <AvatarVideo
                      customization={currentProfile.avatarCustomization}
                      context="talking"
                      autoplay
                      loop
                      muted
                      className="w-full h-full"
                    />
                  </div>
                  
                  {/* Text Bubble */}
                  <div
                    className="relative px-4 py-2 rounded-xl shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                      border: `2px solid ${KPOP_COLORS.neonPink}44`,
                      boxShadow: `
                        0 0 15px ${KPOP_COLORS.neonPink}44,
                        0 0 30px ${KPOP_COLORS.neonPurple}33,
                        inset 0 0 15px ${KPOP_COLORS.neonPink}22
                      `,
                      maxWidth: '300px',
                      minWidth: '150px',
                      zIndex: 10003,
                      position: 'relative',
                      pointerEvents: 'auto',
                      opacity: showAvatarBubbleInTestModal ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <p
                      style={{
                        color: KPOP_COLORS.neonPink,
                        fontFamily: "'Comfortaa', sans-serif",
                        fontSize: '14px',
                        fontWeight: 600,
                        lineHeight: '1.4',
                        margin: 0,
                        textShadow: `0 0 8px ${KPOP_COLORS.neonPink}44`,
                      }}
                    >
                      {avatarMessage}
                    </p>
                    {/* Arrow pointing left */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: `10px solid ${KPOP_COLORS.darkBgSecondary}`,
                        filter: `drop-shadow(-2px 0 4px ${KPOP_COLORS.neonPink}44)`,
                      }}
                    />
                  </div>
                </div>
              )}
              
                    {/* Show one question at a time OR all results */}
                    {!showComprehensionResults ? (
                      (() => {
                        const question = questions[currentQuestionIndex];
                        const userAnswer = comprehensionAnswers[currentQuestionIndex];
                        const isLastQuestion = currentQuestionIndex === questions.length - 1;
                        const isFirstQuestion = currentQuestionIndex === 0;
                        const hasAnswered = userAnswer !== undefined;
                    
                      return (
                          <div key={currentQuestionIndex} className="w-full relative" style={{ zIndex: 20, position: 'relative' }}>
                            {/* Single Question - Compact */}
                        <div 
                              className="mb-4 p-4 rounded-xl relative"
                          style={{
                                background: BOOK_COLORS.warmWhite,
                                border: `2px solid ${BOOK_COLORS.borderLight}`,
                                boxShadow: `0 2px 8px ${BOOK_COLORS.shadowLight}`,
                                zIndex: 20,
                                position: 'relative',
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                marginBottom: '12px',
                                position: 'relative',
                                zIndex: 20,
                              }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: BOOK_COLORS.accentBlue,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: BOOK_COLORS.warmWhite,
                                  fontFamily: "'Comfortaa', sans-serif",
                                  fontWeight: 700,
                                  fontSize: '16px',
                                  flexShrink: 0,
                                  position: 'relative',
                                  zIndex: 20,
                                }}>
                                  {currentQuestionIndex + 1}
                                </div>
                          <p 
                                  className="font-bold relative"
                            style={{
                              color: BOOK_COLORS.textDark,
                                    fontFamily: "'Comfortaa', sans-serif",
                              fontSize: '16px',
                              lineHeight: '1.5',
                                    margin: 0,
                                    flex: 1,
                                    zIndex: 20,
                                    position: 'relative',
                            }}
                          >
                                  {question.question}
                          </p>
                              </div>
                          
                          <div className="flex flex-col gap-2">
                            {question.options.map((option: string, oIndex: number) => {
                              const isSelected = userAnswer === oIndex;
                              
                              return (
                                <label
                                  key={oIndex}
                                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                                  style={{
                                        background: isSelected ? BOOK_COLORS.skyBlue : BOOK_COLORS.warmWhite,
                                        border: `2px solid ${isSelected ? BOOK_COLORS.accentBlue : BOOK_COLORS.borderLight}`,
                                        cursor: 'pointer',
                                  }}
                                  onMouseEnter={(e) => {
                                        if (!isSelected) {
                                          e.currentTarget.style.background = BOOK_COLORS.cream;
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                        if (!isSelected) {
                                          e.currentTarget.style.background = BOOK_COLORS.warmWhite;
                                        }
                                      }}
                                    >
                                      <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        border: `2px solid ${isSelected ? BOOK_COLORS.accentBlue : BOOK_COLORS.borderLight}`,
                                        background: isSelected ? BOOK_COLORS.accentBlue : BOOK_COLORS.warmWhite,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}>
                                        {isSelected && (
                                          <span style={{
                                            color: BOOK_COLORS.warmWhite,
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                          }}>
                                            •
                                          </span>
                                        )}
                                      </div>
                                  <input
                                    type="radio"
                                    name={`question-${currentQuestionIndex}`}
                                    value={oIndex}
                                    checked={isSelected}
                                    onChange={() => {
                                        setComprehensionAnswers({
                                          ...comprehensionAnswers,
                                        [currentQuestionIndex]: oIndex,
                                        });
                                    }}
                                    style={{
                                      position: 'absolute',
                                      opacity: 0,
                                      pointerEvents: 'none',
                                    }}
                                  />
                                  <span
                                    style={{
                                      color: BOOK_COLORS.textDark,
                                          fontFamily: "'Comfortaa', sans-serif",
                                      fontSize: '14px',
                                      lineHeight: '1.5',
                                      flex: 1,
                                          fontWeight: isSelected ? 600 : 400,
                                    }}
                                  >
                                    {option}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                            
                            {/* Navigation Buttons - Duidelijk zichtbaar */}
                            <div className="flex flex-row gap-3 justify-center mt-4" style={{ position: 'relative', zIndex: 1000002, pointerEvents: 'auto' }}>
                              {!isFirstQuestion && (
                                <button
                                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                  className="px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 relative"
                                  style={{
                                    background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                                    border: `2px solid ${KPOP_COLORS.neonCyan}`,
                                    color: KPOP_COLORS.neonCyan,
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    zIndex: 1000002,
                                    minWidth: 'auto',
                                    minHeight: 'auto',
                                    boxShadow: `0 0 10px ${KPOP_COLORS.neonCyan}66, 0 0 20px ${KPOP_COLORS.neonCyan}44`,
                                    textShadow: `0 0 8px ${KPOP_COLORS.neonCyan}66`,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 0 15px ${KPOP_COLORS.neonCyan}, 0 0 30px ${KPOP_COLORS.neonCyan}66`;
                                    e.currentTarget.style.textShadow = `0 0 12px ${KPOP_COLORS.neonCyan}`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = `0 0 10px ${KPOP_COLORS.neonCyan}66, 0 0 20px ${KPOP_COLORS.neonCyan}44`;
                                    e.currentTarget.style.textShadow = `0 0 8px ${KPOP_COLORS.neonCyan}66`;
                                  }}
                                >
                                  ← Vorige
                                </button>
                              )}
                              
                              {!isLastQuestion ? (
                      <button
                        onClick={() => {
                                    if (hasAnswered) {
                                      setCurrentQuestionIndex(prev => prev + 1);
                                    } else {
                                      alert('Kies eerst een antwoord! 😊');
                                    }
                                  }}
                                  disabled={!hasAnswered}
                                  className="px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative"
                                  style={{
                                    background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                                    border: `2px solid ${hasAnswered ? KPOP_COLORS.neonPurple : KPOP_COLORS.neonPurple}66`,
                                    color: hasAnswered ? KPOP_COLORS.neonPurple : `${KPOP_COLORS.neonPurple}66`,
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: 700,
                                    cursor: hasAnswered ? 'pointer' : 'not-allowed',
                                    zIndex: 1000002,
                                    minWidth: 'auto',
                                    minHeight: 'auto',
                                    boxShadow: hasAnswered ? `0 0 10px ${KPOP_COLORS.neonPurple}66, 0 0 20px ${KPOP_COLORS.neonPurple}44` : 'none',
                                    textShadow: hasAnswered ? `0 0 8px ${KPOP_COLORS.neonPurple}66` : 'none',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (hasAnswered) {
                                      e.currentTarget.style.boxShadow = `0 0 15px ${KPOP_COLORS.neonPurple}, 0 0 30px ${KPOP_COLORS.neonPurple}66`;
                                      e.currentTarget.style.textShadow = `0 0 12px ${KPOP_COLORS.neonPurple}`;
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (hasAnswered) {
                                      e.currentTarget.style.boxShadow = `0 0 10px ${KPOP_COLORS.neonPurple}66, 0 0 20px ${KPOP_COLORS.neonPurple}44`;
                                      e.currentTarget.style.textShadow = `0 0 8px ${KPOP_COLORS.neonPurple}66`;
                                    }
                                  }}
                                >
                                  Volgende →
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    if (hasAnswered) {
                          const allAnswered = questions.every((_, qIndex) => 
                            comprehensionAnswers[qIndex] !== undefined
                          );
                          
                          if (allAnswered) {
                            setShowComprehensionResults(true);
                                        const currentAttempts = comprehensionAttempts[currentSegmentIndex] || 0;
                                        setComprehensionAttempts({
                                          ...comprehensionAttempts,
                                          [currentSegmentIndex]: currentAttempts + 1
                                        });
                                        // Mark test as completed for this segment
                                        setTestCompletedForSegment({
                                          ...testCompletedForSegment,
                                          [currentSegmentIndex]: true,
                                        });
                                        // Avatar message will be shown via useEffect
                                        
                                        // Save results to backend
                                        try {
                                          const correctCount = questions.filter((q, qIndex) => 
                                            comprehensionAnswers[qIndex] === q.correct_answer
                                          ).length;
                                          
                                          // Transform data to match backend schema
                                          const questionsData = questions.map((q, qIndex) => ({
                                            question: q.question,
                                            options: q.options,
                                            userAnswerIndex: comprehensionAnswers[qIndex],
                                            correctAnswerIndex: q.correct_answer,
                                            isCorrect: comprehensionAnswers[qIndex] === q.correct_answer,
                                          }));
                                          
                                          // Validate all required fields before saving
                                          const childName = currentProfile?.displayName || currentProfile?.name;
                                          if (!currentSession.session_id || !childName || !questionsData || questionsData.length === 0) {
                                            console.error('Missing required fields for comprehension results:', {
                                              session_id: currentSession.session_id,
                                              child_name: childName,
                                              questions: questionsData,
                                            });
                                            return;
                                          }
                                          
                                          await storyAPI.saveComprehensionResults({
                                            session_id: currentSession.session_id,
                                            segment_sequence: currentSegment?.sequence || currentSegmentIndex + 1,
                                            child_name: childName,
                                            child_profile_id: currentProfile?.id, // Include child profile ID if available
                                            questions: questionsData,
                                            correct_answers: correctCount,
                                            total_questions: questions.length,
                                          });
                                        } catch (error) {
                                          console.error('Error saving comprehension results:', error);
                                          // Don't show error to user, just log it
                                        }
                          } else {
                            alert('Beantwoord eerst alle vragen! 😊');
                                      }
                                    } else {
                                      alert('Kies eerst een antwoord! 😊');
                          }
                        }}
                                  disabled={!hasAnswered}
                                  className="px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative"
                        style={{
                                    background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                                    border: `2px solid ${hasAnswered ? KPOP_COLORS.neonPink : KPOP_COLORS.neonPink}66`,
                                    color: hasAnswered ? KPOP_COLORS.neonPink : `${KPOP_COLORS.neonPink}66`,
                                    fontFamily: "'Poppins', sans-serif",
                          fontWeight: 700,
                                    cursor: hasAnswered ? 'pointer' : 'not-allowed',
                                    zIndex: 1000002,
                                    minWidth: 'auto',
                                    minHeight: 'auto',
                                    boxShadow: hasAnswered ? `0 0 10px ${KPOP_COLORS.neonPink}66, 0 0 20px ${KPOP_COLORS.neonPink}44` : 'none',
                                    textShadow: hasAnswered ? `0 0 8px ${KPOP_COLORS.neonPink}66` : 'none',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (hasAnswered) {
                                      e.currentTarget.style.boxShadow = `0 0 15px ${KPOP_COLORS.neonPink}, 0 0 30px ${KPOP_COLORS.neonPink}66`;
                                      e.currentTarget.style.textShadow = `0 0 12px ${KPOP_COLORS.neonPink}`;
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (hasAnswered) {
                                      e.currentTarget.style.boxShadow = `0 0 10px ${KPOP_COLORS.neonPink}66, 0 0 20px ${KPOP_COLORS.neonPink}44`;
                                      e.currentTarget.style.textShadow = `0 0 8px ${KPOP_COLORS.neonPink}66`;
                                    }
                        }}
                      >
                                  ✓ Check
                      </button>
                    )}
                            </div>
                      </div>
                    );
                  })()
                    ) : (
                      // Show all results with avatar - Compact, no scrolling needed
                      (() => {
                        const correctCount = questions.filter((q, qIndex) => 
                          comprehensionAnswers[qIndex] === q.correct_answer
                        ).length;
                        const total = questions.length;
                        const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
                        const currentAttempts = comprehensionAttempts[currentSegmentIndex] || 0;
                        const maxAttempts = 2;
                        const canRetry = percentage < 100 && currentAttempts < maxAttempts;
                        const hasReachedMaxAttempts = currentAttempts >= maxAttempts;

                        // Get positive message based on score
                        const getPositiveMessage = () => {
                          if (correctCount === total && total > 0) {
                            return 'Geweldig! Alle vragen goed!';
                          } else if (correctCount > 0) {
                            return `Goed gedaan! Je had er ${correctCount} goed!`;
                          } else {
                            return 'Dat was lastig! Probeer het nog eens!';
                          }
                        };
                        
                        return (
                          <div className="w-full" ref={resultsContainerRef} style={{ position: 'relative' }}>
                            {/* Compact Results with Avatar - Side by side, centered */}
                            <div className="flex flex-row items-center justify-center gap-4 mb-3">
                              {/* Avatar - Compact */}
                              {currentProfile?.avatarCustomization && (
                                <div 
                                  className="flex items-center justify-center flex-shrink-0" 
                                  style={{ 
                                    width: currentProfile.avatarCustomization.avatarId === 'stitch' || currentProfile.avatarCustomization.avatarId === 'spiderman' ? '120px' : '100px',
                                    height: currentProfile.avatarCustomization.avatarId === 'stitch' || currentProfile.avatarCustomization.avatarId === 'spiderman' ? '120px' : '100px',
                                    padding: currentProfile.avatarCustomization.avatarId === 'stitch' || currentProfile.avatarCustomization.avatarId === 'spiderman' ? '10px' : '8px',
                                    overflow: 'visible',
                                  }}
                                >
                                  <img
                                    src={getAvatarPath(
                                      currentProfile.avatarCustomization.avatarId, 
                                      'welldone'
                                    )}
                                    alt="Avatar Bravo"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'contain',
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* Results with Stars - Compact */}
                              <div 
                                className="flex-1 p-3 rounded-xl text-center"
                                style={{
                                  background: BOOK_COLORS.warmWhite,
                                  border: `2px solid ${BOOK_COLORS.borderLight}`,
                                }}
                              >
                                {/* Stars Row */}
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  {Array.from({ length: total }).map((_, index) => {
                                    const isFilled = index < correctCount;
                                    return (
                                      <div
                                        key={index}
                                        className="relative"
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        {isFilled ? (
                                          <div style={{ animation: 'starRotateRight 2s linear infinite' }}>
                                            <NeonIconButton 
                                              type="star" 
                                              size="md" 
                                              color="yellow" 
                                              style={{ width: '32px', height: '32px' }} 
                                            />
                                          </div>
                                        ) : (
                                          <div style={{ opacity: 0.3 }}>
                                            <NeonIconButton 
                                              type="star" 
                                              size="md" 
                                              color="yellow" 
                                              style={{ width: '32px', height: '32px' }} 
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Positive Message */}
                        <p style={{
                          color: BOOK_COLORS.textDark,
                          fontFamily: "'Comfortaa', sans-serif",
                                  fontSize: '15px',
                          fontWeight: 700,
                                  lineHeight: '1.4',
                                  margin: 0,
                        }}>
                                  {getPositiveMessage()}
                                </p>
                                {hasReachedMaxAttempts && (
                                  <p style={{
                                    color: BOOK_COLORS.textDark,
                                    fontFamily: "'Comfortaa', sans-serif",
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    lineHeight: '1.3',
                                    margin: '6px 0 0 0',
                                    fontStyle: 'italic',
                                  }}>
                                    Beste: {correctCount}/{total}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Compact Summary - Simple list */}
                            <div className="space-y-2 mb-3">
                              {questions.map((question, qIndex) => {
                                const userAnswer = comprehensionAnswers[qIndex];
                                const isCorrect = userAnswer === question.correct_answer;
                                
                                return (
                                  <div 
                                    key={qIndex}
                                    className="p-2 rounded-lg"
                                    style={{
                                      background: isCorrect ? BOOK_COLORS.lightGreen : BOOK_COLORS.softPink,
                                      border: `1px solid ${isCorrect ? BOOK_COLORS.accentGreen : BOOK_COLORS.accentOrange}`,
                                    }}
                                  >
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: '6px',
                                    }}>
                                      <span style={{
                                        fontSize: '14px',
                                        flexShrink: 0,
                                      }}>
                                        {isCorrect ? '✓' : '✗'}
                                      </span>
                                      <div style={{ flex: 1 }}>
                                        <p style={{
                                          color: BOOK_COLORS.textDark,
                                          fontFamily: "'Comfortaa', sans-serif",
                                          fontSize: '12px',
                                          lineHeight: '1.3',
                                          margin: 0,
                                          fontWeight: 600,
                                        }}>
                                          {question.question}
                                        </p>
                                        <p style={{
                                          color: BOOK_COLORS.textDark,
                                          fontFamily: "'Comfortaa', sans-serif",
                                          fontSize: '11px',
                                          margin: '2px 0 0 0',
                                          opacity: 0.8,
                                        }}>
                                          {question.options[userAnswer] || 'Geen antwoord'}
                        </p>
                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Single Retry Button - Neon Style */}
                            {canRetry && (
                              <button
                                onClick={() => {
                                  setComprehensionAnswers({});
                                  setShowComprehensionResults(false);
                                  setCurrentQuestionIndex(0);
                                  setComprehensionAttempts({
                                    ...comprehensionAttempts,
                                    [currentSegmentIndex]: currentAttempts + 1
                                  });
                                }}
                                className="w-full px-4 py-2 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                                style={{
                                  background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                                  border: `3px solid ${KPOP_COLORS.neonCyan}`,
                                  boxShadow: `0 0 15px ${KPOP_COLORS.neonCyan}66, 0 0 30px ${KPOP_COLORS.neonCyan}44`,
                                  color: KPOP_COLORS.neonCyan,
                                  fontFamily: "'Orbitron', sans-serif",
                                  fontWeight: 900,
                                  letterSpacing: '0.1em',
                                  textShadow: `0 0 8px ${KPOP_COLORS.neonCyan}, 0 0 16px ${KPOP_COLORS.neonCyan}66`,
                                  cursor: 'pointer',
                                  minWidth: 'auto',
                                  minHeight: 'auto',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.boxShadow = `0 0 20px ${KPOP_COLORS.neonCyan}, 0 0 40px ${KPOP_COLORS.neonCyan}66`;
                                  e.currentTarget.style.textShadow = `0 0 12px ${KPOP_COLORS.neonCyan}, 0 0 24px ${KPOP_COLORS.neonCyan}66`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.boxShadow = `0 0 15px ${KPOP_COLORS.neonCyan}66, 0 0 30px ${KPOP_COLORS.neonCyan}44`;
                                  e.currentTarget.style.textShadow = `0 0 8px ${KPOP_COLORS.neonCyan}, 0 0 16px ${KPOP_COLORS.neonCyan}66`;
                                }}
                              >
                                🔄 Opnieuw ({currentAttempts + 1}/{maxAttempts})
                              </button>
                    )}
            </div>
                        );
                      })()
                    )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          {/* Comprehension Test Modal closing - above */}


          {/* Right Panel - Choices (Book Page) */}
        <div 
          className="w-96 flex flex-col rounded-3xl"
          style={{
            background: BOOK_COLORS.warmWhite,
            border: `4px solid ${BOOK_COLORS.borderLight}`,
            boxShadow: `0 8px 24px ${BOOK_COLORS.shadowLight}, inset 0 0 0 1px ${BOOK_COLORS.borderLight}`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'visible',
            padding: '12px',
            paddingBottom: '3.5rem',
            marginBottom: 0,
            justifyContent: 'flex-start',
            position: 'relative',
            alignSelf: 'stretch',
          }}
        >
          {(() => {
            const hasChoices = currentSegment?.next_choices && Array.isArray(currentSegment.next_choices) && currentSegment.next_choices.length > 0;
            const isStoryCompleted = currentSession.completed;
            const isLastSegment = currentSegmentIndex === currentSession.story_segments.length - 1;
            // Also check if this is the last segment and story has no more choices (ended naturally)
            // OR if the last segment has is_ending flag or no next_choices
            const lastSegment = currentSession.story_segments[currentSession.story_segments.length - 1];
            const isStoryEnded = isStoryCompleted || 
              (isLastSegment && (!hasChoices || currentSegment?.next_choices === null || lastSegment?.next_choices === null));
            
            console.log('🔍 Avatar visibility check:', {
              isStoryCompleted,
              isLastSegment,
              hasChoices,
              isStoryEnded,
              currentSegmentIndex,
              totalSegments: currentSession.story_segments.length,
              lastSegmentHasChoices: lastSegment?.next_choices && Array.isArray(lastSegment.next_choices) && lastSegment.next_choices.length > 0
            });
            
            // If story is completed OR ended, show only large avatar (no white box, no choices)
            if (isStoryEnded) {
              const avatarId = currentProfile?.avatarCustomization 
                ? detectAvatarId(currentProfile.avatarCustomization) 
                : 'avatar1';
              const isLargeAvatar = avatarId === 'stitch' || avatarId === 'spiderman';
              
              console.log('✅ Showing avatar for completed story:', { avatarId, isLargeAvatar });
              
              return (
                <div className="flex-1 flex items-center justify-center" style={{ 
                  minHeight: '500px',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div 
                    className="flex flex-col items-center justify-center" 
                    style={{ 
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Test Reminder Message - Above Avatar on Last Segment */}
                    {(() => {
                      const lastSegmentIndex = currentSession.story_segments.length - 1;
                      const lastSegment = currentSession.story_segments[lastSegmentIndex];
                      const hasTestQuestions = lastSegment?.comprehension_questions && 
                                             Array.isArray(lastSegment.comprehension_questions) && 
                                             lastSegment.comprehension_questions.length > 0;
                      const isTestCompleted = testCompletedForSegment[lastSegmentIndex] || false;
                      const isCurrentlyLastSegment = currentSegmentIndex === lastSegmentIndex;
                      
                      // Show reminder if: on last segment OR story is completed, has test questions, and test is not completed
                      return (isCurrentlyLastSegment || currentSession.completed) && 
                             hasTestQuestions && 
                             !isTestCompleted && (
                        <div className="mb-4 px-4 py-3 rounded-lg text-center" style={{
                          background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
                          border: '2px solid #ffc107',
                          boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                          maxWidth: 'min(400px, calc(100vw - 40px))',
                        }}>
                          <p className="text-base font-bold" style={{
                            color: '#856404',
                            fontFamily: "'Comfortaa', sans-serif",
                          }}>
                            ⚠️ Vergeet niet je test nog te doen!
                          </p>
                        </div>
                      );
                    })()}
                    
                    {/* Text Bubble Above Avatar */}
                    {showAvatarBubbleAboveLargeAvatar && avatarMessage && avatarMessageType === 'completion' && (
                      <div 
                        className="mb-4 px-4 py-3 rounded-xl shadow-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                          border: `2px solid ${KPOP_COLORS.neonPink}44`,
                          boxShadow: `0 0 20px ${KPOP_COLORS.neonPink}66, 0 8px 24px rgba(0, 0, 0, 0.4)`,
                          maxWidth: 'min(400px, calc(100vw - 40px))',
                          zIndex: 1000,
                          position: 'relative',
                          opacity: showAvatarBubbleAboveLargeAvatar ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '16px',
                            fontWeight: 600,
                            lineHeight: '1.4',
                            margin: 0,
                            color: KPOP_COLORS.neonCyan,
                            textShadow: `0 0 10px ${KPOP_COLORS.neonCyan}44`,
                          }}
                        >
                          {avatarMessage}
                        </p>
                        {/* Arrow pointing down */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderTop: `10px solid ${KPOP_COLORS.darkBgSecondary}`,
                            filter: `drop-shadow(0 2px 4px ${KPOP_COLORS.neonPink}44)`,
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Large Avatar */}
                    <div 
                      className="flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95" 
                      onClick={() => {
                        // Cancel existing timeout if user clicks again
                        if (completionBubbleTimeoutRef.current) {
                          clearTimeout(completionBubbleTimeoutRef.current);
                          completionBubbleTimeoutRef.current = null;
                        }
                        
                        // Show completion message above the large avatar
                        const message = getRandomAvatarMessage('completion');
                        setAvatarMessage(message);
                        setAvatarMessageType('completion');
                        setShowAvatarBubbleAboveLargeAvatar(true);
                        
                        // Keep bubble visible for 20 seconds (longer duration)
                        completionBubbleTimeoutRef.current = setTimeout(() => {
                          setShowAvatarBubbleAboveLargeAvatar(false);
                          setTimeout(() => {
                            setAvatarMessage(null);
                            setAvatarMessageType(null);
                          }, 300);
                          completionBubbleTimeoutRef.current = null;
                        }, 20000);
                      }}
                      style={{ 
                        height: isLargeAvatar ? '300px' : '280px', // Much larger avatar
                        flexShrink: 0,
                        padding: isLargeAvatar ? '20px' : '18px',
                        overflow: 'visible',
                        minHeight: isLargeAvatar ? '300px' : '280px',
                        position: 'relative',
                        zIndex: 10,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        ref={avatarRef}
                        src={getAvatarPath(avatarId || 'avatar1', 'welldone')}
                        alt="Avatar"
                        style={{
                          height: '100%',
                          width: 'auto',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          filter: `drop-shadow(0 8px 16px ${BOOK_COLORS.shadowLight})`,
                          cursor: 'pointer',
                        }}
                        onError={(e) => {
                          // Fallback chain: welldone -> cat -> default
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('cat')) {
                            target.src = getAvatarPath(avatarId || 'avatar1', 'cat');
                          } else {
                            target.src = '/avatar1/avatar1cat-unscreen.gif';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            }
            
            // If there are choices, show choices + avatar
            return hasChoices ? (
            <>
              <h3 
                className="text-base font-bold mb-2 text-center"
                style={{
                  color: KPOP_COLORS.neonPurple,
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  flexShrink: 0,
                  textShadow: `0 0 10px ${KPOP_COLORS.neonPurple}, 0 0 20px ${KPOP_COLORS.neonPurple}66`,
                }}
              >
                Wat doe je nu? 🤔
              </h3>
              <div 
                ref={choicesRef} 
                className="flex flex-col gap-2"
                style={{ 
                  flexShrink: 0,
                  overflowY: 'visible',
                  flex: '0 0 auto',
                  minHeight: 0,
                  position: 'relative',
                  zIndex: 2,
                  paddingBottom: '0',
                  marginBottom: '0',
                  maxHeight: 'none',
                }}
              >
                {currentSegment.next_choices.map((choice, index) => {
                  // Handle different choice formats: object with label/description, or just string
                  let choiceLabel = '';
                  let choiceDescription = '';
                  
                  if (typeof choice === 'string') {
                    // If choice is a string, use it as description and generate label
                    choiceLabel = String.fromCharCode(65 + index); // A, B, C
                    choiceDescription = choice;
                  } else if (choice && typeof choice === 'object') {
                    // If choice is an object, extract label and description
                    choiceLabel = choice.label || String.fromCharCode(65 + index);
                    choiceDescription = choice.description || (typeof choice === 'string' ? choice : '');
                  }
                  
                  const colors = [
                    { bg: BOOK_COLORS.skyBlue, border: BOOK_COLORS.accentBlue, text: BOOK_COLORS.textDark },
                    { bg: BOOK_COLORS.lavender, border: BOOK_COLORS.accentPurple, text: BOOK_COLORS.textDark },
                    { bg: BOOK_COLORS.softYellow, border: BOOK_COLORS.accentOrange, text: BOOK_COLORS.textDark },
                    { bg: BOOK_COLORS.lightGreen, border: BOOK_COLORS.accentGreen, text: BOOK_COLORS.textDark },
                  ];
                  const choiceColor = colors[index % 4];
                  
                  // Check if this is the "End Story" option (Option D)
                  const isEndStoryOption = choiceLabel === 'D' || 
                    (typeof choiceDescription === 'string' && (
                      choiceDescription.toLowerCase().includes('beëindig') || 
                      choiceDescription.toLowerCase().includes('eindig') ||
                      choiceDescription.toLowerCase().includes('end the story')
                    ));
                  
                  // Check if test is required and completed
                  const questions = currentSegment?.comprehension_questions;
                  const hasQuestions = !focusMode && questions && Array.isArray(questions) && questions.length > 0;
                  const isTestRequired = hasQuestions;
                  const isTestCompleted = testCompletedForSegment[currentSegmentIndex] || false;
                  const isChoiceDisabled = isLoading || currentSession.completed || (isTestRequired && !isTestCompleted);
                  
                  return (
                    <button
                      key={`choice-${index}-${choiceLabel}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // If test is required but not completed, show avatar bubble to guide the child
                        if (isTestRequired && !isTestCompleted) {
                          const message = getRandomAvatarMessage('testPrompt');
                          setAvatarMessage(message);
                          setAvatarMessageType('testPrompt');
                          setShowAvatarBubbleNextToTest(true);
                          // Auto-hide after 20 seconds (longer so child can read it)
                          setTimeout(() => {
                            setShowAvatarBubbleNextToTest(false);
                            setTimeout(() => {
                              setAvatarMessage(null);
                              setAvatarMessageType(null);
                            }, 300);
                          }, 20000);
                          // DON'T open the test modal automatically - let child click "TEST JE BEGRIP" button
                          return;
                        }
                        
                        // If this is the "End Story" option, use handleEndStory
                        if (isEndStoryOption) {
                          handleEndStory();
                          return;
                        }
                        
                        // Otherwise, use normal handleChoice
                        // Create choice object if it's a string
                        const choiceObj = typeof choice === 'string' 
                          ? { label: choiceLabel, description: choice }
                          : choice;
                        handleChoice(choiceObj);
                      }}
                      disabled={isLoading || currentSession.completed}
                      style={{
                        background: isChoiceDisabled ? BOOK_COLORS.borderLight : choiceColor.bg,
                        border: `3px solid ${isChoiceDisabled ? BOOK_COLORS.borderLight : choiceColor.border}`,
                        boxShadow: `0 4px 12px ${BOOK_COLORS.shadowLight}`,
                        cursor: isChoiceDisabled ? 'not-allowed' : 'pointer',
                        minHeight: '60px',
                        padding: '10px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        textAlign: 'left',
                        transition: 'all 0.3s',
                        flexShrink: 0,
                        opacity: isChoiceDisabled ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isChoiceDisabled) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 6px 16px ${BOOK_COLORS.shadowLight}`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${BOOK_COLORS.shadowLight}`;
                      }}
                      title={isTestRequired && !isTestCompleted ? 'Vul eerst de begripstest in!' : ''}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div 
                          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold"
                          style={{
                            background: choiceColor.border,
                            color: BOOK_COLORS.warmWhite,
                            boxShadow: `0 2px 8px ${BOOK_COLORS.shadowLight}`,
                            fontSize: '24px',
                            fontFamily: "'Comfortaa', sans-serif",
                          }}
                        >
                          {choiceLabel}
                        </div>
                        <p 
                          className="flex-1 font-semibold leading-relaxed"
                          style={{
                            color: choiceColor.text,
                            fontFamily: "'Comfortaa', 'Baloo 2', sans-serif",
                            fontSize: '13px',
                            lineHeight: '1.4',
                          }}
                        >
                          {choiceDescription || 'Geen beschrijving'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Test Reminder Message - Above Avatar on Last Segment */}
              {isLastSegment && currentSegment?.comprehension_questions && 
               Array.isArray(currentSegment.comprehension_questions) && 
               currentSegment.comprehension_questions.length > 0 &&
               !testCompletedForSegment[currentSegmentIndex] && (
                <div className="mb-3 px-3 py-2 rounded-lg text-center" style={{
                  background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
                  border: '2px solid #ffc107',
                  boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                }}>
                  <p className="text-sm font-bold" style={{
                    color: '#856404',
                    fontFamily: "'Comfortaa', sans-serif",
                  }}>
                    ⚠️ Vergeet niet je test nog te doen!
                  </p>
                </div>
              )}
              
              {/* Avatar - Moved to bottom of choices panel, larger container for book reading - Clickable */}
              <div 
                className="flex items-center justify-center mt-4 cursor-pointer transition-transform hover:scale-105 active:scale-95" 
                onClick={() => {
                  // Check if comprehension test is completed and choices are available
                  const hasChoices = currentSegment?.next_choices && Array.isArray(currentSegment.next_choices) && currentSegment.next_choices.length > 0;
                  const isTestCompleted = testCompletedForSegment[currentSegmentIndex] || false;
                  
                  // If test is completed and choices are available, show choice prompt
                  if (showComprehensionResults && isTestCompleted && hasChoices) {
                    const message = getRandomAvatarMessage('choicePrompt');
                    setAvatarMessage(message);
                    setAvatarMessageType('choicePrompt');
                    setShowAvatarBubbleNextToTest(true);
                    setTimeout(() => {
                      setShowAvatarBubbleNextToTest(false);
                      setTimeout(() => {
                        setAvatarMessage(null);
                        setAvatarMessageType(null);
                      }, 300);
                    }, 20000); // Longer duration: 20 seconds
                  } else {
                    // Otherwise show normal reading message
                  const message = getRandomAvatarMessage('reading');
                  setAvatarMessage(message);
                  setAvatarMessageType('reading');
                  setShowAvatarBubbleNextToTest(true);
                  setTimeout(() => {
                    setShowAvatarBubbleNextToTest(false);
                    setTimeout(() => {
                      setAvatarMessage(null);
                      setAvatarMessageType(null);
                    }, 300);
                  }, 20000); // Longer duration: 20 seconds
                  }
                }}
                style={{ 
                  height: currentProfile?.avatarCustomization?.avatarId === 'stitch' || currentProfile?.avatarCustomization?.avatarId === 'spiderman' ? '160px' : '140px', 
                  flexShrink: 0,
                  padding: currentProfile?.avatarCustomization?.avatarId === 'stitch' || currentProfile?.avatarCustomization?.avatarId === 'spiderman' ? '10px' : '8px',
                  overflow: 'visible',
                  minHeight: currentProfile?.avatarCustomization?.avatarId === 'stitch' || currentProfile?.avatarCustomization?.avatarId === 'spiderman' ? '160px' : '140px',
                  position: 'relative',
                  zIndex: 10,
                  width: '100%',
                }}
              >
                <img
                  ref={avatarRef}
                  src={getAvatarPath(
                    currentProfile?.avatarCustomization?.avatarId, 
                    'book'
                  )}
                  alt="Avatar"
                  style={{
                    height: currentProfile?.avatarCustomization?.avatarId === 'stitch' || currentProfile?.avatarCustomization?.avatarId === 'spiderman' ? '100%' : '100%',
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: `drop-shadow(0 4px 8px ${BOOK_COLORS.shadowLight})`,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </>
          ) : null;
          })()}
        </div>
      </div>
      )}

      {/* Bottom Navigation - Neon style matching top navbar - Verberg wanneer modal open is */}
      {!focusMode && !showComprehensionTest && (
      <div className="flex-shrink-0 flex justify-center items-center gap-2 py-1 relative z-30" style={{ background: 'transparent', minHeight: 'auto' }}>
        <button
          onClick={handlePreviousSegment}
          disabled={currentSegmentIndex === 0}
          className="px-2 py-1 rounded-3xl font-black text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
            border: `2px solid ${currentSegmentIndex === 0 ? KPOP_COLORS.darkBgSecondary : KPOP_COLORS.neonCyan}66`,
            boxShadow: currentSegmentIndex === 0 ? 'none' : `0 0 6px ${KPOP_COLORS.neonCyan}44`,
            color: currentSegmentIndex === 0 ? KPOP_COLORS.darkBgSecondary : KPOP_COLORS.neonCyan,
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            letterSpacing: '0.08em',
            textShadow: currentSegmentIndex === 0 ? 'none' : `0 0 6px ${KPOP_COLORS.neonCyan}, 0 0 12px ${KPOP_COLORS.neonCyan}66`,
            cursor: currentSegmentIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.7rem',
            minWidth: 'auto',
            minHeight: 'auto',
          }}
        >
          ← VORIGE
        </button>
        
        <div className="px-2 py-1 rounded-3xl" style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
          border: `2px solid ${KPOP_COLORS.neonPurple}44`,
          boxShadow: `0 0 6px ${KPOP_COLORS.neonPurple}44`,
        }}>
          <span className="text-xs font-black" style={{
            color: KPOP_COLORS.neonPurple,
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            letterSpacing: '0.08em',
            textShadow: `0 0 6px ${KPOP_COLORS.neonPurple}, 0 0 12px ${KPOP_COLORS.neonPurple}66`,
            fontSize: '0.7rem',
          }}>
            {currentSegmentIndex + 1}/{currentSession.story_segments.length}
          </span>
        </div>
        
        <button
          onClick={handleNextSegment}
          disabled={currentSegmentIndex === currentSession.story_segments.length - 1}
          className="px-2 py-1 rounded-3xl font-black text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
            border: `2px solid ${currentSegmentIndex === currentSession.story_segments.length - 1 ? KPOP_COLORS.darkBgSecondary : KPOP_COLORS.neonYellow}66`,
            boxShadow: currentSegmentIndex === currentSession.story_segments.length - 1 ? 'none' : `0 0 6px ${KPOP_COLORS.neonYellow}44`,
            color: currentSegmentIndex === currentSession.story_segments.length - 1 ? KPOP_COLORS.darkBgSecondary : KPOP_COLORS.neonYellow,
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            letterSpacing: '0.08em',
            textShadow: currentSegmentIndex === currentSession.story_segments.length - 1 ? 'none' : `0 0 6px ${KPOP_COLORS.neonYellow}, 0 0 12px ${KPOP_COLORS.neonYellow}66`,
            cursor: currentSegmentIndex === currentSession.story_segments.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.7rem',
            minWidth: 'auto',
            minHeight: 'auto',
          }}
        >
          VOLGENDE →
        </button>
      </div>
      )}

      {/* Word Definition Tooltip */}
      {selectedWord && (
        <>
          {/* Backdrop to close tooltip */}
          <div
            onClick={() => setSelectedWord(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'transparent',
            }}
          />
          {/* Tooltip */}
          <div
            style={{
              position: 'fixed',
              top: selectedWord.y < (window.innerHeight / 2) ? `${selectedWord.y}px` : 'auto',
              bottom: selectedWord.y >= (window.innerHeight / 2) ? `${window.innerHeight - selectedWord.y}px` : 'auto',
              left: `${selectedWord.x}px`,
              transform: selectedWord.y < (window.innerHeight / 2) ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
              zIndex: 10000,
              background: BOOK_COLORS.warmWhite,
              border: `3px solid ${BOOK_COLORS.accentBlue}`,
              borderRadius: '16px',
              padding: '12px 16px',
              boxShadow: `0 8px 24px ${BOOK_COLORS.shadowLight}, 0 0 20px ${BOOK_COLORS.accentBlue}44`,
              maxWidth: 'min(300px, calc(100vw - 40px))',
              cursor: 'pointer',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              fontFamily: "'Comfortaa', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: BOOK_COLORS.accentBlue,
              marginBottom: '6px',
            }}>
              {selectedWord.word}
            </div>
            <div style={{
              fontFamily: "'Comfortaa', 'Baloo 2', sans-serif",
              fontSize: '12px',
              color: BOOK_COLORS.textDark,
              lineHeight: '1.5',
            }}>
              {selectedWord.definition}
            </div>
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              ...(selectedWord.y < (window.innerHeight / 2)
                ? { top: '-8px', borderBottom: `8px solid ${BOOK_COLORS.accentBlue}` }
                : { bottom: '-8px', borderTop: `8px solid ${BOOK_COLORS.accentBlue}` }
              ),
            }} />
          </div>
        </>
      )}

      {/* Error Message - Friendly style */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl max-w-md" style={{
          background: BOOK_COLORS.warmWhite,
          border: `3px solid ${BOOK_COLORS.accentOrange}`,
          boxShadow: `0 8px 24px ${BOOK_COLORS.shadowLight}`,
        }}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold" style={{ color: BOOK_COLORS.accentOrange, fontFamily: "'Comfortaa', sans-serif" }}>
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: '20px' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Story Completed Modal - Verschijnt wanneer verhaal is beëindigd */}
      {showStoryCompletedModal && (
        <div
          onClick={(e) => {
            // Sluit alleen als je op de overlay klikt (niet op de modal content)
            if (e.target === e.currentTarget) {
              setShowStoryCompletedModal(false);
            }
          }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div
            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${BOOK_COLORS.warmWhite} 0%, ${BOOK_COLORS.cream} 100%)`,
              border: `4px solid ${BOOK_COLORS.accentOrange}`,
              boxShadow: `0 0 40px ${BOOK_COLORS.accentOrange}66, 0 8px 32px rgba(0, 0, 0, 0.3)`,
              zIndex: 1000000,
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowStoryCompletedModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all hover:scale-110 active:scale-95"
              style={{
                background: BOOK_COLORS.accentOrange,
                color: BOOK_COLORS.warmWhite,
                border: `2px solid ${BOOK_COLORS.accentOrange}`,
                boxShadow: `0 0 15px ${BOOK_COLORS.accentOrange}66`,
                fontSize: '16px',
                minWidth: 'auto',
                minHeight: 'auto',
                padding: 0,
              }}
            >
              ✕
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              {/* Title */}
              <h2
                className="text-3xl font-bold mb-4"
                style={{
                  color: BOOK_COLORS.accentOrange,
                  fontFamily: "'ButterflyKids', 'Comfortaa', sans-serif",
                  fontWeight: 900,
                  textShadow: `0 0 10px ${BOOK_COLORS.accentOrange}44`,
                }}
              >
                Proficiat! Verhaal beëindigd!
              </h2>

              {/* Avatar with Text Bubble - ALWAYS visible when modal is open */}
              <div className="mb-4 flex flex-row items-center justify-center gap-4">
                {/* Avatar - ALWAYS visible, use direct img tag for reliability */}
                <div 
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
                  onClick={() => {
                    // Cancel existing timeout if user clicks again
                    if (completionBubbleTimeoutRef.current) {
                      clearTimeout(completionBubbleTimeoutRef.current);
                      completionBubbleTimeoutRef.current = null;
                    }
                    
                    // Check if last segment has test questions and if test is not completed
                    const lastSegment = currentSession.story_segments[currentSession.story_segments.length - 1];
                    const hasTestQuestions = lastSegment?.comprehension_questions && Array.isArray(lastSegment.comprehension_questions) && lastSegment.comprehension_questions.length > 0;
                    const lastSegmentIndex = currentSession.story_segments.length - 1;
                    const isTestCompleted = testCompletedForSegment[lastSegmentIndex] || false;
                    
                    // Show appropriate message
                    let messageType: 'completion' | 'testEncouragement' = 'completion';
                    if (hasTestQuestions && !isTestCompleted) {
                      messageType = 'testEncouragement';
                    }
                    
                    const message = getRandomAvatarMessage(messageType);
                    setAvatarMessage(message);
                    setAvatarMessageType(messageType);
                    setShowAvatarBubble(true);
                    
                    // Keep bubble visible for 15 seconds (longer duration)
                    completionBubbleTimeoutRef.current = setTimeout(() => {
                      setShowAvatarBubble(false);
                      setTimeout(() => {
                        setAvatarMessage(null);
                        setAvatarMessageType(null);
                      }, 300);
                      completionBubbleTimeoutRef.current = null;
                    }, 15000);
                  }}
                  style={{
                    width: currentProfile?.avatarCustomization 
                      ? (detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '200px' : '180px')
                      : '180px',
                    height: currentProfile?.avatarCustomization 
                      ? (detectAvatarId(currentProfile.avatarCustomization) === 'stitch' ? '200px' : '180px')
                      : '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  <img
                    src={currentProfile?.avatarCustomization 
                      ? getAvatarPath(detectAvatarId(currentProfile.avatarCustomization) || 'avatar1', 'welldone')
                      : getAvatarPath('avatar1', 'welldone')
                    }
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    onError={(e) => {
                      // Fallback chain: welldone -> cat -> default
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('cat')) {
                        target.src = getAvatarPath(
                          currentProfile?.avatarCustomization 
                            ? (detectAvatarId(currentProfile.avatarCustomization) || 'avatar1')
                            : 'avatar1',
                          'cat'
                        );
                      } else {
                        target.src = '/avatar1/avatar1cat-unscreen.gif';
                      }
                    }}
                  />
                </div>
                
                {/* Avatar Message Bubble - Shows automatically and stays for 10 seconds */}
                {showAvatarBubble && avatarMessage && (avatarMessageType === 'completion' || avatarMessageType === 'testEncouragement') && (
                  <div
                    className="relative px-4 py-2 rounded-xl shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                      border: `2px solid ${KPOP_COLORS.neonPink}44`,
                      boxShadow: `
                        0 0 15px ${KPOP_COLORS.neonPink}44,
                        0 0 30px ${KPOP_COLORS.neonPurple}33,
                        inset 0 0 15px ${KPOP_COLORS.neonPink}22
                      `,
                      cursor: 'pointer',
                      maxWidth: '300px',
                      minWidth: '150px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      zIndex: 1001,
                      position: 'relative',
                      pointerEvents: 'auto',
                      opacity: showAvatarBubble ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <p
                      style={{
                        color: KPOP_COLORS.neonPink,
                        fontFamily: "'Comfortaa', sans-serif",
                        fontSize: '14px',
                        fontWeight: 600,
                        lineHeight: '1.4',
                        margin: 0,
                        textShadow: `0 0 8px ${KPOP_COLORS.neonPink}66`,
                      }}
                    >
                      {avatarMessage}
                    </p>
                  </div>
                )}
              </div>
              
              <p
                className="text-base mb-2"
                style={{
                  color: BOOK_COLORS.textMedium,
                  fontFamily: "'Comfortaa', sans-serif",
                }}
              >
                Je verhaal is automatisch opgeslagen voor je ouders en leraren om te bekijken!
              </p>

              {/* Check if last segment has test questions and if test is not completed */}
              {(() => {
                const lastSegment = currentSession.story_segments[currentSession.story_segments.length - 1];
                const hasTestQuestions = lastSegment?.comprehension_questions && Array.isArray(lastSegment.comprehension_questions) && lastSegment.comprehension_questions.length > 0;
                const lastSegmentIndex = currentSession.story_segments.length - 1;
                const isTestCompleted = testCompletedForSegment[lastSegmentIndex] || false;
                
                if (hasTestQuestions && !isTestCompleted) {
                  return (
                    <div className="mb-6">
                      <p
                        className="text-base mb-4"
                        style={{
                          color: BOOK_COLORS.accentOrange,
                          fontFamily: "'Comfortaa', sans-serif",
                          fontWeight: 600,
                          fontStyle: 'italic',
                        }}
                      >
                        Doe nog een laatste test om te laten zien hoe goed je het verhaal begreep! 😊
                      </p>
                      <button
                        onClick={() => {
                          setShowStoryCompletedModal(false);
                          // Go to last segment and show test
                          setCurrentSegmentIndex(lastSegmentIndex);
                          setShowComprehensionTest(true);
                        }}
                        className="w-full px-6 py-3 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 mb-3"
                        style={{
                          background: BOOK_COLORS.accentOrange,
                          border: `3px solid ${BOOK_COLORS.accentOrange}`,
                          color: BOOK_COLORS.warmWhite,
                          fontFamily: "'Comfortaa', sans-serif",
                          fontWeight: 700,
                          boxShadow: `0 4px 16px ${BOOK_COLORS.accentOrange}66`,
                          minWidth: 'auto',
                          minHeight: 'auto',
                        }}
                      >
                        🎯 Doe de Test Nu!
                      </button>
                    </div>
                  );
                } else {
                  // Check if story is marked as completed but test is not done
                  const storyMarkedCompleted = currentSession.completed;
                  if (storyMarkedCompleted && !isTestCompleted && hasTestQuestions) {
                    // Story is marked completed but test is missing - encourage to complete
                    return (
                      <div className="mb-6">
                        <p
                          className="text-base mb-4 font-bold"
                          style={{
                            color: '#ff9800',
                            fontFamily: "'Comfortaa', sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          ⚠️ Je verhaal staat als voltooid, maar je laatste test ontbreekt nog!
                        </p>
                        <p
                          className="text-sm mb-4"
                          style={{
                            color: BOOK_COLORS.textMedium,
                            fontFamily: "'Comfortaa', sans-serif",
                          }}
                        >
                          Dien je laatste test in om je verhaal volledig te voltooien! 😊
                        </p>
                        <button
                          onClick={() => {
                            setShowStoryCompletedModal(false);
                            // Go to last segment and show test
                            setCurrentSegmentIndex(lastSegmentIndex);
                            setShowComprehensionTest(true);
                          }}
                          className="w-full px-6 py-3 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 mb-3"
                          style={{
                            background: BOOK_COLORS.accentOrange,
                            border: `3px solid ${BOOK_COLORS.accentOrange}`,
                            color: BOOK_COLORS.warmWhite,
                            fontFamily: "'Comfortaa', sans-serif",
                            fontWeight: 700,
                            boxShadow: `0 4px 16px ${BOOK_COLORS.accentOrange}66`,
                            minWidth: 'auto',
                            minHeight: 'auto',
                          }}
                        >
                          🎯 Dien je Test In Nu!
                        </button>
                      </div>
                    );
                  }
                  return (
                    <p
                      className="text-base mb-6"
                      style={{
                        color: BOOK_COLORS.accentOrange,
                        fontFamily: "'Comfortaa', sans-serif",
                        fontWeight: 600,
                        fontStyle: 'italic',
                      }}
                    >
                      {isTestCompleted ? 'Geweldig! Je hebt alle tests voltooid! 🎉' : 'Je verhaal is klaar! 🎉'}
                    </p>
                  );
                }
              })()}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    setShowStoryCompletedModal(false);
                    navigate('/generate');
                  }}
                  className="w-full px-6 py-3 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: BOOK_COLORS.accentBlue,
                    border: `3px solid ${BOOK_COLORS.accentBlue}`,
                    color: BOOK_COLORS.warmWhite,
                    fontFamily: "'Comfortaa', sans-serif",
                    fontWeight: 700,
                    boxShadow: `0 4px 16px ${BOOK_COLORS.accentBlue}66`,
                    minWidth: 'auto',
                    minHeight: 'auto',
                  }}
                >
                  Nieuw Verhaal Maken
                </button>
                
                <button
                  onClick={() => {
                    setShowStoryCompletedModal(false);
                    navigate('/onboarding');
                  }}
                  className="w-full px-6 py-3 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: BOOK_COLORS.accentPurple,
                    border: `3px solid ${BOOK_COLORS.accentPurple}`,
                    color: BOOK_COLORS.warmWhite,
                    fontFamily: "'Comfortaa', sans-serif",
                    fontWeight: 700,
                    boxShadow: `0 4px 16px ${BOOK_COLORS.accentPurple}66`,
                    minWidth: 'auto',
                    minHeight: 'auto',
                  }}
                >
                  Terug naar Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Library Modal */}
      <StoryLibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      />
    </div>
  );
}
