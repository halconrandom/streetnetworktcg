import { query, getClient } from '../src/lib/db';

/**
 * Script para eliminar packs duplicados (mismo name + set_id)
 * Mantiene solo el pack más antiguo (por created_at)
 */
async function cleanDuplicatePacks() {
  console.log('🔍 Buscando packs duplicados...\n');

  // Contar duplicados
  const duplicatesResult = await query(`
    SELECT name, set_id, COUNT(*) as count 
    FROM sn_tcg_packs 
    GROUP BY name, set_id 
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `);

  if (duplicatesResult.rows.length === 0) {
    console.log('✅ No hay packs duplicados');
    return;
  }

  console.log(`📊 Encontrados ${duplicatesResult.rows.length} grupos de packs duplicados:\n`);
  
  let totalToDelete = 0;
  for (const row of duplicatesResult.rows.slice(0, 10)) {
    console.log(`   - "${row.name}" (${row.count} copias)`);
    totalToDelete += Number(row.count) - 1;
  }
  if (duplicatesResult.rows.length > 10) {
    console.log(`   ... y ${duplicatesResult.rows.length - 10} más`);
  }
  console.log(`\n🗑️  Se eliminarán ${totalToDelete} packs duplicados\n`);

  // Eliminar duplicados manteniendo el más antiguo
  const deleteResult = await query(`
    DELETE FROM sn_tcg_packs 
    WHERE id NOT IN (
      SELECT id FROM (
        SELECT DISTINCT ON (name, set_id) id 
        FROM sn_tcg_packs 
        ORDER BY name, set_id, created_at ASC
      ) t
    )
    RETURNING name
  `);

  console.log(`✅ Eliminados ${deleteResult.rowCount} packs duplicados`);
  
  // Verificar resultado
  const verifyResult = await query(`
    SELECT COUNT(*) as total FROM sn_tcg_packs
  `);
  console.log(`📦 Total de packs restantes: ${verifyResult.rows[0].total}`);
}

async function main() {
  try {
    await cleanDuplicatePacks();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
