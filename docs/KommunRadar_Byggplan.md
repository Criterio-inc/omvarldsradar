# KommunRadar - Fullstandig Teknisk Byggplan

**Version:** 2.0 (Nollbudget-edition) | **Datum:** 2026-03-03
**Av:** Par Levander (Critero) + Claude Code

**Strategi:** Borja gratis, skala upp med forsta betalande kunden.

---

## 1. Teknikval och Motivering

### Oversikt - Arkitektur

```
┌─────────────────────────────────────────────────────┐
│                    ANVANDARE                         │
│         (Kommuner, regioner, strateger)              │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              VERCEL Hobby [GRATIS]                   │
│         kommunradar.criteroconsulting.se             │
│  ┌───────────────────────────────────────────────┐  │
│  │          NEXT.JS 14 (App Router)              │  │
│  │     Tailwind CSS + shadcn/ui + Recharts       │  │
│  │                                               │  │
│  │  /dashboard    - Huvudvy, trendoversikt       │  │
│  │  /briefing     - Veckobreifing                │  │
│  │  /sources      - Kallbevakning                │  │
│  │  /analysis     - AI-analys per artikel        │  │
│  │  /reports      - Kvartalsrapporter            │  │
│  │  /settings     - Kommunprofil & preferenser   │  │
│  │  /admin        - Kalladmin (internt)          │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Next.js API Routes / Cron (Vercel Cron)            │
│  → Ersatter n8n for schemalagda jobb                │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  SUPABASE    │ │  CLAUDE  │ │   RESEND     │
│  Free        │ │  API     │ │   Free       │
│  [GRATIS]    │ │ [~25 kr] │ │  [GRATIS]    │
│              │ │          │ │              │
│ - PostgreSQL │ │ Haiku:   │ │ 3000 mail/   │
│ - Auth       │ │ klassif. │ │ manad        │
│ - RLS        │ │          │ │              │
│ - Realtime   │ │ Sonnet:  │ │ Briefings &  │
│ - Edge Func  │ │ briefing │ │ notifieringar│
│ - pg_cron    │ │ & analys │ │              │
└──────────────┘ └──────────┘ └──────────────┘
```

### Teknikval - Nollbudget

| Komponent | Val | Kostnad | Kommentar |
|-----------|-----|---------|-----------|
| **Frontend** | Next.js 14 + Tailwind + shadcn/ui + Recharts | 0 kr | Open source |
| **Backend/DB** | Supabase Free | 0 kr | 500 MB, 50k auth, pg_cron, Edge Functions |
| **AI-motor** | Claude API (Haiku + Sonnet) | ~25 kr/man | $5 gratiskredit vid start |
| **Automation** | Vercel Cron + Supabase Edge Functions | 0 kr | Ersatter n8n helt |
| **E-post** | Resend Free | 0 kr | 3 000 mail/manad |
| **Hosting** | Vercel Hobby | 0 kr | Perfekt for MVP |
| **Kod** | GitHub Free | 0 kr | Privat repo |
| **TOTAL** | | **~25 kr/man** | En halv kaffe |

### Vad hander nar vi skalar upp? (efter forsta kunden)

| Tjanst | Uppgradering | Nar | Kostnad |
|--------|-------------|-----|---------|
| Supabase | Free → Pro | >500 MB data eller behov av backups | 300 kr/man |
| Vercel | Hobby → Pro | Kommersiell anvandning, mer bandbredd | 200 kr/man |
| Claude API | Mer volym | Fler artiklar + kunder | ~200-500 kr/man |
| n8n Cloud | Lagg till | Nar visuella floden behovs for komplexitet | 250 kr/man |
| Exa.ai | Lagg till | Premium-sokning for kunder | 500 kr/man |
| Stripe | Lagg till | Betalande kunder | 0 + transaktionsavgift |

### Varfor NOT n8n (for nu)?

Vi ALSKAR n8n-konceptet, men for nollbudget-fasen:

1. **n8n Cloud** har ingen gratis-tier (14 dagars trial, sedan ~$24/man)
2. **Vercel Cron Jobs** + **Supabase Edge Functions** gor samma sak - gratis
3. **Next.js API Routes** kan hantera webhooks och HTTP-anrop
4. Vi kan migrera till n8n later nar vi har betalande kunder och behover visuella floden

**Nar vi lagger till n8n (Fas 2+):**
- Mer komplexa floden med branching-logik
- Visuell oversikt av alla automationer
- Enklare att felsoka och modifiera floden
- AI Agent-noder for avancerade analyser

---

## 2. Automationsfloden (Supabase Edge Functions + Vercel Cron)

