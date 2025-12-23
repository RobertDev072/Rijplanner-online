# 🚗 RijPlanner

Een moderne rijschool management applicatie gebouwd met React, TypeScript en Supabase.

## 📋 Inhoudsopgave

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

## 🛠 Technologie Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL) |
| Authenticatie | Pincode-based (eigen users tabel) |
| PWA | Service Worker + Web Push Notifications |
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
- 🔔 Push notifications voor lesgebeurtenissen
- 📱 PWA installeerbaar op telefoon

### Voor Instructeurs
- 📝 Lessen inplannen met leerlingen
- ❌ Lessen annuleren (met/zonder credit terugboeking)
- 👥 Leerlingenoverzicht
- 🔔 Push notifications bij les acceptatie/weigering

### Voor Admins
- 👤 Gebruikersbeheer (instructeurs & leerlingen)
- 💰 Credits toekennen aan leerlingen
- 🚗 Voertuigenbeheer
- 📊 Dashboard met statistieken
- ⚠️ Waarschuwingen bij lage credits

### Voor Superadmins
- 🏢 Multi-tenant beheer (meerdere rijscholen)
- 🎨 Branding per rijschool (logo, kleuren)

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

### Tabellen

#### `tenants`
Rijscholen (multi-tenant support)

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| name | TEXT | Naam rijschool |
| logo_url | TEXT | Logo URL |
| primary_color | TEXT | Primaire kleur (hex) |
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
| created_at | TIMESTAMP | Aanmaakdatum |

#### `lessons`
Rijlessen

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | UUID | Primary key |
| tenant_id | UUID | FK naar tenants |
| instructor_id | UUID | FK naar users (instructeur) |
| student_id | UUID | FK naar users (leerling) |
| date | DATE | Lesdatum |
| start_time | TIME | Starttijd |
| duration | INTEGER | Duur in minuten (default: 60) |
| status | ENUM | pending, accepted, cancelled |
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

## 📱 PWA Installatie

De applicatie kan geïnstalleerd worden als Progressive Web App:

1. Open de app in Chrome/Safari
2. Klik op "Installeren" of "Toevoegen aan startscherm"
3. De app werkt nu als native applicatie

---

## 📄 Licentie

© 2024 RobertDev.nl - Alle rechten voorbehouden.

---

## 🔗 Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/mlbeciqslbemjrezgclq)
- [Edge Functions](https://supabase.com/dashboard/project/mlbeciqslbemjrezgclq/functions)
- [Database Editor](https://supabase.com/dashboard/project/mlbeciqslbemjrezgclq/editor)
- [Storage](https://supabase.com/dashboard/project/mlbeciqslbemjrezgclq/storage/buckets)
