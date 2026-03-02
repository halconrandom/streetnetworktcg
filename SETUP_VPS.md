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

## 3. Ejecutar el Script de Migración

Sal de psql (`\q`) y ejecuta el script de migración:

```bash
psql -U sn_tcg_user -d SNCardDB -f migration.sql
```

O si lo prefieres desde dentro de psql:

```bash
sudo -u postgres psql -d SNCardDB -f migration.sql
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
```

### Obtener las claves de Clerk:

1. Ve a [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Crea una nueva aplicación o selecciona una existente
3. En **API Keys** encontrarás:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (empieza con `pk_test_` o `pk_live_`)
   - `CLERK_SECRET_KEY` (empieza con `sk_test_` o `sk_live_`)

---

## 5. Configurar Clerk para el Proyecto

### 5.1 Configurar URLs permitidas

En el dashboard de Clerk, ve a **Paths** y configura:

- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/`
- **After sign-up URL**: `/`

### 5.2 Configurar campos de registro

En **Configure** → **User & Authentication** → **Email, Phone, Username**:

- ✅ Habilitar **Username** (requerido)
- ✅ Habilitar **Email address** (requerido)
- ✅ Habilitar **Password** (requerido)

### 5.3 Configurar restricciones de unicidad

Clerk automáticamente maneja la unicidad de:
- Username (no se puede repetir)
- Email (no se puede repetir)

No necesitas configuración adicional para esto.

---

## 6. Crear Usuario Admin (Opcional)

Si necesitas un usuario administrador, primero regístrate normalmente a través de la aplicación, luego actualiza su rol en la base de datos:

```sql
-- Obtener el ID del usuario
SELECT id, username, email FROM sn_tcg_users;

-- Actualizar a admin
UPDATE sn_tcg_users SET role = 'admin' WHERE username = 'nombre_usuario';
```

---

## 7. Inicializar Datos Semilla

Una vez configurado todo, visita la siguiente URL para crear las tablas y poblar datos iniciales:

```
https://tu-dominio.com/api/init-db
```

O en desarrollo:
```
http://localhost:3000/api/init-db
```

Esto creará:
- Tablas con prefijo `sn_tcg_`
- Sets de cartas (Pokemon, Yu-Gi-Oh!, Magic)
- Cartas de ejemplo
- Sobres disponibles

---

## 8. Verificar la Instalación

Conéctate a la base de datos y verifica:

```sql
\c SNCardDB

-- Verificar tablas
\dt sn_tcg_*

-- Verificar datos
SELECT * FROM sn_tcg_sets;
SELECT * FROM sn_tcg_cards;
SELECT * FROM sn_tcg_packs;
```

---

## 9. Configuración de Firewall (si es necesario)

Si tu VPS tiene firewall, asegúrate de permitir conexiones PostgreSQL:

```bash
# Para UFW
sudo ufw allow 5432/tcp

# Para firewalld
sudo firewall-cmd --add-port=5432/tcp --permanent
sudo firewall-cmd --reload
```

---

## 10. Configurar PostgreSQL para Conexiones Remotas (si es necesario)

Edita `postgresql.conf`:

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Busca y modifica:
```
listen_addresses = '*'
```

Edita `pg_hba.conf`:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Añade:
```
host    SNCardDB    sn_tcg_user    0.0.0.0/0    md5
```

Reinicia PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## Estructura de Tablas

| Tabla | Descripción |
|-------|-------------|
| `sn_tcg_users` | Usuarios vinculados a Clerk |
| `sn_tcg_sets` | Sets de cartas (Pokemon, Yu-Gi-Oh!, Magic) |
| `sn_tcg_cards` | Cartas individuales |
| `sn_tcg_packs` | Sobres disponibles para comprar |
| `sn_tcg_user_packs` | Sobres que posee cada usuario |
| `sn_tcg_inventory` | Cartas que posee cada usuario |

---

## Solución de Problemas

### Error de conexión
```
Error: connect ECONNREFUSED
```
- Verifica que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
- Verifica las credenciales en `.env.local`

### Error de permisos
```
Error: permission denied for table
```
- Ejecuta los comandos GRANT del paso 2

### Error de Clerk
```
Error: Clerk: No publishable key found
```
- Verifica que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` esté configurado correctamente
- Reinicia el servidor de desarrollo después de cambiar `.env.local`

---

## Contacto y Soporte

Para problemas adicionales, revisa la documentación de:
- [Clerk Docs](https://clerk.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
