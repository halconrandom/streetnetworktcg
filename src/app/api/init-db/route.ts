import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    const results: string[] = [];

    try {
        // Create Sets table
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_sets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                game VARCHAR(50) NOT NULL CHECK (game IN ('Pokemon', 'Yu-Gi-Oh!', 'Magic')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        results.push('sn_tcg_sets: OK');

        // Create Cards table
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_cards (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                set_id UUID REFERENCES sn_tcg_sets(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100),
                rarity VARCHAR(100),
                image_url TEXT,
                game VARCHAR(50) NOT NULL CHECK (game IN ('Pokemon', 'Yu-Gi-Oh!', 'Magic')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        results.push('sn_tcg_cards: OK');

        // Create Packs table
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_packs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                set_id UUID REFERENCES sn_tcg_sets(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                price INTEGER NOT NULL DEFAULT 0,
                card_count INTEGER NOT NULL DEFAULT 5,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        results.push('sn_tcg_packs: OK');

        // Create Users table (linked to Clerk)
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clerk_id VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        results.push('sn_tcg_users: OK');

        // Create User Packs table
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_user_packs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
                pack_id UUID REFERENCES sn_tcg_packs(id) ON DELETE CASCADE,
                count INTEGER DEFAULT 0 CHECK (count >= 0),
                UNIQUE(user_id, pack_id)
            )
        `);
        results.push('sn_tcg_user_packs: OK');

        // Create Inventory table
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_inventory (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
                card_id UUID REFERENCES sn_tcg_cards(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
                acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, card_id)
            )
        `);
        results.push('sn_tcg_inventory: OK');

        // Create indexes
        await query(`CREATE INDEX IF NOT EXISTS idx_sn_tcg_users_clerk_id ON sn_tcg_users(clerk_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_set_id ON sn_tcg_cards(set_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_sn_tcg_inventory_user_id ON sn_tcg_inventory(user_id)`);
        results.push('Indexes: OK');

        // Seed Sets if empty
        const setsCount = await query('SELECT count(*)::int as cnt FROM sn_tcg_sets');
        if (setsCount.rows[0].cnt === 0) {
            await query(`
                INSERT INTO sn_tcg_sets (name, game) VALUES 
                ('Base Set', 'Pokemon'),
                ('Legend of Blue Eyes', 'Yu-Gi-Oh!'),
                ('Alpha Edition', 'Magic')
            `);
            results.push('Sets seeded: OK');
        } else {
            results.push('Sets: already seeded');
        }

        // Seed Cards if empty
        const cardsCount = await query('SELECT count(*)::int as cnt FROM sn_tcg_cards');
        if (cardsCount.rows[0].cnt === 0) {
            const sets = await query('SELECT id, name FROM sn_tcg_sets');
            const setIds: Record<string, string> = {};
            sets.rows.forEach(r => { setIds[r.name] = r.id; });

            await query(`
                INSERT INTO sn_tcg_cards (set_id, name, type, rarity, image_url, game) VALUES 
                ($1, 'Charizard', 'Fire', 'Ultra Rare', 'https://images.pokemontcg.io/base1/4_hires.png', 'Pokemon'),
                ($1, 'Blastoise', 'Water', 'Rare Holo', 'https://images.pokemontcg.io/base1/2_hires.png', 'Pokemon'),
                ($1, 'Pikachu', 'Lightning', 'Common', 'https://images.pokemontcg.io/base1/58_hires.png', 'Pokemon'),
                ($2, 'Blue-Eyes White Dragon', 'Dragon', 'Ultra Rare', 'https://images.ygoprodeck.com/images/cards/89631139.jpg', 'Yu-Gi-Oh!'),
                ($2, 'Dark Magician', 'Spellcaster', 'Rare Holo', 'https://images.ygoprodeck.com/images/cards/46986414.jpg', 'Yu-Gi-Oh!'),
                ($3, 'Black Lotus', 'Artifact', 'Rare', 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg', 'Magic')
            `, [setIds['Base Set'], setIds['Legend of Blue Eyes'], setIds['Alpha Edition']]);
            results.push('Cards seeded: OK');
        } else {
            results.push('Cards: already seeded');
        }

        // Seed Packs if empty
        const packsCount = await query('SELECT count(*)::int as cnt FROM sn_tcg_packs');
        if (packsCount.rows[0].cnt === 0) {
            const sets = await query('SELECT id, name FROM sn_tcg_sets');
            const setIds: Record<string, string> = {};
            sets.rows.forEach(r => { setIds[r.name] = r.id; });

            await query(`
                INSERT INTO sn_tcg_packs (set_id, name, price, card_count) VALUES 
                ($1, 'Pokemon Base Set', 500, 5),
                ($2, 'Legend of Blue Eyes', 400, 5),
                ($3, 'MTG Alpha Edition', 1000, 5)
            `, [setIds['Base Set'], setIds['Legend of Blue Eyes'], setIds['Alpha Edition']]);
            results.push('Packs seeded: OK');
        } else {
            results.push('Packs: already seeded');
        }

        return NextResponse.json({ success: true, results });

    } catch (err: unknown) {
        const error = err as { message?: string; code?: string };
        console.error('INIT-DB ERROR:', error.message, error.code);
        return NextResponse.json({
            error: error.message || 'Unknown error',
            code: error.code,
            hint: error.code === '42501'
                ? 'Ejecuta migration.sql en tu VPS como superusuario postgres'
                : 'Error inesperado de base de datos'
        }, { status: 500 });
    }
}
