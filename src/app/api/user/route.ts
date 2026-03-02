import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { MOCK_USER } from '@/lib/mockData';

// Check if we're in development mode without DB
const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.DB_HOST;

export async function GET() {
    if (USE_MOCK) {
        return NextResponse.json(MOCK_USER);
    }

    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json(MOCK_USER);
        }

        const userResult = await query(
            'SELECT id, username, balance FROM sg_tcg_users WHERE id = $1',
            [session.id]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(MOCK_USER);
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
            id: user.id,
            username: user.username,
            avatar: null,
            balance: user.balance || 0,
            inventory: packsResult.rows
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(MOCK_USER);
    }
}
