import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Por favor, ingresa tu nombre de usuario y contraseña' }, { status: 400 });
        }

        const result = await query('SELECT * FROM sg_tcg_users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Este nombre de usuario no existe en nuestro club' }, { status: 401 });
        }

        const user = result.rows[0];
        const isMatch = await comparePassword(password, user.password_hash);

        if (!isMatch) {
            return NextResponse.json({ error: 'La contraseña es incorrecta' }, { status: 401 });
        }

        const token = await signJWT({ id: user.id, username: user.username });

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        // Don't return the password hash
        const { password_hash, ...safeUser } = user;
        return NextResponse.json({ user: safeUser });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Hubo un problema al intentar entrar. Inténtalo de nuevo.' }, { status: 500 });
    }
}
