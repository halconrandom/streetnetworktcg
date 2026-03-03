import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

async function checkImportedCards() {
  try {
    // Obtener un set importado (no los de ejemplo)
    const setResult = await pool.query(`
      SELECT id, name, tcg_id 
      FROM sn_tcg_sets 
      WHERE tcg_id IS NOT NULL AND game = 'Pokemon' 
      LIMIT 1
    `);
    
    const set = setResult.rows[0];
    console.log(`\n📦 Set Importado: ${set.name}`);
    console.log(`   TCG ID: ${set.tcg_id}`);
    console.log(`   UUID: ${set.id}\n`);

    // Obtener cartas de ese set
    const cardsResult = await pool.query(`
      SELECT id, name, rarity, rarity_slug, image_url, number
      FROM sn_tcg_cards
      WHERE set_id = $1
      ORDER BY number
      LIMIT 15
    `, [set.id]);

    console.log('📊 Cartas:');
    for (const card of cardsResult.rows) {
      console.log(`\n  #${card.number || 'N/A'} - ${card.name}`);
      console.log(`    Rareza: ${card.rarity || card.rarity_slug || 'N/A'}`);
      console.log(`    Imagen: ${card.image_url || 'SIN IMAGEN'}`);
    }

    // Estadísticas del set
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(image_url) as con_imagen,
        COUNT(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 END) as sin_imagen
      FROM sn_tcg_cards
      WHERE set_id = $1
    `, [set.id]);

    const stats = statsResult.rows[0];
    console.log(`\n\n📈 Estadísticas del set:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Con imagen: ${stats.con_imagen}`);
    console.log(`   Sin imagen: ${stats.sin_imagen}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkImportedCards();