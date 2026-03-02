/**
 * Pokemon TCG Import Script
 * 
 * Fetches all sets and cards from the Pokemon TCG API
 * and imports them into the database.
 * 
 * Usage: npx tsx src/scripts/import-pokemon.ts
 */

import { Pool } from 'pg';
import type { PokemonTcgSet, PokemonTcgCard, PokemonTcgApiResponse } from '../lib/types';

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY || '';
const PAGE_SIZE = 250;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SNCardDB',
};

// Rate limiting
const REQUEST_DELAY_MS = API_KEY ? 100 : 300; // Faster with API key

// ============================================
// DATABASE CONNECTION
// ============================================

const pool = new Pool(DB_CONFIG);

async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

// ============================================
// API FETCHING
// ============================================

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      if (API_KEY) {
        headers['X-Api-Key'] = API_KEY;
      }
      
      const response = await fetch(url, { headers });
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        console.log(`Rate limited, waiting ${waitMs}ms...`);
        await sleep(waitMs);
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

async function fetchAllSets(): Promise<PokemonTcgSet[]> {
  console.log('Fetching all sets...');
  
  const url = `${API_BASE_URL}/sets?orderBy=releaseDate:desc&pageSize=100`;
  const response = await fetchWithRetry(url);
  const data: PokemonTcgApiResponse<PokemonTcgSet> = await response.json();
  
  console.log(`Found ${data.totalCount} sets`);
  return data.data;
}

