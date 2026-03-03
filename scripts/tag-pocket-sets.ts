import { Pool } from 'pg';

const pool = new Pool({
  host: '198.245.57.170',
  port: 5432,
  user: 'sg_tcg_user',
  password: 'Merida19521973',
  database: 'SNCardDB',
  ssl: { rejectUnauthorized: false },
});

// TCG Pocket set IDs (from Bulbapedia)
const POCKET_SET_IDS = [
  'A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'A3b', 'A4', 'A4a',
  'B1', 'B1a', 'B2',
  'me01', 'me02', 'me02.5',
];

async function main() {
  console.log('🏷️ Tagging TCG Pocket sets...\n');
  
  // First, add the column if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE sn_tcg_sets 
      ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'physical'
    `);
    console.log('✅ Column "source" added/verified');
  } catch (err) {
    console.log('⚠️ Column might already exist, continuing...');
  }
  
  // Get all sets
  const setsResult = await pool.query('SELECT id, name, tcg_id FROM sn_tcg_sets');
  console.log(`📊 Total sets: ${setsResult.rows.length}\n`);
  
  let pocketCount = 0;
  let physicalCount = 0;
  
  for (const set of setsResult.rows) {
    const isPocket = POCKET_SET_IDS.includes(set.tcg_id);
    const source = isPocket ? 'pocket' : 'physical';
    
    await pool.query(
      'UPDATE sn_tcg_sets SET source = $1 WHERE id = $2',
      [source, set.id]
    );
    
    if (isPocket) {
      console.log(`📱 POCKET: ${set.tcg_id} - ${set.name}`);
      pocketCount++;
    }
  }
  
  physicalCount = setsResult.rows.length - pocketCount;
  
  console.log('\n========================================');
  console.log(`✅ TCG Pocket sets: ${pocketCount}`);
  console.log(`✅ Physical TCG sets: ${physicalCount}`);
  console.log('========================================\n');
  
  // Verify the update
  const verifyResult = await pool.query(`
    SELECT source, COUNT(*) as count 
    FROM sn_tcg_sets 
    GROUP BY source
  `);
  console.log('Verification:');
  verifyResult.rows.forEach(row => {
    console.log(`  ${row.source}: ${row.count}`);
  });
  
  await pool.end();
}

main().catch(console.error);
