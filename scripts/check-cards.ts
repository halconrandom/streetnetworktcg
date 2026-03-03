import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

async function checkCards() {
  try {
    // Obtener un set específico y sus cartas
    const setResult = await pool.query(`
      SELECT id, name FROM sn_tcg_sets WHERE game = 'Pokemon' LIMIT 1
    `);
    
    const set = setResult.rows[0];
    console.log(`\n📦 Set: ${set.name} (${set.id})\n`);

    // Obtener cartas de ese set
    const cardsResult = await pool.query(`
      SELECT id, name, rarity, image_url, number
      FROM sn_tcg_cards
      WHERE set_id = $1
      ORDER BY number
      LIMIT 10
    `, [set.id]);

    console.log('📊 Cartas:');
    for (const card of cardsResult.rows) {
      console.log(`\n  ${card.number || 'N/A'} - ${card.name}`);
      console.log(`    Rareza: ${card.rarity}`);
      console.log(`    Imagen: ${card.image_url}`);
      console.log(`    ¿Tiene imagen?: ${card.image_url ? 'SÍ' : 'NO'}`);
    }

    // Verificar si hay cartas sin imagen
    const noImageResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM sn_tcg_cards
      WHERE set_id = $1 AND (image_url IS NULL OR image_url = '')
    `, [set.id]);

    console.log(`\n\n⚠️  Cartas sin imagen en este set: ${noImageResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkCards();