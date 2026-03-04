import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query(`
            SELECT 
                p.id, 
                p.name, 
                p.card_count as "cardCount",
                p.image_url as "imageUrl",
                s.game,
                s.logo_url as "setLogoUrl",
                s.name as "setName"
            FROM sn_tcg_packs p
            JOIN sn_tcg_sets s ON p.set_id = s.id
            ORDER BY s.game, s.series, p.name
        `);

        return NextResponse.json(result.rows);
    } catch (err: unknown) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
