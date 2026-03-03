import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
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

    const { setId } = await params;

    const result = await query(`
      SELECT 
        id,
        name,
        number,
        rarity,
        image_url
      FROM sn_tcg_cards
      WHERE set_id = $1
      ORDER BY CAST(number AS INTEGER) ASC
    `, [setId]);

    return NextResponse.json({ cards: result.rows });
  } catch (err: unknown) {
    console.error('Error fetching cards:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}