import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

// GET - Listar todos los usuarios con sus packs y estadísticas
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

    // Obtener todos los usuarios con sus packs
    const usersResult = await query(`
      SELECT 
        u.id,
        u.clerk_id,
        u.username,
        u.email,
        u.role,
        u.balance,
        u.created_at,
        (SELECT COUNT(*) FROM sn_tcg_inventory WHERE user_id = u.id) as cards_count,
        (SELECT COUNT(*) FROM sn_tcg_user_packs WHERE user_id = u.id AND count > 0) as packs_available
      FROM sn_tcg_users u
      ORDER BY u.created_at DESC
    `);

    // Obtener packs de cada usuario
    const usersWithPacks = await Promise.all(
      usersResult.rows.map(async (user) => {
        const packsResult = await query(`
          SELECT 
            p.id as pack_id,
            p.name,
            up.count
          FROM sn_tcg_user_packs up
          JOIN sn_tcg_packs p ON up.pack_id = p.id
          WHERE up.user_id = $1 AND up.count > 0
        `, [user.id]);

        return {
          ...user,
          packs: packsResult.rows,
        };
      })
    );

    return NextResponse.json({ users: usersWithPacks });
  } catch (err: unknown) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Cambiar rol de usuario (solo admin)
export async function PUT(req: NextRequest) {
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

    const { targetUserId, newRole } = await req.json();

    if (!targetUserId || !['user', 'mod', 'admin'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Actualizar rol en la base de datos
    await query(
      'UPDATE sn_tcg_users SET role = $1 WHERE id = $2',
      [newRole, targetUserId]
    );

    // Obtener clerk_id del usuario objetivo
    const targetUserResult = await query(
      'SELECT clerk_id FROM sn_tcg_users WHERE id = $1',
      [targetUserId]
    );

    if (targetUserResult.rows.length > 0) {
      const targetClerkId = targetUserResult.rows[0].clerk_id;
      
      // Actualizar metadata en Clerk
      const client = await clerkClient();
      await client.users.updateUser(targetClerkId, {
        publicMetadata: { role: newRole },
      });
    }

    // Registrar transacción
    await query(
      'INSERT INTO sn_tcg_transactions (user_id, admin_id, action_type, action_data) VALUES ($1, $2, $3, $4)',
      [targetUserId, adminResult.rows[0].id, 'role_change', JSON.stringify({ newRole })]
    );

    return NextResponse.json({ success: true, newRole });
  } catch (err: unknown) {
    console.error('Error updating user role:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}