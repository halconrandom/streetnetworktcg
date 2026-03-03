/**
 * Script para arreglar las URLs de imágenes de TCGdex
 * Agrega extensión .webp y calidad (high/low) a las URLs
 * 
 * Uso: npx tsx scripts/fix-image-urls.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SNCardDB',
  ssl: { rejectUnauthorized: false },
};

const pool = new Pool(DB_CONFIG);

async function fixImageUrls() {
  console.log('========================================');
  console.log('Fix TCGdex Image URLs');
  console.log('========================================\n');

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✓ Database connected\n');

    // Obtener todas las cartas con image_url
    const cardsResult = await pool.query(`
      SELECT id, image_url, tcg_id 
      FROM sn_tcg_cards 
      WHERE image_url IS NOT NULL 
      AND image_url != ''
    `);

    console.log(`Found ${cardsResult.rows.length} cards with image URLs\n`);

    let updated = 0;
    let skipped = 0;

    for (const card of cardsResult.rows) {
      const originalUrl = card.image_url;

      // Si ya tiene extensión, saltar
      if (originalUrl.endsWith('.webp') || originalUrl.endsWith('.png') || originalUrl.endsWith('.jpg')) {
        skipped++;
        continue;
      }

      // Agregar /high.webp al final
      // La URL viene como: https://assets.tcgdex.net/en/swsh/swsh3/136
      // Debe ser: https://assets.tcgdex.net/en/swsh/swsh3/136/high.webp
      const newUrl = `${originalUrl}/high.webp`;

      await pool.query(`
        UPDATE sn_tcg_cards 
        SET image_url = $1 
        WHERE id = $2
      `, [newUrl, card.id]);

      updated++;

      if (updated % 500 === 0) {
        console.log(`  Updated ${updated} cards...`);
      }
    }

    console.log(`\n✓ Updated ${updated} card images`);
    console.log(`  Skipped ${skipped} (already had extension)`);

    // Arreglar logos y símbolos de sets
    const setsResult = await pool.query(`
      SELECT id, logo_url, symbol_url 
      FROM sn_tcg_sets 
      WHERE logo_url IS NOT NULL OR symbol_url IS NOT NULL
    `);

    console.log(`\nProcessing ${setsResult.rows.length} sets...`);

    let setsUpdated = 0;

    for (const set of setsResult.rows) {
      const updates: { logo_url?: string; symbol_url?: string } = {};

      if (set.logo_url && !set.logo_url.endsWith('.webp')) {
        updates.logo_url = `${set.logo_url}/logo.webp`;
      }

      if (set.symbol_url && !set.symbol_url.endsWith('.webp')) {
        updates.symbol_url = `${set.symbol_url}/symbol.webp`;
      }

      if (Object.keys(updates).length > 0) {
        await pool.query(`
          UPDATE sn_tcg_sets 
          SET logo_url = COALESCE($1, logo_url),
              symbol_url = COALESCE($2, symbol_url)
          WHERE id = $3
        `, [updates.logo_url || null, updates.symbol_url || null, set.id]);

        setsUpdated++;
      }
    }

    console.log(`✓ Updated ${setsUpdated} set logos/symbols`);

    // Verificar una muestra
    const sampleResult = await pool.query(`
      SELECT name, image_url 
      FROM sn_tcg_cards 
      WHERE image_url IS NOT NULL 
      LIMIT 3
    `);

    console.log('\nSample URLs after fix:');
    sampleResult.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.image_url}`);
    });

    console.log('\n========================================');
    console.log('Done!');
    console.log('========================================');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixImageUrls();