import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getClient, query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packId } = await req.json();

        if (!packId) {
            return NextResponse.json({ error: 'Missing packId' }, { status: 400 });
        }

        // Get user's database ID
        const userResult = await query(
            'SELECT id FROM sn_tcg_users WHERE clerk_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const dbUserId = userResult.rows[0].id;

        const client = await getClient();
        try {
            await client.query('BEGIN');

            const packRes = await client.query('SELECT count FROM sn_tcg_user_packs WHERE user_id = $1 AND pack_id = $2 FOR UPDATE', [dbUserId, packId]);
            if (packRes.rows.length === 0 || packRes.rows[0].count <= 0) {
                throw new Error('No tienes sobres disponibles');
            }

            await client.query('UPDATE sn_tcg_user_packs SET count = count - 1 WHERE user_id = $1 AND pack_id = $2', [dbUserId, packId]);

            const packDef = await client.query('SELECT set_id, card_count FROM sn_tcg_packs WHERE id = $1', [packId]);
            const { set_id, card_count } = packDef.rows[0];

            const cardsPool = await client.query('SELECT id, name, type, rarity, image_url, game FROM sn_tcg_cards WHERE set_id = $1', [set_id]);
            if (cardsPool.rows.length === 0) throw new Error('No hay cartas en este set');

            const openedCards = [];
            for (let i = 0; i < card_count; i++) {
                const randomCard = cardsPool.rows[Math.floor(Math.random() * cardsPool.rows.length)];
                openedCards.push(randomCard);

                await client.query(`
                    INSERT INTO sn_tcg_inventory (user_id, card_id, quantity)
                    VALUES ($1, $2, 1)
                    ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = sn_tcg_inventory.quantity + 1
                `, [dbUserId, randomCard.id]);
            }

            await client.query('COMMIT');
            return NextResponse.json({ cards: openedCards.map(c => ({ ...c, imageUrl: c.image_url })) });
        } catch (err: unknown) {
            await client.query('ROLLBACK');
            const message = err instanceof Error ? err.message : 'Unknown error';
            return NextResponse.json({ error: message }, { status: 400 });
        } finally {
            client.release();
        }
    } catch (err: unknown) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
