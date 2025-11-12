import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StorySession, StoryResponse } from '../types';

interface StoryStore {
  currentSession: StorySession | null;
  sessions: StorySession[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentSession: (session: StorySession) => void;
  addStorySegment: (response: StoryResponse) => void;
  clearCurrentSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadSession: (sessionId: string) => void;
}

export const useStoryStore = create<StoryStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      isLoading: false,
      error: null,

      setCurrentSession: (session) => {
        set({ currentSession: session });
        // Also add to sessions if not already present
        const existing = get().sessions.find((s) => s.session_id === session.session_id);
        if (!existing) {
          set((state) => ({
            sessions: [...state.sessions, session],
          }));
        }
      },

      addStorySegment: (response) => {
        const state = get();
        if (!state.currentSession) {
          // Create new session if none exists
          const newSession: StorySession = {
            session_id: response.session_id,
            story_segments: [
              {
                sequence: response.story_sequence,
                story_text: response.story,
                next_choices: response.next_choices,
                comprehension_questions: response.comprehension_questions,
                metrics: response.metrics,
              },
            ],
            metadata: response.metadata,
            created_at: response.timestamp,
            completed: response.is_conclusion,
          };
          set({ currentSession: newSession });
          set((state) => ({
            sessions: [...state.sessions, newSession],
          }));
          return;
        }

        // Update existing session
        console.log('📦 addStorySegment - Storing segment with:', {
          hasComprehensionQuestions: !!response.comprehension_questions,
          isArray: Array.isArray(response.comprehension_questions),
          length: response.comprehension_questions?.length || 0,
          comprehension_questions: response.comprehension_questions
        });
        
        const updatedSession: StorySession = {
          ...state.currentSession,
          story_segments: [
            ...state.currentSession.story_segments,
            {
              sequence: response.story_sequence,
              story_text: response.story,
              choice_made: response.next_choices.find((c) => 
                c.description === response.message || 
                c.label === response.message
              )?.description,
              next_choices: response.next_choices,
              comprehension_questions: response.comprehension_questions,
              metrics: response.metrics,
            },
          ],
          completed: response.is_conclusion,
        };

        set({ currentSession: updatedSession });
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.session_id === updatedSession.session_id ? updatedSession : s
          ),
        }));
      },

      clearCurrentSession: () => set({ currentSession: null }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      loadSession: (sessionId) => {
        const session = get().sessions.find((s) => s.session_id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },
    }),
    {
      name: 'story-storage',
    }
  )
);

