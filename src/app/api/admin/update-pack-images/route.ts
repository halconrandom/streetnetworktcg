import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

// POST - Actualizar imágenes de packs con el logo del set
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que sea admin
    const userResult = await query(
      'SELECT role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Actualizar packs que no tienen imagen, usando el logo del set
    const result = await query(`
      UPDATE sn_tcg_packs p
      SET image_url = s.logo_url
      FROM sn_tcg_sets s
      WHERE p.set_id = s.id 
        AND (p.image_url IS NULL OR p.image_url = '')
        AND s.logo_url IS NOT NULL
      RETURNING p.id, p.name, p.image_url
    `);

    return NextResponse.json({ 
      success: true, 
      updated: result.rows.length,
      packs: result.rows 
    });
  } catch (err: unknown) {
    console.error('Error updating pack images:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
