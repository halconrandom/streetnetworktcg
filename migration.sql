-- =============================================
-- SCRIPT DE MIGRACIÓN COMPLETA
-- Ejecutar en el VPS como superusuario postgres:
-- psql -U postgres -d StreetNetworkTCG -f migration.sql
-- =============================================

-- 1. PERMISOS
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sg_tcg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sg_tcg_user;
GRANT CREATE ON SCHEMA public TO sg_tcg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sg_tcg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sg_tcg_user;

-- 2. COLUMNAS FALTANTES en sg_tcg_users
ALTER TABLE sg_tcg_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE sg_tcg_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON sg_tcg_users(email) WHERE email IS NOT NULL;

-- 3. COLUMNAS FALTANTES en sg_tcg_cards
ALTER TABLE sg_tcg_cards ADD COLUMN IF NOT EXISTS game VARCHAR(50);

-- 4. CREAR TABLAS FALTANTES
CREATE TABLE IF NOT EXISTS sg_tcg_user_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sg_tcg_users(id) ON DELETE CASCADE,
    pack_id UUID REFERENCES sg_tcg_packs(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0 CHECK (count >= 0),
    UNIQUE(user_id, pack_id)
);

CREATE TABLE IF NOT EXISTS sg_tcg_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sg_tcg_users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES sg_tcg_cards(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, card_id)
);

-- 5. PERMISOS PARA LAS NUEVAS TABLAS
GRANT ALL PRIVILEGES ON TABLE sg_tcg_user_packs TO sg_tcg_user;
GRANT ALL PRIVILEGES ON TABLE sg_tcg_inventory TO sg_tcg_user;

-- 6. VERIFICAR ESTRUCTURA FINAL
SELECT '=== sg_tcg_users ===' as tabla;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sg_tcg_users' ORDER BY ordinal_position;

SELECT '=== sg_tcg_cards ===' as tabla;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sg_tcg_cards' ORDER BY ordinal_position;

SELECT '=== Migracion completada con exito ===' as status;
