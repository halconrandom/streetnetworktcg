import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query, getClient } from '@/lib/db';

// POST - Asignar cartas específicas a un usuario
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

    const { targetUserId, cards, notes } = await req.json();

    if (!targetUserId || !cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    // Validar cada carta
    for (const card of cards) {
      if (!card.cardId || !card.quantity || card.quantity < 1) {
        return NextResponse.json({ 
          error: `Carta inválida: ${JSON.stringify(card)}` 
        }, { status: 400 });
      }
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const assignedCards: { cardId: string; cardName: string; quantity: number }[] = [];

      for (const card of cards) {
        // Verificar que la carta existe y obtener su nombre
        const cardResult = await client.query(
          'SELECT id, name FROM sn_tcg_cards WHERE id = $1',
          [card.cardId]
        );

        if (cardResult.rows.length === 0) {
          throw new Error(`Carta no encontrada: ${card.cardId}`);
        }

        const cardName = cardResult.rows[0].name;

        // Insertar o actualizar en el inventario
        await client.query(`
          INSERT INTO sn_tcg_inventory (user_id, card_id, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, card_id) 
          DO UPDATE SET quantity = sn_tcg_inventory.quantity + $3
        `, [targetUserId, card.cardId, card.quantity]);

        assignedCards.push({
          cardId: card.cardId,
          cardName,
          quantity: card.quantity
        });
      }

      // Registrar la transacción
      await client.query(`
        INSERT INTO sn_tcg_transactions (user_id, admin_id, action_type, action_data)
        VALUES ($1, $2, 'card_assignment', $3)
      `, [targetUserId, adminUser.id, JSON.stringify({
        cards: assignedCards,
        notes: notes || null,
        totalCards: cards.reduce((sum, c) => sum + c.quantity, 0)
      })]);

      await client.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: `${assignedCards.length} cartas asignadas al usuario`,
        cards: assignedCards
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.error('Error asignando cartas:', err);
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
