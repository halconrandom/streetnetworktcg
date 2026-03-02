import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getClient, query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packId, price } = await req.json();

        if (!packId || !price) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Get user's database ID
        const userResult = await query(
            'SELECT id FROM sn_tcg_users WHERE clerk_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const dbUserId = userResult.rows[0].id;

        const client = await getClient();
        try {
            await client.query('BEGIN');

            const balanceRes = await client.query('SELECT balance FROM sn_tcg_users WHERE id = $1 FOR UPDATE', [dbUserId]);
            const balance = parseFloat(balanceRes.rows[0].balance);

            if (balance < price) {
                throw new Error('Fondos insuficientes');
            }

            await client.query('UPDATE sn_tcg_users SET balance = balance - $1 WHERE id = $2', [price, dbUserId]);

            await client.query(`
                INSERT INTO sn_tcg_user_packs (user_id, pack_id, count)
                VALUES ($1, $2, 1)
                ON CONFLICT (user_id, pack_id) DO UPDATE SET count = sn_tcg_user_packs.count + 1
            `, [dbUserId, packId]);

            await client.query('COMMIT');

            // Fetch updated user with inventory
            const updatedUserRes = await client.query('SELECT id, username, balance FROM sn_tcg_users WHERE id = $1', [dbUserId]);
            const user = updatedUserRes.rows[0];

            const packsResult = await client.query(`
                SELECT p.id as "packId", p.name, up.count 
                FROM sn_tcg_user_packs up
                JOIN sn_tcg_packs p ON up.pack_id = p.id
                WHERE up.user_id = $1 AND up.count > 0
            `, [dbUserId]);

            return NextResponse.json({
                success: true,
                user: {
                    ...user,
                    inventory: packsResult.rows
                }
            });
        } catch (err: unknown) {
            await client.query('ROLLBACK');
            const message = err instanceof Error ? err.message : 'Unknown error';
            return NextResponse.json({ error: message }, { status: 400 });
        } finally {
            client.release();
        }
    } catch (err: unknown) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
