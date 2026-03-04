import { query } from './src/lib/db';
import { readFileSync } from 'fs';

async function runMigration() {
  try {
    const sql = readFileSync('./migration-share.sql', 'utf8');
    await query(sql);
    console.log('✅ Migration successful: sn_tcg_shared_collections table created');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigration();
