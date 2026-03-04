import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clerkUser = await currentUser();

        // Get or create user in our database
        let userResult = await query(
            'SELECT id, clerk_id, username, role FROM sn_tcg_users WHERE clerk_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            // Create user in our database from Clerk data
            const username = clerkUser?.username || clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Player';
            const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';

            userResult = await query(
                'INSERT INTO sn_tcg_users (clerk_id, username, email, role) VALUES ($1, $2, $3, $4) RETURNING id, clerk_id, username, role',
                [userId, username, email, 'user']
            );
        }

        const user = userResult.rows[0];

        // Fetch unopened packs with game info from set
        const packsResult = await query(`
            SELECT p.id as "packId", p.name, up.count, p.image_url as "imageUrl", s.game
            FROM sn_tcg_user_packs up
            JOIN sn_tcg_packs p ON up.pack_id = p.id
            LEFT JOIN sn_tcg_sets s ON p.set_id = s.id
            WHERE up.user_id = $1 AND up.count > 0
        `, [user.id]);

        return NextResponse.json({
            id: user.id,
            username: user.username,
            avatar: clerkUser?.imageUrl || null,
            role: user.role || 'user',
            inventory: packsResult.rows
        });
    } catch (err: unknown) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
