/**
 * Voice Selector Component - Stem-Architect
 * Concept 2: Voice customization interface
 * Gebaseerd op future_story_app_concepts_2025.md
 */

import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { voiceService, type VoiceProfile } from '../../services/voiceService'
import { Slider } from '../ui/Slider'
// Removed lucide-react import - using icon images instead

interface VoiceSelectorProps {
  onVoiceChange?: (voice: VoiceProfile) => void
  className?: string
}

export function VoiceSelector({ onVoiceChange, className = '' }: VoiceSelectorProps) {
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(voiceService.getCurrentVoice())
  const [customPitch, setCustomPitch] = useState(selectedVoice.pitch)
  const [customRate, setCustomRate] = useState(selectedVoice.rate)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    setIsEnabled(voiceService.isAvailable())
  }, [])

  const handleVoiceSelect = (voice: VoiceProfile) => {
    setSelectedVoice(voice)
    setCustomPitch(voice.pitch)
    setCustomRate(voice.rate)
    voiceService.setVoice(voice)
    onVoiceChange?.(voice)
  }

  const handlePitchChange = (value: number[]) => {
    const pitch = value[0]
    setCustomPitch(pitch)
    voiceService.setPitch(pitch)
    const updatedVoice = { ...selectedVoice, pitch }
    setSelectedVoice(updatedVoice)
    onVoiceChange?.(updatedVoice)
  }

  const handleRateChange = (value: number[]) => {
    const rate = value[0]
    setCustomRate(rate)
    voiceService.setRate(rate)
    const updatedVoice = { ...selectedVoice, rate }
    setSelectedVoice(updatedVoice)
    onVoiceChange?.(updatedVoice)
  }

  const handleTestVoice = async () => {
    await voiceService.speak('Hallo! Dit is mijn vertelstem.')
  }

  if (!isEnabled) {
    return (
      <div className={`p-4 bg-yellow-50 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-800">
          Stem-ondersteuning is niet beschikbaar in deze browser.
        </p>
      </div>
    )
  }

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Kies je Vertelstem
          <img src="/icon_play-removebg-preview.png" alt="Voice" className="w-5 h-5 object-contain" />
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTestVoice}
          className="gap-2"
        >
          <img src="/icon_play-removebg-preview.png" alt="Test" className="h-4 w-4 object-contain" />
          Test
        </Button>
      </div>

      {/* Voice Profiles */}
      <div className="grid grid-cols-2 gap-3">
        {voiceService.getAvailableVoices().map((voice) => (
          <Card
            key={voice.name}
            onClick={() => handleVoiceSelect(voice)}
            className={`p-4 cursor-pointer transition-all ${
              selectedVoice.name === voice.name
                ? 'ring-2 ring-primary bg-primary/10'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{voice.emoji}</div>
              <p className="font-semibold text-sm">{voice.name}</p>
              <p className="text-xs text-gray-600">{voice.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Sliders */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Toonhoogte</label>
            <span className="text-sm text-gray-600">{customPitch.toFixed(1)}</span>
          </div>
          <Slider
            value={[customPitch]}
            onValueChange={handlePitchChange}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Lager</span>
            <span>Hoger</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Snelheid</label>
            <span className="text-sm text-gray-600">{customRate.toFixed(1)}</span>
          </div>
          <Slider
            value={[customRate]}
            onValueChange={handleRateChange}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Langzamer</span>
            <span>Sneller</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

