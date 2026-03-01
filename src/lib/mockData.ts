import { Card, Pack, UserProfile } from './types';

export const MOCK_CARDS: Card[] = [
    // Pokemon
    {
        id: 'p1',
        name: 'Charizard',
        type: 'Fire',
        rarity: 'Ultra Rare',
        imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
        game: 'Pokemon',
    },
    {
        id: 'p2',
        name: 'Blastoise',
        type: 'Water',
        rarity: 'Rare Holo',
        imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
        game: 'Pokemon',
    },
    {
        id: 'p3',
        name: 'Venusaur',
        type: 'Grass',
        rarity: 'Rare Holo',
        imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png',
        game: 'Pokemon',
    },
    // Yu-Gi-Oh
    {
        id: 'y1',
        name: 'Blue-Eyes White Dragon',
        type: 'Dragon/Normal',
        rarity: 'Ultra Rare',
        imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
        game: 'Yu-Gi-Oh!',
    },
    {
        id: 'y2',
        name: 'Dark Magician',
        type: 'Spellcaster/Normal',
        rarity: 'Ultra Rare',
        imageUrl: 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
        game: 'Yu-Gi-Oh!',
    },
    {
        id: 'y3',
        name: 'Exodia the Forbidden One',
        type: 'Spellcaster/Effect',
        rarity: 'Ultra Rare',
        imageUrl: 'https://images.ygoprodeck.com/images/cards/33396948.jpg',
        game: 'Yu-Gi-Oh!',
    },
    // Magic
    {
        id: 'm1',
        name: 'Black Lotus',
        type: 'Artifact',
        rarity: 'Rare',
        imageUrl: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
        game: 'Magic',
    },
    {
        id: 'm2',
        name: 'Ancestral Recall',
        type: 'Instant',
        rarity: 'Rare',
        imageUrl: 'https://cards.scryfall.io/large/front/2/3/2359af08-4156-48bd-8ef6-0c121d919d9b.jpg',
        game: 'Magic',
    },
    {
        id: 'm3',
        name: 'Time Walk',
        type: 'Sorcery',
        rarity: 'Rare',
        imageUrl: 'https://cards.scryfall.io/large/front/7/0/70901356-3266-4bd9-aacc-f06c27271de5.jpg',
        game: 'Magic',
    }
];

export const MOCK_PACKS: Pack[] = [
    { id: 'pk-p1', name: 'Pokemon Base Set', game: 'Pokemon', price: 500 },
    { id: 'pk-y1', name: 'Legend of Blue Eyes', game: 'Yu-Gi-Oh!', price: 400 },
    { id: 'pk-m1', name: 'MTG Alpha Edition', game: 'Magic', price: 1000 },
];

export let MOCK_USER: UserProfile = {
    id: 'u1',
    username: 'StreetCollector',
    avatar: null,
    balance: 2500,
    inventory: [
        { packId: 'pk-p1', count: 2 },
        { packId: 'pk-y1', count: 5 },
    ],
};

export let MOCK_COLLECTION: Card[] = [
    MOCK_CARDS[0],
    MOCK_CARDS[3],
];

export const updateMockUser = (newUser: UserProfile) => {
    MOCK_USER = newUser;
};

export const addToCollection = (cards: Card[]) => {
    MOCK_COLLECTION = [...MOCK_COLLECTION, ...cards];
};
