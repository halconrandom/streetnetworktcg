import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query(`
            SELECT p.id, p.name, p.price, p.card_count as "cardCount", s.game
            FROM sn_tcg_packs p
            JOIN sn_tcg_sets s ON p.set_id = s.id
        `);

        return NextResponse.json(result.rows);
    } catch (err: unknown) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
