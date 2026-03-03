import { pool } from './db';

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