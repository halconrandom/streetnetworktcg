/**
 * Fix set logo URLs - remove duplicate /logo in path
 * 
 * Before: https://assets.tcgdex.net/en/base/basep/logo/logo.webp
 * After:  https://assets.tcgdex.net/en/base/basep/logo.webp
 */

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SNCardDB',
});

async function fixLogoUrls() {
  console.log('Fixing set logo URLs...\n');
  
  // Get all sets with logo URLs
  const { rows: sets } = await pool.query(`
    SELECT id, name, logo_url, symbol_url 
    FROM sn_tcg_sets 
    WHERE logo_url IS NOT NULL OR symbol_url IS NOT NULL
  `);
  
  console.log(`Found ${sets.length} sets with logos\n`);
  
  let fixed = 0;
  
  for (const set of sets) {
    let logoUrl = set.logo_url;
    let symbolUrl = set.symbol_url;
    let needsUpdate = false;
    
    // Fix logo URL - remove duplicate /logo/logo.webp -> /logo.webp
    if (logoUrl && logoUrl.includes('/logo/logo.webp')) {
      logoUrl = logoUrl.replace('/logo/logo.webp', '/logo.webp');
      needsUpdate = true;
    }
    
    // Fix symbol URL - remove duplicate /symbol/symbol.webp -> /symbol.webp
    if (symbolUrl && symbolUrl.includes('/symbol/symbol.webp')) {
      symbolUrl = symbolUrl.replace('/symbol/symbol.webp', '/symbol.webp');
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await pool.query(`
        UPDATE sn_tcg_sets 
        SET logo_url = $1, symbol_url = $2 
        WHERE id = $3
      `, [logoUrl, symbolUrl, set.id]);
      
      console.log(`✓ Fixed: ${set.name}`);
      console.log(`  ${set.logo_url} -> ${logoUrl}`);
      fixed++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Fixed ${fixed} sets`);
  console.log(`========================================`);
  
  await pool.end();
}

fixLogoUrls().catch(console.error);
