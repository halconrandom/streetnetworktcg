# 🎴 Street TCG Zone

<div align="center">

**Collect and trade cards on your GTA V roleplay server**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8.19-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)

**🌐 Live Demo:** [tcgzone.tmstreet.network](https://tcgzone.tmstreet.network/)

</div>

---

## 📖 About the Project

Street TCG Zone is a modern web platform for managing trading card game (TCG) collections, specifically designed for GTA V roleplay servers. It allows users to collect, open packs, and manage their cards from three popular games: **Pokémon**, **Yu-Gi-Oh!**, and **Magic: The Gathering**.

### ✨ Key Features

- 🎴 **Collection System**: Manage your card collection with search and filters
- 📦 **Pack Opening**: Interactive experience with animations when opening packs
- 🎮 **Multiple Games**: Support for Pokémon, Yu-Gi-Oh!, and Magic
- 👤 **Authentication**: Integration with Clerk for user management
- 🔐 **Admin Panel**: Full control over users, packs, sets, and cards
- 📊 **Rarity System**: Dynamic configuration of rarity probabilities
- 🔗 **Share Collections**: Generate links to share your collection
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop
- ✨ **Smooth Animations**: Modern interface with Motion/Framer Motion
- 🌙 **Dark Mode**: Elegant design with dark theme

---

## 🚀 Technologies Used

### Frontend
- **[Next.js 16](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library
- **[TypeScript](https://www.typescriptlang.org)** - Static typing
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first styling
- **[Motion](https://motion.dev)** - Smooth animations
- **[Lucide React](https://lucide.dev)** - Modern icons
- **[Clerk](https://clerk.com)** - Authentication and user management

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - REST API
- **[PostgreSQL](https://www.postgresql.org)** - Relational database
- **[pg](https://node-postgres.com)** - PostgreSQL client for Node.js

### Development Tools
- **[ESLint](https://eslint.org)** - Code linting
- **[PostCSS](https://postcss.org)** - CSS processing

---

## 📁 Project Structure

```
streettcg/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── admin/           # Admin endpoints
│   │   │   ├── collection/      # Collection management
│   │   │   ├── open-pack/       # Pack opening
│   │   │   ├── packs/           # Pack catalog
│   │   │   ├── share/           # Share collections
│   │   │   └── user/            # User data
│   │   ├── admin/               # Admin panel
│   │   ├── share/               # Shared pages
│   │   ├── sign-in/             # Sign in
│   │   ├── sign-up/             # Sign up
│   │   ├── layout.tsx           # Main layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── Collection.tsx       # Collection view
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Layout.tsx           # App layout
│   │   ├── PackOpener.tsx       # Pack opening component
│   │   ├── PacksCatalog.tsx     # Pack catalog
│   │   └── TopNav.tsx           # Top navigation
│   └── lib/                     # Utilities and types
│       ├── types.ts             # TypeScript definitions
│       └── rarity-utils.ts      # Rarity utilities
├── public/                      # Static files
├── migration*.sql              # Database migration scripts
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

---

## 🛠️ Installation and Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ configured
- [Clerk](https://clerk.com) account for authentication

### 1. Clone the Repository

```bash
git clone <repository-url>
cd streettcg
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root of the project:

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

### 4. Set Up the Database

Run the migration scripts in order:

```bash
# Use PostgreSQL client or pgAdmin
psql -U your_user -d sn_card_db -f migration.sql
psql -U your_user -d sn_card_db -f migration-pokemon.sql
psql -U your_user -d sn_card_db -f migration-magic.sql
psql -U your_user -d sn_card_db -f migration-admin.sql
psql -U your_user -d sn_card_db -f migration-share.sql
```

Or run the complete script:

```bash
psql -U your_user -d sn_card_db -f SETUP_COMPLETE.sql
```

### 5. Initialize the Database

```bash
npm run dev
```

Then visit `http://localhost:3000/api/init-db` to create the initial admin user.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Using the Application

### For Users

1. **Sign Up**: Create an account using Clerk
2. **Dashboard**: Access the main panel to see options
3. **Open Packs**: Request packs from an admin and open them
4. **Collection**: View and search your cards
5. **Share**: Generate links to share your collection

### For Administrators

The admin panel includes:

- **👥 User Management**: View and manage registered users
- **📦 Pack Management**: Create and assign packs to users
- **🎴 Set Management**: Import and manage card sets
- **🃏 Card Management**: Search and assign individual cards
- **📊 Statistics**: View system metrics
- **⚙️ Rarity Configuration**: Adjust rarity probabilities
- **📜 Transactions**: View transaction history

---

## 🎨 Design Features

### Color System by Game

- **Pokémon**: Red to orange gradient (`from-red-500 to-orange-600`)
- **Yu-Gi-Oh!**: Blue to indigo gradient (`from-blue-400 to-indigo-600`)
- **Magic**: Amber to purple gradient (`from-amber-500 to-purple-700`)

### UI Components

- **GlassPanel**: Glassmorphism effect panels
- **Badge**: Status and category labels
- **RarityBadge**: Visual rarity indicators
- **CardModal**: Detailed modal for viewing cards
- **Button**: Button variants (glass, solid, icon)

### Animations

- Pack opening with reveal effects
- Smooth transitions between views
- Hover effects on cards and buttons
- Floating cards in dashboard
- Animated background orbs

---

## 🗄️ Database Schema

### Main Tables

- **`sn_tcg_sets`**: Card sets by game
- **`sn_tcg_cards`**: Individual cards
- **`sn_tcg_packs`**: Available packs
- **`sn_tcg_users`**: System users
- **`sn_tcg_user_packs`**: User pack inventory
- **`sn_tcg_user_cards`**: User card collections
- **`sn_tcg_transactions`**: Transaction history
- **`sn_tcg_share_links`**: Collection sharing links
- **`sn_tcg_rarity_config`**: Rarity probability configuration

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your repository to [Vercel](https://vercel.com)
2. Configure environment variables in the Vercel dashboard
3. Deploy automatically with each push

### Production Environment Variables

Make sure to configure all variables mentioned in the installation section.

---

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is property of Street Network. All rights reserved.

---

## 📞 Support

For support or questions, contact the development team or join the Street Network Discord server:

[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](http://discord.com/invite/4qNVmk464p)

---

## 🎯 Roadmap

- [ ] User-to-user trading system
- [ ] Card marketplace
- [ ] Achievements and badges
- [ ] Notification system
- [ ] Discord integration
- [ ] Native mobile app

---

<div align="center">

**Developed with ❤️ for the Street Network community**

[🌐 Website](https://tcgzone.tmstreet.network) • [💬 Discord](http://discord.com/invite/4qNVmk464p) • [📧 Contact](mailto:support@street.network)

</div>
