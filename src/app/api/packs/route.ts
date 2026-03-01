import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT id, name, price, card_count as "cardCount", set_id as "setId" FROM sg_tcg_packs');

        // Add game info by joining with sets
        const enrichedResult = await query(`
            SELECT p.id, p.name, p.price, p.card_count as "cardCount", s.game
            FROM sg_tcg_packs p
            JOIN sg_tcg_sets s ON p.set_id = s.id
        `);

        return NextResponse.json(enrichedResult.rows);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
