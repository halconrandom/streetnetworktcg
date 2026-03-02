# Guía de Configuración VPS - Street Network TCG

Esta guía te ayudará a configurar la base de datos PostgreSQL para el proyecto Street Network TCG en tu VPS.

---

## 1. Requisitos Previos

- PostgreSQL instalado en tu VPS (ya confirmado ✅)
- Acceso SSH a tu VPS
- Permisos de superusuario en PostgreSQL

---

## 2. Crear la Base de Datos

Conéctate a PostgreSQL como superusuario:

```bash
sudo -u postgres psql
```

Ejecuta los siguientes comandos:

```sql
-- Crear la base de datos
CREATE DATABASE "SNCardDB";

-- Crear el usuario (cambia la contraseña por una segura)
CREATE USER sn_tcg_user WITH ENCRYPTED PASSWORD 'TU_CONTRASEÑA_SEGURA';

-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE "SNCardDB" TO sn_tcg_user;

-- Conectar a la base de datos
\c "SNCardDB"

-- Otorgar permisos de esquema público
GRANT ALL ON SCHEMA public TO sn_tcg_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sn_tcg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sn_tcg_user;
```

---

## 3. Ejecutar los Scripts de Migración

Ejecuta primero la migración base y luego la de Pokemon:

```bash
# Migración base
psql -U sn_tcg_user -d SNCardDB -f migration.sql

# Migración para Pokemon TCG (campos extendidos)
psql -U sn_tcg_user -d SNCardDB -f migration-pokemon.sql
```

---

## 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Base de Datos PostgreSQL
DB_HOST=tu_ip_vps
DB_PORT=5432
DB_NAME=SNCardDB
DB_USER=sn_tcg_user
DB_PASS=TU_CONTRASEÑA_SEGURA

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX

# Pokemon TCG API (opcional, aumenta rate limit)
POKEMON_TCG_API_KEY=tu_api_key_opcional
```

### Obtener las claves de Clerk:

1. Ve a [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Crea una nueva aplicación o selecciona una existente
3. En **API Keys** encontrarás las claves

### Obtener API Key de Pokemon TCG (opcional):

1. Ve a [https://dev.pokemontcg.io/](https://dev.pokemontcg.io/)
2. Crea una cuenta
3. Genera tu API Key para mayor rate limit

---

## 5. Importar Datos de Pokemon TCG

### Opción A: Via API (recomendado)

1. Inicia la aplicación: `npm run dev`
2. Haz login con un usuario admin
3. Visita: `POST http://localhost:3000/api/admin/import-pokemon`
4. Body: `{ "action": "start" }`

### Opción B: Via Script

```bash
npx tsx src/scripts/import-pokemon.ts
```

Esto importará:
- ~150 sets de Pokemon TCG
- ~18,000+ cartas
- Configuración de rarezas por set

---

## 6. Crear Usuario Admin

Primero regístrate normalmente a través de la aplicación, luego actualiza el rol:

```sql
-- Ver usuarios
SELECT id, username, email, role FROM sn_tcg_users;

-- Hacer admin
UPDATE sn_tcg_users SET role = 'admin' WHERE username = 'nombre_usuario';
```

---

## Estructura de Tablas

| Tabla | Descripción |
|-------|-------------|
| `sn_tcg_users` | Usuarios vinculados a Clerk |
| `sn_tcg_sets` | Sets de cartas (Pokemon, Yu-Gi-Oh!, Magic) |
| `sn_tcg_cards` | Cartas individuales con todos los campos |
| `sn_tcg_packs` | Sobres disponibles para comprar |
| `sn_tcg_user_packs` | Sobres que posee cada usuario |
| `sn_tcg_inventory` | Cartas que posee cada usuario |
| `sn_tcg_rarity_config` | Configuración de probabilidades por set |
| `sn_tcg_import_logs` | Logs de importación |

---

## Sistema de Probabilidades (Rarity Engine)

El sistema usa un motor de probabilidades con:

- **Bad Luck Protection**: Después de 25 packs sin ultra rare, aumentan las probabilidades
- **Lucky Streaks**: Consecutivos hits aumentan probabilidad
- **Jackpot**: 0.5% de chance de pack con múltiples rares
- **Variación por set**: Sets especiales tienen rates diferentes

Ver `src/lib/rarity-engine.ts` para más detalles.
