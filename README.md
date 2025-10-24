# VenneSpill - Sosiale Konkurranser for Norske Vennegjenger 🎉

VenneSpill er en progressiv webapp (PWA) som tilbyr sosiale konkurranser og utfordringer for vennegjenger. Kjøp konsepter, registrer deltakere, og se hvem som blir gjengens mester!

## 🚀 Funksjoner

- 📱 **PWA-støtte** - Installer som app på mobil og desktop
- 🎮 **Flere spillkonsepter** - Turneringskveld, Konkurranseløp, Utfordringsbonanza
- 🏆 **Live poengtavle** - Se rangeringer i sanntid
- 👥 **Brukeradministrasjon** - Enkel pålogging med Google
- 🔧 **Admin-panel** - Administrer konsepter og bestillinger
- 🔐 **Sikkerhet** - GDPR-samsvar med Supabase RLS
- 🎨 **Fargerik design** - Leken og morsom brukeropplevelse

## 🛠️ Teknologi

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (via Lovable Cloud)
  - Database (PostgreSQL)
  - Authentication
  - Row Level Security (RLS)
- **PWA**: vite-plugin-pwa
- **Deployment**: Vercel (anbefalt)

## 📋 Forutsetninger

- Node.js 18+ og npm/yarn/bun
- Lovable Cloud-konto (for backend)

## 🔧 Installasjon

1. **Klon repositoryet**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Installer avhengigheter**
   ```bash
   npm install
   ```

3. **Konfigurer miljøvariabler**
   
   Kopier `.env.example` til `.env` og fyll inn verdiene:
   ```bash
   cp .env.example .env
   ```
   
   Miljøvariablene settes automatisk opp via Lovable Cloud.

4. **Start utviklingsserver**
   ```bash
   npm run dev
   ```
   
   Appen kjører nå på `http://localhost:8080`

## 🏗️ Bygg for produksjon

```bash
npm run build
```

Bygget havner i `dist/`-mappen og kan deployes til en statisk hosting-tjeneste.

## 🚀 Deploy

### Vercel (Anbefalt)

1. Push koden til GitHub
2. Gå til [vercel.com](https://vercel.com)
3. Importer GitHub-repositoryet
4. Vercel setter automatisk opp bygget
5. Legg til miljøvariabler i Vercel-dashboardet

### Andre alternativer

- **Netlify**: Lignende prosess som Vercel
- **Cloudflare Pages**: Gratis hosting med CDN
- **Firebase Hosting**: Google's hosting-løsning

### Lovable Hosting

Simply open [Lovable](https://lovable.dev/projects/f584b2f3-37e7-4c06-9a48-4a2d26bb45dc) and click on Share -> Publish.

## 📦 Database

Databaseskjema administreres via Supabase migrations. Tabeller:

- `concepts` - Spillkonsepter med priser
- `orders` - Bestillinger fra brukere
- `user_games` - Brukernes aktive spill
- `participants` - Deltakere i spill
- `rounds` - Runder i et spill
- `scores` - Poengsum per deltaker per runde
- `user_roles` - Brukerroller (admin/user)

## 🔐 Sikkerhet

- Row Level Security (RLS) aktivert på alle tabeller
- Sikker autentisering med Supabase Auth
- GDPR-samsvar med personvernerklæring
- Ingen sensitive data lagres i frontend

## 🎨 Tilpasning

Design-system finnes i:
- `src/index.css` - Fargepalett og design tokens
- `tailwind.config.ts` - Tailwind-konfigurasjon

## 📱 PWA-funksjonalitet

PWA-konfigurasjonen finnes i `vite.config.ts`. For å oppdatere:

- **Manifest**: `vite.config.ts` -> `manifest`
- **Ikoner**: Legg til i `public/`-mappen
- **Service Worker**: Håndteres automatisk av vite-plugin-pwa

## 🧪 Testing

```bash
# Kjør linting
npm run lint

# Type-checking (hvis konfigurert)
npm run type-check
```

## 🔗 Lenker

- **Lovable Project**: https://lovable.dev/projects/f584b2f3-37e7-4c06-9a48-4a2d26bb45dc
- **Custom Domain Setup**: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📝 Redigering

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f584b2f3-37e7-4c06-9a48-4a2d26bb45dc) and start prompting.

**Use your preferred IDE**

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## 📄 Lisens

Alle rettigheter forbeholdt VenneSpill AS © 2025

## 🤝 Bidrag

Dette er et privat prosjekt. Kontakt oss for samarbeidsmuligheter.

## 📞 Kontakt

- **E-post**: support@vennespill.no
- **Nettside**: [vennespill.no](https://vennespill.no)

## 🔮 Fremtidige funksjoner

- [ ] Stripe-integrasjon for betalinger
- [ ] Deling av resultater til sosiale medier
- [ ] Mulighet for å laste opp gruppebilder
- [ ] Push-notifikasjoner for poengopdateringer
- [ ] Flere spillkonsepter

---

**Laget med ❤️ i Norge 🇳🇴**
