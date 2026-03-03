/**
 * Fix Card Rarities Script
 * 
 * Updates card rarities from TCGdex API
 * The /sets endpoint doesn't include rarity, so we need to fetch each card individually
 * 
 * Usage: npx tsx scripts/fix-rarities.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';

const API_BASE_URL = 'https://api.tcgdex.net/v2/en';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SNCardDB',
};

const pool = new Pool(DB_CONFIG);

interface TCGdexCard {
  id: string;
  name: string;
  rarity?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.status === 429) {
        console.log('Rate limited, waiting 5s...');
        await sleep(5000);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Request failed, retrying (${i + 1}/${retries})...`);
      await sleep(1000);
    }
  }
  throw new Error('Max retries exceeded');
}

async function fixRarities() {
  console.log('========================================');
  console.log('Fix Card Rarities Script');
  console.log('========================================\n');

  const startTime = Date.now();

  try {
    // Get all cards with tcg_id
    const result = await pool.query(`
      SELECT c.id, c.tcg_id, c.name, c.rarity, s.tcg_id as set_tcg_id
      FROM sn_tcg_cards c
      JOIN sn_tcg_sets s ON c.set_id = s.id
      WHERE c.tcg_id IS NOT NULL
      ORDER BY c.tcg_id
    `);

    console.log(`Found ${result.rows.length} cards to update\n`);

    let updated = 0;
    let errors = 0;
    let unchanged = 0;

    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < result.rows.length; i += batchSize) {
      const batch = result.rows.slice(i, Math.min(i + batchSize, result.rows.length));

      for (const card of batch) {
        try {
          // Fetch card data from TCGdex
          const url = `${API_BASE_URL}/cards/${card.tcg_id}`;
          const response = await fetchWithRetry(url);
          const data: TCGdexCard = await response.json();

          const newRarity = data.rarity || 'Common';

          // Update if rarity changed
          if (newRarity !== card.rarity) {
            await pool.query(`
              UPDATE sn_tcg_cards 
              SET rarity = $1, rarity_slug = $1
              WHERE id = $2
            `, [newRarity, card.id]);

            console.log(`✓ ${card.name}: ${card.rarity} → ${newRarity}`);
            updated++;
          } else {
            unchanged++;
          }

          // Small delay to avoid rate limiting
          await sleep(100);

        } catch (error) {
          console.error(`✗ Error updating ${card.name}: ${error}`);
          errors++;
        }
      }

      // Progress
      if ((i + batchSize) % 1000 === 0) {
        console.log(`\nProgress: ${Math.min(i + batchSize, result.rows.length)}/${result.rows.length}\n`);
      }

      // Delay between batches
      await sleep(200);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n========================================');
    console.log('Update Complete!');
    console.log('========================================');
    console.log(`Total cards: ${result.rows.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Unchanged: ${unchanged}`);
    console.log(`Errors: ${errors}`);
    console.log(`Duration: ${duration}s`);

  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixRarities();
