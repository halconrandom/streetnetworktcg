-- ============================================
-- STREET TCG - SETUP COMPLETE
-- Ejecutar todo este script en DBeaver
-- ============================================

-- 1. LIMPIAR BASE DE DATOS
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;

-- ============================================
-- 2. CREAR TABLAS BASE
-- ============================================

-- Sets Table
CREATE TABLE sn_tcg_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    game VARCHAR(50) NOT NULL CHECK (game IN ('Pokemon', 'Yu-Gi-Oh!', 'Magic')),
    series VARCHAR(255),
    printed_total INTEGER,
    release_date DATE,
    logo_url TEXT,
    symbol_url TEXT,
    tcg_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cards Table
CREATE TABLE sn_tcg_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES sn_tcg_sets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    rarity VARCHAR(100),
    image_url TEXT,
    game VARCHAR(50) NOT NULL CHECK (game IN ('Pokemon', 'Yu-Gi-Oh!', 'Magic')),
    supertype VARCHAR(50),
    subtypes TEXT[],
    types TEXT[],
    hp VARCHAR(10),
    number VARCHAR(20),
    artist VARCHAR(255),
    rarity_slug VARCHAR(100),
    tcg_id VARCHAR(100) UNIQUE,
    evolves_to TEXT[],
    retreat_cost TEXT[],
    converted_retreat_cost INTEGER,
    attacks JSONB,
    abilities JSONB,
    weaknesses JSONB,
    resistances JSONB,
    legalities JSONB,
    national_pokedex_numbers INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Packs Table
CREATE TABLE sn_tcg_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES sn_tcg_sets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    card_count INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (linked to Clerk)
CREATE TABLE sn_tcg_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 2500,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    luck_state JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Packs Table
CREATE TABLE sn_tcg_user_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
    pack_id UUID REFERENCES sn_tcg_packs(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0 CHECK (count >= 0),
    UNIQUE(user_id, pack_id)
);

-- Inventory Table
CREATE TABLE sn_tcg_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES sn_tcg_cards(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, card_id)
);

-- Rarity Config Table
CREATE TABLE sn_tcg_rarity_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES sn_tcg_sets(id) ON DELETE CASCADE,
    rarity VARCHAR(100) NOT NULL,
    weight DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
    min_per_pack INTEGER DEFAULT 0,
    max_per_pack INTEGER DEFAULT 1,
    is_guaranteed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(set_id, rarity)
);

-- Import Logs Table
CREATE TABLE sn_tcg_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES sn_tcg_users(id)
);

-- ============================================
-- 3. CREAR ÍNDICES
-- ============================================

CREATE INDEX idx_sn_tcg_users_clerk_id ON sn_tcg_users(clerk_id);
CREATE INDEX idx_sn_tcg_users_email ON sn_tcg_users(email);
CREATE INDEX idx_sn_tcg_cards_set_id ON sn_tcg_cards(set_id);
CREATE INDEX idx_sn_tcg_cards_game ON sn_tcg_cards(game);
CREATE INDEX idx_sn_tcg_cards_tcg_id ON sn_tcg_cards(tcg_id);
CREATE INDEX idx_sn_tcg_cards_rarity_slug ON sn_tcg_cards(rarity_slug);
CREATE INDEX idx_sn_tcg_cards_supertype ON sn_tcg_cards(supertype);
CREATE INDEX idx_sn_tcg_cards_types ON sn_tcg_cards USING GIN(types);
CREATE INDEX idx_sn_tcg_packs_set_id ON sn_tcg_packs(set_id);
CREATE INDEX idx_sn_tcg_sets_tcg_id ON sn_tcg_sets(tcg_id);
CREATE INDEX idx_sn_tcg_sets_series ON sn_tcg_sets(series);
CREATE INDEX idx_sn_tcg_user_packs_user_id ON sn_tcg_user_packs(user_id);
CREATE INDEX idx_sn_tcg_inventory_user_id ON sn_tcg_inventory(user_id);
CREATE INDEX idx_sn_tcg_inventory_card_id ON sn_tcg_inventory(card_id);

