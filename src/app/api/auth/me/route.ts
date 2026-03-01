import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ user: null });
        }

        const userResult = await query(
            'SELECT id, username, balance FROM sg_tcg_users WHERE id = $1',
            [session.id]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ user: null });
        }

        const user = userResult.rows[0];

        // Fetch unopened packs
        const packsResult = await query(`
            SELECT p.id as "packId", p.name, up.count 
            FROM sg_tcg_user_packs up
            JOIN sg_tcg_packs p ON up.pack_id = p.id
            WHERE up.user_id = $1 AND up.count > 0
        `, [session.id]);

        return NextResponse.json({
            user: {
                ...user,
                inventory: packsResult.rows
            }
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
