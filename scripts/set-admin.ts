import { Pool } from 'pg';

async function setAdmin() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Obtener el primer usuario
    const userResult = await pool.query(`
      SELECT id, username, email, role FROM sn_tcg_users ORDER BY created_at ASC LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('💡 Primero debes registrarte en la aplicación');
      return;
    }

    const user = userResult.rows[0];
    console.log(`👤 Usuario encontrado: ${user.username} (${user.email})`);
    console.log(`📋 Rol actual: ${user.role}`);

    if (user.role === 'admin') {
      console.log('✅ Este usuario ya es admin');
      return;
    }

    // Actualizar a admin
    await pool.query(`
      UPDATE sn_tcg_users SET role = 'admin' WHERE id = $1
    `, [user.id]);

    console.log('✅ Usuario actualizado a admin correctamente');
    console.log('⚠️  IMPORTANTE: También debes actualizar el rol en Clerk Dashboard');
    console.log('   1. Ve a https://dashboard.clerk.com/');
    console.log('   2. Selecciona tu aplicación');
    console.log('   3. Ve a Users → selecciona el usuario');
    console.log('   4. En "Public Metadata", agrega: { "role": "admin" }');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

setAdmin();