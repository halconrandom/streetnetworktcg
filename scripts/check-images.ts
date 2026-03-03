import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

async function checkImages() {
  try {
    console.log('🔗 Conectando a la base de datos...\n');

    // Verificar sets con imágenes
    const setsResult = await pool.query(`
      SELECT id, name, game, logo_url, symbol_url 
      FROM sn_tcg_sets 
      WHERE logo_url IS NOT NULL 
      LIMIT 5
    `);

    console.log('📊 Sets con imágenes:');
    console.log('====================');
    for (const set of setsResult.rows) {
      console.log(`\n${set.name} (${set.game})`);
      console.log(`  Logo: ${set.logo_url}`);
      console.log(`  Symbol: ${set.symbol_url}`);
    }

    // Verificar cartas con imágenes
    const cardsResult = await pool.query(`
      SELECT id, name, rarity, image_url, set_id
      FROM sn_tcg_cards 
      WHERE image_url IS NOT NULL 
      LIMIT 5
    `);

    console.log('\n\n📊 Cartas con imágenes:');
    console.log('====================');
    for (const card of cardsResult.rows) {
      console.log(`\n${card.name} (${card.rarity})`);
      console.log(`  Image: ${card.image_url}`);
    }

    // Contar totales
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM sn_tcg_sets) as total_sets,
        (SELECT COUNT(*) FROM sn_tcg_sets WHERE logo_url IS NOT NULL) as sets_with_logo,
        (SELECT COUNT(*) FROM sn_tcg_cards) as total_cards,
        (SELECT COUNT(*) FROM sn_tcg_cards WHERE image_url IS NOT NULL) as cards_with_image
    `);

    const stats = statsResult.rows[0];
    console.log('\n\n📈 Estadísticas:');
    console.log('================');
    console.log(`Sets: ${stats.sets_with_logo}/${stats.total_sets} con logo`);
    console.log(`Cartas: ${stats.cards_with_image}/${stats.total_cards} con imagen`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkImages();