import { Navigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { useStoryStore } from '../store/storyStore';
import { useParams } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSession?: boolean; // For story pages that need a valid session
}

/**
 * Protected Route Component
 * Redirects to /login if user is not authenticated
 */
export function ProtectedRoute({ children, requireSession = false }: ProtectedRouteProps) {
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const { sessionId } = useParams<{ sessionId?: string }>();
  const sessions = useStoryStore((state) => state.sessions);
  
  // Check if user is logged in
  if (!currentProfile) {
    return <Navigate to="/login" replace />;
  }

  // For story pages, check if session exists
  // NOTE: We don't redirect here - let StoryReaderPage handle loading the session
  // The session might not be in the store yet but can be loaded from the API
  if (requireSession) {
    if (!sessionId) {
      // No sessionId in URL, redirect to home page (not generate, to avoid onboarding redirect)
      return <Navigate to="/home" replace />;
    }
    // Don't check if session exists in store - StoryReaderPage will load it from API if needed
    // This allows direct navigation to /story/:sessionId even if session isn't in store yet
  }

  return <>{children}</>;
}

