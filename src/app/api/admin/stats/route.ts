import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

// GET - Estadísticas del dashboard
export async function GET() {
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

    // Contar usuarios
    const usersCount = await query('SELECT COUNT(*) FROM sn_tcg_users');
    
    // Contar packs
    const packsCount = await query('SELECT COUNT(*) FROM sn_tcg_packs');
    
    // Contar cartas
    const cardsCount = await query('SELECT COUNT(*) FROM sn_tcg_cards');
    
    // Contar transacciones
    const transactionsCount = await query('SELECT COUNT(*) FROM sn_tcg_transactions');

    // Transacciones recientes
    const recentTransactions = await query(`
      SELECT 
        t.id,
        t.action_type,
        t.action_data,
        t.created_at,
        u.username as user_name,
        a.username as admin_name
      FROM sn_tcg_transactions t
      LEFT JOIN sn_tcg_users u ON t.user_id = u.id
      LEFT JOIN sn_tcg_users a ON t.admin_id = a.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    return NextResponse.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalPacks: parseInt(packsCount.rows[0].count),
      totalCards: parseInt(cardsCount.rows[0].count),
      totalTransactions: parseInt(transactionsCount.rows[0].count),
      recentTransactions: recentTransactions.rows,
    });
  } catch (err: unknown) {
    console.error('Error fetching stats:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}