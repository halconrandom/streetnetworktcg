# Proyecto: Street Network TCG - Nexus

## 1. Visión General
Plataforma de colección de cartas TCG (Trading Card Game) para un servidor de roleplay de GTA V. Los usuarios pueden comprar sobres, abrirlos y coleccionar cartas de Pokemon, Yu-Gi-Oh! y Magic: The Gathering.

## 2. Requisitos Funcionales
- ✅ Sistema de autenticación con Clerk (usuario, correo, contraseña)
- ✅ Prevención de usuarios duplicados (username y email únicos)
- ✅ Dashboard con estadísticas de colección
- ✅ Tienda de sobres
- ✅ Apertura de sobres con animación
- ✅ Colección de cartas del usuario
- ✅ Sistema de balance/creditos

## 3. Estética y Diseño
- **Rojo Principal:** #dc2626 (Tailwind Red 600)
- **Fondos:** Negro profundo (#080808) y superficies de cristal oscuro (Glassmorphism)
- **Acentos:** Ámbar #f59e0b (para créditos y balances) y Zinc para textos secundarios
- **Fuente:** Outfit (Google Fonts)
- **Animaciones:** Motion (Framer Motion)

## 4. Tecnologías y Herramientas
- **Frontend:** Next.js 16 (App Router)
- **Estilos:** Tailwind CSS 4
- **Base de Datos:** PostgreSQL (SNCardDB)
- **Autenticación:** Clerk
- **Animaciones:** Motion (Framer Motion)

## 5. Estructura de Base de Datos
Todas las tablas usan el prefijo `sn_tcg_`:

| Tabla | Descripción |
|-------|-------------|
| `sn_tcg_users` | Usuarios vinculados a Clerk |
| `sn_tcg_sets` | Sets de cartas (Pokemon, Yu-Gi-Oh!, Magic) |
| `sn_tcg_cards` | Cartas individuales |
| `sn_tcg_packs` | Sobres disponibles para comprar |
| `sn_tcg_user_packs` | Sobres que posee cada usuario |
| `sn_tcg_inventory` | Cartas que posee cada usuario |

## 6. Configuración de Desarrollo

### Variables de Entorno (.env.local)
```env
# Database
DB_HOST=tu_vps_ip
DB_PORT=5432
DB_NAME=SNCardDB
DB_USER=sn_tcg_user
DB_PASS=tu_contraseña

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### Comandos
```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Servidor producción
npm run lint     # Linting
```

## 7. Flujo de Autenticación
1. Usuario visita la app
2. Si no está autenticado, ve pantalla de login
3. Clerk maneja el registro/login
4. Al autenticarse, se crea/actualiza el usuario en la DB
5. El usuario accede al dashboard

## 8. Próximas Funcionalidades (Roadmap)
- [ ] Sistema de intercambio de cartas
- [ ] Marketplace entre usuarios
- [ ] Logros y badges
- [ ] Estadísticas globales
- [ ] Panel de administración
