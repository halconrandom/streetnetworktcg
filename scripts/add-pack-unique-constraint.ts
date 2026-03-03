import { query } from '../src/lib/db';

/**
 * Añadir restricción UNIQUE a sn_tcg_packs para evitar duplicados (name, set_id)
 */
async function addUniqueConstraint() {
  console.log('🔧 Añadiendo restricción UNIQUE a sn_tcg_packs...\n');

  try {
    // Verificar si ya existe la restricción
    const checkResult = await query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'sn_tcg_packs' 
      AND constraint_type = 'UNIQUE'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Ya existe una restricción UNIQUE');
      return;
    }

    // Añadir restricción UNIQUE
    await query(`
      ALTER TABLE sn_tcg_packs 
      ADD CONSTRAINT sn_tcg_packs_name_set_id_unique 
      UNIQUE (name, set_id)
    `);

    console.log('✅ Restricción UNIQUE añadida correctamente');
    console.log('   Ahora no se podrán crear packs duplicados con el mismo nombre y set_id');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await addUniqueConstraint();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
