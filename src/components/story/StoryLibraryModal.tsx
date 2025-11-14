import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { storyAPI } from '../../services/api';
import { useProfileStore } from '../../store/profileStore';
import type { StorySession } from '../../types';

// K-pop Dark Neon Color Palette
const KPOP_COLORS = {
  neonPink: '#FF10F0',
  neonBlue: '#00F0FF',
  neonPurple: '#B026FF',
  neonCyan: '#00FFFF',
  neonMagenta: '#FF00FF',
  darkBg: '#0a0a1a',
  darkBgSecondary: '#1a1a2e',
  darkBgTertiary: '#16213e',
};

interface StoryLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoryLibraryModal({ isOpen, onClose }: StoryLibraryModalProps) {
  const navigate = useNavigate();
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const [sessions, setSessions] = useState<StorySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingToSessionId, setNavigatingToSessionId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Memoized loadSessions function to prevent unnecessary re-renders
  const loadSessions = useCallback(async () => {
    if (!currentProfile) {
      console.log('📚 StoryLibraryModal: No current profile, skipping load');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📚 StoryLibraryModal: Loading sessions for profile:', {
        id: currentProfile.id,
        name: currentProfile.name,
        displayName: currentProfile.displayName
      });
      
      let allSessions: StorySession[] = [];
      
      // Use child profile ID if available (preferred method)
      // Backend now handles fallback to name-based search automatically
      if (currentProfile.id) {
        try {
          console.log('📚 StoryLibraryModal: Calling API with profile ID:', currentProfile.id);
          const sessionsData = await storyAPI.getChildSessionsByProfileId(currentProfile.id);
          console.log('📚 StoryLibraryModal: Loaded sessions by profile ID:', sessionsData.length, sessionsData);
          allSessions = [...sessionsData];
        } catch (error) {
          console.error('📚 StoryLibraryModal: Failed to load sessions by profile ID:', error);
        }
      }
      
      // Additional fallback: Try both displayName and name to find all stories
      // (in case stories were created with different name variations)
      const primaryName = currentProfile.displayName || currentProfile.name;
      if (primaryName) {
        const allNames = new Set<string>([primaryName]);
        
        // Add the other name if it exists and is different
        if (currentProfile.displayName && currentProfile.name && 
            currentProfile.displayName !== currentProfile.name) {
          allNames.add(currentProfile.displayName);
          allNames.add(currentProfile.name);
        }
        
        // Fetch sessions for all possible names and combine results
        const allSessionsPromises = Array.from(allNames).map(name => 
          storyAPI.getChildSessions(name).catch(err => {
            console.warn(`📚 StoryLibraryModal: Failed to load sessions for name "${name}":`, err);
            return [];
          })
        );
        
        const nameBasedSessions = await Promise.all(allSessionsPromises);
        const nameSessions = nameBasedSessions.flat();
        console.log('📚 StoryLibraryModal: Loaded sessions by name:', nameSessions.length);
        
        // Combine with profile ID results
        allSessions = [...allSessions, ...nameSessions];
      }
      
      // Remove duplicates based on session_id
      const uniqueSessions = Array.from(
        new Map(allSessions.map(session => [session.session_id, session])).values()
      );
      
      // Sort by created_at (newest first)
      uniqueSessions.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      
      // Only show last 5 stories
      const last5Sessions = uniqueSessions.slice(0, 5);
      
      console.log('📚 StoryLibraryModal: Total unique sessions:', uniqueSessions.length, 'Showing:', last5Sessions.length);
      setSessions(last5Sessions);
    } catch (error) {
      console.error('📚 StoryLibraryModal: Error loading sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentProfile]);

  // Load sessions when modal opens
  useEffect(() => {
    if (isOpen && currentProfile) {
      loadSessions();
    } else if (!isOpen) {
      // Clear sessions when modal closes to prevent stale data
      setSessions([]);
    }
  }, [isOpen, currentProfile, loadSessions]);

  // Animation when modal opens/closes
  useEffect(() => {
    if (!modalRef.current || !overlayRef.current) return;

    if (isOpen) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(modalRef.current, { scale: 0.8, opacity: 0, y: 50, duration: 0.2 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [isOpen]);

  const handleStoryClick = (sessionId: string) => {
    // Show loading overlay immediately
    setIsNavigating(true);
    setNavigatingToSessionId(sessionId);
    
    // Close modal first
    onClose();
    
    // Small delay before navigation to show loading
    setTimeout(() => {
      // Navigate to story reader page
      navigate(`/story/${sessionId}`);
      // Keep loading overlay visible longer - StoryReaderPage needs time to load
      // The StoryReaderPage has its own loading state, but we keep this overlay
      // visible for at least 3-4 seconds to ensure smooth transition
      setTimeout(() => {
        // Only hide if we're still navigating to the same session
        // (in case user navigated away or page loaded)
        if (navigatingToSessionId === sessionId) {
          setIsNavigating(false);
          setNavigatingToSessionId(null);
        }
      }, 4000); // Keep visible for 4 seconds - gives StoryReaderPage time to load
    }, 300);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Always show loading overlay if navigating, even if modal is closed
  // This overlay stays visible until StoryReaderPage takes over with its own loading
  if (isNavigating) {
    return (
      <div 
        className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      >
        {/* Background Video */}
        <video
          src="/kidsreadingtablet.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            zIndex: 1,
            opacity: 0.4,
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
          }}
          onError={(e) => {
            console.error('Error loading video:', e);
          }}
          onLoadedData={() => {
            console.log('✅ Loading video loaded successfully');
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
          
          {/* Text */}
          <p 
            className="text-2xl font-bold text-white"
            style={{
              fontFamily: "'Comfortaa', sans-serif",
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(176, 38, 255, 0.5)',
              letterSpacing: '0.05em',
            }}
          >
            Je verhaal wordt geladen...
          </p>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      
      {/* Modal */}
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
          border: `3px solid ${KPOP_COLORS.neonPurple}`,
          boxShadow: `
            0 0 40px ${KPOP_COLORS.neonPurple}66,
            0 0 80px ${KPOP_COLORS.neonPink}44,
            inset 0 0 30px ${KPOP_COLORS.neonPurple}22
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div
          className="flex items-center justify-between p-6 border-b-2 flex-shrink-0"
          style={{
            borderColor: `${KPOP_COLORS.neonCyan}44`,
          }}
        >
          <h2
            className="text-3xl font-black glow-text"
            style={{
              color: KPOP_COLORS.neonPink,
              fontFamily: "'Orbitron', sans-serif",
              textShadow: `0 0 10px ${KPOP_COLORS.neonPink}, 0 0 20px ${KPOP_COLORS.neonPink}66`,
            }}
          >
            📚 Mijn Verhalen
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all hover:scale-110 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
              border: `2px solid ${KPOP_COLORS.neonCyan}`,
              color: KPOP_COLORS.neonCyan,
              boxShadow: `0 0 15px ${KPOP_COLORS.neonCyan}66`,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0" style={{ 
          maxHeight: 'calc(90vh - 120px)',
          WebkitOverflowScrolling: 'touch',
        }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p
                className="text-xl font-bold glow-text"
                style={{
                  color: KPOP_COLORS.neonCyan,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Verhalen laden...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p
                className="text-xl font-bold glow-text mb-4"
                style={{
                  color: KPOP_COLORS.neonCyan,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Nog geen verhalen
              </p>
              <p
                className="text-sm opacity-70"
                style={{
                  color: KPOP_COLORS.neonBlue,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Maak je eerste verhaal om te beginnen!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => {
                // Check ALL segments for missing tests, not just the last one
                const segmentsWithTests = session.story_segments?.map((segment: any, index: number) => {
                  const hasTestQuestions = segment?.comprehension_questions && 
                                         Array.isArray(segment.comprehension_questions) && 
                                         segment.comprehension_questions.length > 0;
                  return {
                    segmentIndex: index,
                    segmentSequence: segment?.sequence || index + 1,
                    hasTestQuestions,
                  };
                }) || [];
                
                // Count how many segments need tests
                const segmentsNeedingTests = segmentsWithTests.filter(s => s.hasTestQuestions);
                const totalTestsNeeded = segmentsNeedingTests.length;
                
                // For now, show warning if story is completed but has test questions
                // (We can't check if tests are actually completed without API call)
                const needsTest = session.completed && totalTestsNeeded > 0;
                
                return (
                <div
                  key={session.session_id}
                  onClick={() => handleStoryClick(session.session_id)}
                  className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: session.completed
                      ? `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary}88 0%, ${KPOP_COLORS.darkBgTertiary}88 100%)`
                      : `linear-gradient(135deg, ${KPOP_COLORS.darkBgSecondary} 0%, ${KPOP_COLORS.darkBgTertiary} 100%)`,
                    border: `2px solid ${session.completed ? KPOP_COLORS.neonCyan : KPOP_COLORS.neonPurple}`,
                    boxShadow: session.completed
                      ? `0 0 20px ${KPOP_COLORS.neonCyan}44`
                      : `0 0 20px ${KPOP_COLORS.neonPurple}44`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3
                        className="text-xl font-bold mb-1"
                        style={{
                          color: session.completed ? KPOP_COLORS.neonCyan : KPOP_COLORS.neonPink,
                          fontFamily: "'Poppins', sans-serif",
                          textShadow: `0 0 8px ${session.completed ? KPOP_COLORS.neonCyan : KPOP_COLORS.neonPink}44`,
                        }}
                      >
                        {session.metadata?.character 
                          ? `${currentProfile?.displayName || currentProfile?.name || 'Jij'} en de ${session.metadata.character}`
                          : 'Mijn Verhaal'}
                      </h3>
                      <p
                        className="text-sm opacity-80 mb-2"
                        style={{
                          color: KPOP_COLORS.neonBlue,
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        {session.metadata?.setting || 'Plaats'} • {session.metadata?.object || 'Voorwerp'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {session.completed && (
                        <span
                          className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                          style={{
                            background: `${KPOP_COLORS.neonCyan}22`,
                            color: KPOP_COLORS.neonCyan,
                            border: `1px solid ${KPOP_COLORS.neonCyan}44`,
                          }}
                        >
                          ✓ Voltooid
                        </span>
                      )}
                      {needsTest && (
                        <span
                          className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                          style={{
                            background: '#ff9800',
                            color: '#ffffff',
                            border: '1px solid #ff9800',
                            fontWeight: 600,
                          }}
                        >
                          🎯 Test nodig
                        </span>
                      )}
                    </div>
                  </div>
                  {needsTest && (
                    <div className="mb-2 p-2 rounded-lg" style={{
                      background: 'rgba(255, 152, 0, 0.2)',
                      border: '1px solid #ff9800',
                    }}>
                      <p className="text-xs font-semibold mb-1" style={{
                        color: '#ff9800',
                        fontFamily: "'Poppins', sans-serif",
                      }}>
                        🎯 {totalTestsNeeded === 1 
                          ? 'Dien je test in om je verhaal volledig te voltooien!' 
                          : `Dien je ${totalTestsNeeded} tests in om je verhaal volledig te voltooien!`}
                      </p>
                      <p className="text-xs opacity-80" style={{
                        color: '#ff9800',
                        fontFamily: "'Poppins', sans-serif",
                      }}>
                        💡 Klik op het verhaal om de tests te maken!
                      </p>
                    </div>
                  )}
                  {!session.completed && totalTestsNeeded > 0 && (
                    <div className="mb-2 p-2 rounded-lg" style={{
                      background: 'rgba(156, 39, 176, 0.2)',
                      border: '1px solid #9c27b0',
                    }}>
                      <p className="text-xs font-semibold" style={{
                        color: '#9c27b0',
                        fontFamily: "'Poppins', sans-serif",
                      }}>
                        📝 Verhaal heeft {totalTestsNeeded} {totalTestsNeeded === 1 ? 'test' : 'tests'} beschikbaar
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm pt-2 border-t"
                    style={{
                      borderColor: `${KPOP_COLORS.neonPurple}33`,
                    }}>
                    <span style={{ 
                      color: KPOP_COLORS.neonBlue,
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      📖 {(session as any).total_segments || session.story_segments?.length || 0} {((session as any).total_segments || session.story_segments?.length || 0) === 1 ? 'deel' : 'delen'}
                    </span>
                    <span style={{ 
                      color: KPOP_COLORS.neonCyan,
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                    }}>
                      📅 {formatDate(session.created_at || '')}
                    </span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

