import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Rutas que requieren rol admin
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Rutas que solo el admin puede acceder (no mods)
const isAdminOnlyRoute = createRouteMatcher([
  '/admin/users/roles(.*)',
  '/admin/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = auth();
  
  // Si es una ruta protegida
  if (isProtectedRoute(req)) {
    // Verificar que esté autenticado
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Para rutas admin, verificar rol
    if (isAdminRoute(req)) {
      // Obtener rol de los claims de Clerk o usar 'user' por defecto
      const role = (sessionClaims?.publicMetadata as Record<string, unknown>)?.role || 'user';
      
      // Si no tiene rol admin o mod, denegar acceso
      if (role !== 'admin' && role !== 'mod') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      // Rutas solo para admin (no mods)
      if (isAdminOnlyRoute(req) && role !== 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and api routes that don't need protection
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};