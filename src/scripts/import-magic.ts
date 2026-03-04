/**
 * Magic: The Gathering Import Script - Scryfall API
 * 
 * Uses Scryfall Bulk Data API (free, no API key needed)
 * https://scryfall.com/docs/api/bulk-data
 * 
 * Usage: npx tsx src/scripts/import-magic.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { createWriteStream, existsSync, unlinkSync } from 'fs';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import { Readable } from 'stream';

// ============================================
// CONFIGURATION
// ============================================

const BULK_DATA_URL = 'https://api.scryfall.com/bulk-data';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SNCardDB',
};

const BATCH_SIZE = 500; // Insert in batches for performance

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

interface ScryfallBulkData {
  object: string;
  id: string;
  type: string;
  uri: string;
  name: string;
  description: string;
  download_uri: string;
  updated_at: string;
  size: number;
  content_type: string;
  content_encoding: string;
}

interface ScryfallBulkDataResponse {
  object: string;
  has_more: boolean;
  data: ScryfallBulkData[];
}

interface ScryfallCard {
  object: string;
  id: string;
  oracle_id: string;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  set: string;
  set_id: string;
  set_name: string;
  set_type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus';
  collector_number: string;
  type_line: string;
  oracle_text?: string;
  mana_cost?: string;
  cmc?: number;
  colors?: string[];
  color_identity?: string[];
  color_indicator?: string[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  keywords?: string[];
  legalities?: Record<string, string>;
  reserved?: boolean;
  artist?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line?: string;
    oracle_text?: string;
    colors?: string[];
    power?: string;
    toughness?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      png: string;
    };
  }>;
  games?: string[];
  prices?: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    eur_foil?: string;
  };
}

// ============================================
// API FUNCTIONS
// ============================================

interface ScryfallSet {
  object: string;
  id: string;
  code: string;
  name: string;
  uri: string;
  scryfall_uri: string;
  search_uri: string;
  released_at: string | null;
  set_type: string;
  card_count: number;
  digital: boolean;
  nonfoil_only: boolean;
  foil_only: boolean;
  icon_svg_uri: string;
  block_code?: string;
  block?: string;
  parent_set_code?: string;
}

// Cache for set icons
let setIconsMap: Map<string, string> = new Map();

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

async function getOracleCardsUrl(): Promise<string> {
  console.log('Fetching bulk data info from Scryfall...');
  
  const response = await fetch(BULK_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch bulk data: ${response.statusText}`);
  }
  
  const data: ScryfallBulkDataResponse = await response.json();
  const oracleCards = data.data.find(item => item.type === 'oracle_cards');
  
  if (!oracleCards) {
    throw new Error('Oracle cards bulk data not found');
  }
  
  console.log(`Oracle Cards updated at: ${oracleCards.updated_at}`);
  console.log(`Download URL: ${oracleCards.download_uri}`);
  
  return oracleCards.download_uri;
}

async function downloadAndParseCards(downloadUrl: string): Promise<ScryfallCard[]> {
  console.log('\nDownloading Oracle Cards (this may take a few minutes)...');
  
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download cards: ${response.statusText}`);
  }
  
  // The response is gzipped, need to decompress
  const chunks: Uint8Array[] = [];
  const reader = response.body?.getReader();
  
  if (!reader) {
    throw new Error('Failed to get response reader');
  }
  
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalBytes += value.length;
    
    // Progress indicator every 10MB
    if (totalBytes % 10_000_000 < 100_000) {
      process.stdout.write(`\rDownloaded: ${(totalBytes / 1_000_000).toFixed(1)} MB`);
    }
  }
  
  console.log(`\nDownloaded ${(totalBytes / 1_000_000).toFixed(1)} MB`);
  console.log('Parsing JSON...');
  
  const buffer = Buffer.concat(chunks);
  
  // Try to parse as plain JSON first, then try gunzip
  let jsonBuffer: Buffer;
  try {
    // Check if it's gzipped by looking at the first two bytes
    const isGzipped = buffer[0] === 0x1f && buffer[1] === 0x8b;
    
    if (isGzipped) {
      console.log('Decompressing gzipped data...');
      jsonBuffer = await new Promise<Buffer>((resolve, reject) => {
        require('zlib').gunzip(buffer, (err: Error | null, result: Buffer) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } else {
      console.log('Data is not compressed, parsing directly...');
      jsonBuffer = buffer;
    }
  } catch (e) {
    console.log('Gunzip failed, trying direct parse...');
    jsonBuffer = buffer;
  }
  
  const cards: ScryfallCard[] = JSON.parse(jsonBuffer.toString('utf-8'));
  console.log(`Parsed ${cards.length} cards`);
  
  return cards;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function upsertSet(card: ScryfallCard): Promise<string> {
  // Get the icon SVG URI for this set
  const symbolUrl = setIconsMap.get(card.set.toLowerCase()) || null;
  
  const result = await query(`
    INSERT INTO sn_tcg_sets (name, game, series, release_date, symbol_url, tcg_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (tcg_id) DO UPDATE SET
      name = EXCLUDED.name,
      series = EXCLUDED.series,
      release_date = EXCLUDED.release_date,
      symbol_url = COALESCE(EXCLUDED.symbol_url, sn_tcg_sets.symbol_url)
    RETURNING id
  `, [
    card.set_name,
    'Magic',
    card.set_type || 'Unknown',
    card.released_at || null,
    symbolUrl,
    card.set,
  ]);
  
  return result.rows[0]?.id;
}

async function upsertCard(card: ScryfallCard, setDbId: string): Promise<void> {
  // Get image URL - prefer large, fallback to normal
  const imageUrl = card.image_uris?.large || 
                   card.image_uris?.normal || 
                   card.card_faces?.[0]?.image_uris?.large ||
                   card.card_faces?.[0]?.image_uris?.normal ||
                   null;
  
  // Get card colors
  const colors = card.colors || card.card_faces?.[0]?.colors || null;
  
  // Get power/toughness for creatures
  const power = card.power || card.card_faces?.[0]?.power || null;
  const toughness = card.toughness || card.card_faces?.[0]?.toughness || null;
  
  // Get oracle text
  const oracleText = card.oracle_text || 
                     card.card_faces?.map(f => f.oracle_text).filter(Boolean).join('\n---\n') || 
                     null;
  
  // Get mana cost
  const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || null;
  
  // Map rarity to our system
  const rarityMap: Record<string, string> = {
    'common': 'Common',
    'uncommon': 'Uncommon',
    'rare': 'Rare',
    'mythic': 'Mythic',
    'special': 'Special',
    'bonus': 'Bonus',
  };
  
  const rarity = rarityMap[card.rarity] || 'Common';
  
  await query(`
    INSERT INTO sn_tcg_cards (
      set_id, name, type, rarity, image_url, game,
      mana_cost, cmc, colors, color_identity, oracle_text,
      power, toughness, loyalty, keywords, legalities, reserved,
      tcg_id, artist, number
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    )
    ON CONFLICT (tcg_id) DO UPDATE SET
      name = EXCLUDED.name,
      rarity = EXCLUDED.rarity,
      image_url = COALESCE(EXCLUDED.image_url, sn_tcg_cards.image_url),
      mana_cost = EXCLUDED.mana_cost,
      cmc = EXCLUDED.cmc,
      colors = EXCLUDED.colors,
      color_identity = EXCLUDED.color_identity,
      oracle_text = EXCLUDED.oracle_text,
      power = EXCLUDED.power,
      toughness = EXCLUDED.toughness,
      loyalty = EXCLUDED.loyalty,
      keywords = EXCLUDED.keywords,
      legalities = EXCLUDED.legalities,
      reserved = EXCLUDED.reserved,
      artist = EXCLUDED.artist
  `, [
    setDbId,
    card.name,
    card.type_line || 'Unknown',
    rarity,
    imageUrl,
    'Magic',
    manaCost,
    card.cmc || null,
    colors,
    card.color_identity || null,
    oracleText,
    power,
    toughness,
    card.loyalty || null,
    card.keywords || null,
    card.legalities ? JSON.stringify(card.legalities) : null,
    card.reserved || false,
    card.oracle_id, // Use oracle_id as tcg_id for uniqueness
    card.artist || null,
    card.collector_number || null,
  ]);
}

async function createPackForSet(setDbId: string, setName: string): Promise<void> {
  await query(`
    INSERT INTO sn_tcg_packs (set_id, name, price, card_count)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
  `, [setDbId, `${setName} Booster Pack`, 500, 15]);
}

async function seedRarityConfig(setDbId: string): Promise<void> {
  const rarityConfigs = [
    { rarity: 'Common', weight: 1.0, min: 10, max: 12, guaranteed: false },
    { rarity: 'Uncommon', weight: 1.0, min: 3, max: 3, guaranteed: true },
    { rarity: 'Rare', weight: 0.85, min: 1, max: 1, guaranteed: true },
    { rarity: 'Mythic', weight: 0.15, min: 0, max: 1, guaranteed: false },
    { rarity: 'Special', weight: 0.05, min: 0, max: 1, guaranteed: false },
    { rarity: 'Bonus', weight: 0.03, min: 0, max: 1, guaranteed: false },
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

async function importMagicTcg(): Promise<void> {
  console.log('========================================');
  console.log('Magic: The Gathering Import Script');
  console.log('Scryfall API - Oracle Cards');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await query('SELECT 1');
    console.log('Database connected!\n');
    
    // Fetch set icons first
    setIconsMap = await fetchSetIcons();
    
    // Get download URL
    const downloadUrl = await getOracleCardsUrl();
    
    // Download and parse cards
    const cards = await downloadAndParseCards(downloadUrl);
    
    // Filter: only English cards and paper cards
    const englishPaperCards = cards.filter(card => 
      card.lang === 'en' && 
      card.games?.includes('paper') &&
      card.layout !== 'token' &&
      card.layout !== 'double_faced_token' &&
      card.layout !== 'emblem' &&
      card.layout !== 'planar' &&
      card.layout !== 'scheme' &&
      card.layout !== 'vanguard' &&
      card.layout !== 'reversible_card'
    );
    
    console.log(`\nFiltered to ${englishPaperCards.length} English paper cards`);
    
    // Track unique sets
    const setsMap = new Map<string, string>();
    
    // First pass: create all sets
    console.log('\nCreating sets...');
    for (const card of englishPaperCards) {
      if (!setsMap.has(card.set)) {
        const setDbId = await upsertSet(card);
        if (setDbId) {
          setsMap.set(card.set, setDbId);
          process.stdout.write(`\rSets created: ${setsMap.size}`);
        }
      }
    }
    console.log(`\nCreated ${setsMap.size} sets\n`);
    
    // Second pass: import cards in batches
    console.log('Importing cards...');
    let totalCards = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < englishPaperCards.length; i++) {
      const card = englishPaperCards[i];
      const setDbId = setsMap.get(card.set);
      
      if (!setDbId) {
        totalErrors++;
        continue;
      }
      
      try {
        await upsertCard(card, setDbId);
        totalCards++;
        
        if ((i + 1) % 1000 === 0) {
          process.stdout.write(`\rProgress: ${i + 1}/${englishPaperCards.length} cards (${((i + 1) / englishPaperCards.length * 100).toFixed(1)}%)`);
        }
      } catch (error) {
        totalErrors++;
      }
    }
    
    console.log(`\n\nCreating packs and rarity configs...`);
    
    // Create packs and rarity configs for each set
    let packsCreated = 0;
    for (const [setCode, setDbId] of setsMap) {
      // Get set name from a card
      const setCard = englishPaperCards.find(c => c.set === setCode);
      if (setCard) {
        await createPackForSet(setDbId, setCard.set_name);
        await seedRarityConfig(setDbId);
        packsCreated++;
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n========================================');
    console.log('Import Complete!');
    console.log('========================================');
    console.log(`Sets imported: ${setsMap.size}`);
    console.log(`Cards imported: ${totalCards}`);
    console.log(`Packs created: ${packsCreated}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Duration: ${duration}s`);
    
  } catch (error) {
    console.error('\nImport failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the import
importMagicTcg();