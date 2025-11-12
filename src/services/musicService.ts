/**
 * Music Service - Emotie-Soundtrack
 * Concept 6: Generatieve muziek op basis van emotionele lading
 * Gebaseerd op future_story_app_concepts_2025.md
 */

export type EmotionType = 'happy' | 'sad' | 'excited' | 'mysterious' | 'calm' | 'adventurous' | 'peaceful'

export interface MusicConfig {
  emotion: EmotionType
  tempo: number // BPM
  key: string // Musical key
  instruments: string[]
}

export class MusicService {
  private audioContext: AudioContext | null = null
  private isPlaying = false
  private currentOscillators: OscillatorNode[] = []

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  /**
   * Analyze text emotion (simple heuristic)
   */
  analyzeEmotion(text: string): EmotionType {
    const lowerText = text.toLowerCase()

    // Happy keywords
    if (lowerText.match(/blij|geluk|vrolijk|feest|lachen|happy|joy|smile/)) {
      return 'happy'
    }

    // Excited keywords
    if (lowerText.match(/spannend|avontuur|rennen|snel|excited|adventure|run/)) {
      return 'excited'
    }

    // Mysterious keywords
    if (lowerText.match(/geheim|mysterie|donker|verborgen|mystery|secret|dark/)) {
      return 'mysterious'
    }

    // Calm keywords
    if (lowerText.match(/rustig|vredig|zacht|vriendelijk|calm|peaceful|gentle/)) {
      return 'calm'
    }

    // Adventurous keywords
    if (lowerText.match(/reizen|ontdekken|exploreren|adventure|explore|travel/)) {
      return 'adventurous'
    }

    // Default to peaceful
    return 'peaceful'
  }

  /**
   * Get music config for emotion
   */
  getMusicConfig(emotion: EmotionType): MusicConfig {
    const configs: Record<EmotionType, MusicConfig> = {
      happy: {
        emotion: 'happy',
        tempo: 120,
        key: 'C major',
        instruments: ['sine', 'triangle'],
      },
      excited: {
        emotion: 'excited',
        tempo: 140,
        key: 'C major',
        instruments: ['square', 'sawtooth'],
      },
      mysterious: {
        emotion: 'mysterious',
        tempo: 80,
        key: 'A minor',
        instruments: ['sine', 'triangle'],
      },
      calm: {
        emotion: 'calm',
        tempo: 60,
        key: 'C major',
        instruments: ['sine'],
      },
      adventurous: {
        emotion: 'adventurous',
        tempo: 110,
        key: 'D major',
        instruments: ['sawtooth', 'triangle'],
      },
      peaceful: {
        emotion: 'peaceful',
        tempo: 70,
        key: 'G major',
        instruments: ['sine'],
      },
      sad: {
        emotion: 'sad',
        tempo: 70,
        key: 'A minor',
        instruments: ['sine'],
      },
    }

    return configs[emotion]
  }

  /**
   * Generate ambient music based on emotion
   */
  async generateAmbientMusic(emotion: EmotionType): Promise<void> {
    if (!this.audioContext) {
      console.warn('AudioContext not available')
      return
    }

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    this.stop() // Stop any existing music

    const config = this.getMusicConfig(emotion)
    const baseFreq = this.getBaseFrequency(config.key)

    // Create multiple oscillators for rich sound
    const oscillators: OscillatorNode[] = []

    // Main melody
    const mainOsc = this.audioContext.createOscillator()
    const mainGain = this.audioContext.createGain()
    mainOsc.type = config.instruments[0] as OscillatorType
    mainOsc.frequency.value = baseFreq
    mainGain.gain.value = 0.1 // Low volume for ambient
    mainOsc.connect(mainGain)
    mainGain.connect(this.audioContext.destination)
    oscillators.push(mainOsc)

    // Harmony (if multiple instruments)
    if (config.instruments.length > 1) {
      const harmonyOsc = this.audioContext.createOscillator()
      const harmonyGain = this.audioContext.createGain()
      harmonyOsc.type = config.instruments[1] as OscillatorType
      harmonyOsc.frequency.value = baseFreq * 1.5 // Fifth interval
      harmonyGain.gain.value = 0.05
      harmonyOsc.connect(harmonyGain)
      harmonyGain.connect(this.audioContext.destination)
      oscillators.push(harmonyOsc)
    }

    // Add subtle variation
    oscillators.forEach((osc, index) => {
      osc.start()
      // Gentle frequency modulation
      const variation = (Math.sin(Date.now() / 2000 + index) * 5) + baseFreq
      osc.frequency.setValueAtTime(variation, this.audioContext!.currentTime)
    })

    this.currentOscillators = oscillators
    this.isPlaying = true
  }

  /**
   * Get base frequency for musical key
   */
  private getBaseFrequency(key: string): number {
    const frequencies: Record<string, number> = {
      'C major': 261.63, // C4
      'D major': 293.66, // D4
      'G major': 392.00, // G4
      'A minor': 220.00, // A3
    }

    return frequencies[key] || 261.63
  }

  /**
   * Stop music
   */
  stop() {
    if (this.currentOscillators.length > 0) {
      this.currentOscillators.forEach((osc) => {
        try {
          osc.stop()
        } catch (e) {
          // Already stopped
        }
      })
      this.currentOscillators = []
    }
    this.isPlaying = false
  }

  /**
   * Check if music is playing
   */
  isMusicPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Generate music from story text
   */
  async playMusicForStory(storyText: string): Promise<void> {
    const emotion = this.analyzeEmotion(storyText)
    await this.generateAmbientMusic(emotion)
  }
}

// Singleton instance
export const musicService = new MusicService()