### Hur det funkar (utan n8n)

Istallet for n8n anvander vi:
- **Vercel Cron Jobs**: Schemalagda anrop till vara API-routes (gratis, max 1 gang/dag pa Hobby, MEN vi kan anvanda Supabase pg_cron for oftare)
- **Supabase pg_cron**: Schemalagda databasjobb (var 30:e minut, etc.)
- **Supabase Edge Functions**: Serverless functions som kor var logik (hjalp RSS, anropa Claude, skicka mail)
- **Database triggers**: Nar en ny artikel sparas, triggas analysen automatiskt

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTOMATIONSFLODE                            │
│                                                             │
│  pg_cron (var 30 min)                                       │
│       │                                                     │
│       ▼                                                     │
│  Edge Function: fetch-sources                               │
│  (Hamtar RSS fran SKR, DIGG, MSB etc.)                      │
│       │                                                     │
│       ▼                                                     │
│  INSERT INTO articles (ny artikel)                          │
│       │                                                     │
│       ▼                                                     │
│  Database Trigger: on_new_article                           │
│       │                                                     │
│       ▼                                                     │
│  Edge Function: analyze-article                             │
│  (Anropar Claude Haiku → klassificering + analys)           │
│       │                                                     │
│       ├── Relevans < 80 → Sparas i article_analyses         │
│       └── Relevans >= 80 → Sparas + Edge Function: notify   │
│                              (Skickar alert via Resend)     │
│                                                             │
│  pg_cron (varje mandag 06:00)                               │
│       │                                                     │
│       ▼                                                     │
│  Edge Function: generate-briefing                           │
│  (Hamtar veckans artiklar → Claude Sonnet → briefing)       │
│       │                                                     │
│       ▼                                                     │
│  Edge Function: send-briefing                               │
│  (Renderar HTML → Resend → e-post till anvandare)           │
└─────────────────────────────────────────────────────────────┘
```

### Edge Function 1: fetch-sources (Kallbevakning)

**Vad den gor:** Hamtar nyheter fran RSS-floden och sparar nya artiklar i databasen.
**Nar:** Var 30:e minut via pg_cron
**Kallor (MVP - 10 st):**

| # | Kalla | URL-typ | Prioritet |
|---|-------|---------|-----------|
| 1 | SKR Nyheter | RSS | Hog |
| 2 | DIGG Nyheter | RSS | Hog |
| 3 | eSam | Web scrape | Hog |
| 4 | MSB Nyheter | RSS | Hog |
| 5 | Regeringen.se | RSS | Hog |
| 6 | EU Digital Strategy | RSS | Medel |
| 7 | Inera | RSS | Medel |
| 8 | Upphandlingsmyndigheten | RSS | Medel |
| 9 | Dagens Samhalle | RSS | Lag |
| 10 | Computer Sweden | RSS | Lag |

### Edge Function 2: analyze-article (AI-klassificering)

**Vad den gor:** Anropar Claude API for att analysera varje ny artikel.
**Nar:** Automatiskt via database trigger nar ny artikel sparas.

**AI-strategi (kostnadsoptimerad):**
- **Steg 1 - Haiku** (~0.04 kr/artikel): Snabb klassificering + relevanspoang
- **Steg 2 - Sonnet** (~0.7 kr/artikel): BARA for artiklar med relevans > 70, djupare analys

```
Ny artikel
    │
    ▼
Claude Haiku (snabb, billig):
  → Kategori
  → Relevanspoang (0-100)
  → Kort sammanfattning
    │
    ├── Relevans < 70: Sparas som-den-ar (kostar ~0.04 kr)
    │
    └── Relevans >= 70:
          │
          ▼
        Claude Sonnet (smart, dyrare):
          → Djup konsekvensanalys per kommunstorlek
          → Rekommenderade atgarder
          → Ramverkskopplingar (WEF, Kairos, DIGG)
          → Deadlines och tidslinjer
          (kostar ~0.7 kr per artikel)
```

**Kostnadskalkyl:**
- 500 artiklar/man hamtas
- ~400 far bara Haiku: 400 × 0.04 = 16 kr
- ~100 far aven Sonnet: 100 × 0.7 = 70 kr
- **Total: ~86 kr/man** (men med $5 startkredit = gratis forsta 6 veckorna)

### Edge Function 3: generate-briefing (Veckobreifing)

**Vad den gor:** Genererar en veckobreifing per organisation med Claude Sonnet.
**Nar:** Varje mandag kl 06:00 via pg_cron.

### Edge Function 4: send-notifications (Akuta notifieringar)

**Vad den gor:** Skickar alert-mail nar kritiska artiklar identifieras.
**Nar:** Direkt efter att analyze-article hittat ngt med relevans > 80 eller impact = 'kritisk'.

### Systemprompt for Claude (karna i produkten)

```
Du ar KommunRadar AI - en expertanalytiker for svensk offentlig sektor.

