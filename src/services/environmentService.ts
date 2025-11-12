/**
 * Environment Service - Levende Wereld
 * Concept 3: Omgevings-synchronisatie met tijd en weer
 * Gebaseerd op future_story_app_concepts_2025.md
 */

export interface EnvironmentContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  weather: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy' | 'unknown'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  isDark: boolean
}

export class EnvironmentService {
  private locationPermission: PermissionState | null = null
  private weatherApiKey: string | null = null

  constructor() {
    // Check for weather API key from environment
    this.weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY || null
  }

  /**
   * Get current time of day
   */
  getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }

  /**
   * Get current season
   */
  getSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth()
    
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  /**
   * Check if it's dark outside (evening/night)
   */
  isDarkOutside(): boolean {
    const timeOfDay = this.getTimeOfDay()
    return timeOfDay === 'evening' || timeOfDay === 'night'
  }

  /**
   * Get weather (with permission check)
   */
  async getWeather(): Promise<'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy' | 'unknown'> {
    // For MVP, we'll use a simple heuristic based on time
    // In production, you'd call a weather API with location permission
    
    if (!this.weatherApiKey) {
      // Fallback: use time-based estimation
      const hour = new Date().getHours()
      const month = new Date().getMonth()
      
      // Simple heuristic
      if (month >= 10 || month <= 2) {
        // Winter months - more likely cloudy/rainy
        return Math.random() > 0.7 ? 'sunny' : 'cloudy'
      }
      
      return 'sunny' // Default to sunny
    }

    // TODO: Implement actual weather API call
    // This would require location permission and API integration
    return 'unknown'
  }

  /**
   * Get complete environment context
   */
  async getEnvironmentContext(): Promise<EnvironmentContext> {
    const timeOfDay = this.getTimeOfDay()
    const weather = await this.getWeather()
    const season = this.getSeason()
    const isDark = this.isDarkOutside()

    return {
      timeOfDay,
      weather,
      season,
      isDark,
    }
  }

  /**
   * Apply environment context to story
   */
  applyEnvironmentToStory(
    storyText: string,
    context: EnvironmentContext
  ): string {
    let modifiedStory = storyText

    // Add time-based descriptions
    if (context.timeOfDay === 'night') {
      // Add night atmosphere
      if (!modifiedStory.includes('nacht') && !modifiedStory.includes('night')) {
        modifiedStory = `Onder de sterrenhemel, ${modifiedStory.toLowerCase()}`
      }
    }

    if (context.timeOfDay === 'morning') {
      // Add morning atmosphere
      if (!modifiedStory.includes('ochtend') && !modifiedStory.includes('morning')) {
        modifiedStory = `In het ochtendlicht, ${modifiedStory.toLowerCase()}`
      }
    }

    // Add weather-based descriptions
    if (context.weather === 'rainy') {
      // Add rain atmosphere
      if (!modifiedStory.includes('regen') && !modifiedStory.includes('rain')) {
        // Add subtle rain reference
      }
    }

    return modifiedStory
  }

  /**
   * Get environment-based visual effects
   */
  getEnvironmentEffects(context: EnvironmentContext): {
    backgroundGradient: string
    ambientSounds: string[]
    particleEffects: string[]
  } {
    const effects = {
      backgroundGradient: '',
      ambientSounds: [] as string[],
      particleEffects: [] as string[],
    }

    // Time-based effects
    if (context.timeOfDay === 'night') {
      effects.backgroundGradient = 'from-indigo-900 via-purple-900 to-indigo-900'
      effects.ambientSounds.push('night-crickets')
      effects.particleEffects.push('stars', 'moon-glow')
    } else if (context.timeOfDay === 'morning') {
      effects.backgroundGradient = 'from-orange-100 via-yellow-50 to-blue-100'
      effects.ambientSounds.push('morning-birds')
      effects.particleEffects.push('sun-rays')
    } else {
      effects.backgroundGradient = 'from-blue-50 to-purple-50'
    }

    // Weather-based effects
    if (context.weather === 'rainy') {
      effects.ambientSounds.push('rain-drops')
      effects.particleEffects.push('rain')
      effects.backgroundGradient = 'from-gray-600 via-gray-700 to-gray-800'
    } else if (context.weather === 'sunny') {
      effects.particleEffects.push('sunshine')
    }

    return effects
  }
}

// Singleton instance
export const environmentService = new EnvironmentService()

