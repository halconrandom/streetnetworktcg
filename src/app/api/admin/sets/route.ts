import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

// GET - Listar sets con sus cartas
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que sea admin o mod
    const userResult = await query(
      'SELECT role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    const userRole = userResult.rows[0]?.role;
    if (userRole !== 'admin' && userRole !== 'mod') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const game = searchParams.get('game');
    const setId = searchParams.get('setId');
    const pokemon = searchParams.get('pokemon');

    // Si piden un set específico con sus cartas
    if (setId) {
      const setResult = await query(`
        SELECT 
          id, name, game, series, printed_total, release_date, logo_url, symbol_url, tcg_id
        FROM sn_tcg_sets
        WHERE id = $1
      `, [setId]);

      if (setResult.rows.length === 0) {
        return NextResponse.json({ error: 'Set not found' }, { status: 404 });
      }

      const cardsResult = await query(`
        SELECT 
          id, name, type, rarity, rarity_slug, image_url, number, supertype
        FROM sn_tcg_cards
        WHERE set_id = $1
        ORDER BY number
      `, [setId]);

      // Agrupar cartas por rareza
      const cardsByRarity: Record<string, typeof cardsResult.rows> = {};
      for (const card of cardsResult.rows) {
        const rarity = card.rarity || card.rarity_slug || 'Unknown';
        if (!cardsByRarity[rarity]) {
          cardsByRarity[rarity] = [];
        }
        cardsByRarity[rarity].push(card);
      }

      return NextResponse.json({
        set: setResult.rows[0],
        cards: cardsResult.rows,
        cardsByRarity,
        totalCards: cardsResult.rows.length,
      });
    }

    // Listar todos los sets
    let queryText: string;
    const params: unknown[] = [];

    if (pokemon && pokemon.length >= 2) {
      // Buscar sets que contienen cartas del Pokémon especificado
      queryText = `
        SELECT DISTINCT
          s.id,
          s.name,
          s.game,
          s.series,
          s.printed_total,
          s.release_date,
          s.logo_url,
          s.tcg_id,
          s.source,
          (SELECT COUNT(*)::int FROM sn_tcg_cards c WHERE c.set_id = s.id) as cards_count,
          (SELECT COUNT(*)::int FROM sn_tcg_packs p WHERE p.set_id = s.id) as packs_count,
          (SELECT COUNT(*)::int FROM sn_tcg_cards c WHERE c.set_id = s.id AND LOWER(c.name) LIKE LOWER($1)) as pokemon_count
        FROM sn_tcg_sets s
        WHERE EXISTS (
          SELECT 1 FROM sn_tcg_cards c 
          WHERE c.set_id = s.id 
          AND LOWER(c.name) LIKE LOWER($1)
        )
        ORDER BY s.game, s.release_date DESC
      `;
      params.push(`%${pokemon}%`);
    } else {
      queryText = `
        SELECT 
          s.id,
          s.name,
          s.game,
          s.series,
          s.printed_total,
          s.release_date,
          s.logo_url,
          s.tcg_id,
          s.source,
          (SELECT COUNT(*)::int FROM sn_tcg_cards c WHERE c.set_id = s.id) as cards_count,
          (SELECT COUNT(*)::int FROM sn_tcg_packs p WHERE p.set_id = s.id) as packs_count
        FROM sn_tcg_sets s
      `;

      if (game) {
        queryText += ' WHERE s.game = $1';
        params.push(game);
      }

      queryText += ' ORDER BY s.game, s.release_date DESC';
    }

    const result = await query(queryText, params);

    return NextResponse.json({ sets: result.rows });
  } catch (err: unknown) {
    console.error('Error fetching sets:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}