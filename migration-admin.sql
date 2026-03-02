-- ============================================
-- STREET TCG - Admin Panel Migration
-- Agrega soporte para roles mod y logs de transacciones
-- ============================================

-- 1. Agregar rol 'mod' al CHECK de roles
ALTER TABLE sn_tcg_users 
DROP CONSTRAINT IF EXISTS sn_tcg_users_role_check;

ALTER TABLE sn_tcg_users 
ADD CONSTRAINT sn_tcg_users_role_check 
CHECK (role IN ('user', 'mod', 'admin'));

-- Actualizar el valor por defecto
ALTER TABLE sn_tcg_users 
ALTER COLUMN role SET DEFAULT 'user';

-- 2. Crear tabla de transacciones/logs
CREATE TABLE IF NOT EXISTS sn_tcg_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES sn_tcg_users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para transacciones
CREATE INDEX IF NOT EXISTS idx_sn_tcg_transactions_user_id ON sn_tcg_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_transactions_admin_id ON sn_tcg_transactions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_transactions_action_type ON sn_tcg_transactions(action_type);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_transactions_created_at ON sn_tcg_transactions(created_at DESC);

-- 3. Crear tabla de asignación de sobres
CREATE TABLE IF NOT EXISTS sn_tcg_pack_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES sn_tcg_users(id) ON DELETE CASCADE,
    pack_id UUID REFERENCES sn_tcg_packs(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES sn_tcg_users(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para asignaciones
CREATE INDEX IF NOT EXISTS idx_sn_tcg_pack_assignments_user_id ON sn_tcg_pack_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_pack_assignments_pack_id ON sn_tcg_pack_assignments(pack_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_pack_assignments_admin_id ON sn_tcg_pack_assignments(admin_id);
CREATE INDEX IF NOT EXISTS idx_sn_tcg_pack_assignments_created_at ON sn_tcg_pack_assignments(created_at DESC);

-- 4. Agregar campos adicionales a packs para personalización
ALTER TABLE sn_tcg_packs 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES sn_tcg_users(id) ON DELETE SET NULL;

-- 5. Crear función para registrar transacciones automáticamente
CREATE OR REPLACE FUNCTION log_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO sn_tcg_transactions (user_id, action_type, action_data)
        VALUES (NEW.user_id, 'pack_assignment', jsonb_build_object(
            'pack_id', NEW.pack_id,
            'quantity', NEW.quantity,
            'admin_id', NEW.admin_id
        ));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log automático de asignaciones
DROP TRIGGER IF EXISTS log_pack_assignment ON sn_tcg_pack_assignments;
CREATE TRIGGER log_pack_assignment
    AFTER INSERT ON sn_tcg_pack_assignments
    FOR EACH ROW
    EXECUTE FUNCTION log_transaction();

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Admin migration complete!' as status;

SELECT 'Roles permitidos:' as info;
SELECT DISTINCT role FROM sn_tcg_users;

SELECT 'Tablas creadas:' as info;
SELECT tablename FROM pg_tables WHERE tablename LIKE 'sn_tcg_%' ORDER BY tablename;