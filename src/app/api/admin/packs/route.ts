import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query, getClient } from '@/lib/db';

// GET - Listar todos los packs con configuración
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
    const pokemonSearch = searchParams.get('pokemon');

    let result;

    if (pokemonSearch && pokemonSearch.length >= 2) {
      // Buscar packs que contienen cartas del Pokémon especificado
      result = await query(`
        SELECT DISTINCT
          p.id,
          p.name,
          p.card_count,
          p.description,
          p.image_url,
          p.is_custom,
          p.created_at,
          s.id as set_id,
          s.name as set_name,
          s.logo_url as set_logo,
          s.tcg_id as set_tcg_id,
          s.game,
          s.series,
          (SELECT COUNT(*)::int FROM sn_tcg_cards c WHERE c.set_id = p.set_id) as cards_in_set,
          (SELECT COUNT(*)::int FROM sn_tcg_cards c WHERE c.set_id = p.set_id AND LOWER(c.name) LIKE LOWER($1)) as pokemon_count
        FROM sn_tcg_packs p
        LEFT JOIN sn_tcg_sets s ON p.set_id = s.id
        WHERE EXISTS (
          SELECT 1 FROM sn_tcg_cards c 
          WHERE c.set_id = p.set_id 
          AND LOWER(c.name) LIKE LOWER($1)
        )
        ORDER BY s.game, s.series, p.name
      `, [`%${pokemonSearch}%`]);
    } else {
      // Listar todos los packs
      result = await query(`
        SELECT 
          p.id,
          p.name,
          p.card_count,
          p.description,
          p.image_url,
          p.is_custom,
          p.created_at,
          s.id as set_id,
          s.name as set_name,
          s.logo_url as set_logo,
          s.tcg_id as set_tcg_id,
          s.game,
          s.series,
          (SELECT COUNT(*)::int FROM sn_tcg_cards c WHERE c.set_id = p.set_id) as cards_in_set
        FROM sn_tcg_packs p
        LEFT JOIN sn_tcg_sets s ON p.set_id = s.id
        ORDER BY s.game, s.series, p.name
      `);
    }

    return NextResponse.json({ packs: result.rows });
  } catch (err: unknown) {
    console.error('Error fetching packs:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Crear nuevo pack
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que sea admin
    const adminResult = await query(
      'SELECT id, role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { name, setId, price, cardCount, description, imageUrl } = await req.json();

    if (!name || !setId || price === undefined || !cardCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO sn_tcg_packs (name, set_id, price, card_count, description, image_url, is_custom, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, true, $7)
      RETURNING *
    `, [name, setId, price, cardCount, description || null, imageUrl || null, adminResult.rows[0].id]);

    return NextResponse.json({ pack: result.rows[0] });
  } catch (err: unknown) {
    console.error('Error creating pack:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Actualizar pack
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que sea admin
    const adminResult = await query(
      'SELECT role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { packId, name, price, cardCount, description, imageUrl } = await req.json();

    if (!packId) {
      return NextResponse.json({ error: 'Missing packId' }, { status: 400 });
    }

    const result = await query(`
      UPDATE sn_tcg_packs
      SET 
        name = COALESCE($2, name),
        price = COALESCE($3, price),
        card_count = COALESCE($4, card_count),
        description = COALESCE($5, description),
        image_url = COALESCE($6, image_url)
      WHERE id = $1
      RETURNING *
    `, [packId, name, price, cardCount, description, imageUrl]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    return NextResponse.json({ pack: result.rows[0] });
  } catch (err: unknown) {
    console.error('Error updating pack:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Eliminar pack
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que sea admin
    const adminResult = await query(
      'SELECT role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const packId = searchParams.get('packId');

    if (!packId) {
      return NextResponse.json({ error: 'Missing packId' }, { status: 400 });
    }

    // Verificar que no tenga usuarios con este pack
    const userPacksResult = await query(
      'SELECT COUNT(*) FROM sn_tcg_user_packs WHERE pack_id = $1 AND count > 0',
      [packId]
    );

    if (parseInt(userPacksResult.rows[0].count) > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete pack - users have this pack in their inventory' 
      }, { status: 400 });
    }

    await query('DELETE FROM sn_tcg_packs WHERE id = $1', [packId]);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Error deleting pack:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}