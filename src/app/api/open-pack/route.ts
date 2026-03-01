import { NextRequest, NextResponse } from 'next/server';
import { MOCK_USER, updateMockUser, MOCK_CARDS, addToCollection } from '@/lib/mockData';

export async function POST(req: NextRequest) {
    const { packId } = await req.json();

    const packIndex = MOCK_USER.inventory.findIndex(i => i.packId === packId);

    if (packIndex === -1 || MOCK_USER.inventory[packIndex].count <= 0) {
        return NextResponse.json({ error: 'No packs available' }, { status: 400 });
    }

    // Determine game from packId (hack for mock)
    const game = packId.startsWith('pk-p') ? 'Pokemon' : packId.startsWith('pk-y') ? 'Yu-Gi-Oh!' : 'Magic';
    const pool = MOCK_CARDS.filter(c => c.game === game);

    // Generate 5 random cards (duplicates allowed in mock for simplicity)
    const openedCards = Array.from({ length: 5 }, () => {
        const randomIdx = Math.floor(Math.random() * pool.length);
        const card = pool[randomIdx];
        return { ...card, id: `${card.id}-${Math.random().toString(36).substr(2, 9)}` };
    });

    // Update inventory
    const newInventory = [...MOCK_USER.inventory];
    newInventory[packIndex].count -= 1;

    updateMockUser({
        ...MOCK_USER,
        inventory: newInventory
    });

    // Add to collection
    addToCollection(openedCards);

    return NextResponse.json({ cards: openedCards });
}
