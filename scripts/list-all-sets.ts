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
  const result = await pool.query('SELECT id, name, game, tcg_id FROM sn_tcg_sets ORDER BY name');
  console.log('Total sets:', result.rows.length);
  console.log('\n');
  result.rows.forEach(s => {
    console.log(`${s.tcg_id || 'NO_ID'} | ${s.name} | ${s.game}`);
  });
  await pool.end();
}

main();
