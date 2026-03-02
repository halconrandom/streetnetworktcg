import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { MOCK_CARDS, MOCK_USER } from '@/lib/mockData';

// Check if we're in development mode without DB
const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.DB_HOST;

export async function POST(req: NextRequest) {
    if (USE_MOCK) {
        const { packId } = await req.json();
        
        // Simulate opening a pack - return random cards
        const shuffled = [...MOCK_CARDS].sort(() => Math.random() - 0.5);
        const openedCards = shuffled.slice(0, 5);

        return NextResponse.json({ cards: openedCards });
    }

    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packId } = await req.json();

        if (!packId) {
            return NextResponse.json({ error: 'Missing packId' }, { status: 400 });
        }

        const client = await getClient();
        try {
            await client.query('BEGIN');

            const packRes = await client.query('SELECT count FROM sg_tcg_user_packs WHERE user_id = $1 AND pack_id = $2 FOR UPDATE', [session.id, packId]);
            if (packRes.rows.length === 0 || packRes.rows[0].count <= 0) {
                throw new Error('No packs available');
            }

            await client.query('UPDATE sg_tcg_user_packs SET count = count - 1 WHERE user_id = $1 AND pack_id = $2', [session.id, packId]);

            const packDef = await client.query('SELECT set_id, card_count FROM sg_tcg_packs WHERE id = $1', [packId]);
            const { set_id, card_count } = packDef.rows[0];

            const cardsPool = await client.query('SELECT id, name, type, rarity, image_url, game FROM sg_tcg_cards WHERE set_id = $1', [set_id]);
            if (cardsPool.rows.length === 0) throw new Error('No cards in set pool');

            const openedCards = [];
            for (let i = 0; i < card_count; i++) {
                const randomCard = cardsPool.rows[Math.floor(Math.random() * cardsPool.rows.length)];
                openedCards.push(randomCard);

                await client.query(`
                    INSERT INTO sg_tcg_inventory (user_id, card_id, quantity)
                    VALUES ($1, $2, 1)
                    ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = sg_tcg_inventory.quantity + 1
                `, [session.id, randomCard.id]);
            }

            await client.query('COMMIT');
            return NextResponse.json({ cards: openedCards.map(c => ({ ...c, imageUrl: c.image_url })) });
        } catch (err: any) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: err.message }, { status: 400 });
        } finally {
            client.release();
        }
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