UPPGIFT: Analysera nedanstaende artikel/nyhet och producera en strukturerad
analys riktad till kommuner och regioner i Sverige.

ANALYSRAMVERK:
1. WEF Global Risks: Koppla till relevanta riskkategorier
   (ekonomi, miljo, geopolitik, samhalle, teknik)
2. Kairos Future TAIDA: Identifiera trender och drivkrafter
   (Tracking, Analysing, Imaging, Deciding, Acting)
3. DIGG/eSam: Koppla till svenska digitaliseringsintiativ och regelverk

OUTPUT (JSON):
{
  "summary": "Kort sammanfattning pa svenska, 2-3 meningar",
  "category": "eu_regelverk|nationella_reformer|teknologiskiften|demografi|sakerhetspolitik|miljo|ekonomi",
  "subcategories": ["mer specifika amnen"],
  "relevance_score": 0-100,
  "impact_level": "lag|medel|hog|kritisk",
  "impact_analysis": {
    "liten_kommun": "Konsekvensanalys for kommun med <20 000 inv",
    "medel_kommun": "Konsekvensanalys for kommun med 20-50 000 inv",
    "stor_kommun": "Konsekvensanalys for kommun med >50 000 inv eller region"
  },
  "recommended_actions": ["Konkret atgard 1", "Konkret atgard 2"],
  "framework_tags": {
    "wef_risks": ["relevant_risk_1"],
    "kairos_trends": ["relevant_trend_1"],
    "digg_initiatives": ["relevant_initiativ_1"]
  },
  "key_dates": [{"date": "YYYY-MM-DD", "description": "Vad hander"}],
  "target_roles": ["kommundirektor", "digitaliseringschef"]
}
```

---

## 3. Datamodell (Supabase/PostgreSQL)

### Karnrelationer

```
organizations (kommun/region)
  │
  ├── organization_profiles (storlek, demografi, fokusomraden)
  │
  ├── users (kopplad till org via org_id)
  │     └── user_preferences (roll, bevakningsomraden, notifieringar)
  │
  ├── subscriptions (Bas/Standard/Premium/Enterprise) [Fas 2]
  │
  └── briefings (genererade veckobreifings for denna org)

sources (SKR, DIGG, MSB, etc.)
  │
  └── articles (hamtade artiklar/nyheter)
        │
        ├── article_analyses (AI-genererad analys)
        │     ├── category
        │     ├── relevance_score (0-100)
        │     ├── summary
        │     ├── impact_analysis (per kommunstorlek)
        │     └── framework_tags (WEF, Kairos, DIGG)
        │
        └── article_interactions (laest, bokmarka, feedback)
```

### SQL-schema

```sql
-- Organisationer (kommuner/regioner)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('kommun', 'region', 'kommunforbund', 'myndighet')),
  municipality_code TEXT,
  population INTEGER,
  size_category TEXT CHECK (size_category IN ('liten', 'medel', 'stor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kommunprofiler (for kontextanpassad AI-analys)
CREATE TABLE organization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  focus_areas TEXT[],
  maturity_level TEXT,
  current_challenges TEXT[],
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Anvandare
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN (
    'kommundirektor', 'digitaliseringschef',
    'verksamhetsutvecklare', 'strateg',
    'fortroendevald', 'admin'
  )),
  notification_preferences JSONB DEFAULT '{"email_briefing": true, "acute_alerts": true}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kallor
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('rss', 'api', 'web_scrape')),
  category TEXT,
  fetch_interval_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  metadata JSONB
);

-- Artiklar/nyheter
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  external_id TEXT,
  title TEXT NOT NULL,
  url TEXT,
  content TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, external_id)
);

-- AI-analyser
CREATE TABLE article_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
  summary TEXT,
  category TEXT,
  subcategories TEXT[],
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  impact_level TEXT CHECK (impact_level IN ('lag', 'medel', 'hog', 'kritisk')),
  impact_analysis JSONB,
  recommended_actions TEXT[],
  framework_tags JSONB,
  key_dates JSONB,
  target_roles TEXT[],
  ai_model TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT now()
);

-- Anvandares interaktion
CREATE TABLE article_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN (
    'viewed', 'bookmarked', 'shared',
    'feedback_positive', 'feedback_negative'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id, interaction_type)
);

