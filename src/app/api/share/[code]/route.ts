import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/share/[code]
 * Obtiene la colección pública asociada a un código compartido
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Verificar que el código existe y está activo
    const shareResult = await query(
      `SELECT 
        sc.id,
        sc.user_id,
        sc.expires_at,
        sc.is_active,
        u.username as owner_username
      FROM sn_tcg_shared_collections sc
      JOIN sn_tcg_users u ON sc.user_id = u.id
      WHERE sc.share_code = $1`,
      [code]
    );

    if (shareResult.rows.length === 0) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const share = shareResult.rows[0];

    // Verificar si está activo
    if (!share.is_active) {
      return NextResponse.json({ error: 'Share has been revoked' }, { status: 410 });
    }

    // Verificar si ha expirado
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share has expired' }, { status: 410 });
    }

    // Obtener la colección del usuario
    const collectionResult = await query(
      `SELECT 
        i.id,
        c.id as "cardId",
        c.name, 
        c.type, 
        c.rarity, 
        c.image_url as "imageUrl", 
        c.game,
        i.quantity,
        i.acquired_at as "acquiredAt",
        s.name as "setName",
        s.series
      FROM sn_tcg_inventory i
      JOIN sn_tcg_cards c ON i.card_id = c.id
      LEFT JOIN sn_tcg_sets s ON c.set_id = s.id
      WHERE i.user_id = $1
      ORDER BY i.acquired_at DESC`,
      [share.user_id]
    );

    // Estadísticas de la colección
    const statsResult = await query(
      `SELECT 
        COUNT(*) as "totalCards",
        COUNT(DISTINCT c.game) as "totalGames",
        SUM(i.quantity) as "totalQuantity"
      FROM sn_tcg_inventory i
      JOIN sn_tcg_cards c ON i.card_id = c.id
      WHERE i.user_id = $1`,
      [share.user_id]
    );

    const stats = statsResult.rows[0];

    return NextResponse.json({
      success: true,
      owner: share.owner_username,
      expiresAt: share.expires_at,
      stats: {
        totalCards: parseInt(stats.totalCards) || 0,
        totalGames: parseInt(stats.totalGames) || 0,
        totalQuantity: parseInt(stats.totalQuantity) || 0,
      },
      collection: collectionResult.rows,
    });
  } catch (err: unknown) {
    console.error('Error fetching share:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
