import { query } from '../src/lib/db';

/**
 * Eliminar el trigger que crea transacciones duplicadas
 * El código ya maneja las transacciones manualmente con más detalles
 */
async function removeDuplicateTrigger() {
  console.log('🔧 Eliminando trigger de transacciones duplicadas...\n');

  try {
    // Eliminar el trigger
    await query(`DROP TRIGGER IF EXISTS log_pack_assignment ON sn_tcg_pack_assignments`);
    console.log('✅ Trigger "log_pack_assignment" eliminado');

    // Eliminar la función
    await query(`DROP FUNCTION IF EXISTS log_transaction()`);
    console.log('✅ Función "log_transaction" eliminada');

    // Eliminar transacciones duplicadas (las que tienen datos incompletos)
    const deleteResult = await query(`
      DELETE FROM sn_tcg_transactions 
      WHERE action_type = 'pack_assignment' 
      AND action_data->>'packName' IS NULL
      RETURNING id
    `);
    console.log(`🗑️  Eliminadas ${deleteResult.rowCount} transacciones duplicadas con datos incompletos`);

    console.log('\n✅ Proceso completado. Las transacciones ya no se duplicarán.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await removeDuplicateTrigger();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
