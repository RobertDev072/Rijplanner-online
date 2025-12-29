# 🚗 RijPlanner

Een moderne rijschool management applicatie gebouwd met React, TypeScript en Supabase. Ontworpen als mobiel-first PWA met multi-tenant ondersteuning.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Capacitor](https://img.shields.io/badge/Capacitor-iOS%20%26%20Android-119EFF?logo=capacitor)](https://capacitorjs.com/)

## 📋 Inhoudsopgave

- [Features](#-features)
- [Demo & Screenshots](#-demo--screenshots)
- [Technologie Stack](#-technologie-stack)
- [Architectuur](#-architectuur)
- [Installatie](#-installatie)
- [Configuratie](#-configuratie)
- [Database Schema](#-database-schema)
- [API & Edge Functions](#-api--edge-functions)
- [Gebruikersrollen](#-gebruikersrollen)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### 🎓 Voor Leerlingen
| Feature | Beschrijving |
|---------|--------------|
| 📅 Lesagenda | Bekijk en beheer je geplande rijlessen in een overzichtelijke weekkalender |
| ✅ Les accepteren | Accepteer of weiger voorgestelde lessen van je instructeur |
| 💳 Credits systeem | Houd je beschikbare lesuren bij met het credit systeem |
| 📝 Feedback | Ontvang gedetailleerde feedback van je instructeur na elke les |
| 🎓 Theorie status | Track je theorie voortgang en examen status |
| 🔔 Push notificaties | Krijg real-time meldingen voor nieuwe lessen en updates |

### 🚗 Voor Instructeurs
| Feature | Beschrijving |
|---------|--------------|
| 📝 Les inplannen | Plan eenvoudig lessen in met je leerlingen |
| 📊 Leerlingoverzicht | Beheer je leerlingen en bekijk hun voortgang |
| ⭐ Feedback geven | Geef feedback na elke les met topics en ratings |
| 🚙 Voertuig selectie | Wijs voertuigen toe aan lessen |
| 📱 Mobiele agenda | Altijd en overal toegang tot je lesrooster |

### 👔 Voor Admins
| Feature | Beschrijving |
|---------|--------------|
| 👥 Gebruikersbeheer | Beheer instructeurs en leerlingen |
| 💰 Credit administratie | Ken credits toe en monitor verbruik |
| 🚗 Voertuigenbeheer | Beheer het wagenpark van de rijschool |
| 📊 Dashboard analytics | Inzicht in statistieken en performance |
| 🎨 Branding | Pas logo en kleuren aan per rijschool |
| 📤 Data export | Exporteer gegevens naar CSV |

### 🏢 Voor Superadmins
| Feature | Beschrijving |
|---------|--------------|
| 🏢 Multi-tenant beheer | Beheer meerdere rijscholen vanuit één platform |
| 👥 Cross-tenant overzicht | Bekijk alle gebruikers per rijschool |
| 🔐 Pincode reset | Reset pincodes voor elke gebruiker |

---

## 🛠 Technologie Stack

### Frontend
```
React 18          → UI Framework
TypeScript        → Type Safety
Vite              → Build Tool & Dev Server
Tailwind CSS      → Utility-first Styling
shadcn/ui         → Component Library
Framer Motion     → Animations
React Router v6   → Client-side Routing
TanStack Query    → Server State Management
```

### Backend
```
Supabase          → Backend as a Service
PostgreSQL        → Database
Row Level Security→ Data Access Control
Edge Functions    → Serverless Functions
Realtime          → Live Updates
```

### Mobile & PWA
```
Service Worker    → Offline Support
Web Push API      → Push Notifications
Capacitor         → Native iOS/Android Builds
```

### DevOps
```
Docker            → Containerization
Nginx             → Production Web Server
Vercel            → Hosting (optional)
```

---

## 🏗 Architectuur

### Project Structuur

```
rijplanner/
├── 📁 public/
│   ├── logo.png              # App logo
│   ├── sw.js                 # Service Worker
│   ├── robots.txt            # SEO
│   └── sitemap.xml           # SEO
│
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 ui/            # shadcn/ui componenten
│   │   ├── BottomTabNav.tsx  # Bottom navigation
│   │   ├── Header.tsx        # App header
│   │   ├── MobileLayout.tsx  # Main layout wrapper
│   │   ├── LessonCard.tsx    # Lesson display
│   │   ├── CreditsBadge.tsx  # Credits indicator
│   │   └── ...
│   │
│   ├── 📁 pages/
│   │   ├── Dashboard.tsx     # Home per rol
│   │   ├── Agenda.tsx        # Week calendar
│   │   ├── Schedule.tsx      # Create lesson
│   │   ├── Students.tsx      # Instructor students
│   │   ├── Users.tsx         # Admin user management
│   │   ├── Lessons.tsx       # All lessons overview
│   │   ├── Vehicles.tsx      # Vehicle management
│   │   ├── Credits.tsx       # Credits overview
│   │   ├── Feedback.tsx      # Student feedback
│   │   ├── Profile.tsx       # User profile
│   │   ├── Settings.tsx      # Tenant settings
│   │   └── Tenants.tsx       # Multi-tenant admin
│   │
│   ├── 📁 contexts/
│   │   ├── AuthContext.tsx   # Authentication state
│   │   ├── DataContext.tsx   # App data (users, lessons)
│   │   └── ThemeContext.tsx  # Tenant theming
│   │
│   ├── 📁 hooks/
│   │   ├── use-mobile.tsx    # Mobile detection
│   │   └── useOfflineStorage.ts
│   │
│   ├── 📁 utils/
│   │   ├── csvExport.ts      # CSV export helpers
│   │   ├── lessonValidation.ts
│   │   └── notifications.ts  # Push notification helpers
│   │
│   └── 📁 integrations/
│       └── supabase/
│           ├── client.ts     # Supabase client
│           └── types.ts      # Generated types
│
├── 📁 supabase/
│   ├── 📁 functions/         # Edge Functions
│   │   ├── secure-login/     # PIN authentication
│   │   ├── send-push-notification/
│   │   ├── get-vapid-public-key/
│   │   └── auto-complete-lessons/
│   └── 📁 migrations/        # Database migrations
│
├── Dockerfile                # Docker container
├── docker-compose.yml        # Docker orchestration
├── nginx.conf                # Production server
└── capacitor.config.json     # Native app config
```

### Navigatie Flow

```
                    ┌─────────────┐
                    │   Index /   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │ Not logged │            │ Logged in
              ▼            │            ▼
       ┌──────────┐        │     ┌──────────────┐
       │  Login   │        │     │  Dashboard   │
       │ /login   │────────┘     │  /dashboard  │
       └──────────┘              └──────┬───────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
    ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
    │   📅 Agenda  │            │  📝 Schedule │            │  👤 Profile  │
    │   /agenda    │            │  /schedule   │            │  /profile    │
    └──────────────┘            └──────────────┘            └──────────────┘
```

### Route Tabel

| Route | Pagina | Toegang | Beschrijving |
|-------|--------|---------|--------------|
| `/` | Index | Publiek | Redirect naar login/dashboard |
| `/login` | Login | Publiek | Inloggen met username + pincode |
| `/dashboard` | Dashboard | Alle rollen | Rol-specifieke homepage |
| `/agenda` | Agenda | Instructor, Student | Weekkalender met lessen |
| `/schedule` | Inplannen | Instructor | Nieuwe les aanmaken |
| `/students` | Leerlingen | Instructor | Leerlingenbeheer |
| `/users` | Gebruikers | Admin, Superadmin | Gebruikersbeheer |
| `/lessons` | Lessen | Admin | Alle lessen overzicht |
| `/vehicles` | Voertuigen | Admin | Voertuigenbeheer |
| `/credits` | Credits | Admin, Instructor | Credit overzicht |
| `/settings` | Instellingen | Admin | Rijschool configuratie |
| `/feedback` | Feedback | Student | Ontvangen feedback |
| `/tenants` | Rijscholen | Superadmin | Multi-tenant beheer |
| `/profile` | Profiel | Alle rollen | Gebruikersprofiel |

---

## 🚀 Installatie

### Vereisten

- Node.js 18+ of Bun
- npm, yarn, pnpm of bun
- Supabase account (of Lovable Cloud)

### Lokale Ontwikkeling

```bash
# 1. Clone repository
git clone <repository-url>
cd rijplanner

# 2. Installeer dependencies
npm install
# of
bun install

# 3. Configureer environment
cp .env.example .env
# Vul de Supabase credentials in

# 4. Start development server
npm run dev
# of
bun dev

# 5. Open in browser
open http://localhost:5173
```

### Docker Deployment

```bash
# Build en start met Docker Compose
docker-compose up -d

# Of handmatig
docker build -t rijplanner .
docker run -p 80:80 rijplanner
```

---

## ⚙️ Configuratie

### Environment Variables

Maak een `.env` bestand aan met de volgende variabelen:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Push Notifications (optioneel)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### Supabase Secrets (Edge Functions)

| Secret | Beschrijving |
|--------|--------------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key |
| `VAPID_PUBLIC_KEY` | Web Push public key |
| `VAPID_PRIVATE_KEY` | Web Push private key |

---

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     tenants     │
├─────────────────┤
│ id              │───────────┐
│ name            │           │
│ status          │           │
│ logo_url        │           │
│ primary_color   │           │
│ user_limit      │           │
└─────────────────┘           │
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│      users      │  │    vehicles     │  │ lesson_credits  │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id              │  │ id              │  │ id              │
│ tenant_id (FK)  │  │ tenant_id (FK)  │  │ tenant_id (FK)  │
│ name            │  │ brand           │  │ student_id (FK) │
│ username        │  │ model           │  │ total_credits   │
│ pincode (hash)  │  │ license_plate   │  │ used_credits    │
│ role            │  │ instructor_id   │  └─────────────────┘
│ email           │  └─────────────────┘
│ phone           │
│ theory_passed   │
└─────────────────┘
        │
        │ instructor_id, student_id
        ▼
┌─────────────────┐
│     lessons     │
├─────────────────┤
│ id              │
│ tenant_id (FK)  │
│ instructor_id   │───► users
│ student_id      │───► users
│ vehicle_id      │───► vehicles
│ date            │
│ start_time      │
│ duration        │
│ status          │     (pending/accepted/cancelled/completed)
│ remarks         │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ lesson_feedback │
├─────────────────┤
│ id              │
│ lesson_id (FK)  │
│ instructor_id   │
│ student_id      │
│ rating          │
│ notes           │
│ topics_practiced│
└─────────────────┘
```

### Belangrijke Tabellen

| Tabel | Beschrijving |
|-------|--------------|
| `tenants` | Rijscholen (multi-tenant) |
| `users` | Alle gebruikers (superadmin, admin, instructor, student) |
| `lessons` | Ingeplande rijlessen |
| `vehicles` | Lesvoertuigen per rijschool |
| `lesson_credits` | Credit saldo per leerling |
| `lesson_feedback` | Feedback van instructeurs |
| `push_subscriptions` | Push notification endpoints |
| `audit_logs` | Audit trail van acties |

### Row Level Security (RLS)

Alle tabellen zijn beveiligd met RLS policies:

- **Tenant isolation**: Gebruikers zien alleen data van hun eigen rijschool
- **Role-based access**: Admins kunnen meer dan studenten
- **Ownership rules**: Leerlingen zien alleen hun eigen lessen

---

## 🔌 API & Edge Functions

### Edge Functions

| Function | Endpoint | Beschrijving |
|----------|----------|--------------|
| `secure-login` | `/functions/v1/secure-login` | PIN-based authenticatie |
| `send-push-notification` | `/functions/v1/send-push-notification` | Push notificaties versturen |
| `get-vapid-public-key` | `/functions/v1/get-vapid-public-key` | VAPID key voor push setup |
| `auto-complete-lessons` | `/functions/v1/auto-complete-lessons` | Automatisch lessen voltooien |

### Secure Login Flow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Client    │────►│  secure-login   │────►│  Supabase   │
│   (React)   │     │  Edge Function  │     │  Database   │
└─────────────┘     └─────────────────┘     └─────────────┘
      │                     │                      │
      │  POST /secure-login │                      │
      │  {username, pin}    │                      │
      │────────────────────►│                      │
      │                     │  Verify credentials  │
      │                     │─────────────────────►│
      │                     │                      │
      │                     │◄─────────────────────│
      │  {user, session}    │                      │
      │◄────────────────────│                      │
```

---

## 👥 Gebruikersrollen

### Rol Hiërarchie

```
     Superadmin
          │
          ▼
        Admin
          │
          ▼
     Instructor
          │
          ▼
       Student
```

### Rol Permissies

| Actie | Superadmin | Admin | Instructor | Student |
|-------|:----------:|:-----:|:----------:|:-------:|
| Rijscholen beheren | ✅ | ❌ | ❌ | ❌ |
| Gebruikers beheren | ✅ | ✅ | ❌ | ❌ |
| Voertuigen beheren | ✅ | ✅ | ❌ | ❌ |
| Lessen inplannen | ❌ | ❌ | ✅ | ❌ |
| Lessen accepteren | ❌ | ❌ | ❌ | ✅ |
| Credits toekennen | ✅ | ✅ | ❌ | ❌ |
| Feedback geven | ❌ | ❌ | ✅ | ❌ |
| Feedback bekijken | ❌ | ❌ | ✅ | ✅ |

---

## 🚢 Deployment

### Lovable (Recommended)

1. Push naar GitHub via Lovable integratie
2. Automatische deployments bij elke push

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker (Self-hosted)

```bash
# Build image
docker build -t rijplanner .

# Run container
docker run -d \
  -p 80:80 \
  --name rijplanner \
  rijplanner
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

---

## 📱 PWA & Native Apps

### PWA Installatie

De app is installeerbaar als Progressive Web App:

1. Open de app in Chrome/Safari
2. Klik op "Installeren" of "Toevoegen aan beginscherm"
3. De app werkt nu offline

### Native Apps (Capacitor)

```bash
# iOS
npx cap add ios
npx cap sync ios
npx cap open ios

# Android
npx cap add android
npx cap sync android
npx cap open android
```

---

## 🔔 Push Notifications

### Setup

1. Genereer VAPID keys:
```bash
npx web-push generate-vapid-keys
```

2. Configureer in Supabase secrets:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`

3. Gebruikers kunnen notificaties inschakelen via hun profiel

### Notification Events

| Event | Ontvanger | Trigger |
|-------|-----------|---------|
| Nieuwe les | Student | Instructeur plant les in |
| Les geaccepteerd | Instructeur | Student accepteert les |
| Les geweigerd | Instructeur | Student weigert les |
| Les geannuleerd | Student | Instructeur annuleert les |

---

## 🤝 Contributing

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je changes (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

---

## 📄 Licentie

Dit project is eigendom van de ontwikkelaar. Alle rechten voorbehouden.

---

## 📞 Support

Voor vragen of ondersteuning, neem contact op via de rijschool administrator.
