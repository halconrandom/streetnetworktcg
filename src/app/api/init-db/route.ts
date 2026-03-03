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
                series VARCHAR(255),
                printed_total INTEGER,
                release_date DATE,
                logo_url TEXT,
                symbol_url TEXT,
                tcg_id VARCHAR(100) UNIQUE,
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
                rarity_slug VARCHAR(100),
                image_url TEXT,
                game VARCHAR(50) NOT NULL CHECK (game IN ('Pokemon', 'Yu-Gi-Oh!', 'Magic')),
                supertype VARCHAR(100),
                subtypes TEXT[],
                types TEXT[],
                hp VARCHAR(20),
                number VARCHAR(20),
                artist VARCHAR(255),
                tcg_id VARCHAR(100) UNIQUE,
                evolves_to TEXT[],
                retreat_cost TEXT[],
                converted_retreat_cost INTEGER,
                attacks JSONB,
                abilities JSONB,
                weaknesses JSONB,
                resistances JSONB,
                national_pokedex_numbers INTEGER[],
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
                card_count INTEGER NOT NULL DEFAULT 10,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        results.push('sn_tcg_packs: OK');

        // Create Rarity Config table
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_rarity_config (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                set_id UUID REFERENCES sn_tcg_sets(id) ON DELETE CASCADE,
                rarity VARCHAR(100) NOT NULL,
                weight DECIMAL(5, 4) NOT NULL,
                min_per_pack INTEGER DEFAULT 0,
                max_per_pack INTEGER DEFAULT 1,
                is_guaranteed BOOLEAN DEFAULT FALSE,
                UNIQUE(set_id, rarity)
            )
        `);
        results.push('sn_tcg_rarity_config: OK');

        // Create Users table (linked to Clerk)
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clerk_id VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'mod', 'admin')),
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

        // Create Transactions table
        await query(`
            CREATE TABLE IF NOT EXISTS sn_tcg_transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES sn_tcg_users(id) ON DELETE SET NULL,
                admin_id UUID REFERENCES sn_tcg_users(id) ON DELETE SET NULL,
                action_type VARCHAR(50) NOT NULL,
                action_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        results.push('sn_tcg_transactions: OK');

        // Create indexes
        await query(`CREATE INDEX IF NOT EXISTS idx_sn_tcg_users_clerk_id ON sn_tcg_users(clerk_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_set_id ON sn_tcg_cards(set_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_rarity ON sn_tcg_cards(rarity)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_sn_tcg_inventory_user_id ON sn_tcg_inventory(user_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_sn_tcg_user_packs_user_id ON sn_tcg_user_packs(user_id)`);
        results.push('Indexes: OK');

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