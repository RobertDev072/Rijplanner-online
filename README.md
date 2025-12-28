# 🚗 RijPlanner

Een moderne rijschool management applicatie gebouwd met React, TypeScript en Supabase.

## 📋 Inhoudsopgave

- [Sitemap & Navigatie](#-sitemap--navigatie)
- [Technologie Stack](#-technologie-stack)
- [Functionaliteiten](#-functionaliteiten)
- [Supabase Configuratie](#-supabase-configuratie)
- [Database Schema](#-database-schema)
- [Edge Functions](#-edge-functions)
- [Push Notifications](#-push-notifications)
- [Environment Variables](#-environment-variables)
- [Gebruikersrollen](#-gebruikersrollen)
- [Installatie](#-installatie)

---

## 🗺 Sitemap & Navigatie

### Applicatie Structuur Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RijPlanner App                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │  Index   │    │  Login   │    │ NotFound │
              │    /     │    │  /login  │    │   /*     │
              └────┬─────┘    └────┬─────┘    └──────────┘
                   │               │
                   └───────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Protected Routes     │
              │  (Requires Login)      │
              └───────────┬────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────┐         ┌─────────┐         ┌─────────┐
│SUPERADMIN│        │  ADMIN  │         │INSTRUCTOR│
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     ▼                   ▼                   ▼
┌─────────┐         ┌─────────┐         ┌─────────┐
│ STUDENT │←────────┤  Shared │─────────→│ Pages  │
└─────────┘         └─────────┘         └─────────┘
```

### Pagina Overzicht per Rol

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SUPERADMIN                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  /dashboard ──► Home (Rijscholen beheren link)                              │
│  /tenants ────► Rijscholen Beheer (CRUD rijscholen + admin aanmaken)        │
│  /users ──────► Alle Gebruikers (per rijschool gegroepeerd)                 │
│  /profile ────► Profiel                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  /dashboard ──► Dashboard (Statistieken, low credit warnings)               │
│  /users ──────► Gebruikers (Instructeurs & Leerlingen beheren)              │
│  /lessons ────► Lessen Overzicht (Alle lessen + export)                     │
│  /vehicles ───► Voertuigen Beheer (CRUD voertuigen)                         │
│  /credits ────► Credits Overzicht (Alerts & overzicht)                      │
│  /settings ───► Instellingen (Branding, kleuren, export)                    │
│  /profile ────► Profiel                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            INSTRUCTOR                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  /dashboard ──► Dashboard (Komende lessen)                                  │
│  /agenda ─────► Agenda (Week kalender + dagweergave)                        │
│  /schedule ───► Les Inplannen (Formulier voor nieuwe les)                   │
│  /students ───► Mijn Leerlingen (CRUD + credits + theorie status)           │
│  /credits ────► Credits Overzicht                                           │
│  /profile ────► Profiel                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             STUDENT                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  /dashboard ──► Dashboard (Credits, pending lessen, komende lessen)         │
│  /agenda ─────► Agenda (Week kalender + les accepteren/weigeren)            │
│  /feedback ───► Mijn Feedback (Alle feedback van instructeurs)              │
│  /profile ────► Profiel (Theorie toggle, contactinfo, uitloggen)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Navigatie Flow Diagram

```
                              ┌──────────────┐
                              │    START     │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   / (Index)  │
                              │  Landingpage │
                              └──────┬───────┘
                                     │
                              ┌──────┴───────┐
                              │  Ingelogd?   │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │ Nee            │                │ Ja
                    ▼                │                ▼
             ┌──────────────┐        │      ┌──────────────┐
             │   /login     │        │      │  /dashboard  │
             │  Login Page  │        │      │   Homepage   │
             └──────┬───────┘        │      └──────────────┘
                    │                │              │
                    ▼                │              ▼
             ┌──────────────┐        │     ┌───────────────┐
             │ Credentials  │────────┘     │ Bottom Tab    │
             │   Correct?   │              │ Navigation    │
             └──────────────┘              └───────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
                    ▼                             ▼                             ▼
           ┌────────────────┐            ┌────────────────┐            ┌────────────────┐
           │    🏠 Home     │            │   📅 Agenda    │            │   👤 Profiel   │
           │   /dashboard   │            │    /agenda     │            │    /profile    │
           └────────────────┘            └────────────────┘            └────────────────┘
                    │                             │                             │
                    │                             ▼                             │
                    │                    ┌────────────────┐                     │
                    │                    │  📝 Inplannen  │                     │
                    │                    │   /schedule    │                     │
                    │                    │(Instructeur)   │                     │
                    │                    └────────────────┘                     │
                    │                                                           │
                    ▼                                                           ▼
           ┌────────────────┐                                          ┌────────────────┐
           │   Menu (☰)     │──────────────────────────────────────────│   Uitloggen    │
           │  Extra pages   │                                          │    /login      │
           └────────────────┘                                          └────────────────┘
```

### Complete Route Tabel

| Route | Pagina | Toegang | Beschrijving |
|-------|--------|---------|--------------|
| `/` | Index | Publiek | Landingspagina / redirect |
| `/login` | Login | Publiek | Inlogpagina met username + pincode |
| `/dashboard` | Dashboard | Alle rollen | Hoofdpagina met rol-specifieke content |
| `/agenda` | Agenda | Instructor, Student | Weekkalender met lessen |
| `/schedule` | Les Inplannen | Instructor | Formulier om nieuwe les te plannen |
| `/students` | Mijn Leerlingen | Instructor | Leerlingenbeheer |
| `/users` | Gebruikers | Admin, Superadmin | Gebruikersbeheer |
| `/lessons` | Lessen | Admin | Overzicht van alle lessen |
| `/vehicles` | Voertuigen | Admin | Voertuigenbeheer |
| `/credits` | Credits | Admin, Instructor | Credits overzicht en alerts |
| `/settings` | Instellingen | Admin | Rijschool configuratie |
| `/feedback` | Feedback | Student | Lesfeedback overzicht |
| `/tenants` | Rijscholen | Superadmin | Multi-tenant beheer |
| `/profile` | Profiel | Alle rollen | Persoonlijk profiel |
| `/*` | 404 | Publiek | Pagina niet gevonden |

### Component Architectuur

```
src/
├── components/
│   ├── ui/                    # shadcn/ui componenten
│   ├── BottomTabNav.tsx       # Navigatie balk onderin
│   ├── Header.tsx             # Top header met titel/logo
│   ├── MobileLayout.tsx       # Hoofd layout wrapper
│   ├── MobileMenu.tsx         # Hamburger menu
│   ├── LessonCard.tsx         # Les weergave component
│   ├── CreditsBadge.tsx       # Credits indicator
│   ├── FeedbackCard.tsx       # Feedback weergave
│   └── ...
│
├── pages/
│   ├── Index.tsx              # Landingspagina
│   ├── Login.tsx              # Login pagina
│   ├── Dashboard.tsx          # Hoofdpagina per rol
│   ├── Agenda.tsx             # Weekkalender
│   ├── Schedule.tsx           # Les inplannen
│   ├── Students.tsx           # Leerlingen (instructeur)
│   ├── Users.tsx              # Gebruikers (admin)
│   ├── Lessons.tsx            # Lessen overzicht
│   ├── Vehicles.tsx           # Voertuigen
│   ├── Credits.tsx            # Credits overzicht
│   ├── Settings.tsx           # Instellingen
│   ├── Feedback.tsx           # Feedback (student)
│   ├── Tenants.tsx            # Rijscholen (superadmin)
│   ├── Profile.tsx            # Gebruikersprofiel
│   └── NotFound.tsx           # 404 pagina
│
├── contexts/
│   ├── AuthContext.tsx        # Authenticatie state
│   ├── DataContext.tsx        # App data (users, lessons, etc.)
│   └── ThemeContext.tsx       # Theming per tenant
│
└── App.tsx                    # Routes configuratie
```

---

## 🛠 Technologie Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL) |
| Authenticatie | Pincode-based (eigen users tabel) |
| PWA | Service Worker + Web Push Notifications |
| Mobile | Capacitor (iOS/Android) |
| Animaties | Framer Motion |
| Routing | React Router v6 |
| State Management | React Context |
| Data Fetching | TanStack Query |

---

## ✨ Functionaliteiten

### Voor Leerlingen
- 📅 Lesoverzicht en agenda
- ✅ Lessen accepteren of weigeren
- 💳 Credits beheren
- 📝 Feedback bekijken van instructeurs
- 🎓 Theorie status bijhouden
- 🔔 Push notifications voor lesgebeurtenissen
- 📱 PWA installeerbaar op telefoon

### Voor Instructeurs
- 📝 Lessen inplannen met leerlingen
- ❌ Lessen annuleren (met/zonder credit terugboeking)
- 👥 Leerlingenoverzicht met theorie status
- 🚗 Voertuig toewijzen aan lessen
- ⭐ Feedback geven na voltooide lessen
- 🔔 Push notifications bij les acceptatie/weigering

### Voor Admins
- 👤 Gebruikersbeheer (instructeurs & leerlingen)
- 💰 Credits toekennen aan leerlingen
- 🚗 Voertuigenbeheer
- 📊 Dashboard met statistieken
- ⚠️ Waarschuwingen bij lage credits
- 🎨 Branding aanpassen (logo, kleuren)
- 📤 Data exporteren naar CSV

### Voor Superadmins
- 🏢 Multi-tenant beheer (meerdere rijscholen)
- 👥 Alle gebruikers overzicht per rijschool
- 🔐 Pincode reset voor alle gebruikers

---

## 🗄 Supabase Configuratie

### Project Details

| Setting | Waarde |
|---------|--------|
| Project ID | `mlbeciqslbemjrezgclq` |
| URL | `https://mlbeciqslbemjrezgclq.supabase.co` |
| Region | EU (Frankfurt) |

### Secrets

| Secret | Beschrijving |
|--------|--------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Publieke anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin service role key |
| `SUPABASE_DB_URL` | PostgreSQL database URL |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key |

---

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   tenants   │       │    users    │       │   lessons   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ tenant_id   │       │ id (PK)     │
│ name        │       │ id (PK)     │◄──┬───│ tenant_id   │
│ logo_url    │       │ username    │   │   │ instructor_id│
│ primary_clr │       │ pincode     │   │   │ student_id  │
│ secondary   │       │ role        │   │   │ date        │
│ whatsapp    │       │ name        │   │   │ start_time  │
│ created_at  │       │ email       │   │   │ duration    │
│ updated_at  │       │ phone       │   │   │ status      │
└─────────────┘       │ address     │   │   │ vehicle_id  │
                      │ avatar_url  │   │   │ remarks     │
                      │ theory_pass │   │   │ created_at  │
                      │ created_at  │   │   └──────┬──────┘
                      └──────┬──────┘          │
                             │                 │
        ┌────────────────────┼─────────────────┘
        │                    │
        ▼                    ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│lesson_credits│      │  vehicles   │       │lesson_feedbk│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ tenant_id   │       │ tenant_id   │       │ tenant_id   │
│ student_id  │       │ brand       │       │ lesson_id   │
│ total_creds │       │ model       │       │ student_id  │
│ used_credits│       │ license_plt │       │ instructor  │
│ created_at  │       │ instructor  │       │ rating      │
│ updated_at  │       │ created_at  │       │ notes       │
└─────────────┘       │ updated_at  │       │ topics      │
                      └─────────────┘       │ created_at  │
                                            └─────────────┘

┌─────────────┐
│push_subscr  │
├─────────────┤
│ id (PK)     │
│ user_id     │
│ tenant_id   │
│ endpoint    │
│ p256dh      │
│ auth        │
│ created_at  │
│ updated_at  │
└─────────────┘
```

### Tabellen

#### `tenants`
Rijscholen (multi-tenant support)

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| name | TEXT | Naam rijschool |
| logo_url | TEXT | Logo URL |
| primary_color | TEXT | Primaire kleur (hex) |
| secondary_color | TEXT | Secundaire kleur (hex) |
| whatsapp_number | TEXT | WhatsApp support nummer |
| created_at | TIMESTAMP | Aanmaakdatum |
| updated_at | TIMESTAMP | Laatst bijgewerkt |

#### `users`
Alle gebruikers van de applicatie

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| tenant_id | UUID | FK naar tenants |
| username | TEXT | Gebruikersnaam (uniek) |
| pincode | TEXT | Login pincode |
| role | ENUM | admin, instructor, student, superadmin |
| name | TEXT | Volledige naam |
| email | TEXT | E-mailadres |
| phone | TEXT | Telefoonnummer |
| address | TEXT | Adres |
| avatar_url | TEXT | Profielfoto URL |
| theory_passed | BOOLEAN | Theorie examen gehaald |
| theory_passed_at | TIMESTAMP | Datum theorie gehaald |
| created_at | TIMESTAMP | Aanmaakdatum |

#### `lessons`
Rijlessen

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| tenant_id | UUID | FK naar tenants |
| instructor_id | UUID | FK naar users (instructeur) |
| student_id | UUID | FK naar users (leerling) |
| vehicle_id | UUID | FK naar vehicles |
| date | DATE | Lesdatum |
| start_time | TIME | Starttijd |
| duration | INTEGER | Duur in minuten (default: 60) |
| status | ENUM | pending, accepted, cancelled, completed |
| remarks | TEXT | Opmerkingen/ophaaladres |
| created_at | TIMESTAMP | Aanmaakdatum |

#### `lesson_credits`
Lescredits per leerling

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| tenant_id | UUID | FK naar tenants |
| student_id | UUID | FK naar users (uniek) |
| total_credits | INTEGER | Totaal toegekende credits |
| used_credits | INTEGER | Gebruikte credits |
| created_at | TIMESTAMP | Aanmaakdatum |
| updated_at | TIMESTAMP | Laatst bijgewerkt |

#### `lesson_feedback`
Feedback per les

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| tenant_id | UUID | FK naar tenants |
| lesson_id | UUID | FK naar lessons |
| student_id | UUID | FK naar users |
| instructor_id | UUID | FK naar users |
| rating | INTEGER | Score 1-5 |
| notes | TEXT | Opmerkingen |
| topics_practiced | TEXT[] | Geoefende onderwerpen |
| created_at | TIMESTAMP | Aanmaakdatum |

#### `vehicles`
Lesvoertuigen

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| tenant_id | UUID | FK naar tenants |
| brand | TEXT | Merk |
| model | TEXT | Model |
| license_plate | TEXT | Kenteken |
| instructor_id | UUID | FK naar users (optioneel) |
| created_at | TIMESTAMP | Aanmaakdatum |
| updated_at | TIMESTAMP | Laatst bijgewerkt |

#### `push_subscriptions`
Push notification subscriptions

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| user_id | UUID | FK naar users |
| tenant_id | UUID | FK naar tenants |
| endpoint | TEXT | Push endpoint URL |
| p256dh | TEXT | Encryption key |
| auth | TEXT | Auth secret |
| created_at | TIMESTAMP | Aanmaakdatum |
| updated_at | TIMESTAMP | Laatst bijgewerkt |

### Storage Buckets

| Bucket | Publiek | Beschrijving |
|--------|---------|--------------|
| `avatars` | Ja | Profielfoto's van gebruikers |

---

## ⚡ Edge Functions

### `send-push-notification`

Verstuurt Web Push notifications naar gebruikers.

**Endpoint:** `POST /functions/v1/send-push-notification`

**Request Body:**
```json
{
  "userIds": ["uuid1", "uuid2"],
  "title": "Notificatie titel",
  "body": "Notificatie bericht",
  "tenantId": "tenant-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "sent": 2,
  "removed": 0
}
```

### `auto-complete-lessons`

Markeert lessen automatisch als voltooid na de lesdatum.

### `get-vapid-public-key`

Haalt de VAPID public key op voor push notificatie registratie.

---

## 🔔 Push Notifications

Push notifications worden verstuurd bij de volgende gebeurtenissen:

| Gebeurtenis | Ontvangers | Titel |
|-------------|-----------|-------|
| Les gepland | Leerling | 📅 Nieuwe les gepland |
| Les geaccepteerd | Instructeur | ✅ Les geaccepteerd |
| Les geweigerd | Instructeur | 🚫 Les geweigerd |
| Les geannuleerd | Instructeur + Leerling | ❌ Les geannuleerd |

### Technische implementatie

- **Service Worker:** `public/sw.js`
- **VAPID Protocol:** Web Push standaard
- **Subscription opslag:** `push_subscriptions` tabel
- **Automatische cleanup:** Ongeldige subscriptions worden verwijderd

---

## 🔐 Environment Variables

### `.env` bestand

```env
VITE_SUPABASE_PROJECT_ID="mlbeciqslbemjrezgclq"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbG..."
VITE_SUPABASE_URL="https://mlbeciqslbemjrezgclq.supabase.co"
VITE_VAPID_PUBLIC_KEY="BByDFZxCmooeH-1lWGqvSbDaYZnlrXE5HWB01xiCu9eYXt5mAbI3UwdFrG_9a9EzBu-eV05q7n6wBeEV3yfI2Bc"
```

> ⚠️ **Let op:** Gebruik nooit `VITE_` prefix voor geheime keys. Deze zijn zichtbaar in de browser.

---

## 👥 Gebruikersrollen

| Rol | Beschrijving | Rechten |
|-----|--------------|---------|
| `superadmin` | Platform beheerder | Alle rijscholen beheren |
| `admin` | Rijschool eigenaar | Eigen rijschool beheren, gebruikers, credits |
| `instructor` | Rij-instructeur | Lessen inplannen en annuleren |
| `student` | Leerling | Lessen bekijken, accepteren/weigeren |

### Rol Hiërarchie

```
                    ┌──────────────┐
                    │  SUPERADMIN  │
                    │   (Platform) │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    ADMIN     │
                    │  (Rijschool) │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  INSTRUCTOR  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   STUDENT    │
                    └──────────────┘
```

### Authenticatie Flow

1. Gebruiker voert gebruikersnaam in
2. Gebruiker voert 4-cijferige pincode in
3. Bij succes: redirect naar dashboard
4. Sessie wordt opgeslagen in localStorage

---

## 🚀 Installatie

### Vereisten

- Node.js 18+
- npm of bun

### Stappen

1. **Clone de repository**
   ```bash
   git clone <repository-url>
   cd rijplanner
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Configureer environment variables**
   ```bash
   cp .env.example .env
   # Vul de juiste waarden in
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open de applicatie**
   ```
   http://localhost:5173
   ```

---

## 📱 PWA & Native App

### PWA Installatie

De applicatie kan geïnstalleerd worden als Progressive Web App:

1. Open de app in Chrome/Safari
2. Klik op "Installeren" of "Toevoegen aan startscherm"
3. De app werkt nu als native applicatie

### Native App (Capacitor)

Voor een echte native app:

```bash
# iOS
npx cap add ios
npx cap sync ios
npx cap run ios

# Android  
npx cap add android
npx cap sync android
npx cap run android
```

---

## 📄 Licentie

© 2024 RobertDev.nl - Alle rechten voorbehouden.

---

## 🔗 Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/mlbeciqslbemjrezgclq)
- [Edge Functions](https://supabase.com/dashboard/project/mlbeciqslbemjrezgclq/functions)
- [Database Editor](https://supabase.com/dashboard/project/mlbeciqslbemjrezgclq/editor)
- [Storage](https://supabase.com/dashboard/project/mlbeciqslbemjrezgclq/storage/buckets)
