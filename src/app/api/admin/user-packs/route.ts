import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query, getClient } from '@/lib/db';

// DELETE - Eliminar packs de un usuario
export async function DELETE(req: NextRequest) {
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
    const { userId: targetUserId, packId, quantity } = body;

    if (!targetUserId || !packId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Verificar cantidad actual
      const currentResult = await client.query(
        'SELECT count FROM sn_tcg_user_packs WHERE user_id = $1 AND pack_id = $2',
        [targetUserId, packId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('El usuario no tiene este pack');
      }

      const currentQty = currentResult.rows[0].count;
      if (quantity > currentQty) {
        throw new Error(`El usuario solo tiene ${currentQty} de este pack`);
      }

      // Actualizar o eliminar
      if (quantity >= currentQty) {
        await client.query(
          'DELETE FROM sn_tcg_user_packs WHERE user_id = $1 AND pack_id = $2',
          [targetUserId, packId]
        );
      } else {
        await client.query(
          'UPDATE sn_tcg_user_packs SET count = count - $1 WHERE user_id = $2 AND pack_id = $3',
          [quantity, targetUserId, packId]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: `Eliminados ${quantity} packs` 
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.error('Error deleting pack:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