async function fetchCardsBySet(setId: string): Promise<PokemonTcgCard[]> {
  const allCards: PokemonTcgCard[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const url = `${API_BASE_URL}/cards?q=set.id:${setId}&page=${page}&pageSize=${PAGE_SIZE}`;
    const response = await fetchWithRetry(url);
    const data: PokemonTcgApiResponse<PokemonTcgCard> = await response.json();
    
    allCards.push(...data.data);
    
    console.log(`  Fetched page ${page}/${Math.ceil(data.totalCount / PAGE_SIZE)} (${data.data.length} cards)`);
    
    hasMore = data.count === PAGE_SIZE;
    page++;
    
    await sleep(REQUEST_DELAY_MS);
  }
  
  return allCards;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function upsertSet(set: PokemonTcgSet): Promise<string> {
  const result = await query(`
    INSERT INTO sn_tcg_sets (name, game, series, printed_total, release_date, logo_url, symbol_url, tcg_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (tcg_id) DO UPDATE SET
      name = EXCLUDED.name,
      series = EXCLUDED.series,
      printed_total = EXCLUDED.printed_total,
      release_date = EXCLUDED.release_date,
      logo_url = EXCLUDED.logo_url,
      symbol_url = EXCLUDED.symbol_url
    RETURNING id
  `, [
    set.name,
    'Pokemon',
    set.series,
    set.printedTotal,
    set.releaseDate,
    set.images?.logo || null,
    set.images?.symbol || null,
    set.id,
  ]);
  
  return result.rows[0].id;
}

async function upsertCard(card: PokemonTcgCard, setDbId: string): Promise<void> {
  await query(`
    INSERT INTO sn_tcg_cards (
      set_id, name, type, rarity, image_url, game,
      supertype, subtypes, types, hp, number, artist, rarity_slug, tcg_id,
      evolves_to, retreat_cost, converted_retreat_cost,
      attacks, abilities, weaknesses, resistances, legalities, national_pokedex_numbers
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
    )
    ON CONFLICT (tcg_id) DO UPDATE SET
      name = EXCLUDED.name,
      rarity = EXCLUDED.rarity,
      image_url = EXCLUDED.image_url,
      supertype = EXCLUDED.supertype,
      subtypes = EXCLUDED.subtypes,
      types = EXCLUDED.types,
      hp = EXCLUDED.hp,
      number = EXCLUDED.number,
      artist = EXCLUDED.artist,
      rarity_slug = EXCLUDED.rarity_slug,
      evolves_to = EXCLUDED.evolves_to,
      retreat_cost = EXCLUDED.retreat_cost,
      attacks = EXCLUDED.attacks,
      abilities = EXCLUDED.abilities,
      weaknesses = EXCLUDED.weaknesses,
      resistances = EXCLUDED.resistances,
      legalities = EXCLUDED.legalities,
      national_pokedex_numbers = EXCLUDED.national_pokedex_numbers
  `, [
    setDbId,
    card.name,
    card.types?.[0] || card.supertype || 'Unknown',
    card.rarity || 'Common',
    card.images?.large || card.images?.small || null,
    'Pokemon',
    card.supertype || null,
    card.subtypes || null,
    card.types || null,
    card.hp || null,
    card.number || null,
    card.artist || null,
    card.rarity || null,
    card.id,
    card.evolvesTo || null,
    card.retreatCost || null,
    card.convertedRetreatCost || null,
    card.attacks ? JSON.stringify(card.attacks) : null,
    card.abilities ? JSON.stringify(card.abilities) : null,
    card.weaknesses ? JSON.stringify(card.weaknesses) : null,
    card.resistances ? JSON.stringify(card.resistances) : null,
    card.legalities ? JSON.stringify(card.legalities) : null,
    card.nationalPokedexNumbers || null,
  ]);
}

async function createPackForSet(setDbId: string, setName: string): Promise<void> {
  await query(`
    INSERT INTO sn_tcg_packs (set_id, name, price, card_count)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
  `, [setDbId, `${setName} Booster Pack`, 500, 10]);
}

async function seedRarityConfig(setDbId: string): Promise<void> {
  const rarityConfigs = [
    { rarity: 'Common', weight: 1.0, min: 5, max: 7, guaranteed: false },
    { rarity: 'Uncommon', weight: 1.0, min: 2, max: 3, guaranteed: false },
    { rarity: 'Rare', weight: 0.70, min: 1, max: 1, guaranteed: true },
    { rarity: 'Rare Holo', weight: 0.25, min: 0, max: 1, guaranteed: false },
    { rarity: 'Ultra Rare', weight: 0.04, min: 0, max: 1, guaranteed: false },
    { rarity: 'Illustration Rare', weight: 0.03, min: 0, max: 1, guaranteed: false },
    { rarity: 'Special Illustration Rare', weight: 0.015, min: 0, max: 1, guaranteed: false },
    { rarity: 'Hyper Rare', weight: 0.01, min: 0, max: 1, guaranteed: false },
    { rarity: 'Amazing Rare', weight: 0.02, min: 0, max: 1, guaranteed: false },
    { rarity: 'Rainbow Rare', weight: 0.015, min: 0, max: 1, guaranteed: false },
    { rarity: 'Secret Rare', weight: 0.01, min: 0, max: 1, guaranteed: false },
    { rarity: 'Shiny Rare', weight: 0.03, min: 0, max: 1, guaranteed: false },
    { rarity: 'Golden Rare', weight: 0.01, min: 0, max: 1, guaranteed: false },
    { rarity: 'Prism Rare', weight: 0.01, min: 0, max: 1, guaranteed: false },
    { rarity: 'Double Rare', weight: 0.25, min: 0, max: 1, guaranteed: false },
  ];
  
  for (const config of rarityConfigs) {
    await query(`
      INSERT INTO sn_tcg_rarity_config (set_id, rarity, weight, min_per_pack, max_per_pack, is_guaranteed)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (set_id, rarity) DO UPDATE SET
        weight = EXCLUDED.weight,
        min_per_pack = EXCLUDED.min_per_pack,
        max_per_pack = EXCLUDED.max_per_pack,
        is_guaranteed = EXCLUDED.is_guaranteed
    `, [setDbId, config.rarity, config.weight, config.min, config.max, config.guaranteed]);
  }
}

// ============================================
// MAIN IMPORT FUNCTION
// ============================================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function importPokemonTcg(): Promise<void> {
  console.log('========================================');
  console.log('Pokemon TCG Import Script');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await query('SELECT 1');
    console.log('Database connected!\n');
    
    // Fetch all sets
    const sets = await fetchAllSets();
    console.log(`\nImporting ${sets.length} sets...\n`);
    
    let totalCards = 0;
    let totalErrors = 0;
    
    // Import each set
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      console.log(`[${i + 1}/${sets.length}] Processing: ${set.name} (${set.id})`);
      
      try {
        // Upsert set
        const setDbId = await upsertSet(set);
        console.log(`  Set ID: ${setDbId}`);
        
        // Fetch and import cards
        const cards = await fetchCardsBySet(set.id);
        console.log(`  Importing ${cards.length} cards...`);
        
        for (const card of cards) {
          try {
            await upsertCard(card, setDbId);
            totalCards++;
          } catch (error) {
            console.error(`  Error importing card ${card.id}: ${error}`);
            totalErrors++;
          }
        }
        
        // Create pack for this set
        await createPackForSet(setDbId, set.name);
        
        // Seed rarity config
        await seedRarityConfig(setDbId);
        
        console.log(`  ✓ Set complete: ${cards.length} cards\n`);
        
        // Small delay between sets
        await sleep(REQUEST_DELAY_MS);
        
      } catch (error) {
        console.error(`  ✗ Error processing set ${set.id}: ${error}\n`);
        totalErrors++;
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('========================================');
    console.log('Import Complete!');
    console.log('========================================');
    console.log(`Sets imported: ${sets.length}`);
    console.log(`Cards imported: ${totalCards}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Duration: ${duration}s`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the import
importPokemonTcg();
