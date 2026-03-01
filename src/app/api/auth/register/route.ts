import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { username, email, password, confirmPassword } = await req.json();

        // 1. Basic validation
        if (!username || !email || !password || !confirmPassword) {
            return NextResponse.json({ error: 'Por favor, completa todos los campos' }, { status: 400 });
        }

        // 2. Password confirmation
        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Las contraseñas no coinciden' }, { status: 400 });
        }

        // 3. Password length validation (Min 12 characters)
        if (password.length < 12) {
            return NextResponse.json({ error: 'La contraseña debe tener al menos 12 caracteres' }, { status: 400 });
        }

        // 4. Check for existing username or email
        const existing = await query(
            'SELECT username, email FROM sg_tcg_users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existing.rows.length > 0) {
            const userMatch = existing.rows.find(r => r.username === username);
            const emailMatch = existing.rows.find(r => r.email === email);

            if (userMatch && emailMatch) return NextResponse.json({ error: 'El nombre de usuario y el correo ya están registrados' }, { status: 400 });
            if (userMatch) return NextResponse.json({ error: 'Este nombre de usuario ya está en uso' }, { status: 400 });
            if (emailMatch) return NextResponse.json({ error: 'Este correo electrónico ya está registrado' }, { status: 400 });
        }

        // 5. Create user
        const hashed = await hashPassword(password);
        const result = await query(
            'INSERT INTO sg_tcg_users (username, email, password_hash, balance) VALUES ($1, $2, $3, $4) RETURNING id, username, balance',
            [username, email, hashed, 2500]
        );

        const user = result.rows[0];
        const token = await signJWT({ id: user.id, username: user.username });

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return NextResponse.json({ user });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
