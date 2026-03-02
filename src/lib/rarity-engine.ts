/**
 * Rarity Engine for TCG Pack Opening
 * 
 * Implements a weighted probability system for pack openings
 * with fun mechanics like lucky streaks and bad luck protection.
 */

// ============================================
// TYPES
// ============================================

export interface RaritySlot {
  rarity: string;
  weight: number;
  minPerPack: number;
  maxPerPack: number;
  isGuaranteed: boolean;
}

export interface PackConfig {
  totalCards: number;
  slots: RaritySlot[];
}

export interface OpenPackResult {
  cards: string[]; // Card IDs
  rarityBreakdown: Record<string, number>;
  isJackpot: boolean;
  luckyBonus: number;
}

export interface UserLuckState {
  packsSinceLastHit: number; // Packs since last ultra rare or better
  packsSinceLastRare: number; // Packs since last rare holo or better
  totalPacksOpened: number;
  currentLuckyStreak: number;
}

// ============================================
// RARITY DEFINITIONS
// ============================================

export const POKEMON_RARITIES = {
  // Base rarities (common slots)
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  
  // Rare slot (guaranteed 1 per pack)
  RARE: 'Rare',
  RARE_HOLO: 'Rare Holo',
  DOUBLE_RARE: 'Double Rare',
  
  // Ultra rare tiers
  ULTRA_RARE: 'Ultra Rare',
  ILLUSTRATION_RARE: 'Illustration Rare',
  SPECIAL_ILLUSTRATION_RARE: 'Special Illustration Rare',
  HYPER_RARE: 'Hyper Rare',
  
  // Special rarities
  AMAZING_RARE: 'Amazing Rare',
  RAINBOW_RARE: 'Rainbow Rare',
  SECRET_RARE: 'Secret Rare',
  SHINY_RARE: 'Shiny Rare',
  GOLDEN_RARE: 'Golden Rare',
  PRISM_RARE: 'Prism Rare',
} as const;

// Rarity tiers for probability calculations
const RARITY_TIERS: Record<string, number> = {
  'Common': 1,
  'Uncommon': 2,
  'Rare': 3,
  'Rare Holo': 4,
  'Double Rare': 4,
  'Amazing Rare': 4,
  'Ultra Rare': 5,
  'Illustration Rare': 5,
  'Shiny Rare': 5,
  'Rainbow Rare': 6,
  'Special Illustration Rare': 6,
  'Hyper Rare': 6,
  'Golden Rare': 6,
  'Secret Rare': 7,
  'Prism Rare': 7,
};

// ============================================
// DEFAULT PACK CONFIGURATIONS
// ============================================

