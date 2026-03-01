import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('--- STARTING INIT DB ---');

        // 1. UUID Extension (Might fail if not superuser, but we try)
        try {
            await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        } catch (e: any) {
            console.warn('Note: UUID Extension skip/fail (usually requires superuser):', e.message);
        }

        // 2. Base Tables (Using IF NOT EXISTS for safety)
        // These should have been created by the architect script, but we ensure they exist.

        // 3. Add necessary columns (Might fail if permission is restricted)
        try {
            await query(`
                ALTER TABLE sg_tcg_users 
                ADD COLUMN IF NOT EXISTS password_hash TEXT,
                ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
            `);
        } catch (e: any) {
            console.error('Permission Error: Cannot ALTER users table. Please run the GRANT ALL command on the VPS.', e.message);
            // We don't throw yet, maybe the columns already exist.
        }

        // 4. Create User Packs table
        await query(`
            CREATE TABLE IF NOT EXISTS sg_tcg_user_packs (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES sg_tcg_users(id) ON DELETE CASCADE,
                pack_id UUID REFERENCES sg_tcg_packs(id) ON DELETE CASCADE,
                count INTEGER DEFAULT 0 CHECK (count >= 0),
                UNIQUE(user_id, pack_id)
            );
        `);

        // 5. Seed initial data (Only if tables are empty)
        const setsCount = await query('SELECT count(*) FROM sg_tcg_sets');
        if (parseInt(setsCount.rows[0].count) === 0) {
            await query(`
                INSERT INTO sg_tcg_sets (name, game) VALUES 
                ('Base Set', 'Pokemon'),
                ('Legend of Blue Eyes', 'Yu-Gi-Oh!'),
                ('Alpha Edition', 'Magic');
            `);
        }

        console.log('--- INIT DB SUCCESS ---');
        return NextResponse.json({ success: true, message: 'Database initialized successfully' });
    } catch (err: any) {
        console.error('DATABASE INIT FATAL ERROR:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
