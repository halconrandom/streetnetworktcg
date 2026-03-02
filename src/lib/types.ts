export type GameType = 'Pokemon' | 'Yu-Gi-Oh!' | 'Magic';

// ============================================
// CARD TYPES
// ============================================

export interface Card {
  id: string;
  name: string;
  type: string;
  rarity: string;
  imageUrl: string;
  game: GameType;
  price?: number;
  
  // Extended Pokemon fields
  supertype?: string;
  subtypes?: string[];
  types?: string[];
  hp?: string;
  number?: string;
  artist?: string;
  raritySlug?: string;
  tcgId?: string;
  evolvesTo?: string[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  attacks?: CardAttack[];
  abilities?: CardAbility[];
  weaknesses?: CardWeakness[];
  resistances?: CardResistance[];
  legalities?: CardLegalities;
  nationalPokedexNumbers?: number[];
}

export interface CardAttack {
  name: string;
  cost?: string[];
  convertedEnergyCost?: number;
  damage?: string;
  text?: string;
}

export interface CardAbility {
  name: string;
  text: string;
  type: string;
}

export interface CardWeakness {
  type: string;
  value?: string;
}

export interface CardResistance {
  type: string;
  value?: string;
}

export interface CardLegalities {
  unlimited?: string;
  standard?: string;
  expanded?: string;
}

// ============================================
// SET TYPES
// ============================================

export interface Set {
  id: string;
  name: string;
  game: GameType;
  series?: string;
  printedTotal?: number;
  total?: number;
  releaseDate?: string;
  logoUrl?: string;
  symbolUrl?: string;
  tcgId?: string;
}

// ============================================
// PACK TYPES
// ============================================

export interface Pack {
  id: string;
  name: string;
  game: GameType;
  price: number;
  imageUrl?: string;
  cardCount?: number;
  setId?: string;
}

// ============================================
// USER TYPES
// ============================================

export interface InventoryItem {
  packId: string;
  count: number;
  name?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string | null;
  balance: number;
  inventory: InventoryItem[];
  role?: 'user' | 'admin';
}

// ============================================
// RARITY ENGINE TYPES
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

export interface UserLuckState {
  packsSinceLastHit: number;
  packsSinceLastRare: number;
  totalPacksOpened: number;
  currentLuckyStreak: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PokemonTcgSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface PokemonTcgCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  level?: string;
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  ancientTrait?: {
    name: string;
    text: string;
  };
  abilities?: Array<{
    name: string;
    text: string;
    type: string;
  }>;
  attacks?: Array<{
    name: string;
    cost?: string[];
    convertedEnergyCost?: number;
    damage?: string;
    text?: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value?: string;
  }>;
  resistances?: Array<{
    type: string;
    value?: string;
  }>;
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    legalities: Record<string, string>;
    ptcgoCode?: string;
    releaseDate: string;
    updatedAt: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<string, {
      low?: number;
      mid?: number;
      high?: number;
      market?: number;
      directLow?: number;
    }>;
  };
  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
      lowPriceExPlus?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      reverseHoloAvg1?: number;
      reverseHoloAvg7?: number;
      reverseHoloAvg30?: number;
    };
  };
}

export interface PokemonTcgApiResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// ============================================
// IMPORT TYPES
// ============================================

export interface ImportProgress {
  type: 'sets' | 'cards';
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  total: number;
  processed: number;
  currentSet?: string;
  errors: string[];
  startedAt?: Date;
  completedAt?: Date;
}
