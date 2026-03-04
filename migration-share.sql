-- Migration: Shared Collections
-- Creates table for public collection sharing

-- ============================================
-- SHARED COLLECTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sn_tcg_shared_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
    share_code VARCHAR(12) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by share_code
CREATE INDEX IF NOT EXISTS idx_sn_tcg_shared_collections_code ON sn_tcg_shared_collections(share_code);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_shared_collections_user ON sn_tcg_shared_collections(user_id);

-- ============================================
-- DONE!
-- ============================================

SELECT 'Shared collections table created!' as status;
