import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query, getClient } from '@/lib/db';

// POST - Asignar sobres a un usuario
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que sea admin o mod
    const adminResult = await query(
      'SELECT id, role, username FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    const adminUser = adminResult.rows[0];
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'mod')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetUserId, packId, quantity, notes } = await req.json();

    if (!targetUserId || !packId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Obtener info del pack y set
      const packResult = await client.query(`
        SELECT p.id, p.name, p.card_count, s.id as set_id, s.name as set_name, s.game
        FROM sn_tcg_packs p
        LEFT JOIN sn_tcg_sets s ON p.set_id = s.id
        WHERE p.id = $1
      `, [packId]);

      if (packResult.rows.length === 0) {
        throw new Error('Pack not found');
      }

      const pack = packResult.rows[0];

      // Obtener info del usuario destino
      const targetUserResult = await client.query(
        'SELECT id, username, email FROM sn_tcg_users WHERE id = $1',
        [targetUserId]
      );

      const targetUser = targetUserResult.rows[0];

      // Agregar packs al usuario
      await client.query(`
        INSERT INTO sn_tcg_user_packs (user_id, pack_id, count)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, pack_id) 
        DO UPDATE SET count = sn_tcg_user_packs.count + $3
      `, [targetUserId, packId, quantity]);

      // Registrar la asignación (tabla legacy)
      await client.query(`
        INSERT INTO sn_tcg_pack_assignments (user_id, pack_id, admin_id, quantity, notes)
        VALUES ($1, $2, $3, $4, $5)
      `, [targetUserId, packId, adminUser.id, quantity, notes || null]);

      // Registrar en transacciones con detalles completos
      await client.query(`
        INSERT INTO sn_tcg_transactions (user_id, admin_id, action_type, action_data)
        VALUES ($1, $2, 'pack_assignment', $3)
      `, [targetUserId, adminUser.id, JSON.stringify({
        packId: pack.id,
        packName: pack.name,
        setId: pack.set_id,
        setName: pack.set_name,
        game: pack.game,
        cardCount: pack.card_count,
        quantity,
        notes: notes || null,
        // Info adicional para mostrar en logs
        adminUsername: adminUser.username,
        targetUsername: targetUser?.username,
        targetEmail: targetUser?.email
      })]);

      await client.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: `Assigned ${quantity} packs to user`,
        pack: packResult.rows[0]
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.error('Error assigning packs:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}