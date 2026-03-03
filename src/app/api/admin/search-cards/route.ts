import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

// GET - Buscar cartas por nombre
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
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ cards: [] });
    }

    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.rarity,
        c.image_url,
        c.number,
        s.name as set_name,
        s.game
      FROM sn_tcg_cards c
      JOIN sn_tcg_sets s ON c.set_id = s.id
      WHERE LOWER(c.name) LIKE LOWER($1)
      ORDER BY c.name
      LIMIT 50
    `, [`%${q}%`]);

    return NextResponse.json({ cards: result.rows });
  } catch (err: unknown) {
    console.error('Error buscando cartas:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
