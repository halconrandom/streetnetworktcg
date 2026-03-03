import { Pool } from 'pg';

const pool = new Pool({
  host: '198.245.57.170',
  port: 5432,
  user: 'sg_tcg_user',
  password: 'Merida19521973',
  database: 'SNCardDB',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  // Ver usuarios existentes
  const allUsers = await pool.query('SELECT id, clerk_id, username, email, role FROM sn_tcg_users');
  console.log('📋 Usuarios en la DB:');
  allUsers.rows.forEach(u => console.log(`  - ${u.username} (${u.clerk_id}) - rol: ${u.role}`));

  // Buscar o crear el usuario
  const clerkId = 'user_3AMxg97xPY3XvvB5Uqlx5VHmFmF';
  
  let result = await pool.query(
    'SELECT id, username, role FROM sn_tcg_users WHERE clerk_id = $1',
    [clerkId]
  );

  if (result.rows.length === 0) {
    // Crear usuario admin
    result = await pool.query(
      "INSERT INTO sn_tcg_users (clerk_id, username, email, role, balance) VALUES ($1, $2, $3, 'admin', 999999) RETURNING id, username, role",
      [clerkId, 'Admin', 'admin@streetgames.com']
    );
    console.log('\n✅ Usuario admin CREADO:');
  } else {
    // Actualizar a admin
    result = await pool.query(
      "UPDATE sn_tcg_users SET role = 'admin' WHERE clerk_id = $1 RETURNING id, username, role",
      [clerkId]
    );
    console.log('\n✅ Usuario actualizado a ADMIN:');
  }

  console.log(result.rows[0]);
  await pool.end();
}

main();