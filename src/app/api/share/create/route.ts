import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';

/**
 * Genera un código aleatorio de 8 caracteres
 */
function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/share/create
 * Crea un nuevo link compartido para la colección del usuario
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener el ID de usuario en la base de datos
    const userResult = await query(
      'SELECT id FROM sn_tcg_users WHERE clerk_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUserId = userResult.rows[0].id;

    // Obtener duración de expiración del body (default: 24 horas)
    const body = await request.json().catch(() => ({}));
    const expiresInHours = body.expiresInHours || 24;

    // Generar código único
    let shareCode = generateShareCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Asegurar que el código sea único
    while (attempts < maxAttempts) {
      const existingCode = await query(
        'SELECT id FROM sn_tcg_shared_collections WHERE share_code = $1',
        [shareCode]
      );
      
      if (existingCode.rows.length === 0) break;
      
      shareCode = generateShareCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: 'Could not generate unique code' }, { status: 500 });
    }

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Insertar el nuevo share
    const result = await query(
      `INSERT INTO sn_tcg_shared_collections (user_id, share_code, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, share_code, expires_at`,
      [dbUserId, shareCode, expiresAt]
    );

    const share = result.rows[0];

    // Construir la URL base
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    return NextResponse.json({
      success: true,
      shareCode: share.share_code,
      shareUrl: `${baseUrl}/share/${share.share_code}`,
      expiresAt: share.expires_at,
    });
  } catch (err: unknown) {
    console.error('Error creating share:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
