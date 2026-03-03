import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query, getClient } from '@/lib/db';

// GET - Ver colección de un usuario específico
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que sea admin o mod
    const userResult = await query(
      'SELECT role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    const userRole = userResult.rows[0]?.role;
    if (userRole !== 'admin' && userRole !== 'mod') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Obtener información del usuario
    const userInfoResult = await query(`
      SELECT id, username, email, role, created_at
      FROM sn_tcg_users
      WHERE id = $1
    `, [targetUserId]);

    if (userInfoResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Obtener inventario de cartas
    const inventoryResult = await query(`
      SELECT 
        c.id,
        c.name,
        c.type,
        c.rarity,
        c.rarity_slug,
        c.image_url,
        c.number,
        c.supertype,
        s.name as set_name,
        s.game,
        i.quantity,
        i.acquired_at
      FROM sn_tcg_inventory i
      JOIN sn_tcg_cards c ON i.card_id = c.id
      JOIN sn_tcg_sets s ON c.set_id = s.id
      WHERE i.user_id = $1 AND i.quantity > 0
      ORDER BY s.game, s.name, c.number
    `, [targetUserId]);

    // Obtener packs disponibles
    const packsResult = await query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.card_count,
        s.name as set_name,
        s.game,
        up.count
      FROM sn_tcg_user_packs up
      JOIN sn_tcg_packs p ON up.pack_id = p.id
      JOIN sn_tcg_sets s ON p.set_id = s.id
      WHERE up.user_id = $1 AND up.count > 0
    `, [targetUserId]);

    // Agrupar cartas por juego
    const cardsByGame: Record<string, typeof inventoryResult.rows> = {};
    for (const card of inventoryResult.rows) {
      if (!cardsByGame[card.game]) {
        cardsByGame[card.game] = [];
      }
      cardsByGame[card.game].push(card);
    }

    // Estadísticas
    const stats = {
      totalCards: inventoryResult.rows.reduce((sum, c) => sum + c.quantity, 0),
      uniqueCards: inventoryResult.rows.length,
      byGame: Object.entries(cardsByGame).map(([game, cards]) => ({
        game,
        total: cards.reduce((sum, c) => sum + c.quantity, 0),
        unique: cards.length,
      })),
      totalPacks: packsResult.rows.reduce((sum, p) => sum + p.count, 0),
    };

    return NextResponse.json({
      user: userInfoResult.rows[0],
      inventory: inventoryResult.rows,
      cardsByGame,
      packs: packsResult.rows,
      stats,
    });
  } catch (err: unknown) {
    console.error('Error fetching user collection:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Eliminar cartas del inventario de un usuario
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que sea admin o mod
    const userResult = await query(
      'SELECT role FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    const userRole = userResult.rows[0]?.role;
    if (userRole !== 'admin' && userRole !== 'mod') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, cardId, quantity } = body;

    if (!targetUserId || !cardId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Verificar cantidad actual
      const currentResult = await client.query(
        'SELECT quantity FROM sn_tcg_inventory WHERE user_id = $1 AND card_id = $2',
        [targetUserId, cardId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('El usuario no tiene esta carta');
      }

      const currentQty = currentResult.rows[0].quantity;
      if (quantity > currentQty) {
        throw new Error(`El usuario solo tiene ${currentQty} de esta carta`);
      }

      // Actualizar o eliminar
      if (quantity >= currentQty) {
        await client.query(
          'DELETE FROM sn_tcg_inventory WHERE user_id = $1 AND card_id = $2',
          [targetUserId, cardId]
        );
      } else {
        await client.query(
          'UPDATE sn_tcg_inventory SET quantity = quantity - $1 WHERE user_id = $2 AND card_id = $3',
          [quantity, targetUserId, cardId]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: `Eliminadas ${quantity} cartas` 
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    console.error('Error deleting card:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}