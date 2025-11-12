/**
 * Avatar Video Mapping
 * Koppelt avatar ID's aan hun bijbehorende video's
 */

export interface AvatarVideoSet {
  default?: string; // Standaard media (fallback)
  intro?: string;   // Intro context (voor avatar selectie)
  readingbook?: string; // Reading book context (wanneer kind verhaal leest)
  talking?: string; // Talking context (wanneer kind op avatar klikt)
  welldone?: string; // Welldone context (wanneer kind verhaal heeft gegenereerd)
  book?: string;    // Boek context (legacy, fallback naar readingbook)
  cat?: string;     // Kat context (legacy)
}

/**
 * Mapping van avatar ID's naar video sets
 * Alle beschikbare avatars met hun varianten
 */
export const avatarVideoMap: Record<string, AvatarVideoSet> = {
  // Legacy avatars (behouden voor backwards compatibility)
  'avatar1': {
    default: '/avatar1/avatar1-unscreen.gif',
    book: '/avatar1/avatar1book-unscreen.gif',
    cat: '/avatar1/avatar1cat-unscreen.gif',
    talking: '/avatar1/avatar1_talking.gif',
  },
  'avatar2': {
    default: '/avatar2/avatar2-unscreen.gif',
    book: '/avatar2/avatar2book-unscreen.gif',
    cat: '/avatar2/avatar2cat-unscreen.gif',
    talking: '/avatar2/avatar2_talking.gif',
  },
  'avatar4': {
    default: '/avatar4/avatar4-unscreen.gif',
    book: '/avatar4/avatar4book-unscreen.gif',
    cat: '/avatar4/avatar4cat-unscreen.gif',
    talking: '/avatar4/avatar4_talking.gif',
  },
  'avatar5': {
    default: '/avatar5/avatar5-unscreen.gif',
    book: '/avatar5/avatar5book-unscreen.gif',
    cat: '/avatar5/avatar5cat-unscreen.gif',
    talking: '/avatar5/avatar5_talking.gif',
  },
  'avatar6': {
    default: '/avatar6/avatar6-unscreen.gif',
    book: '/avatar6/avatar6-unscreen.gif',
    cat: '/avatar6/avatar6cat-unscreen.gif',
    talking: '/avatar6/avatar6_talking.gif',
  },
  // Nieuwe avatars met alle contexten
  'avatarpink': {
    intro: '/avatarpink/avatarpink-intro-2--unscreen.gif',
    readingbook: '/avatarpink/avatarpink-readingbook-2--unscreen.gif',
    talking: '/avatarpink/avatarpink-talking-3--unscreen.gif',
    welldone: '/avatarpink/avatarpink-welldone-unscreen.gif',
    default: '/avatarpink/avatarpink-intro-2--unscreen.gif',
  },
  'avatarpurple': {
    intro: '/avatarpurple/avatarpurple-intro-unscreen.gif',
    readingbook: '/avatarpurple/avatarpurple-readingbook-2--unscreen.gif',
    talking: '/avatarpurple/avatarpurple-talking-2--unscreen.gif',
    welldone: '/avatarpurple/avatarpurple-welldone-2--unscreen.gif',
    default: '/avatarpurple/avatarpurple-intro-unscreen.gif',
  },
  'avatarbrown': {
    intro: '/avatarbrown/avatarbrown-intro-2--unscreen.gif',
    readingbook: '/avatarbrown/avatarbrown-readingbook-2--unscreen.gif',
    talking: '/avatarbrown/avatarbrown-talking-2--unscreen.gif',
    welldone: '/avatarbrown/avatarbrown-welldone-2--unscreen.gif',
    default: '/avatarbrown/avatarbrown-intro-2--unscreen.gif',
  },
  // Stitch avatar met alle contexten
  'stitch': {
    intro: '/stitch/stitch_happy-unscreen.gif',
    readingbook: '/stitch/stitch-readingbook-unscreen.gif',
    talking: '/stitch/stitch-talking-unscreen.gif',
    welldone: '/stitch/stitch-bravo-unscreen.gif',
    default: '/stitch/stitch_happy-unscreen.gif',
    // Legacy support
    book: '/stitch/stitch-readingbook-unscreen.gif',
  },
  // Spiderman avatar met alle contexten
  'spiderman': {
    intro: '/spiderman/spiderman-intro-unscreen.gif',
    readingbook: '/spiderman/spiderman-readingbook-unscreen.gif',
    talking: '/spiderman/spiderman-talking-unscreen.gif',
    welldone: '/spiderman/spiderman-bravo-unscreen.gif',
    default: '/spiderman/spiderman-intro-unscreen.gif',
    // Legacy support
    book: '/spiderman/spiderman-readingbook-unscreen.gif',
  },
}

/**
 * Detecteert welke avatar ID op basis van customization
 * Nu gebruiken we de expliciete avatarId veld
 */
export function detectAvatarId(customization: {
  avatarId?: string;
  skinColor?: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  accessories?: string[];
}): string | null {
  if (!customization) return null;

  // Gebruik expliciete avatarId als die bestaat
  if (customization.avatarId) {
    return customization.avatarId;
  }

  // Fallback: oude detectie logica (voor backwards compatibility)
  // Updated met nieuwe kindvriendelijke kleuren
  const isAvatar4 = 
    (customization.hairStyle === 'long' || customization.hairStyle === 'braids') && 
    (customization.hairColor === 'brown' || customization.hairColor === '#8B4513' || customization.hairColor === '#D4A574') &&
    (customization.eyeColor === 'brown' || customization.eyeColor === '#8B4513' || customization.eyeColor === '#FFBF00');

  if (isAvatar4) {
    return 'avatar4';
  }

  // Geen match gevonden
  return null;
}

/**
 * Haalt de juiste video op voor een avatar in een bepaalde context
 * Fallback naar default als de specifieke context variant niet bestaat
 */
export function getAvatarVideo(
  avatarId: string | null,
  context: 'default' | 'intro' | 'readingbook' | 'talking' | 'welldone' | 'book' | 'cat' = 'default'
): string | null {
  if (!avatarId || !avatarVideoMap[avatarId]) {
    return null;
  }

  const videoSet = avatarVideoMap[avatarId];
  
  // Legacy support: 'book' mapt naar 'readingbook'
  if (context === 'book' && videoSet.readingbook) {
    return videoSet.readingbook;
  }
  
  // Als context 'default' is, gebruik intro of default
  if (context === 'default') {
    return videoSet.intro || videoSet.default || null;
  }
  
  // Voor specifieke context: gebruik de variant als die bestaat
  const contextVideo = videoSet[context];
  if (contextVideo) {
    return contextVideo;
  }
  
  // Fallback chain: context -> default -> intro
  return videoSet.default || videoSet.intro || null;
}

