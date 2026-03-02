import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getClient, query } from '@/lib/db';
import { 
  openPack, 
  getInitialLuckState, 
  updateLuckState,
  isHitRarity 
} from '@/lib/rarity-engine';

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

      // Check if user has this pack
      const packRes = await client.query(
        'SELECT count FROM sn_tcg_user_packs WHERE user_id = $1 AND pack_id = $2 FOR UPDATE',
        [dbUserId, packId]
      );
      
      if (packRes.rows.length === 0 || packRes.rows[0].count <= 0) {
        throw new Error('No tienes sobres disponibles');
      }

      // Decrement pack count
      await client.query(
        'UPDATE sn_tcg_user_packs SET count = count - 1 WHERE user_id = $1 AND pack_id = $2',
        [dbUserId, packId]
      );

      // Get pack info
      const packDef = await client.query(
        'SELECT set_id, card_count FROM sn_tcg_packs WHERE id = $1',
        [packId]
      );
      
      if (packDef.rows.length === 0) {
        throw new Error('Pack not found');
      }
      
      const { set_id } = packDef.rows[0];

      // Get all cards for this set
      const cardsPool = await client.query(`
        SELECT id, name, type, rarity, rarity_slug, image_url, game
        FROM sn_tcg_cards 
        WHERE set_id = $1
      `, [set_id]);
      
      if (cardsPool.rows.length === 0) {
        throw new Error('No hay cartas en este set');
      }

      // Get user's luck state (stored in DB or use default)
      const luckResult = await client.query(
        'SELECT luck_state FROM sn_tcg_users WHERE id = $1',
        [dbUserId]
      );
      
      let luckState = luckResult.rows[0]?.luck_state || getInitialLuckState();
      
      // Use rarity engine to open pack
      const packResult = openPack(
        cardsPool.rows.map(c => ({
          id: c.id,
          rarity: c.rarity || c.rarity_slug || 'Common',
          raritySlug: c.rarity_slug,
        })),
        set_id,
        luckState,
        userId
      );

      // Add cards to user's inventory
      const openedCards = [];
      for (const cardId of packResult.cards) {
        const card = cardsPool.rows.find(c => c.id === cardId);
        if (card) {
          openedCards.push({
            ...card,
            imageUrl: card.image_url,
          });
          
          await client.query(`
            INSERT INTO sn_tcg_inventory (user_id, card_id, quantity)
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = sn_tcg_inventory.quantity + 1
          `, [dbUserId, cardId]);
        }
      }

      // Update luck state
      luckState = updateLuckState(luckState, openedCards.map(c => c.rarity));
      
      await client.query(
        'UPDATE sn_tcg_users SET luck_state = $1 WHERE id = $2',
        [JSON.stringify(luckState), dbUserId]
      );

      await client.query('COMMIT');
      
      return NextResponse.json({ 
        cards: openedCards,
        isJackpot: packResult.isJackpot,
        luckyBonus: packResult.luckyBonus,
        rarityBreakdown: packResult.rarityBreakdown,
      });
      
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
