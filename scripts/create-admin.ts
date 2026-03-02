import { Pool } from 'pg';

async function createAdminUser() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔗 Conectando a la base de datos...');

    // Crear usuario admin de prueba
    const result = await pool.query(`
      INSERT INTO sn_tcg_users (clerk_id, username, email, role, balance)
      VALUES ('admin_test_001', 'AdminTest', 'admin@test.com', 'admin', 999999)
      ON CONFLICT (clerk_id) DO UPDATE SET role = 'admin'
      RETURNING id, username, email, role
    `);

    console.log('✅ Usuario admin creado/actualizado:');
    console.log(result.rows[0]);

    // Verificar que existe
    const verify = await pool.query(`
      SELECT id, username, email, role FROM sn_tcg_users WHERE clerk_id = 'admin_test_001'
    `);
    
    console.log('\n📊 Verificación:');
    console.log(verify.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createAdminUser();