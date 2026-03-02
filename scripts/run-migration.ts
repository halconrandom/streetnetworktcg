import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
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
    
    const migrationPath = path.join(__dirname, '..', 'migration-admin.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Ejecutando migración...');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migración ejecutada correctamente');
    
    // Verify tables
    const tablesResult = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE tablename LIKE 'sn_tcg_%' 
      ORDER BY tablename
    `);
    
    console.log('\n📊 Tablas en la base de datos:');
    tablesResult.rows.forEach(row => console.log(`  - ${row.tablename}`));
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();