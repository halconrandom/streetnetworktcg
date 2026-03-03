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
      'SELECT id, role, username FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    const adminUser = userResult.rows[0];
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'mod')) {
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

      // Obtener info del pack y usuario
      const packInfoResult = await client.query(`
        SELECT p.id, p.name, p.card_count, s.name as set_name, s.game, up.count as current_count
        FROM sn_tcg_user_packs up
        JOIN sn_tcg_packs p ON up.pack_id = p.id
        LEFT JOIN sn_tcg_sets s ON p.set_id = s.id
        WHERE up.user_id = $1 AND up.pack_id = $2
      `, [targetUserId, packId]);

      if (packInfoResult.rows.length === 0) {
        throw new Error('El usuario no tiene este pack');
      }

      const packInfo = packInfoResult.rows[0];
      const currentQty = packInfo.current_count;

      if (quantity > currentQty) {
        throw new Error(`El usuario solo tiene ${currentQty} de este pack`);
      }

      // Obtener info del usuario destino
      const targetUserResult = await client.query(
        'SELECT id, username, email FROM sn_tcg_users WHERE id = $1',
        [targetUserId]
      );

      const targetUser = targetUserResult.rows[0];

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

      // Registrar la transacción
      await client.query(`
        INSERT INTO sn_tcg_transactions (user_id, admin_id, action_type, action_data)
        VALUES ($1, $2, 'pack_removed', $3)
      `, [targetUserId, adminUser.id, JSON.stringify({
        packId: packInfo.id,
        packName: packInfo.name,
        setName: packInfo.set_name,
        game: packInfo.game,
        cardCount: packInfo.card_count,
        quantity,
        previousQuantity: currentQty,
        remainingQuantity: Math.max(0, currentQty - quantity),
        // Info adicional para mostrar en logs
        adminUsername: adminUser.username,
        targetUsername: targetUser?.username,
        targetEmail: targetUser?.email
      })]);

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