-- Veckobreifings
CREATE TABLE briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  target_role TEXT,
  period_start DATE,
  period_end DATE,
  content JSONB,
  html_content TEXT,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

-- Artiklar och analyser ar publika for alla inloggade anvandare
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_read_authenticated" ON articles
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE article_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analyses_read_authenticated" ON article_analyses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Interaktioner ar privata per anvandare
CREATE POLICY "interactions_own" ON article_interactions
  FOR ALL USING (user_id = auth.uid());

-- Briefings ar per organisation
CREATE POLICY "briefings_org" ON briefings
  FOR SELECT USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Anvandare ser bara sin organisations anvandare
CREATE POLICY "users_org_access" ON users
  FOR SELECT USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Service role (for Edge Functions) kan skriva allt
-- (Supabase service_role key anvands i Edge Functions)
```

---

## 4. Frontend-struktur (Next.js)

### Sidstruktur

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (dashboard)/
│   ├── layout.tsx              -- Sidebar + topbar
│   ├── page.tsx                -- Huvuddashboard
│   ├── feed/page.tsx           -- Artikelflodet (filtrerbart)
│   ├── article/[id]/page.tsx   -- Enskild artikel + AI-analys
│   ├── briefing/page.tsx       -- Senaste + arkiv
│   ├── trends/page.tsx         -- Trendoversikt (diagram)
│   ├── search/page.tsx         -- Sokning [Fas 2: AI-sok]
│   └── settings/
│       ├── profile/page.tsx    -- Kommunprofil
│       ├── team/page.tsx       -- Teammedlemmar
│       └── notifications/page.tsx
│
├── api/
│   ├── cron/
│   │   ├── fetch-sources/route.ts    -- Vercel Cron: hamta RSS
│   │   └── generate-briefings/route.ts -- Vercel Cron: mandagsbriefing
│   ├── analyze/route.ts              -- Webhook: analysera artikel
│   └── search/route.ts              -- AI-sokning [Fas 2]
│
└── (admin)/
    ├── sources/page.tsx
    └── organizations/page.tsx
```

### Dashboard-layout (huvudsida)

```
┌────────────────────────────────────────────────────────────────┐
│  KommunRadar       [Sok...]        [Notifieringar] [Profil]   │
├──────────┬─────────────────────────────────────────────────────┤
│          │                                                     │
│ MENY     │  Godmorgon, Par! Vecka 10, 2026                    │
│          │                                                     │
│ Oversikt │  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│ Flodet   │  │ 12 nya       │ │ 3 kritiska   │ │ Nasta      │ │
│ Briefing │  │ denna vecka  │ │ forandringar │ │ briefing:  │ │
│ Trender  │  │              │ │              │ │ man 10 mar │ │
│ Rapporter│  └──────────────┘ └──────────────┘ └────────────┘ │
│ Sok      │                                                     │
│          │  SENASTE INSIKTER                     [Filtrera ▼]  │
│ ──────── │  ┌────────────────────────────────────────────────┐ │
│ Installn.│  │ 🔴 KRITISK | EU-regelverk                      │ │
│ Team     │  │ AI Act: Nya krav for kommuner med AI-piloter   │ │
│          │  │ Relevans: 95 | Publicerad: 1 mar 2026          │ │
│          │  │ "Kommuner behover inventera sina AI-system..."  │ │
│          │  └────────────────────────────────────────────────┘ │
│          │  ┌────────────────────────────────────────────────┐ │
│          │  │ 🟠 HOG | Sakerhet                               │ │
│          │  │ NIS2: MSB publicerar ny vagledning              │ │
│          │  │ Relevans: 88 | Publicerad: 28 feb 2026         │ │
│          │  └────────────────────────────────────────────────┘ │
│          │                                                     │
│          │  TRENDOVERSIKT (senaste 30 dagar)                  │
│          │  ┌─────────────────────────────────────┐           │
│          │  │  EU-regelverk    ████████████ 34%    │           │
│          │  │  Teknik          ████████ 22%        │           │
│          │  │  Sakerhet        ██████ 18%          │           │
│          │  │  Demografi       ████ 12%            │           │
│          │  │  Ovrigt          █████ 14%           │           │
│          │  └─────────────────────────────────────┘           │
└──────────┴─────────────────────────────────────────────────────┘
```

---

## 5. Byggordning - Sprint for Sprint

### SPRINT 1 (Vecka 1-2): Grundfundament

**Mal:** Projektuppsattning, databas, auth, grundlayout

