/**
 * Fix Remaining Rarities Script
 * 
 * Updates cards with 'None' rarity to 'Promo'
 * 
 * Usage: npx tsx scripts/fix-remaining-rarities.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SNCardDB',
};

const pool = new Pool(DB_CONFIG);

async function fixRemainingRarities() {
  console.log('========================================');
  console.log('Fix Remaining Rarities Script');
  console.log('========================================\n');

  try {
    // Update 'None' to 'Promo'
    const result = await pool.query(`
      UPDATE sn_tcg_cards 
      SET rarity = 'Promo', rarity_slug = 'Promo' 
      WHERE rarity = 'None'
    `);
    
    console.log(`✓ Updated ${result.rowCount} cards from 'None' to 'Promo'`);

    // Show final distribution
    const distribution = await pool.query(`
      SELECT rarity, COUNT(*) as count 
      FROM sn_tcg_cards 
      GROUP BY rarity 
      ORDER BY count DESC
    `);

    console.log('\n========================================');
    console.log('Final Rarity Distribution:');
    console.log('========================================');
    
    for (const row of distribution.rows) {
      console.log(`${row.rarity}: ${row.count}`);
    }

  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixRemainingRarities();
