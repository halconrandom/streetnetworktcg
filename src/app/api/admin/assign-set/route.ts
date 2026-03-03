import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query, getClient } from '@/lib/db';

// POST - Asignar un set completo a un usuario
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea admin o mod
    const adminResult = await query(
      'SELECT id, role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    const adminUser = adminResult.rows[0];
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'mod')) {
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
    }

    const { targetUserId, setId, quantity = 1, rarityFilter, notes } = await req.json();

    if (!targetUserId || !setId) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Verificar que el set existe
      const setResult = await client.query(
        'SELECT id, name, game FROM sn_tcg_sets WHERE id = $1',
        [setId]
      );

      if (setResult.rows.length === 0) {
        throw new Error('Set no encontrado');
      }

      const setName = setResult.rows[0].name;

      // Obtener cartas del set (con filtro de rareza opcional)
      let cardsQuery = 'SELECT id, name, rarity FROM sn_tcg_cards WHERE set_id = $1';
      const params: (string | string[])[] = [setId];

      if (rarityFilter && Array.isArray(rarityFilter) && rarityFilter.length > 0) {
        cardsQuery += ' AND rarity = ANY($2)';
        params.push(rarityFilter);
      }

      const cardsResult = await client.query(cardsQuery, params);

      if (cardsResult.rows.length === 0) {
        throw new Error('No hay cartas en este set con los filtros especificados');
      }

      // Asignar cada carta al usuario
      const assignedCards: { cardId: string; cardName: string; rarity: string; quantity: number }[] = [];

      for (const card of cardsResult.rows) {
        // Insertar o actualizar en el inventario
        await client.query(`
          INSERT INTO sn_tcg_inventory (user_id, card_id, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, card_id) 
          DO UPDATE SET quantity = sn_tcg_inventory.quantity + $3
        `, [targetUserId, card.id, quantity]);

        assignedCards.push({
          cardId: card.id,
          cardName: card.name,
          rarity: card.rarity,
          quantity
        });
      }

      // Registrar la transacción
      await client.query(`
        INSERT INTO sn_tcg_transactions (user_id, admin_id, action_type, action_data)
        VALUES ($1, $2, 'set_assignment', $3)
      `, [targetUserId, adminUser.id, JSON.stringify({
        setId,
        setName,
        quantity,
        rarityFilter: rarityFilter || null,
        notes: notes || null,
        totalCards: cardsResult.rows.length,
        totalQuantity: cardsResult.rows.length * quantity
      })]);

      await client.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: `Set "${setName}" asignado: ${cardsResult.rows.length} cartas x ${quantity} = ${cardsResult.rows.length * quantity} cartas totales`,
        set: { id: setId, name: setName },
        cardsAssigned: cardsResult.rows.length,
        totalQuantity: cardsResult.rows.length * quantity
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.error('Error asignando set:', err);
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
