-- Migration: Magic The Gathering Support
-- Adds fields for MTG cards and extends existing tables

-- ============================================
-- 1. ADD MTG-SPECIFIC FIELDS TO CARDS TABLE
-- ============================================

ALTER TABLE sn_tcg_cards
ADD COLUMN IF NOT EXISTS mana_cost VARCHAR(50),
ADD COLUMN IF NOT EXISTS cmc DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS colors TEXT[],
ADD COLUMN IF NOT EXISTS color_identity TEXT[],
ADD COLUMN IF NOT EXISTS oracle_text TEXT,
ADD COLUMN IF NOT EXISTS power VARCHAR(10),
ADD COLUMN IF NOT EXISTS toughness VARCHAR(10),
ADD COLUMN IF NOT EXISTS loyalty VARCHAR(10),
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS legalities JSONB,
ADD COLUMN IF NOT EXISTS reserved BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. CREATE INDEXES FOR MTG FIELDS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_colors ON sn_tcg_cards USING GIN(colors);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_color_identity ON sn_tcg_cards USING GIN(color_identity);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_cmc ON sn_tcg_cards(cmc);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_cards_keywords ON sn_tcg_cards USING GIN(keywords);

-- ============================================
-- 3. ADD MTG RARITY CONFIG DEFAULTS
-- ============================================

-- MTG rarities: common, uncommon, rare, mythic
INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'common',
    1.0,
    10,
    12,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Magic'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'common'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'uncommon',
    1.0,
    3,
    3,
    TRUE
FROM sn_tcg_sets s
WHERE s.game = 'Magic'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'uncommon'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'rare',
    0.85,
    1,
    1,
    TRUE
FROM sn_tcg_sets s
WHERE s.game = 'Magic'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'rare'
);

INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
SELECT 
    s.id,
    'mythic',
    0.15,
    0,
    1,
    FALSE
FROM sn_tcg_sets s
WHERE s.game = 'Magic'
AND NOT EXISTS (
    SELECT 1 FROM sn_tcg_rarity_config rc WHERE rc.set_id = s.id AND rc.rarity = 'mythic'
);

-- ============================================
-- DONE!
-- ============================================

SELECT 'Magic The Gathering migration complete!' as status;