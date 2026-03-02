import { NextRequest, NextResponse } from 'next/server';
import { getClient, query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { MOCK_USER, MOCK_PACKS } from '@/lib/mockData';

// Check if we're in development mode without DB
const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.DB_HOST;

export async function POST(req: NextRequest) {
    if (USE_MOCK) {
        const { packId, price } = await req.json();
        
        // Simulate buying a pack
        const pack = MOCK_PACKS.find(p => p.id === packId);
        if (!pack) {
            return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
        }

        // Update mock user
        const updatedUser = {
            ...MOCK_USER,
            balance: MOCK_USER.balance - price,
            inventory: [
                ...MOCK_USER.inventory,
                { packId, count: 1 }
            ]
        };

        return NextResponse.json({ success: true, user: updatedUser });
    }

    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packId, price } = await req.json();

        if (!packId || !price) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const client = await getClient();
        try {
            await client.query('BEGIN');

            const userRes = await client.query('SELECT balance FROM sg_tcg_users WHERE id = $1 FOR UPDATE', [session.id]);
            const balance = parseFloat(userRes.rows[0].balance);

            if (balance < price) {
                throw new Error('Insufficient funds');
            }

            await client.query('UPDATE sg_tcg_users SET balance = balance - $1 WHERE id = $2', [price, session.id]);

            await client.query(`
                INSERT INTO sg_tcg_user_packs (user_id, pack_id, count)
                VALUES ($1, $2, 1)
                ON CONFLICT (user_id, pack_id) DO UPDATE SET count = sg_tcg_user_packs.count + 1
            `, [session.id, packId]);

            await client.query('COMMIT');

            // Fetch updated user with inventory
            const updatedUserRes = await client.query('SELECT id, username, balance FROM sg_tcg_users WHERE id = $1', [session.id]);
            const user = updatedUserRes.rows[0];

            const packsResult = await client.query(`
                SELECT p.id as "packId", p.name, up.count 
                FROM sg_tcg_user_packs up
                JOIN sg_tcg_packs p ON up.pack_id = p.id
                WHERE up.user_id = $1 AND up.count > 0
            `, [session.id]);

            return NextResponse.json({
                success: true,
                user: {
                    ...user,
                    inventory: packsResult.rows
                }
            });
        } catch (err: any) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: err.message }, { status: 400 });
        } finally {
            client.release();
        }
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
