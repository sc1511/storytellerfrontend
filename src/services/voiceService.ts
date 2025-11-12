/**
 * Voice Service - Stem-Architect
 * Concept 2: Voice customization zonder opname
 * Gebaseerd op future_story_app_concepts_2025.md
 */

export interface VoiceProfile {
  name: string
  emoji: string
  description: string
  pitch: number // 0.5 - 2.0 (default 1.0)
  rate: number // 0.5 - 2.0 (default 1.0)
  volume: number // 0.0 - 1.0 (default 1.0)
}

export const DEFAULT_VOICES: VoiceProfile[] = [
  {
    name: 'Zachte Reus',
    emoji: '🌳',
    description: 'Groot en vriendelijk',
    pitch: 0.7, // Lager
    rate: 0.8, // Langzamer
    volume: 1.0,
  },
  {
    name: 'Energieke Elf',
    emoji: '✨',
    description: 'Vrolijk en snel',
    pitch: 1.3, // Hoger
    rate: 1.2, // Sneller
    volume: 1.0,
  },
  {
    name: 'Wijze Boom',
    emoji: '🌲',
    description: 'Kalm en bedachtzaam',
    pitch: 0.8,
    rate: 0.9,
    volume: 1.0,
  },
  {
    name: 'Speelse Draak',
    emoji: '🐉',
    description: 'Avontuurlijk en enthousiast',
    pitch: 1.1,
    rate: 1.1,
    volume: 1.0,
  },
]

export class VoiceService {
  private synthesis: SpeechSynthesis | null = null
  private currentVoice: VoiceProfile = DEFAULT_VOICES[0]
  private isEnabled = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
      this.isEnabled = true
    }
  }

  /**
   * Set voice profile
   */
  setVoice(voice: VoiceProfile) {
    this.currentVoice = voice
  }

  /**
   * Adjust pitch (0.5 - 2.0)
   */
  setPitch(pitch: number) {
    this.currentVoice.pitch = Math.max(0.5, Math.min(2.0, pitch))
  }

  /**
   * Adjust rate (0.5 - 2.0)
   */
  setRate(rate: number) {
    this.currentVoice.rate = Math.max(0.5, Math.min(2.0, rate))
  }

  /**
   * Speak text with current voice profile
   */
  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis || !this.isEnabled) {
        reject(new Error('Speech synthesis not available'))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Apply voice profile
      utterance.pitch = this.currentVoice.pitch
      utterance.rate = this.currentVoice.rate
      utterance.volume = this.currentVoice.volume

      // Set language (Dutch or English)
      utterance.lang = 'nl-NL' // Default to Dutch

      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)

      this.synthesis.speak(utterance)
    })
  }

  /**
   * Stop speaking
   */
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  /**
   * Pause speaking
   */
  pause() {
    if (this.synthesis) {
      this.synthesis.pause()
    }
  }

  /**
   * Resume speaking
   */
  resume() {
    if (this.synthesis) {
      this.synthesis.resume()
    }
  }

  /**
   * Check if speech synthesis is available
   */
  isAvailable(): boolean {
    return this.isEnabled
  }

  /**
   * Get current voice profile
   */
  getCurrentVoice(): VoiceProfile {
    return this.currentVoice
  }

  /**
   * Get all available voice profiles
   */
  getAvailableVoices(): VoiceProfile[] {
    return DEFAULT_VOICES
  }
}

// Singleton instance
export const voiceService = new VoiceService()