- [ ] Skapa Next.js 14-projekt med Tailwind + shadcn/ui
- [ ] Koppla till Supabase (auth, databas)
- [ ] Kora SQL-schema (alla tabeller + RLS)
- [ ] Bygga grundlayout: sidebar, topbar, routing
- [ ] Login/logout med Supabase Auth (magic link)
- [ ] Deploy till Vercel + custom domain
- [ ] Seed-data: 10 kallor, 1 testorganisation, 1 testanvandare

**Resultat:** Fungerande app-skal med inloggning pa kommunradar.criteroconsulting.se

### SPRINT 2 (Vecka 3-4): Kallbevakning

**Mal:** Automatiskt hamta artiklar fran 5-10 kallor

- [ ] Edge Function: fetch-sources (RSS-parser)
- [ ] pg_cron: Schema var 30:e minut
- [ ] Testa med SKR, DIGG, MSB, Regeringen, eSam
- [ ] Dubbletthantering (UNIQUE constraint)
- [ ] Admin-vy: se hamtade artiklar + status per kalla

**Resultat:** Artiklar strommar in automatiskt

### SPRINT 3 (Vecka 5-6): AI-motor (Claude API)

**Mal:** Varje ny artikel analyseras automatiskt

- [ ] Registrera pa console.anthropic.com (API-nyckel)
- [ ] Edge Function: analyze-article
- [ ] Haiku for snabb klassificering
- [ ] Sonnet for djupanalys (relevans > 70)
- [ ] Database trigger: kalla analyze vid ny artikel
- [ ] Testa + finjustera systemprompt pa 50+ artiklar

**Resultat:** AI-analyser med relevanspoang, kategorier, konsekvensanalys

### SPRINT 4 (Vecka 7-8): Dashboard

**Mal:** Anvandare kan se och interagera med innehallet

- [ ] Huvuddashboard med statistikkort
- [ ] Artikelflodet med filtrering och sortering
- [ ] Artikeldetaljsida (fulltext + AI-analys)
- [ ] Bokmarkning + "laest"-markering
- [ ] Trendoversikt med Recharts-diagram
- [ ] Responsiv design

**Resultat:** Anvandbar dashboard

### SPRINT 5 (Vecka 9-10): Briefings + Notifieringar

**Mal:** Automatiska veckobreifings och akuta alerts

- [ ] Edge Function: generate-briefing (Claude Sonnet)
- [ ] pg_cron: Varje mandag kl 06:00
- [ ] Resend-integration for e-postutskick
- [ ] HTML-mall for briefing-mail
- [ ] Akut notifiering vid kritiska artiklar
- [ ] Briefing-arkiv i dashboarden

**Resultat:** Automatiska veckobreifings via e-post

### SPRINT 6 (Vecka 11-12): Kommunprofiler + Pilot

**Mal:** Kontextanpassning och pilottest

- [ ] Settings-sidor: kommunprofil, team, notifieringar
- [ ] Fokusomraden paverkar AI-analys och briefing
- [ ] Enkel onboarding for nya organisationer
- [ ] Polering och bugfixar
- [ ] Bjud in 3-5 pilotkommuner

**Resultat:** MVP redo for pilottest!

---

## 6. Konton att Satta Upp

### MVP (allt gratis utom Claude API)

| # | Tjanst | URL | Behov | Status |
|---|--------|-----|-------|--------|
| 1 | Supabase | supabase.com | Nytt projekt | ✅ Har konto |
| 2 | Vercel | vercel.com | Ny deploy | ✅ Har konto |
| 3 | GitHub | github.com | Nytt repo | ✅ Har konto |
| 4 | Anthropic API | console.anthropic.com | API-nyckel ($5 kredit) | [ ] Skapa |
| 5 | Resend | resend.com | API-nyckel (gratis) | [ ] Skapa |

### Nar forsta kunden betalar (Fas 2)

| # | Tjanst | URL | Behov |
|---|--------|-----|-------|
| 6 | Stripe | stripe.com | Betalningshantering |
| 7 | n8n Cloud | n8n.io | Visuella automationsfloden |
| 8 | Exa.ai | exa.ai | Premium AI-sokning |

### Doman-setup

1. Hos din DNS-leverantor for criteroconsulting.se:
   Lagg till CNAME: `kommunradar` → `cname.vercel-dns.com`
2. I Vercel: Lagg till custom domain `kommunradar.criteroconsulting.se`

---

## 7. Nasta Steg

1. ✅ **Plan godkand** - Nollbudget-stack bekraftad
2. **Nu:** Satt upp projektet (Sprint 1 startar)
3. **Vecka 3:** Forsta automationsflodena
4. **Vecka 5:** Claude API kopplad
5. **Vecka 9:** Pilottest med kommuner
