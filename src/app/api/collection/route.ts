import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await query(`
            SELECT 
                c.id, 
                c.name, 
                c.type, 
                c.rarity, 
                c.image_url as "imageUrl", 
                c.game
            FROM sg_tcg_inventory i
            JOIN sg_tcg_cards c ON i.card_id = c.id
            WHERE i.user_id = $1
            ORDER BY i.acquired_at DESC
        `, [session.id]);

        return NextResponse.json(result.rows);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
