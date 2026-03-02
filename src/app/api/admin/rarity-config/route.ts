import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

// GET - Obtener configuración de rarezas por set
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
    const setId = searchParams.get('setId');

    if (!setId) {
      // Retornar todos los sets con su configuración
      const result = await query(`
        SELECT 
          s.id as set_id,
          s.name as set_name,
          s.game,
          COALESCE(
            json_agg(
              json_build_object(
                'id', rc.id,
                'rarity', rc.rarity,
                'weight', rc.weight,
                'minPerPack', rc.min_per_pack,
                'maxPerPack', rc.max_per_pack,
                'isGuaranteed', rc.is_guaranteed
              )
              ORDER BY rc.weight DESC
            ) FILTER (WHERE rc.id IS NOT NULL),
            '[]'::json
          ) as rarity_config
        FROM sn_tcg_sets s
        LEFT JOIN sn_tcg_rarity_config rc ON s.id = rc.set_id
        GROUP BY s.id, s.name, s.game
        ORDER BY s.game, s.name
      `);

      return NextResponse.json({ sets: result.rows });
    }

    // Retornar configuración de un set específico
    const result = await query(`
      SELECT 
        id,
        rarity,
        weight,
        min_per_pack as "minPerPack",
        max_per_pack as "maxPerPack",
        is_guaranteed as "isGuaranteed"
      FROM sn_tcg_rarity_config
      WHERE set_id = $1
      ORDER BY weight DESC
    `, [setId]);

    return NextResponse.json({ config: result.rows });
  } catch (err: unknown) {
    console.error('Error fetching rarity config:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Actualizar configuración de rarezas
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

    const { setId, config } = await req.json();

    if (!setId || !Array.isArray(config)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Actualizar cada configuración de rareza
    for (const slot of config) {
      await query(`
        INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (set_id, rarity)
        DO UPDATE SET
          weight = $3,
          min_per_pack = $4,
          max_per_pack = $5,
          is_guaranteed = $6
      `, [setId, slot.rarity, slot.weight, slot.minPerPack, slot.maxPerPack, slot.isGuaranteed]);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Error updating rarity config:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}