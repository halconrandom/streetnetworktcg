# 🎴 Street TCG Zone

<div align="center">

**Colecciona e intercambia cartas en tu servidor de GTA V roleplay**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8.19-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)

**🌐 Live Demo:** [tcgzone.tmstreet.network](https://tcgzone.tmstreet.network/)

</div>

---

## 📖 Sobre el Proyecto

Street TCG Zone es una plataforma web moderna para gestionar colecciones de cartas coleccionables (TCG) diseñada específicamente para servidores de GTA V roleplay. Permite a los usuarios coleccionar, abrir sobres y gestionar sus cartas de tres juegos populares: **Pokémon**, **Yu-Gi-Oh!** y **Magic: The Gathering**.

### ✨ Características Principales

- 🎴 **Sistema de Colección**: Gestiona tu colección de cartas con búsqueda y filtros
- 📦 **Apertura de Sobres**: Experiencia interactiva con animaciones al abrir sobres
- 🎮 **Múltiples Juegos**: Soporte para Pokémon, Yu-Gi-Oh! y Magic
- 👤 **Autenticación**: Integración con Clerk para gestión de usuarios
- 🔐 **Panel de Administración**: Control total sobre usuarios, sobres, sets y cartas
- 📊 **Sistema de Rareza**: Configuración dinámica de probabilidades de rareza
- 🔗 **Compartir Colecciones**: Genera enlaces para compartir tu colección
- 📱 **Diseño Responsivo**: Optimizado para móvil, tablet y desktop
- ✨ **Animaciones Fluidas**: Interfaz moderna con Motion/Framer Motion
- 🌙 **Modo Oscuro**: Diseño elegante con tema oscuro

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **[Next.js 16](https://nextjs.org)** - Framework React con App Router
- **[React 19](https://react.dev)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org)** - Tipado estático
- **[Tailwind CSS 4](https://tailwindcss.com)** - Estilos utility-first
- **[Motion](https://motion.dev)** - Animaciones fluidas
- **[Lucide React](https://lucide.dev)** - Iconos modernos
- **[Clerk](https://clerk.com)** - Autenticación y gestión de usuarios

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - API REST
- **[PostgreSQL](https://www.postgresql.org)** - Base de datos relacional
- **[pg](https://node-postgres.com)** - Cliente PostgreSQL para Node.js

### Herramientas de Desarrollo
- **[ESLint](https://eslint.org)** - Linting de código
- **[PostCSS](https://postcss.org)** - Procesamiento de CSS

---

## 📁 Estructura del Proyecto

```
streettcg/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── admin/           # Endpoints de administración
│   │   │   ├── collection/      # Gestión de colecciones
│   │   │   ├── open-pack/       # Apertura de sobres
│   │   │   ├── packs/           # Catálogo de sobres
│   │   │   ├── share/           # Compartir colecciones
│   │   │   └── user/            # Datos de usuario
│   │   ├── admin/               # Panel de administración
│   │   ├── share/               # Páginas compartidas
│   │   ├── sign-in/             # Inicio de sesión
│   │   ├── sign-up/             # Registro
│   │   ├── layout.tsx           # Layout principal
│   │   └── page.tsx             # Página principal
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes UI reutilizables
│   │   ├── Collection.tsx       # Vista de colección
│   │   ├── Dashboard.tsx        # Dashboard principal
│   │   ├── Layout.tsx           # Layout de la app
│   │   ├── PackOpener.tsx       # Componente de apertura
│   │   ├── PacksCatalog.tsx     # Catálogo de sobres
│   │   └── TopNav.tsx           # Navegación superior
│   └── lib/                     # Utilidades y tipos
│       ├── types.ts             # Definiciones TypeScript
│       └── rarity-utils.ts      # Utilidades de rareza
├── public/                      # Archivos estáticos
├── migration*.sql              # Scripts de migración de BD
├── next.config.ts              # Configuración de Next.js
├── tailwind.config.ts          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
└── package.json                # Dependencias del proyecto
```

---

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+ instalado
- PostgreSQL 12+ configurado
- Cuenta en [Clerk](https://clerk.com) para autenticación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd streettcg
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sn_card_db

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurar la Base de Datos

Ejecuta los scripts de migración en orden:

```bash
# Usar el cliente de PostgreSQL o pgAdmin
psql -U your_user -d sn_card_db -f migration.sql
psql -U your_user -d sn_card_db -f migration-pokemon.sql
psql -U your_user -d sn_card_db -f migration-magic.sql
psql -U your_user -d sn_card_db -f migration-admin.sql
psql -U your_user -d sn_card_db -f migration-share.sql
```

O ejecuta el script completo:

```bash
psql -U your_user -d sn_card_db -f SETUP_COMPLETE.sql
```

### 5. Inicializar la Base de Datos

```bash
npm run dev
```

Luego visita `http://localhost:3000/api/init-db` para crear el usuario administrador inicial.

### 6. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📚 Uso de la Aplicación

### Para Usuarios

1. **Registro**: Crea una cuenta usando Clerk
2. **Dashboard**: Accede al panel principal para ver opciones
3. **Abrir Sobres**: Solicita sobres a un administrador y ábrelos
4. **Colección**: Visualiza y busca tus cartas
5. **Compartir**: Genera enlaces para compartir tu colección

### Para Administradores

El panel de administración incluye:

- **👥 Gestión de Usuarios**: Ver y gestionar usuarios registrados
- **📦 Gestión de Sobres**: Crear y asignar sobres a usuarios
- **🎴 Gestión de Sets**: Importar y gestionar sets de cartas
- **🃏 Gestión de Cartas**: Buscar y asignar cartas individuales
- **📊 Estadísticas**: Ver métricas del sistema
- **⚙️ Configuración de Rareza**: Ajustar probabilidades de rareza
- **📜 Transacciones**: Ver historial de transacciones

---

## 🎨 Características de Diseño

### Sistema de Colores por Juego

- **Pokémon**: Gradiente rojo a naranja (`from-red-500 to-orange-600`)
- **Yu-Gi-Oh!**: Gradiente azul a índigo (`from-blue-400 to-indigo-600`)
- **Magic**: Gradiente ámbar a púrpura (`from-amber-500 to-purple-700`)

### Componentes UI

- **GlassPanel**: Paneles con efecto glassmorphism
- **Badge**: Etiquetas de estado y categorías
- **RarityBadge**: Indicadores visuales de rareza
- **CardModal**: Modal detallado para ver cartas
- **Button**: Botones con variantes (glass, solid, icon)

### Animaciones

- Apertura de sobres con efectos de revelación
- Transiciones suaves entre vistas
- Hover effects en cartas y botones
- Floating cards en el dashboard
- Animated orbs de fondo

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- **`sn_tcg_sets`**: Sets de cartas por juego
- **`sn_tcg_cards`**: Cartas individuales
- **`sn_tcg_packs`**: Sobres disponibles
- **`sn_tcg_users`**: Usuarios del sistema
- **`sn_tcg_user_packs`**: Inventario de sobres de usuarios
- **`sn_tcg_user_cards`**: Colección de cartas de usuarios
- **`sn_tcg_transactions`**: Historial de transacciones
- **`sn_tcg_share_links`**: Enlaces para compartir colecciones
- **`sn_tcg_rarity_config`**: Configuración de probabilidades de rareza

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm start            # Inicia servidor de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint
```

---

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente con cada push

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables mencionadas en la sección de instalación.

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es propiedad de Street Network. Todos los derechos reservados.

---

## 📞 Soporte

Para soporte o preguntas, contacta al equipo de desarrollo o únete al servidor de Discord de Street Network:

[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](http://discord.com/invite/4qNVmk464p)

---

## 🎯 Roadmap

- [ ] Sistema de trading entre usuarios
- [ ] Marketplace de cartas
- [ ] Logros y badges
- [ ] Sistema de notificaciones
- [ ] Integración con Discord
- [ ] App móvil nativa

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de Street Network**

[🌐 Sitio Web](https://tcgzone.tmstreet.network) • [💬 Discord](http://discord.com/invite/4qNVmk464p) • [📧 Contacto](mailto:isaac.streetnetwork@gmail.com)

</div>
