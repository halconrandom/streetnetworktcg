// migrate.js - Run this ONCE to add the missing columns to your database.
// Requires: DB_SUPERUSER and DB_SUPERPASS set in your .env (or hardcoded below)

const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    // Try with the standard user first (it might work after GRANT ALL was run)
    const client = new Client({
        host: process.env.DB_HOST,
        port: 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    try {
        await client.connect();
        console.log('Connected. Running migrations...');

        await client.query(`ALTER TABLE sg_tcg_users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
        console.log('OK: Added password_hash column');

        await client.query(`ALTER TABLE sg_tcg_users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
        console.log('OK: Added email column');

        // Try to add unique constraint (might fail if duplicates exist)
        try {
            await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON sg_tcg_users(email) WHERE email IS NOT NULL`);
            console.log('OK: Added unique index on email');
        } catch (e) {
            console.log('Note: Could not add unique email index:', e.message);
        }

        await client.query(`
            CREATE TABLE IF NOT EXISTS sg_tcg_user_packs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES sg_tcg_users(id) ON DELETE CASCADE,
                pack_id UUID REFERENCES sg_tcg_packs(id) ON DELETE CASCADE,
                count INTEGER DEFAULT 0 CHECK (count >= 0),
                UNIQUE(user_id, pack_id)
            )
        `);
        console.log('OK: Created sg_tcg_user_packs table');

        await client.query(`
            CREATE TABLE IF NOT EXISTS sg_tcg_inventory (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES sg_tcg_users(id) ON DELETE CASCADE,
                card_id UUID REFERENCES sg_tcg_cards(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
                acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, card_id)
            )
        `);
        console.log('OK: Created sg_tcg_inventory table');

        console.log('\nAll migrations completed successfully!');
        await client.end();
    } catch (err) {
        console.error('\nMigration failed:', err.message);
        console.error('Code:', err.code);
        if (err.code === '42501') {
            console.error('\nPermission denied. You need to run this SQL on your VPS as a superuser:');
            console.error('\n  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sg_tcg_user;');
            console.error('  ALTER TABLE sg_tcg_users ADD COLUMN IF NOT EXISTS password_hash TEXT;');
            console.error('  ALTER TABLE sg_tcg_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);');
        }
        process.exit(1);
    }
}

migrate();
