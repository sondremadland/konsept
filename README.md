# VenneSpill - Sosiale Konkurranser for Norske Vennegjenger 🎉

VenneSpill er en progressiv webapp (PWA) som tilbyr sosiale konkurranser og utfordringer for vennegjenger. Kjøp konsepter, registrer deltakere, og se hvem som blir gjengens mester!

## 🚀 Funksjoner

- 📱 **PWA-støtte** - Installer som app på mobil og desktop med offline-støtte
- 🎮 **Flere spillkonsepter** - Turneringskveld, Konkurranseløp, Utfordringsbonanza
- 🏆 **Live poengtavle** - Se rangeringer i sanntid med automatiske oppdateringer
- 🎯 **Runde-administrasjon** - Opprett runder og registrer poeng enkelt
- 👥 **Brukeradministrasjon** - Enkel pålogging med e-post og Google
- 🔧 **Admin-panel** - Administrer konsepter og bestillinger
- 🔐 **Sikkerhet** - GDPR-samsvar med Supabase RLS
- 🎨 **Fargerik design** - Leken og morsom brukeropplevelse
- ✨ **Onboarding** - Veiledning for nye brukere
- 📊 **Realtime updates** - Poengtavlen oppdateres automatisk når poeng registreres

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

## 🔐 Sikkerhet og Compliance

### Sikkerhet
- Row Level Security (RLS) aktivert på alle tabeller
- Sikker autentisering med Supabase Auth
- HTTPS/SSL kryptering for all datatransmisjon
- Ingen sensitive data eller API-nøkler eksponert i frontend

### GDPR-samsvar
- Personvernerklæring tilgjengelig på `/privacy`
- Brukervilkår tilgjengelig på `/terms`
- Brukere har rett til innsyn, retting og sletting
- Data isoleres per bruker via RLS
- Cascade delete ved brukersletting

### Databehandling
- Kun nødvendig data samles inn (e-post, navn, spilldata)
- Ingen tredjeparts sporing eller analytics
- Data lagres sikkert i Supabase (EU-basert)

## 🎨 Tilpasning

Design-system finnes i:
- `src/index.css` - Fargepalett og design tokens
- `tailwind.config.ts` - Tailwind-konfigurasjon

## 📱 PWA-funksjonalitet

VenneSpill er en fullverdig Progressive Web App med følgende funksjoner:

- **Offline-støtte**: Bruk appen selv uten internett
- **Installasjon**: Installer på iOS, Android og desktop
- **Service Worker**: Automatisk caching for rask lasting
- **App-lignende opplevelse**: Fullskjerm uten nettleser-UI
- **Auto-oppdatering**: Får alltid nyeste versjon automatisk

PWA-konfigurasjonen finnes i `vite.config.ts`:
- **Manifest**: Tilpasset app-info og ikoner
- **Ikoner**: `public/icon-512.png` (512x512)
- **Service Worker**: Håndteres automatisk av vite-plugin-pwa

For å installere appen, besøk `/install`-siden eller bruk nettleserens installasjonsprompt.

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

## 💳 Betalingsintegrasjon (Fase 2)

Stripe-integrasjon er forberedt men ikke aktivert ennå. Se `src/lib/stripe.ts` for implementasjonsdetaljer.

For å aktivere Stripe:
1. Opprett en Stripe-konto på [stripe.com](https://stripe.com)
2. Legg til `VITE_STRIPE_PUBLISHABLE_KEY` i `.env`
3. Opprett en Supabase Edge Function for betalingshåndtering
4. Oppdater `ConceptDetail.tsx` til å bruke Stripe-funksjonene

## ⚡ Ytelse og Kvalitet

- Lazy loading av bilder for rask lasting
- Optimalisert bundling med Vite
- PWA-caching for offline-støtte
- Error boundary for graceful feilhåndtering
- Strukturert logging i development-modus
- Lighthouse-score mål: 90+ for Performance og PWA

## 🔮 Fremtidige funksjoner

- [x] Bestillingsskjema med e-post
- [x] Privacy og Terms pages
- [ ] Stripe-integrasjon for betalinger
- [ ] Deling av resultater til sosiale medier
- [ ] Mulighet for å laste opp gruppebilder
- [ ] Push-notifikasjoner for poengopdateringer
- [ ] Flere spillkonsepter
- [ ] Statistikk og historikk
- [ ] Mulighet for å slette/redigere deltakere
- [ ] Eksporter resultat som PDF

---

**Laget med ❤️ i Norge 🇳🇴**
