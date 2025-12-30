# RijPlanner

**Rijschoolbeheer Applicatie**

© 2026 Robert Rocha / ROBERTDEV.NL - Alle rechten voorbehouden

---

## Wat is RijPlanner?

RijPlanner is een moderne, mobiele rijschoolbeheer applicatie. Instructeurs plannen rijlessen in, leerlingen kunnen deze accepteren of weigeren, en beheerders hebben volledig overzicht over hun rijschool.

---

## Gebruikersrollen

| Rol | Rechten |
|-----|---------|
| **Superadmin** | Beheer van alle rijscholen (multi-tenant) |
| **Admin** | Beheer rijschool, gebruikers, voertuigen, credits |
| **Instructeur** | Lessen inplannen, leerlingen beheren, feedback geven |
| **Leerling** | Lessen bekijken, accepteren/weigeren, voortgang volgen |

---

## Technologie Stack

### Frontend
| Technologie | Versie | Doel |
|-------------|--------|------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 6.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | - | UI Components |
| Framer Motion | 12.x | Animaties |
| React Router | 6.30.1 | Navigatie |
| TanStack Query | 5.83.0 | Data Fetching |

### Backend
| Technologie | Doel |
|-------------|------|
| Supabase | Database, Auth, Edge Functions |
| PostgreSQL | Database met Row Level Security |

### PWA & Mobile
| Technologie | Doel |
|-------------|------|
| Service Worker | Offline Support |
| Web Push API | Push Notificaties |
| Capacitor | Native iOS/Android Builds |

---

## Belangrijke Libraries

```
@supabase/supabase-js    ^2.89.0     Supabase client
@tanstack/react-query    ^5.83.0     Server state management
framer-motion            ^12.23.26   Animaties
lucide-react             ^0.462.0    Iconen
date-fns                 ^3.6.0      Datum utilities
zod                      ^3.25.76    Schema validatie
react-hook-form          ^7.61.1     Formulieren
sonner                   ^1.7.4      Toast notificaties
recharts                 ^2.15.4     Grafieken
```

---

## Koppelingen & Services

| Service | Doel |
|---------|------|
| **Supabase** | Database, authenticatie, edge functions, storage |
| **Vercel** | Hosting & deployment |
| **Capacitor** | Native mobile apps (iOS/Android) |
| **Docker** | Containerization voor self-hosting |

---

## Installatie

```bash
# Clone repository
git clone <repository-url>
cd rijplanner

# Installeer dependencies
npm install

# Start development server
npm run dev
```

---

## Copyright & Licentie

### PROPRIETARY SOFTWARE

© 2026 Robert Rocha / ROBERTDEV.NL

**Alle rechten voorbehouden.**

Dit is proprietary software. Geen enkel deel van deze software, inclusief maar niet beperkt tot broncode, configuratie, documentatie, assets en afgeleide werken, mag worden:

- Gekopieerd
- Gewijzigd
- Gedistribueerd
- Verkocht
- Verhuurd
- In sublicentie gegeven

...zonder voorafgaande schriftelijke toestemming van Robert Rocha / ROBERTDEV.NL.

Zie [LICENSE](./LICENSE) voor volledige licentievoorwaarden.

---

## Contact

**ROBERTDEV.NL**
