import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { query, getClient } from '@/lib/db';

// Pokemon TCG API configuration
const API_BASE_URL = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY || '';
const PAGE_SIZE = 250;

// ============================================
// HELPER FUNCTIONS
// ============================================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        await sleep(waitMs);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000);
    }
  }
  
  throw new Error('Max retries exceeded');
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function upsertSet(set: {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  releaseDate: string;
  images: { logo: string; symbol: string };
}): Promise<string> {
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

async function upsertCard(card: {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  types?: string[];
  hp?: string;
  number?: string;
  artist?: string;
  rarity?: string;
  evolvesTo?: string[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  attacks?: Array<{ name: string; cost?: string[]; damage?: string; text?: string }>;
  abilities?: Array<{ name: string; text: string; type: string }>;
  weaknesses?: Array<{ type: string; value?: string }>;
  resistances?: Array<{ type: string; value?: string }>;
  legalities?: Record<string, string>;
  nationalPokedexNumbers?: number[];
  images: { small: string; large: string };
}, setDbId: string): Promise<void> {
  await query(`
    INSERT INTO sn_tcg_cards (
      set_id, name, type, rarity, image_url, game,
      supertype, subtypes, types, hp, number, artist, rarity_slug, tcg_id,
      evolves_to, retreat_cost, converted_retreat_cost,
      attacks, abilities, weaknesses, resistances, legalities, national_pokedex_numbers
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
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
      rarity_slug = EXCLUDED.rarity_slug
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

async function createPackForSet(setDbId: string, setName: string, setLogo?: string): Promise<void> {
  await query(`
    INSERT INTO sn_tcg_packs (set_id, name, price, card_count, image_url)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (set_id) DO UPDATE SET
      name = EXCLUDED.name,
      image_url = COALESCE(EXCLUDED.image_url, sn_tcg_packs.image_url)
  `, [setDbId, `${setName} Booster Pack`, 500, 10, setLogo || null]);
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

async function importSets(): Promise<{ id: string; name: string }[]> {
  const url = `${API_BASE_URL}/sets?orderBy=releaseDate:desc&pageSize=100`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  return data.data.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }));
}

async function importCardsForSet(setId: string, setDbId: string): Promise<number> {
  let totalCards = 0;
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const url = `${API_BASE_URL}/cards?q=set.id:${setId}&page=${page}&pageSize=${PAGE_SIZE}`;
    const response = await fetchWithRetry(url);
    const data = await response.json();
    
    for (const card of data.data) {
      await upsertCard(card, setDbId);
      totalCards++;
    }
    
    hasMore = data.data.length === PAGE_SIZE;
    page++;
    
    await sleep(API_KEY ? 100 : 300);
  }
  
  return totalCards;
}

// ============================================
// API ROUTE
// ============================================

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const userResult = await query(
      'SELECT role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const body = await req.json();
    const action = body.action || 'status';
    
    // Get or create import log
    if (action === 'start') {
      // Create import log
      const logResult = await query(`
        INSERT INTO sn_tcg_import_logs (import_type, status, created_by)
        VALUES ('pokemon_full', 'in_progress', $1)
        RETURNING id
      `, [userResult.rows[0].id]);
      
      const importId = logResult.rows[0].id;
      
      // Start import in background (simplified - in production use a job queue)
      const sets = await importSets();
      
      let totalCards = 0;
      const results: { set: string; cards: number }[] = [];
      
      for (const set of sets) {
        const setDbId = await upsertSet(set as Parameters<typeof upsertSet>[0]);
        const cardCount = await importCardsForSet(set.id, setDbId);
        
        // Obtener el logo del set para usarlo como imagen del pack
        const setLogo = (set as { images?: { logo?: string } }).images?.logo;
        await createPackForSet(setDbId, set.name, setLogo);
        await seedRarityConfig(setDbId);
        
        totalCards += cardCount;
        results.push({ set: set.name, cards: cardCount });
        
        // Update progress
        await query(`
          UPDATE sn_tcg_import_logs 
          SET processed_items = $1, total_items = $2
          WHERE id = $3
        `, [results.length, sets.length, importId]);
      }
      
      // Mark complete
      await query(`
        UPDATE sn_tcg_import_logs 
        SET status = 'completed', completed_at = NOW(), processed_items = $1, total_items = $2
        WHERE id = $3
      `, [sets.length, sets.length, importId]);
      
      return NextResponse.json({
        success: true,
        importId,
        setsProcessed: sets.length,
        totalCards,
        results: results.slice(0, 10), // First 10 results
      });
    }
    
    if (action === 'status') {
      const logResult = await query(`
        SELECT * FROM sn_tcg_import_logs 
        WHERE import_type = 'pokemon_full' 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      return NextResponse.json({
        log: logResult.rows[0] || null,
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Import error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get import status
    const logResult = await query(`
      SELECT * FROM sn_tcg_import_logs 
      WHERE import_type = 'pokemon_full' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    // Get counts
    const setsCount = await query('SELECT COUNT(*)::int as count FROM sn_tcg_sets WHERE game = $1', ['Pokemon']);
    const cardsCount = await query('SELECT COUNT(*)::int as count FROM sn_tcg_cards WHERE game = $1', ['Pokemon']);
    const packsCount = await query('SELECT COUNT(*)::int as count FROM sn_tcg_packs p JOIN sn_tcg_sets s ON p.set_id = s.id WHERE s.game = $1', ['Pokemon']);
    
    return NextResponse.json({
      log: logResult.rows[0] || null,
      stats: {
        sets: setsCount.rows[0].count,
        cards: cardsCount.rows[0].count,
        packs: packsCount.rows[0].count,
      },
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
