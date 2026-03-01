export type GameType = 'Pokemon' | 'Yu-Gi-Oh!' | 'Magic';

export interface Card {
    id: string;
    name: string;
    type: string;
    rarity: string;
    imageUrl: string;
    game: GameType;
    price?: number;
}

export interface Pack {
    id: string;
    name: string;
    game: GameType;
    price: number;
    imageUrl?: string;
}

export interface InventoryItem {
    packId: string;
    count: number;
}

export interface UserProfile {
    id: string;
    username: string;
    avatar: string | null;
    balance: number;
    inventory: InventoryItem[];
}
