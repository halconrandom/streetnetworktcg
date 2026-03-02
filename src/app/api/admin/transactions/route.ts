import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

// GET - Listar transacciones con filtros
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
    const actionType = searchParams.get('actionType');
    const targetUserId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = `
      SELECT 
        t.id,
        t.action_type,
        t.action_data,
        t.created_at,
        u.username as user_name,
        u.email as user_email,
        a.username as admin_name
      FROM sn_tcg_transactions t
      LEFT JOIN sn_tcg_users u ON t.user_id = u.id
      LEFT JOIN sn_tcg_users a ON t.admin_id = a.id
      WHERE 1=1
    `;
    
    const params: unknown[] = [];
    let paramIndex = 1;

    if (actionType) {
      queryText += ` AND t.action_type = $${paramIndex}`;
      params.push(actionType);
      paramIndex++;
    }

    if (targetUserId) {
      queryText += ` AND t.user_id = $${paramIndex}`;
      params.push(targetUserId);
      paramIndex++;
    }

    queryText += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Contar total para paginación
    let countQuery = 'SELECT COUNT(*) FROM sn_tcg_transactions WHERE 1=1';
    const countParams: unknown[] = [];
    let countIndex = 1;

    if (actionType) {
      countQuery += ` AND action_type = $${countIndex}`;
      countParams.push(actionType);
      countIndex++;
    }

    if (targetUserId) {
      countQuery += ` AND user_id = $${countIndex}`;
      countParams.push(targetUserId);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      transactions: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err: unknown) {
    console.error('Error fetching transactions:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}