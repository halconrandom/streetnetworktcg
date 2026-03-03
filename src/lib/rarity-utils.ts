/**
 * Rarity Utilities for TCG Card Display
 * Supports both Physical TCG and TCG Pocket rarity systems
 */

// Rarity tier definitions
export const RARITY_TIERS = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  RARE_HOLO: 4,
  DOUBLE_RARE: 4,
  ULTRA_RARE: 5,
  ILLUSTRATION_RARE: 6,
  SPECIAL_ILLUSTRATION_RARE: 7,
  HYPER_RARE: 8,
  SECRET_RARE: 8,
  RAINBOW_RARE: 7,
  SHINY_RARE: 6,
  SHINY_ULTRA_RARE: 7,
  AMAZING_RARE: 5,
  GOLDEN_RARE: 8,
  PRISM_RARE: 8,
  CROWN_RARE: 9,
  IMMERSIVE_RARE: 8,
} as const;

// Visual configuration for each rarity
export interface RarityConfig {
  symbol: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor?: string;
  isAnimated?: boolean;
  tier: number;
}

// Rarity visual mappings
export const RARITY_VISUALS: Record<string, RarityConfig> = {
  // TCG POCKET - Diamond System (◊)
  '◊': { symbol: '◊', label: 'Uncommon', color: 'text-zinc-300', bgColor: 'bg-zinc-500/20', borderColor: 'border-zinc-500/30', tier: 2 },
  '◊◊': { symbol: '◊◊', label: 'Rare', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30', tier: 3 },
  '◊◊◊': { symbol: '◊◊◊', label: 'Double Rare', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30', glowColor: 'shadow-purple-500/30', tier: 4 },
  '◊◊◊◊': { symbol: '◊◊◊◊', label: 'Ultra Rare', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30', glowColor: 'shadow-amber-500/30', tier: 5 },
  
  // TCG POCKET - Star System (☆)
  '☆': { symbol: '☆', label: 'Illustration Rare', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30', glowColor: 'shadow-amber-500/30', tier: 6 },
  '☆☆': { symbol: '☆☆', label: 'Special Illustration', color: 'text-pink-400', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30', glowColor: 'shadow-pink-500/30', tier: 7 },
  '☆☆☆': { symbol: '☆☆☆', label: 'Immersive', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30', glowColor: 'shadow-cyan-500/30', isAnimated: true, tier: 8 },
  
  // TCG POCKET - Crown
  '👑': { symbol: '👑', label: 'Crown Rare', color: 'text-yellow-300', bgColor: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30', borderColor: 'border-yellow-400/50', glowColor: 'shadow-yellow-500/50', isAnimated: true, tier: 9 },
  'Crown Rare': { symbol: '👑', label: 'Crown Rare', color: 'text-yellow-300', bgColor: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30', borderColor: 'border-yellow-400/50', glowColor: 'shadow-yellow-500/50', isAnimated: true, tier: 9 },
  'Immersive Rare': { symbol: '☆☆☆', label: 'Immersive', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30', glowColor: 'shadow-cyan-500/30', isAnimated: true, tier: 8 },
  
  // PHYSICAL TCG
  'Common': { symbol: '○', label: 'Common', color: 'text-zinc-400', bgColor: 'bg-zinc-500/20', borderColor: 'border-zinc-500/30', tier: 1 },
  'Uncommon': { symbol: '◆', label: 'Uncommon', color: 'text-zinc-300', bgColor: 'bg-zinc-400/20', borderColor: 'border-zinc-400/30', tier: 2 },
  'Rare': { symbol: '★', label: 'Rare', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30', tier: 3 },
  'Rare Holo': { symbol: '★', label: 'Rare Holo', color: 'text-blue-300', bgColor: 'bg-blue-400/20', borderColor: 'border-blue-400/30', glowColor: 'shadow-blue-400/30', tier: 4 },
  'Double Rare': { symbol: '★★', label: 'Double Rare', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30', glowColor: 'shadow-red-500/30', tier: 4 },
  'Ultra Rare': { symbol: '★★', label: 'Ultra Rare', color: 'text-slate-300', bgColor: 'bg-slate-400/20', borderColor: 'border-slate-400/30', glowColor: 'shadow-slate-300/30', tier: 5 },
  'Illustration Rare': { symbol: '★', label: 'Illustration Rare', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30', glowColor: 'shadow-amber-500/30', tier: 6 },
  'Special Illustration Rare': { symbol: '★★', label: 'Special Illustration', color: 'text-pink-400', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30', glowColor: 'shadow-pink-500/30', tier: 7 },
  'Hyper Rare': { symbol: '👑', label: 'Hyper Rare', color: 'text-yellow-300', bgColor: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30', borderColor: 'border-yellow-400/50', glowColor: 'shadow-yellow-500/50', isAnimated: true, tier: 8 },
  'Secret Rare': { symbol: '✦', label: 'Secret Rare', color: 'text-rose-400', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/30', glowColor: 'shadow-rose-500/30', tier: 8 },
  'Rainbow Rare': { symbol: '🌈', label: 'Rainbow Rare', color: 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400', bgColor: 'bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20', borderColor: 'border-white/30', glowColor: 'shadow-white/30', isAnimated: true, tier: 7 },
  'Shiny Rare': { symbol: '✦', label: 'Shiny Rare', color: 'text-rose-400', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/30', tier: 6 },
  'Shiny Ultra Rare': { symbol: '✦✦', label: 'Shiny Ultra Rare', color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/20', borderColor: 'border-fuchsia-500/30', glowColor: 'shadow-fuchsia-500/30', tier: 7 },
  'Amazing Rare': { symbol: '✨', label: 'Amazing Rare', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30', glowColor: 'shadow-cyan-500/30', tier: 5 },
  'Golden Rare': { symbol: '★', label: 'Golden Rare', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30', glowColor: 'shadow-yellow-500/30', tier: 8 },
  'Prism Rare': { symbol: '◇', label: 'Prism Rare', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30', glowColor: 'shadow-purple-500/30', isAnimated: true, tier: 8 },
  'Promo': { symbol: 'P', label: 'Promo', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30', tier: 3 },
  
  // Legacy star system
  '★': { symbol: '★', label: 'Rare', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30', tier: 3 },
  '★★': { symbol: '★★', label: 'Ultra Rare', color: 'text-slate-300', bgColor: 'bg-slate-400/20', borderColor: 'border-slate-400/30', glowColor: 'shadow-slate-300/30', tier: 5 },
  '★★★': { symbol: '★★★', label: 'Hyper Rare', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30', glowColor: 'shadow-cyan-500/30', isAnimated: true, tier: 8 },
  
  // Shiny system
  '✦': { symbol: '✦', label: 'Shiny Rare', color: 'text-rose-400', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/30', tier: 6 },
  '✦✦': { symbol: '✦✦', label: 'Shiny Ultra Rare', color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/20', borderColor: 'border-fuchsia-500/30', glowColor: 'shadow-fuchsia-500/30', tier: 7 },
};

// Normalize rarity name for matching
export function normalizeRarity(rarity: string): string {
  if (!rarity) return 'Common';
  const normalized = rarity.trim();
  if (RARITY_VISUALS[normalized]) return normalized;
  
  // Handle diamond notation
  const diamondMatch = normalized.match(/^(◊+)|(\d+)\s*diamond/i);
  if (diamondMatch) {
    if (diamondMatch[1]) return diamondMatch[1];
    const count = parseInt(diamondMatch[2]);
    if (count >= 1 && count <= 4) return '◊'.repeat(count);
  }
  
  // Handle star notation
  const starMatch = normalized.match(/^(★+)|(\d+)\s*star/i);
  if (starMatch) {
    if (starMatch[1]) return starMatch[1];
    const count = parseInt(starMatch[2]);
    if (count >= 1 && count <= 3) return '★'.repeat(count);
  }
  
  // Handle pocket star notation (☆)
  const pocketStarMatch = normalized.match(/^(☆+)|(\d+)\s*(pocket\s*)?star/i);
  if (pocketStarMatch) {
    if (pocketStarMatch[1]) return pocketStarMatch[1];
    const count = parseInt(pocketStarMatch[2]);
    if (count >= 1 && count <= 3) return '☆'.repeat(count);
  }
  
  const variations: Record<string, string> = {
    'common': 'Common', 'uncommon': 'Uncommon', 'rare holo': 'Rare Holo', 'rare': 'Rare',
    'ultra': 'Ultra Rare', 'ultra rare': 'Ultra Rare', 'illustration': 'Illustration Rare',
    'illustration rare': 'Illustration Rare', 'special illustration': 'Special Illustration Rare',
    'special illustration rare': 'Special Illustration Rare', 'hyper': 'Hyper Rare',
    'hyper rare': 'Hyper Rare', 'secret': 'Secret Rare', 'secret rare': 'Secret Rare',
    'rainbow': 'Rainbow Rare', 'rainbow rare': 'Rainbow Rare', 'shiny': 'Shiny Rare',
    'shiny rare': 'Shiny Rare', 'shiny ultra': 'Shiny Ultra Rare', 'shiny ultra rare': 'Shiny Ultra Rare',
    'amazing': 'Amazing Rare', 'amazing rare': 'Amazing Rare', 'double rare': 'Double Rare',
    'golden': 'Golden Rare', 'golden rare': 'Golden Rare', 'prism': 'Prism Rare',
    'prism rare': 'Prism Rare', 'promo': 'Promo', 'crown': 'Crown Rare', 'crown rare': 'Crown Rare',
    'immersive': 'Immersive Rare', 'immersive rare': 'Immersive Rare', 'none': 'Common',
  };
  
  return variations[normalized.toLowerCase()] || 'Common';
}

export function getRarityConfig(rarity: string): RarityConfig {
  const normalized = normalizeRarity(rarity);
  return RARITY_VISUALS[normalized] || RARITY_VISUALS['Common'];
}

export function getRarityTier(rarity: string): number {
  const normalized = normalizeRarity(rarity);
  return RARITY_VISUALS[normalized]?.tier || 1;
}

export function isHitRarity(rarity: string): boolean {
  return getRarityTier(rarity) >= 5;
}

export function isUltraRareOrBetter(rarity: string): boolean {
  return getRarityTier(rarity) >= 6;
}

export function hasAnimation(rarity: string): boolean {
  const config = getRarityConfig(rarity);
  return config.isAnimated || false;
}

export function getUniqueRarities(cards: { rarity: string }[]): string[] {
  const rarities = new Set<string>();
  cards.forEach(card => { if (card.rarity) rarities.add(card.rarity); });
  return Array.from(rarities).sort((a, b) => getRarityTier(b) - getRarityTier(a));
}
