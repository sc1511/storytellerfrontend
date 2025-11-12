import axios from 'axios';
import type { StoryResponse, StorySession } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 150000, // 150 seconds voor story generation (n8n + Claude API kan lang duren)
});

export const storyAPI = {
  /**
   * Login kind met verificatie code
   * POST /api/auth/child/login
   */
  async loginWithCode(verificationCode: string, childName: string): Promise<{
    id: string;
    name: string;
    age: string | null;
    language: string;
    avatar_customization: any;
    verification_code: string;
  }> {
    try {
      const response = await apiClient.post('/auth/child/login', {
        verification_code: verificationCode,
        child_name: childName,
      });
      return response.data.data.child;
    } catch (error) {
      console.error('Error logging in with code:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to login with code'
        );
      }
      throw error;
    }
  },

  /**
   * Update child profile (display_name, age, language, avatar)
   * PUT /api/auth/child/profile/:childId
   */
  async updateChildProfile(childId: string, updates: {
    display_name?: string;
    age?: string;
    language?: 'en' | 'nl';
    avatar_customization?: any;
  }): Promise<void> {
    try {
      await apiClient.put(`/auth/child/profile/${childId}`, updates);
    } catch (error) {
      console.error('Error updating child profile:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to update child profile'
        );
      }
      throw error;
    }
  },

  /**
   * Start nieuwe story
   * POST /api/story
   */
  async createStory(data: {
    character: string;
    setting: string;
    object: string;
    childName: string;
    language?: 'en' | 'nl';
    age?: string;
  }): Promise<StoryResponse> {
    try {
      console.log('API Call:', {
        baseURL: API_BASE_URL,
        endpoint: '/story',
        fullURL: `${API_BASE_URL}/story`,
        data: { ...data, childName: data.childName.substring(0, 10) + '...' } // Log partial data for privacy
      });
      
      const response = await apiClient.post('/story', {
        character: data.character,
        setting: data.setting,
        object: data.object,
        childName: data.childName,
        language: data.language || 'nl',
        age: data.age || '6-8',
      });

      // Transform backend response to StoryResponse format
      const responseData = response.data;
      
      // Check all possible field names
      const storyText = responseData.storyText || responseData.story || responseData.story_text || '';
      const nextChoicesRaw = responseData.nextChoices || responseData.next_choices || [];
      const comprehensionQuestionsRaw = responseData.comprehensionQuestions || responseData.comprehension_questions || [];
      
      console.log('📦 API Response Data:', {
        all_keys: Object.keys(responseData || {}),
        has_storyText: !!responseData.storyText,
        has_story: !!responseData.story,
        has_story_text: !!responseData.story_text,
        final_story_length: storyText.length,
        has_nextChoices: !!responseData.nextChoices,
        has_next_choices: !!responseData.next_choices,
        next_choices_type: Array.isArray(nextChoicesRaw) ? 'array' : typeof nextChoicesRaw,
        next_choices_length: Array.isArray(nextChoicesRaw) ? nextChoicesRaw.length : 0,
        has_comprehensionQuestions: !!responseData.comprehensionQuestions,
        has_comprehension_questions: !!responseData.comprehension_questions,
        comprehension_questions_raw: comprehensionQuestionsRaw,
        comprehension_questions_type: Array.isArray(comprehensionQuestionsRaw) ? 'array' : typeof comprehensionQuestionsRaw,
        comprehension_questions_length: Array.isArray(comprehensionQuestionsRaw) ? comprehensionQuestionsRaw.length : 0,
      });
      
      return {
        success: true,
        message: 'Story created successfully',
        session_id: responseData.metadata?.session_id || responseData.session_id || '',
        story_id: responseData.metadata?.story_id || responseData.story_id || '',
        story: storyText,
        story_sequence: responseData.metadata?.story_sequence || responseData.story_sequence || 1,
        is_conclusion: responseData.is_conclusion || responseData.is_conclusion === true || false,
        next_choices: (Array.isArray(nextChoicesRaw) ? nextChoicesRaw : []).map((choice: any, index: number) => {
          if (typeof choice === 'string') {
            return {
              label: String.fromCharCode(65 + index), // A, B, C
              description: choice,
            };
          }
          return {
            label: choice.label || String.fromCharCode(65 + index),
            description: choice.description || choice,
          };
        }),
        comprehension_questions: Array.isArray(comprehensionQuestionsRaw)
          ? comprehensionQuestionsRaw.map((q: any) => ({
              question: q.question || q.text || '',
              options: Array.isArray(q.options) ? q.options : (q.choices || []),
              correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : (q.correctAnswer || 0)
            }))
          : undefined,
        metrics: responseData.metadata?.metrics || {
          vocabulary: {
            total_word_count: 0,
            unique_words: 0,
            diversity_score: 0,
            advanced_vocabulary: [],
            reading_level: 'beginner',
          },
          creativity: {
            originality_score: 0,
            character_development_depth: 0,
            plot_complexity: 'simple',
            sensory_language_density: 'low',
          },
          educational: [],
        },
        metadata: responseData.metadata || {
          child_name: data.childName,
          character: data.character,
          setting: data.setting,
          object: data.object,
          language: data.language || 'nl',
          age: data.age || '6-8',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating story:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to create story'
        );
      }
      throw error;
    }
  },

  /**
   * Continue story met choice
   * POST /api/story/continue
   */
  async continueStory(data: {
    session_id: string;
    choice_made: string;
    language?: 'en' | 'nl';
    age?: string;
    end_story?: boolean; // Flag om aan te geven dat dit het laatste verhaal is
  }): Promise<StoryResponse> {
    try {
      const response = await apiClient.post('/story/continue', {
        session_id: data.session_id,
        choice_made: data.choice_made,
        language: data.language || 'nl',
        age: data.age || '6-8',
        end_story: data.end_story || false,
      });

      // Transform backend response to StoryResponse format
      const responseData = response.data;
      
      console.log('📥 continueStory - Raw backend response:', {
        allKeys: Object.keys(responseData || {}),
        hasComprehensionQuestions: !!responseData.comprehensionQuestions,
        hasComprehension_questions: !!responseData.comprehension_questions,
        comprehensionQuestionsType: typeof responseData.comprehensionQuestions,
        comprehensionQuestionsIsArray: Array.isArray(responseData.comprehensionQuestions),
        comprehensionQuestionsLength: Array.isArray(responseData.comprehensionQuestions) ? responseData.comprehensionQuestions.length : 'not-array',
        comprehension_questionsType: typeof responseData.comprehension_questions,
        comprehension_questionsIsArray: Array.isArray(responseData.comprehension_questions),
        comprehension_questionsLength: Array.isArray(responseData.comprehension_questions) ? responseData.comprehension_questions.length : 'not-array',
        rawComprehensionQuestions: responseData.comprehensionQuestions,
        rawComprehension_questions: responseData.comprehension_questions
      });
      
      // Parse comprehension questions from backend response - EXACTLY like next_choices
      const comprehensionQuestionsRaw = responseData.comprehensionQuestions || responseData.comprehension_questions || [];
      
      console.log('📚 continueStory - Comprehension questions after selection:', {
        hasQuestions: !!comprehensionQuestionsRaw,
        isArray: Array.isArray(comprehensionQuestionsRaw),
        length: Array.isArray(comprehensionQuestionsRaw) ? comprehensionQuestionsRaw.length : 0,
        raw: comprehensionQuestionsRaw
      });
      
      return {
        success: true,
        message: 'Story continued successfully',
        session_id: responseData.metadata?.session_id || responseData.session_id || data.session_id,
        story_id: responseData.metadata?.story_id || responseData.story_id || '',
        story: responseData.storyText || responseData.story || '',
        story_sequence: responseData.metadata?.story_sequence || responseData.story_sequence || 1,
        is_conclusion: responseData.is_conclusion || false,
        next_choices: (responseData.nextChoices || responseData.next_choices || []).map((choice: any, index: number) => {
          if (typeof choice === 'string') {
            return {
              label: String.fromCharCode(65 + index), // A, B, C
              description: choice,
            };
          }
          return {
            label: choice.label || String.fromCharCode(65 + index),
            description: choice.description || choice,
          };
        }),
        // Use comprehension questions EXACTLY as they come from backend - no extra mapping
        // They're already in the correct format from n8n
        comprehension_questions: Array.isArray(comprehensionQuestionsRaw) && comprehensionQuestionsRaw.length > 0
          ? comprehensionQuestionsRaw
          : undefined,
        metrics: responseData.metadata?.metrics || {
          vocabulary: {
            total_word_count: 0,
            unique_words: 0,
            diversity_score: 0,
            advanced_vocabulary: [],
            reading_level: 'beginner',
          },
          creativity: {
            originality_score: 0,
            character_development_depth: 0,
            plot_complexity: 'simple',
            sensory_language_density: 'low',
          },
          educational: [],
        },
        metadata: responseData.metadata || {
          child_name: '',
          character: '',
          setting: '',
          object: '',
          language: data.language || 'nl',
          age: data.age || '6-8',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error continuing story:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to continue story'
        );
      }
      throw error;
    }
  },

  /**
   * Get all story sessions for a child by profile ID (preferred method)
   * GET /api/story/child-profile/:childProfileId
   */
  async getChildSessionsByProfileId(childProfileId: string, limit: number = 50, offset: number = 0): Promise<StorySession[]> {
    try {
      const response = await apiClient.get(`/story/child-profile/${encodeURIComponent(childProfileId)}`, {
        params: { limit, offset }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting child sessions by profile ID:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to get child sessions'
        );
      }
      throw error;
    }
  },

  /**
   * Get all story sessions for a child by name (backwards compatibility)
   * GET /api/story/child/:childName
   * @deprecated Use getChildSessionsByProfileId instead
   */
  async getChildSessions(childName: string, limit: number = 50, offset: number = 0): Promise<StorySession[]> {
    try {
      const response = await apiClient.get(`/story/child/${encodeURIComponent(childName)}`, {
        params: { limit, offset }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting child sessions:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to get child sessions'
        );
      }
      throw error;
    }
  },

  /**
   * Get a story session with all segments
   * GET /api/story/:sessionId
   */
  async getStorySession(sessionId: string): Promise<StorySession> {
    try {
      console.log('📡 Fetching story session from API:', sessionId);
      const response = await apiClient.get(`/story/${sessionId}`);
      console.log('📥 Received story session from API:', {
        session_id: response.data.session_id,
        segments_count: response.data.story_segments?.length || 0,
        segments_with_questions: response.data.story_segments?.filter((seg: any) => seg.comprehension_questions?.length > 0).length || 0,
        first_segment_has_questions: !!response.data.story_segments?.[0]?.comprehension_questions,
        first_segment_questions_count: response.data.story_segments?.[0]?.comprehension_questions?.length || 0,
        raw_response: response.data
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching story session:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to fetch story session'
        );
      }
      throw error;
    }
  },

  /**
   * Save comprehension test results
   * POST /api/story/comprehension-results
   */
  async saveComprehensionResults(data: {
    session_id: string;
    segment_sequence: number;
    child_name: string;
    child_profile_id?: string; // Optional: if provided, will be used directly
    questions: Array<{
      question: string;
      options: string[];
      userAnswerIndex: number;
      correctAnswerIndex: number;
      isCorrect: boolean;
    }>;
    correct_answers: number;
    total_questions: number;
  }): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await apiClient.post('/story/comprehension-results', data);
      return response.data;
    } catch (error) {
      console.error('Error saving comprehension results:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to save comprehension results'
        );
      }
      throw error;
    }
  },

  /**
   * Get comprehension results for a child
   * GET /api/story/comprehension-results/:childName
   */
  async getComprehensionResults(childName: string, days: number = 7): Promise<{ success: boolean; count: number; data: any[] }> {
    try {
      const response = await apiClient.get(`/story/comprehension-results/${childName}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehension results:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to fetch comprehension results'
        );
      }
      throw error;
    }
  },

  /**
   * Save parent settings
   * POST /api/story/parent-settings
   */
  async saveParentSettings(data: {
    child_name: string;
    parent_email: string;
    weekly_report_enabled?: boolean;
  }): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await apiClient.post('/story/parent-settings', data);
      return response.data;
    } catch (error) {
      console.error('Error saving parent settings:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to save parent settings'
        );
      }
      throw error;
    }
  },

  /**
   * Get parent settings for a child
   * GET /api/story/parent-settings/:childName
   */
  async getParentSettings(childName: string): Promise<{ success: boolean; data: any }> {
    try {
      const response = await apiClient.get(`/story/parent-settings/${childName}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching parent settings:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to fetch parent settings'
        );
      }
      throw error;
    }
  },

  /**
   * Delete a child profile
   * DELETE /api/auth/parent/children/:childId
   */
  async deleteChild(childId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/auth/parent/children/${childId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting child:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to delete child'
        );
      }
      throw error;
    }
  },

  /**
   * Request a manual weekly report email for a child
   */
  async requestManualReport(childProfileId: string, token: string): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/parent/report/${childProfileId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error requesting manual report:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Failed to request report'
        );
      }
      throw error;
    }
  },
};

