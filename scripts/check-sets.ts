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
  const result = await pool.query('SELECT id, name, logo_url, symbol_url FROM sn_tcg_sets LIMIT 10');
  console.log('📊 Sets con imágenes:');
  result.rows.forEach(s => {
    console.log(`\n${s.name}:`);
    console.log(`  logo_url: ${s.logo_url || 'NULL'}`);
    console.log(`  symbol_url: ${s.symbol_url || 'NULL'}`);
  });
  await pool.end();
}

main();