/**
 * Dream Synthesizer Component - Concept 1
 * Custom wereldbouw interface
 * Gebaseerd op future_story_app_concepts_2025.md
 */

import { useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface DreamSynthesizerProps {
  onWorldCreated: (description: string) => void
  className?: string
}

const worldElements = [
  { emoji: '🏰', label: 'Kasteel', value: 'kasteel' },
  { emoji: '🌲', label: 'Bos', value: 'bos' },
  { emoji: '🌊', label: 'Oceaan', value: 'oceaan' },
  { emoji: '⛰️', label: 'Berg', value: 'berg' },
  { emoji: '🌌', label: 'Ruimte', value: 'ruimte' },
  { emoji: '🏙️', label: 'Stad', value: 'stad' },
  { emoji: '☁️', label: 'Wolken', value: 'wolken' },
  { emoji: '🌈', label: 'Regenboog', value: 'regenboog' },
]

const modifiers = [
  { emoji: '✨', label: 'Magisch', value: 'magisch' },
  { emoji: '🌙', label: 'Nacht', value: 'nacht' },
  { emoji: '☀️', label: 'Zonnig', value: 'zonnig' },
  { emoji: '❄️', label: 'Sneeuw', value: 'sneeuw' },
  { emoji: '🌺', label: 'Bloemen', value: 'bloemen' },
  { emoji: '🦄', label: 'Unicorns', value: 'unicorns' },
]

export function DreamSynthesizer({ onWorldCreated, className = '' }: DreamSynthesizerProps) {
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [customDescription, setCustomDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleElementClick = (value: string) => {
    setSelectedElements((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleModifierClick = (value: string) => {
    setSelectedModifiers((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const buildWorldDescription = (): string => {
    const parts: string[] = []

    if (selectedElements.length > 0) {
      parts.push(`Een ${selectedElements.join(', ')}`)
    }

    if (selectedModifiers.length > 0) {
      parts.push(`met ${selectedModifiers.join(', ')}`)
    }

    if (customDescription.trim()) {
      parts.push(customDescription.trim())
    }

    return parts.join(' ') || 'Een magische wereld'
  }

  const handleCreate = async () => {
    setIsGenerating(true)
    const description = buildWorldDescription()
    
    // Simulate AI image generation (in production, call actual API)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsGenerating(false)
    onWorldCreated(description)
  }

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div>
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          Schilder je Droomwereld
          <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-6 h-6 object-contain" />
        </h3>
        <p className="text-gray-600">
          Kies elementen en voeg je eigen ideeën toe om een unieke wereld te maken!
        </p>
      </div>

      {/* World Elements */}
      <div>
        <label className="block text-sm font-medium mb-3">Waar speelt je verhaal zich af?</label>
        <div className="grid grid-cols-4 gap-3">
          {worldElements.map((element) => (
            <Card
              key={element.value}
              onClick={() => handleElementClick(element.value)}
              className={`p-3 cursor-pointer text-center transition-all ${
                selectedElements.includes(element.value)
                  ? 'ring-2 ring-primary bg-primary/10'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center">
                <img src="/icon_star_alone-removebg-preview.png" alt={element.label} className="w-full h-full object-contain" />
              </div>
              <p className="text-xs font-medium">{element.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Modifiers */}
      <div>
        <label className="block text-sm font-medium mb-3">Wat maakt het speciaal?</label>
        <div className="grid grid-cols-3 gap-3">
          {modifiers.map((modifier) => (
            <Card
              key={modifier.value}
              onClick={() => handleModifierClick(modifier.value)}
              className={`p-3 cursor-pointer text-center transition-all ${
                selectedModifiers.includes(modifier.value)
                  ? 'ring-2 ring-accent bg-accent/10'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                <img src="/icon_star_alone-removebg-preview.png" alt={modifier.label} className="w-full h-full object-contain" />
              </div>
              <p className="text-xs font-medium">{modifier.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Vertel meer over je wereld (optioneel)
        </label>
        <Input
          type="text"
          placeholder="Bijvoorbeeld: met watervallen van limonade..."
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Preview */}
      {(selectedElements.length > 0 || selectedModifiers.length > 0 || customDescription) && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-1">Je wereld:</p>
          <p className="text-blue-700">{buildWorldDescription()}</p>
        </Card>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleCreate}
        disabled={isGenerating || (selectedElements.length === 0 && !customDescription)}
        className="w-full h-14 text-lg"
        size="lg"
      >
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Wereld aan het maken...
          </>
        ) : (
          <>
            <img src="/icon_star_alone-removebg-preview.png" alt="" className="w-5 h-5 object-contain mr-2" />
            Maak mijn Wereld!
          </>
        )}
      </Button>
    </Card>
  )
}

