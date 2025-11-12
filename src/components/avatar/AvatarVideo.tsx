/**
 * AvatarVideo Component
 * Toont de juiste avatar video op basis van context
 */

import { useEffect, useRef, useState } from 'react'
import { getAvatarVideo, detectAvatarId } from '../../lib/avatarVideos'
import type { AvatarCustomization } from '../../types'

interface AvatarVideoProps {
  customization: AvatarCustomization | null | undefined
  context?: 'default' | 'intro' | 'readingbook' | 'talking' | 'welldone' | 'book' | 'cat'
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  className?: string
  onLoaded?: () => void
  onError?: () => void
  static?: boolean // Als true, toon alleen eerste frame (geen animatie)
}

export function AvatarVideo({
  customization,
  context = 'default',
  autoplay = true,
  loop = true,
  muted = true,
  className = '',
  onLoaded,
  onError,
  static: staticMode = false, // Alleen eerste frame tonen
}: AvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mediaSrc, setMediaSrc] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [staticFrameSrc, setStaticFrameSrc] = useState<string | null>(null) // Voor eerste frame van GIF

  useEffect(() => {
    if (!customization) {
      setMediaSrc(null)
      return
    }

    const avatarId = detectAvatarId(customization)
    const media = getAvatarVideo(avatarId, context)
    
    setMediaSrc(media)
    setHasError(false)
  }, [customization, context])

  // Check of het een GIF of MP4 is
  const isGif = mediaSrc?.endsWith('.gif')

  useEffect(() => {
    if (!mediaSrc) {
      setStaticFrameSrc(null)
      return
    }

    if (isGif && staticMode) {
      // Voor GIF's in static mode: extraheer eerste frame met canvas
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          if (ctx) {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            // Converteer canvas naar data URL
            const dataUrl = canvas.toDataURL('image/png')
            setStaticFrameSrc(dataUrl)
            onLoaded?.()
          }
        }
      }
      
      img.onerror = () => {
        console.warn(`Avatar GIF failed to load: ${mediaSrc}`)
        setHasError(true)
        onError?.()
      }
      
      img.src = mediaSrc
      
      return () => {
        // Cleanup
        setStaticFrameSrc(null)
      }
    } else if (isGif) {
      // Voor GIF's: gebruik img element - GIF's animeren automatisch
      if (imgRef.current) {
        const img = imgRef.current

        const handleLoad = () => {
          // Forceer GIF animatie door src opnieuw te zetten (als browser animatie heeft gestopt)
          if (img.complete && img.naturalWidth > 0) {
            // GIF is geladen, animatie zou automatisch moeten werken
            // Sommige browsers stoppen GIF animaties, maar dit is normaal browser gedrag
          }
          onLoaded?.()
        }

        const handleError = () => {
          console.warn(`Avatar GIF failed to load: ${mediaSrc}`)
          setHasError(true)
          onError?.()
        }

        img.addEventListener('load', handleLoad)
        img.addEventListener('error', handleError)

        // Zorg ervoor dat de GIF correct wordt geladen
        if (img.src !== mediaSrc) {
          img.src = mediaSrc
        }

        return () => {
          img.removeEventListener('load', handleLoad)
          img.removeEventListener('error', handleError)
        }
      }
    } else {
      // Voor MP4's: gebruik video element
      if (videoRef.current) {
        const video = videoRef.current

        const handleLoadedData = () => {
          onLoaded?.()
        }

        const handleError = () => {
          console.warn(`Avatar video failed to load: ${mediaSrc}`)
          setHasError(true)
          onError?.()
        }

        video.addEventListener('loadeddata', handleLoadedData)
        video.addEventListener('error', handleError)

        // Probeer video te laden
        video.load()

        return () => {
          video.removeEventListener('loadeddata', handleLoadedData)
          video.removeEventListener('error', handleError)
        }
      }
    }
  }, [mediaSrc, isGif, staticMode, onLoaded, onError])

  // Als er geen media is of een error, toon niets (of fallback)
  if (!mediaSrc || hasError) {
    return null
  }

  // Check if this is Stitch avatar - needs special handling for big ears
  const avatarId = customization ? detectAvatarId(customization) : null;
  const isStitch = avatarId === 'stitch';
  
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent', // Transparant voor GIF's zonder witte achtergrond
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: isStitch ? 'visible' : 'hidden', // Allow overflow for Stitch's ears
        padding: isStitch ? '10%' : '0', // Add padding for Stitch to show ears
      }}
    >
      {/* Hidden canvas voor eerste frame extractie van GIF's */}
      {isGif && staticMode && (
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      )}
      {isGif ? (
        staticMode && staticFrameSrc ? (
          // Voor GIF's in static mode: toon eerste frame als canvas
          <img
            src={staticFrameSrc}
            alt="Avatar"
            style={{
              width: isStitch ? '150%' : '100%', // Make Stitch image bigger
              height: isStitch ? '150%' : '100%',
              objectFit: isStitch ? 'contain' : 'cover',
              objectPosition: 'center',
            }}
          />
        ) : (
          <img
            ref={imgRef}
            src={mediaSrc}
            alt="Avatar"
            style={{
              width: isStitch ? '180%' : '100%', // Make Stitch image much bigger
              height: isStitch ? '180%' : '100%',
              objectFit: isStitch ? 'contain' : 'cover', // Use contain for Stitch to show full image
              objectPosition: 'center',
            }}
            loading="eager"
            decoding="async"
          />
        )
      ) : (
        <video
          ref={videoRef}
          src={mediaSrc}
          autoPlay={staticMode ? false : autoplay}
          loop={staticMode ? false : loop}
          muted={muted}
          playsInline
          style={{
            width: isStitch ? '180%' : '100%', // Make Stitch image much bigger
            height: isStitch ? '180%' : '100%',
            objectFit: isStitch ? 'contain' : 'cover',
            objectPosition: 'center',
          }}
          onLoadedData={() => {
            // Voor video's: als static mode, pauzeer op eerste frame
            if (staticMode && videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.pause();
            }
            onLoaded?.();
          }}
        />
      )}
    </div>
  )
}

