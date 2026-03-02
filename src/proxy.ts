import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Rutas públicas
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// Rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Rutas públicas no requieren autenticación
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Para rutas protegidas, verificar autenticación
  if (isProtectedRoute(req)) {
    // Proteger la ruta - redirige a sign-in si no está autenticado
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};