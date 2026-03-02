import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's database ID
        const userResult = await query(
            'SELECT id FROM sn_tcg_users WHERE clerk_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json([]);
        }

        const dbUserId = userResult.rows[0].id;

        const result = await query(`
            SELECT 
                c.id, 
                c.name, 
                c.type, 
                c.rarity, 
                c.image_url as "imageUrl", 
                c.game,
                i.quantity
            FROM sn_tcg_inventory i
            JOIN sn_tcg_cards c ON i.card_id = c.id
            WHERE i.user_id = $1
            ORDER BY i.acquired_at DESC
        `, [dbUserId]);

        return NextResponse.json(result.rows);
    } catch (err: unknown) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
