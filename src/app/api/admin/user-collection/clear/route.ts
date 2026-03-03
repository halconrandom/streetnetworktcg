import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query, getClient } from '@/lib/db';

// POST - Borrar toda la colección de un usuario
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { userId: targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Eliminar todas las cartas del inventario
      await client.query(
        'DELETE FROM sn_tcg_inventory WHERE user_id = $1',
        [targetUserId]
      );

      // Eliminar todos los packs del usuario
      await client.query(
        'DELETE FROM sn_tcg_user_packs WHERE user_id = $1',
        [targetUserId]
      );

      await client.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: 'Colección borrada correctamente' 
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.error('Error clearing collection:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}