-- ============================================
-- 4. DATOS SEMILLA INICIALES
-- ============================================

-- Sets de ejemplo
INSERT INTO sn_tcg_sets (name, game, series) VALUES 
('Base Set', 'Pokemon', 'Base'),
('Legend of Blue Eyes', 'Yu-Gi-Oh!', 'Legend of Blue Eyes'),
('Alpha Edition', 'Magic', 'Alpha')
ON CONFLICT DO NOTHING;

-- Cartas de ejemplo
DO $$
DECLARE
    base_set_id UUID;
    lobe_id UUID;
    alpha_id UUID;
BEGIN
    SELECT id INTO base_set_id FROM sn_tcg_sets WHERE name = 'Base Set' AND game = 'Pokemon';
    SELECT id INTO lobe_id FROM sn_tcg_sets WHERE name = 'Legend of Blue Eyes' AND game = 'Yu-Gi-Oh!';
    SELECT id INTO alpha_id FROM sn_tcg_sets WHERE name = 'Alpha Edition' AND game = 'Magic';

    INSERT INTO sn_tcg_cards (set_id, name, type, rarity, image_url, game) VALUES
    (base_set_id, 'Charizard', 'Fire', 'Ultra Rare', 'https://images.pokemontcg.io/base1/4_hires.png', 'Pokemon'),
    (base_set_id, 'Blastoise', 'Water', 'Rare Holo', 'https://images.pokemontcg.io/base1/2_hires.png', 'Pokemon'),
    (base_set_id, 'Pikachu', 'Lightning', 'Common', 'https://images.pokemontcg.io/base1/58_hires.png', 'Pokemon'),
    (lobe_id, 'Blue-Eyes White Dragon', 'Dragon', 'Ultra Rare', 'https://images.ygoprodeck.com/images/cards/89631139.jpg', 'Yu-Gi-Oh!'),
    (lobe_id, 'Dark Magician', 'Spellcaster', 'Ultra Rare', 'https://images.ygoprodeck.com/images/cards/46986414.jpg', 'Yu-Gi-Oh!'),
    (alpha_id, 'Black Lotus', 'Artifact', 'Rare', 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg', 'Magic')
    ON CONFLICT DO NOTHING;
END $$;

-- Packs de ejemplo
DO $$
DECLARE
    base_set_id UUID;
    lobe_id UUID;
    alpha_id UUID;
BEGIN
    SELECT id INTO base_set_id FROM sn_tcg_sets WHERE name = 'Base Set' AND game = 'Pokemon';
    SELECT id INTO lobe_id FROM sn_tcg_sets WHERE name = 'Legend of Blue Eyes' AND game = 'Yu-Gi-Oh!';
    SELECT id INTO alpha_id FROM sn_tcg_sets WHERE name = 'Alpha Edition' AND game = 'Magic';

    INSERT INTO sn_tcg_packs (set_id, name, price, card_count) VALUES
    (base_set_id, 'Pokemon Base Set Booster', 500, 5),
    (lobe_id, 'Legend of Blue Eyes Booster', 400, 5),
    (alpha_id, 'MTG Alpha Edition Booster', 1000, 5)
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 5. VERIFICACIÓN
-- ============================================

SELECT 'Tablas creadas:' as status;
SELECT tablename FROM pg_tables WHERE tablename LIKE 'sn_tcg_%' ORDER BY tablename;

SELECT 'Sets:' as tipo, COUNT(*)::text as cantidad FROM sn_tcg_sets
UNION ALL
SELECT 'Cards:', COUNT(*)::text FROM sn_tcg_cards
UNION ALL
SELECT 'Packs:', COUNT(*)::text FROM sn_tcg_packs;

-- ============================================
-- ¡LISTO!
-- ============================================
