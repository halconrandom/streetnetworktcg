-- Migration Script for Street Network TCG
-- Database: SNCardDB
-- Prefix: sn_tcg_

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Sets Table (Pokemon, Yu-Gi-Oh!, Magic sets)
CREATE TABLE IF NOT EXISTS sn_tcg_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    game VARCHAR(50) NOT NULL CHECK (game IN ('Pokemon', 'Yu-Gi-Oh!', 'Magic')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cards Table
CREATE TABLE IF NOT EXISTS sn_tcg_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES sn_tcg_sets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    rarity VARCHAR(100),
    image_url TEXT,
    game VARCHAR(50) NOT NULL CHECK (game IN ('Pokemon', 'Yu-Gi-Oh!', 'Magic')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Packs Table
CREATE TABLE IF NOT EXISTS sn_tcg_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES sn_tcg_sets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    card_count INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (linked to Clerk)
CREATE TABLE IF NOT EXISTS sn_tcg_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 2500,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Packs Table (inventory of unopened packs)
CREATE TABLE IF NOT EXISTS sn_tcg_user_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
    pack_id UUID REFERENCES sn_tcg_packs(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0 CHECK (count >= 0),
    UNIQUE(user_id, pack_id)
);

-- Inventory Table (user's card collection)
CREATE TABLE IF NOT EXISTS sn_tcg_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES sn_tcg_cards(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, card_id)
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sn_tcg_users_clerk_id ON sn_tcg_users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_users_email ON sn_tcg_users(email);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_set_id ON sn_tcg_cards(set_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_game ON sn_tcg_cards(game);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_packs_set_id ON sn_tcg_packs(set_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_user_packs_user_id ON sn_tcg_user_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_inventory_user_id ON sn_tcg_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_inventory_card_id ON sn_tcg_inventory(card_id);

-- ============================================
-- 3. SEED DATA
-- ============================================

-- Insert Sets
INSERT INTO sn_tcg_sets (name, game) VALUES 
('Base Set', 'Pokemon'),
('Fossil', 'Pokemon'),
('Jungle', 'Pokemon'),
('Legend of Blue Eyes', 'Yu-Gi-Oh!'),
('Metal Raiders', 'Yu-Gi-Oh!'),
('Alpha Edition', 'Magic'),
('Beta Edition', 'Magic')
ON CONFLICT DO NOTHING;

-- Get set IDs for card insertion
DO $$
DECLARE
    base_set_id UUID;
    fossil_id UUID;
    jungle_id UUID;
    lobe_id UUID;
    metal_id UUID;
    alpha_id UUID;
    beta_id UUID;
BEGIN
    SELECT id INTO base_set_id FROM sn_tcg_sets WHERE name = 'Base Set' AND game = 'Pokemon';
    SELECT id INTO fossil_id FROM sn_tcg_sets WHERE name = 'Fossil' AND game = 'Pokemon';
    SELECT id INTO jungle_id FROM sn_tcg_sets WHERE name = 'Jungle' AND game = 'Pokemon';
    SELECT id INTO lobe_id FROM sn_tcg_sets WHERE name = 'Legend of Blue Eyes' AND game = 'Yu-Gi-Oh!';
    SELECT id INTO metal_id FROM sn_tcg_sets WHERE name = 'Metal Raiders' AND game = 'Yu-Gi-Oh!';
    SELECT id INTO alpha_id FROM sn_tcg_sets WHERE name = 'Alpha Edition' AND game = 'Magic';
    SELECT id INTO beta_id FROM sn_tcg_sets WHERE name = 'Beta Edition' AND game = 'Magic';

    -- Insert Pokemon Cards
    INSERT INTO sn_tcg_cards (set_id, name, type, rarity, image_url, game) VALUES
    (base_set_id, 'Charizard', 'Fire', 'Ultra Rare', 'https://images.pokemontcg.io/base1/4_hires.png', 'Pokemon'),
    (base_set_id, 'Blastoise', 'Water', 'Rare Holo', 'https://images.pokemontcg.io/base1/2_hires.png', 'Pokemon'),
    (base_set_id, 'Venusaur', 'Grass', 'Rare Holo', 'https://images.pokemontcg.io/base1/15_hires.png', 'Pokemon'),
    (base_set_id, 'Pikachu', 'Lightning', 'Common', 'https://images.pokemontcg.io/base1/58_hires.png', 'Pokemon'),
    (base_set_id, 'Mewtwo', 'Psychic', 'Rare Holo', 'https://images.pokemontcg.io/base1/10_hires.png', 'Pokemon'),
    (fossil_id, 'Aerodactyl', 'Fighting', 'Rare Holo', 'https://images.pokemontcg.io/base4/1_hires.png', 'Pokemon'),
    (jungle_id, 'Snorlax', 'Colorless', 'Rare Holo', 'https://images.pokemontcg.io/base2/11_hires.png', 'Pokemon')
    ON CONFLICT DO NOTHING;

    -- Insert Yu-Gi-Oh Cards
    INSERT INTO sn_tcg_cards (set_id, name, type, rarity, image_url, game) VALUES
    (lobe_id, 'Blue-Eyes White Dragon', 'Dragon/Normal', 'Ultra Rare', 'https://images.ygoprodeck.com/images/cards/89631139.jpg', 'Yu-Gi-Oh!'),
    (lobe_id, 'Dark Magician', 'Spellcaster/Normal', 'Ultra Rare', 'https://images.ygoprodeck.com/images/cards/46986414.jpg', 'Yu-Gi-Oh!'),
    (lobe_id, 'Exodia the Forbidden One', 'Spellcaster/Effect', 'Ultra Rare', 'https://images.ygoprodeck.com/images/cards/33396948.jpg', 'Yu-Gi-Oh!'),
    (lobe_id, 'Red-Eyes Black Dragon', 'Dragon/Normal', 'Ultra Rare', 'https://images.ygoprodeck.com/images/cards/74677422.jpg', 'Yu-Gi-Oh!'),
    (metal_id, 'Gate Guardian', 'Warrior/Effect', 'Ultra Rare', 'https://images.ygoprodeck.com/images/cards/25833572.jpg', 'Yu-Gi-Oh!')
    ON CONFLICT DO NOTHING;

    -- Insert Magic Cards
    INSERT INTO sn_tcg_cards (set_id, name, type, rarity, image_url, game) VALUES
    (alpha_id, 'Black Lotus', 'Artifact', 'Rare', 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg', 'Magic'),
    (alpha_id, 'Ancestral Recall', 'Instant', 'Rare', 'https://cards.scryfall.io/large/front/2/3/2359af08-4156-48bd-8ef6-0c121d919d9b.jpg', 'Magic'),
    (alpha_id, 'Time Walk', 'Sorcery', 'Rare', 'https://cards.scryfall.io/large/front/7/0/70901356-3266-4bd9-aacc-f06c27271de5.jpg', 'Magic'),
    (alpha_id, 'Mox Sapphire', 'Artifact', 'Rare', 'https://cards.scryfall.io/large/front/a/c/acf823b8-5b71-4f5e-9f6d-6f340a29aaf1.jpg', 'Magic'),
    (beta_id, 'Shivan Dragon', 'Creature - Dragon', 'Rare', 'https://cards.scryfall.io/large/front/2/2/227cf1b1-fc5a-4d9e-b5f3-59e6e81a1c7e.jpg', 'Magic')
    ON CONFLICT DO NOTHING;

    -- Insert Packs
    INSERT INTO sn_tcg_packs (set_id, name, price, card_count) VALUES
    (base_set_id, 'Pokemon Base Set Booster', 500, 5),
    (fossil_id, 'Pokemon Fossil Booster', 450, 5),
    (lobe_id, 'Legend of Blue Eyes Booster', 400, 5),
    (metal_id, 'Metal Raiders Booster', 400, 5),
    (alpha_id, 'MTG Alpha Edition Booster', 1000, 5)
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================

-- Grant permissions to the application user
-- Replace 'sn_tcg_user' with your actual database username if different

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sn_tcg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sn_tcg_user;

-- ============================================
-- DONE!
-- ============================================

-- Verify installation
SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE tablename LIKE 'sn_tcg_%';

SELECT 'Sets seeded:' as status;
SELECT COUNT(*) as count FROM sn_tcg_sets;

SELECT 'Cards seeded:' as status;
SELECT COUNT(*) as count FROM sn_tcg_cards;

SELECT 'Packs seeded:' as status;
SELECT COUNT(*) as count FROM sn_tcg_packs;
