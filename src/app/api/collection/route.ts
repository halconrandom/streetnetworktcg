import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { MOCK_COLLECTION } from '@/lib/mockData';

// Check if we're in development mode without DB
const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.DB_HOST;

export async function GET() {
    if (USE_MOCK) {
        return NextResponse.json(MOCK_COLLECTION);
    }

    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json(MOCK_COLLECTION);
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

        return NextResponse.json(result.rows.length > 0 ? result.rows : MOCK_COLLECTION);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(MOCK_COLLECTION);
    }
}
