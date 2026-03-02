-- Migration Script for Pokemon TCG Import
-- Adds extended fields for full Pokemon TCG support

-- ============================================
-- 1. UPDATE SETS TABLE
-- ============================================

ALTER TABLE sn_tcg_sets 
ADD COLUMN IF NOT EXISTS series VARCHAR(255),
ADD COLUMN IF NOT EXISTS printed_total INTEGER,
ADD COLUMN IF NOT EXISTS release_date DATE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS symbol_url TEXT,
ADD COLUMN IF NOT EXISTS tcg_id VARCHAR(50) UNIQUE;

-- ============================================
-- 2. UPDATE CARDS TABLE
-- ============================================

ALTER TABLE sn_tcg_cards
ADD COLUMN IF NOT EXISTS supertype VARCHAR(50),
ADD COLUMN IF NOT EXISTS subtypes TEXT[],
ADD COLUMN IF NOT EXISTS types TEXT[],
ADD COLUMN IF NOT EXISTS hp VARCHAR(10),
ADD COLUMN IF NOT EXISTS number VARCHAR(20),
ADD COLUMN IF NOT EXISTS artist VARCHAR(255),
ADD COLUMN IF NOT EXISTS rarity_slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS tcg_id VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS evolves_to TEXT[],
ADD COLUMN IF NOT EXISTS retreat_cost TEXT[],
ADD COLUMN IF NOT EXISTS converted_retreat_cost INTEGER,
ADD COLUMN IF NOT EXISTS attacks JSONB,
ADD COLUMN IF NOT EXISTS abilities JSONB,
ADD COLUMN IF NOT EXISTS weaknesses JSONB,
ADD COLUMN IF NOT EXISTS resistances JSONB,
ADD COLUMN IF NOT EXISTS legalities JSONB,
ADD COLUMN IF NOT EXISTS national_pokedex_numbers INTEGER[];

-- ============================================
-- 3. CREATE RARITY CONFIG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sn_tcg_rarity_config (
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

-- ============================================
-- 4. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_tcg_id ON sn_tcg_cards(tcg_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_rarity_slug ON sn_tcg_cards(rarity_slug);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_supertype ON sn_tcg_cards(supertype);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_types ON sn_tcg_cards USING GIN(types);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_sets_tcg_id ON sn_tcg_sets(tcg_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_sets_series ON sn_tcg_sets(series);

-- ============================================
-- 5. SEED DEFAULT RARITY CONFIG
-- ============================================

-- This will be populated per-set during import
-- Default config for standard Pokemon sets

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'Common',
    1.0,
    5,
    7,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Pokemon'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'Common'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'Uncommon',
    1.0,
    2,
    3,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Pokemon'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'Uncommon'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'Rare',
    0.70,
    1,
    1,
    TRUE
FROM sn_tcg_sets s
WHERE s.game = 'Pokemon'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'Rare'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'Rare Holo',
    0.25,
    0,
    1,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Pokemon'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'Rare Holo'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'Ultra Rare',
    0.04,
    0,
    1,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Pokemon'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'Ultra Rare'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'Illustration Rare',
    0.03,
    0,
    1,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Pokemon'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'Illustration Rare'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'Special Illustration Rare',
    0.015,
    0,
    1,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Pokemon'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'Special Illustration Rare'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'Hyper Rare',
    0.01,
    0,
    1,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Pokemon'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'Hyper Rare'
);

-- ============================================
-- 6. ADD LUCK STATE TO USERS
-- ============================================

ALTER TABLE sn_tcg_users
ADD COLUMN IF NOT EXISTS luck_state JSONB DEFAULT '{}';

-- ============================================
-- 7. CREATE IMPORT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sn_tcg_import_logs (
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
-- DONE!
-- ============================================

SELECT 'Pokemon TCG migration complete!' as status;
