import { pool } from './db';

async function main() {
  const result = await pool.query('SELECT id, name, game, tcg_id FROM sn_tcg_sets ORDER BY name');
  console.log('Total sets:', result.rows.length);
  console.log('\n');
  result.rows.forEach(s => {
    console.log(`${s.tcg_id || 'NO_ID'} | ${s.name} | ${s.game}`);
  });
  await pool.end();
}

main();