export const DEFAULT_POKEMON_CONFIG: PackConfig = {
  totalCards: 10,
  slots: [
    { rarity: POKEMON_RARITIES.COMMON, weight: 1.0, minPerPack: 5, maxPerPack: 7, isGuaranteed: false },
    { rarity: POKEMON_RARITIES.UNCOMMON, weight: 1.0, minPerPack: 2, maxPerPack: 3, isGuaranteed: false },
    { rarity: POKEMON_RARITIES.RARE, weight: 0.70, minPerPack: 1, maxPerPack: 1, isGuaranteed: true },
    { rarity: POKEMON_RARITIES.RARE_HOLO, weight: 0.25, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
    { rarity: POKEMON_RARITIES.ULTRA_RARE, weight: 0.04, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
    { rarity: POKEMON_RARITIES.ILLUSTRATION_RARE, weight: 0.03, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
    { rarity: POKEMON_RARITIES.SPECIAL_ILLUSTRATION_RARE, weight: 0.015, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
    { rarity: POKEMON_RARITIES.HYPER_RARE, weight: 0.01, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
  ],
};

// Special sets have different rates
export const SPECIAL_SET_CONFIGS: Record<string, PackConfig> = {
  // Paldean Fates - higher shiny rates
  'sv4pt5': {
    totalCards: 10,
    slots: [
      { rarity: POKEMON_RARITIES.COMMON, weight: 1.0, minPerPack: 5, maxPerPack: 7, isGuaranteed: false },
      { rarity: POKEMON_RARITIES.UNCOMMON, weight: 1.0, minPerPack: 2, maxPerPack: 3, isGuaranteed: false },
      { rarity: POKEMON_RARITIES.RARE, weight: 0.60, minPerPack: 1, maxPerPack: 1, isGuaranteed: true },
      { rarity: POKEMON_RARITIES.RARE_HOLO, weight: 0.30, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
      { rarity: POKEMON_RARITIES.SHINY_RARE, weight: 0.08, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
      { rarity: POKEMON_RARITIES.ILLUSTRATION_RARE, weight: 0.04, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
      { rarity: POKEMON_RARITIES.SPECIAL_ILLUSTRATION_RARE, weight: 0.02, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
      { rarity: POKEMON_RARITIES.HYPER_RARE, weight: 0.015, minPerPack: 0, maxPerPack: 1, isGuaranteed: false },
    ],
  },
};

// ============================================
// LUCK MECHANICS
// ============================================

const LUCK_CONFIG = {
  // Bad luck protection: after X packs without ultra rare, increase odds
  badLuckThreshold: 25,
  badLuckBonusPerPack: 0.005, // +0.5% per pack after threshold
  
  // Lucky streak: consecutive packs with hits increase chance
  luckyStreakBonus: 0.02, // +2% per consecutive hit
  
  // Jackpot chance: small chance of multiple ultra rares
  jackpotChance: 0.005, // 0.5% chance
  jackpotMinExtraRares: 1,
  jackpotMaxExtraRares: 2,
  
  // Max luck bonus
  maxLuckBonus: 0.15, // Cap at +15%
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Seeded random number generator for reproducible results
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * Generate a random seed based on timestamp and user ID
 */
export function generateSeed(userId: string): number {
  const timestamp = Date.now();
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return Math.abs(timestamp ^ hash);
}

/**
 * Weighted random selection
 */
function weightedRandom<T>(items: T[], weights: number[], random: () => number): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomValue = random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

/**
 * Check if a rarity is "hit" tier (ultra rare or better)
 */
export function isHitRarity(rarity: string): boolean {
  const tier = RARITY_TIERS[rarity] || 0;
  return tier >= 5;
}

/**
 * Check if a rarity is rare holo or better
 */
export function isRareOrBetter(rarity: string): boolean {
  const tier = RARITY_TIERS[rarity] || 0;
  return tier >= 4;
}

// ============================================
// MAIN PACK OPENING LOGIC
// ============================================

/**
 * Calculate luck bonus based on user's state
 */
export function calculateLuckBonus(luckState: UserLuckState): number {
  let bonus = 0;
  
  // Bad luck protection
  if (luckState.packsSinceLastHit >= LUCK_CONFIG.badLuckThreshold) {
    const packsOverThreshold = luckState.packsSinceLastHit - LUCK_CONFIG.badLuckThreshold;
    bonus += packsOverThreshold * LUCK_CONFIG.badLuckBonusPerPack;
  }
  
  // Lucky streak bonus
  if (luckState.currentLuckyStreak > 0) {
    bonus += luckState.currentLuckyStreak * LUCK_CONFIG.luckyStreakBonus;
  }
  
  // Cap the bonus
  return Math.min(bonus, LUCK_CONFIG.maxLuckBonus);
}

/**
 * Determine rarities for a pack opening
 */
export function determinePackRarities(
  config: PackConfig,
  luckState: UserLuckState,
  seed: number
): { rarities: string[]; isJackpot: boolean; luckyBonus: number } {
  const random = seededRandom(seed);
  const luckBonus = calculateLuckBonus(luckState);
  const rarities: string[] = [];
  let isJackpot = false;
  
  // Check for jackpot
  if (random() < LUCK_CONFIG.jackpotChance) {
    isJackpot = true;
  }
  
  // Separate slots by type
  const baseSlots = config.slots.filter(s => !s.isGuaranteed && s.minPerPack > 0);
  const rareSlots = config.slots.filter(s => s.isGuaranteed || s.weight < 0.5);
  
  // Fill base slots (commons and uncommons)
  for (const slot of baseSlots) {
    const count = slot.minPerPack + Math.floor(random() * (slot.maxPerPack - slot.minPerPack + 1));
    for (let i = 0; i < count; i++) {
      rarities.push(slot.rarity);
    }
  }
  
  // Fill remaining slots with random base cards
  while (rarities.length < config.totalCards - 1) {
    const slot = weightedRandom(
      baseSlots,
      baseSlots.map(s => s.weight),
      random
    );
    rarities.push(slot.rarity);
  }
  
  // Determine the rare slot (last card)
  const rareSlot = selectRareSlot(rareSlots, luckBonus, random);
  rarities.push(rareSlot);
  
  // Jackpot: add extra rare cards
  if (isJackpot) {
    const extraRares = LUCK_CONFIG.jackpotMinExtraRares + 
      Math.floor(random() * (LUCK_CONFIG.jackpotMaxExtraRares - LUCK_CONFIG.jackpotMinExtraRares + 1));
    
    for (let i = 0; i < extraRares; i++) {
      // Replace a common with an extra rare
      const commonIndex = rarities.findIndex(r => r === POKEMON_RARITIES.COMMON);
      if (commonIndex !== -1) {
        const extraSlot = selectRareSlot(rareSlots, luckBonus + 0.1, random);
        rarities[commonIndex] = extraSlot;
      }
    }
  }
  
  // Shuffle the pack
  shuffleArray(rarities, random);
  
  return { rarities, isJackpot, luckyBonus: luckBonus };
}

/**
 * Select a rare slot based on weights and luck bonus
 */
function selectRareSlot(
  slots: RaritySlot[],
  luckBonus: number,
  random: () => number
): string {
  // Apply luck bonus to rare slots
  const adjustedSlots = slots.map(slot => ({
    ...slot,
    adjustedWeight: isHitRarity(slot.rarity) 
      ? slot.weight * (1 + luckBonus * 10) // Amplify luck for rare cards
      : slot.weight,
  }));
  
  // Guaranteed rare is the fallback
  const guaranteed = adjustedSlots.find(s => s.isGuaranteed);
  
  // Try for each rare tier
  for (const slot of adjustedSlots) {
    if (slot.isGuaranteed && slot.weight >= 0.5) continue; // Skip base guaranteed
    
    if (random() < slot.adjustedWeight) {
      return slot.rarity;
    }
  }
  
  // Fallback to guaranteed rare
  return guaranteed?.rarity || POKEMON_RARITIES.RARE;
}

/**
 * Shuffle array in place using Fisher-Yates
 */
function shuffleArray<T>(array: T[], random: () => number): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ============================================
// CARD SELECTION
// ============================================

/**
 * Select a random card of a specific rarity from available cards
 */
export function selectCardOfRarity(
  cards: { id: string; rarity: string; raritySlug?: string }[],
  targetRarity: string,
  random: () => number
): string | null {
  // Match by exact rarity or rarity slug
  const matchingCards = cards.filter(card => {
    const cardRarity = card.rarity || card.raritySlug || '';
    return normalizeRarity(cardRarity) === normalizeRarity(targetRarity);
  });
  
  if (matchingCards.length === 0) {
    // Fallback: try to find similar rarity tier
    const targetTier = RARITY_TIERS[targetRarity] || 3;
    const fallbackCards = cards.filter(card => {
      const cardRarity = card.rarity || card.raritySlug || '';
      const cardTier = RARITY_TIERS[cardRarity] || 1;
      return Math.abs(cardTier - targetTier) <= 1;
    });
    
    if (fallbackCards.length === 0) {
      return cards.length > 0 ? cards[Math.floor(random() * cards.length)].id : null;
    }
    
    return fallbackCards[Math.floor(random() * fallbackCards.length)].id;
  }
  
  return matchingCards[Math.floor(random() * matchingCards.length)].id;
}

/**
 * Normalize rarity names for matching
 */
function normalizeRarity(rarity: string): string {
  return rarity
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace('rareholo', 'rareholo')
    .replace('double', 'rare')
    .replace('specialillustration', 'specialillustration');
}

// ============================================
// MAIN EXPORT
// ============================================

/**
 * Open a pack and return card IDs
 */
export function openPack(
  availableCards: { id: string; rarity: string; raritySlug?: string }[],
  setId: string,
  luckState: UserLuckState,
  userId: string
): OpenPackResult {
  const seed = generateSeed(userId);
  const random = seededRandom(seed);
  
  // Get config for this set (or default)
  const config = SPECIAL_SET_CONFIGS[setId] || DEFAULT_POKEMON_CONFIG;
  
  // Determine rarities
  const { rarities, isJackpot, luckyBonus } = determinePackRarities(config, luckState, seed);
  
  // Select cards for each rarity
  const cards: string[] = [];
  const rarityBreakdown: Record<string, number> = {};
  
  for (const rarity of rarities) {
    const cardId = selectCardOfRarity(availableCards, rarity, random);
    if (cardId) {
      cards.push(cardId);
      rarityBreakdown[rarity] = (rarityBreakdown[rarity] || 0) + 1;
    }
  }
  
  return {
    cards,
    rarityBreakdown,
    isJackpot,
    luckyBonus,
  };
}

/**
 * Get initial luck state for a new user
 */
export function getInitialLuckState(): UserLuckState {
  return {
    packsSinceLastHit: 0,
    packsSinceLastRare: 0,
    totalPacksOpened: 0,
    currentLuckyStreak: 0,
  };
}

/**
 * Update luck state after opening a pack
 */
export function updateLuckState(
  currentState: UserLuckState,
  pulledRarities: string[]
): UserLuckState {
  const hadHit = pulledRarities.some(isHitRarity);
  const hadRare = pulledRarities.some(isRareOrBetter);
  
  return {
    packsSinceLastHit: hadHit ? 0 : currentState.packsSinceLastHit + 1,
    packsSinceLastRare: hadRare ? 0 : currentState.packsSinceLastRare + 1,
    totalPacksOpened: currentState.totalPacksOpened + 1,
    currentLuckyStreak: hadHit ? currentState.currentLuckyStreak + 1 : 0,
  };
}
