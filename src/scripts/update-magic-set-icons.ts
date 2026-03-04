/**
 * Update Magic Set Icons Script
 * 
 * Fetches set icons from Scryfall and updates the symbol_url
 * for all Magic sets in the database.
 * 
 * Usage: npx tsx src/scripts/update-magic-set-icons.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { Pool } from 'pg';

// ============================================
// CONFIGURATION
// ============================================

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SNCardDB',
};

// ============================================
// DATABASE CONNECTION
// ============================================

const pool = new Pool(DB_CONFIG);

async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

// ============================================
// SCRYFALL TYPES
// ============================================

interface ScryfallSet {
  object: string;
  id: string;
  code: string;
  name: string;
  icon_svg_uri: string;
  released_at: string | null;
  set_type: string;
}

// ============================================
// MAIN FUNCTIONS
// ============================================

async function fetchSetIcons(): Promise<Map<string, string>> {
  console.log('Fetching set icons from Scryfall...');
  
  const response = await fetch('https://api.scryfall.com/sets');
  if (!response.ok) {
    throw new Error(`Failed to fetch sets: ${response.statusText}`);
  }
  
  const data = await response.json();
  const sets: ScryfallSet[] = data.data;
  
  const iconsMap = new Map<string, string>();
  for (const set of sets) {
    iconsMap.set(set.code.toLowerCase(), set.icon_svg_uri);
  }
  
  console.log(`Loaded ${iconsMap.size} set icons`);
  return iconsMap;
}

async function updateSetIcons(): Promise<void> {
  console.log('========================================');
  console.log('Update Magic Set Icons');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await query('SELECT 1');
    console.log('Database connected!\n');
    
    // Fetch set icons from Scryfall
    const iconsMap = await fetchSetIcons();
    
    // Get all Magic sets from database
    console.log('\nFetching Magic sets from database...');
    const result = await query(`
      SELECT id, name, tcg_id, symbol_url 
      FROM sn_tcg_sets 
      WHERE game = 'Magic'
    `);
    
    const dbSets = result.rows;
    console.log(`Found ${dbSets.length} Magic sets in database\n`);
    
    // Update each set
    let updated = 0;
    let skipped = 0;
    let notFound = 0;
    
    for (const dbSet of dbSets) {
      const setCode = dbSet.tcg_id?.toLowerCase();
      
      if (!setCode) {
        console.log(`  ⚠ Skipping "${dbSet.name}" - no tcg_id`);
        skipped++;
        continue;
      }
      
      const iconUrl = iconsMap.get(setCode);
      
      if (!iconUrl) {
        console.log(`  ⚠ No icon found for "${dbSet.name}" (${setCode})`);
        notFound++;
        continue;
      }
      
      // Update the set
      await query(`
        UPDATE sn_tcg_sets 
        SET symbol_url = $1 
        WHERE id = $2
      `, [iconUrl, dbSet.id]);
      
      updated++;
      
      if (updated % 50 === 0) {
        console.log(`  Updated ${updated} sets...`);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n========================================');
    console.log('Update Complete!');
    console.log('========================================');
    console.log(`Sets updated: ${updated}`);
    console.log(`Sets skipped (no tcg_id): ${skipped}`);
    console.log(`Sets without icon: ${notFound}`);
    console.log(`Duration: ${duration}s`);
    
    // Show sample of updated sets
    console.log('\nSample of updated sets:');
    const sampleResult = await query(`
      SELECT name, tcg_id, symbol_url 
      FROM sn_tcg_sets 
      WHERE game = 'Magic' AND symbol_url IS NOT NULL
      LIMIT 5
    `);
    
    for (const row of sampleResult.rows) {
      console.log(`  ${row.name} (${row.tcg_id}): ${row.symbol_url}`);
    }
    
  } catch (error) {
    console.error('\nUpdate failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the update
updateSetIcons();