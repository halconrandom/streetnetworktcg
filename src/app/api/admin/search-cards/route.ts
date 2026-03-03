import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

// GET - Buscar cartas con filtros avanzados
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea admin o mod
    const userResult = await query(
      'SELECT role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    const userRole = userResult.rows[0]?.role;
    if (userRole !== 'admin' && userRole !== 'mod') {
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const setId = searchParams.get('setId');
    const game = searchParams.get('game');
    const rarity = searchParams.get('rarity');
    const series = searchParams.get('series');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construir query dinámico
    let whereConditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (q && q.length >= 2) {
      whereConditions.push(`LOWER(c.name) LIKE LOWER(${paramIndex})`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (setId) {
      whereConditions.push(`c.set_id = ${paramIndex}`);
      params.push(setId);
      paramIndex++;
    }

    if (game) {
      whereConditions.push(`s.game = ${paramIndex}`);
      params.push(game);
      paramIndex++;
    }

    if (rarity) {
      whereConditions.push(`c.rarity = ${paramIndex}`);
      params.push(rarity);
      paramIndex++;
    }

    if (series) {
      whereConditions.push(`s.series ILIKE ${paramIndex}`);
      params.push(`%${series}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.rarity,
        c.image_url,
        c.number,
        c.types,
        c.supertype,
        s.id as set_id,
        s.name as set_name,
        s.game,
        s.series,
        s.logo_url as set_logo
      FROM sn_tcg_cards c
      JOIN sn_tcg_sets s ON c.set_id = s.id
      ${whereClause}
      ORDER BY s.game, s.name, c.number
      LIMIT ${paramIndex}
    `, [...params, limit]);

    // Obtener listas únicas para filtros
    const gamesResult = await query(`
      SELECT DISTINCT game FROM sn_tcg_sets WHERE game IS NOT NULL ORDER BY game
    `);
    
    const raritiesResult = await query(`
      SELECT DISTINCT rarity FROM sn_tcg_cards WHERE rarity IS NOT NULL ORDER BY rarity
    `);

    const seriesResult = await query(`
      SELECT DISTINCT series FROM sn_tcg_sets WHERE series IS NOT NULL ORDER BY series
    `);

    const setsResult = await query(`
      SELECT id, name, game FROM sn_tcg_sets ORDER BY game, name
    `);

    return NextResponse.json({ 
      cards: result.rows,
      filters: {
        games: gamesResult.rows.map(r => r.game),
        rarities: raritiesResult.rows.map(r => r.rarity),
        series: seriesResult.rows.map(r => r.series),
        sets: setsResult.rows
      }
    });
  } catch (err: unknown) {
    console.error('Error buscando cartas:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
