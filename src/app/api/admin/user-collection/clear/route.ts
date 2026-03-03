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
      'SELECT id, role, username FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    const adminUser = userResult.rows[0];
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'mod')) {
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

      // Obtener info del usuario destino
      const targetUserResult = await client.query(
        'SELECT id, username, email FROM sn_tcg_users WHERE id = $1',
        [targetUserId]
      );

      const targetUser = targetUserResult.rows[0];

      // Obtener conteos antes de borrar
      const cardsCountResult = await client.query(
        'SELECT COUNT(*) FROM sn_tcg_inventory WHERE user_id = $1',
        [targetUserId]
      );
      const packsCountResult = await client.query(
        'SELECT COUNT(*) FROM sn_tcg_user_packs WHERE user_id = $1 AND count > 0',
        [targetUserId]
      );

      const totalCards = parseInt(cardsCountResult.rows[0].count);
      const totalPacks = parseInt(packsCountResult.rows[0].count);

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

      // Registrar la transacción
      await client.query(`
        INSERT INTO sn_tcg_transactions (user_id, admin_id, action_type, action_data)
        VALUES ($1, $2, 'collection_cleared', $3)
      `, [targetUserId, adminUser.id, JSON.stringify({
        totalCardsDeleted: totalCards,
        totalPacksDeleted: totalPacks,
        // Info adicional para mostrar en logs
        adminUsername: adminUser.username,
        targetUsername: targetUser?.username,
        targetEmail: targetUser?.email
      })]);

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