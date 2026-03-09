# Sprint 2: Datainsamling & Källintegration

**Period:** Vecka 3-4 (efter Sprint 1 slutfört)
**Mål:** Automatiserad hämtning av artiklar från 25+ svenska och internationella källor

---

## Översikt

Sprint 2 bygger det automatiserade datainsamlingssystemet. Varje källa integreras
via RSS-flöden eller web scraping och lagras i Supabase. En Supabase Edge Function
körs schemalagt via pg_cron och hämtar nya artiklar var 6:e timme.

---

## Databas: `sources`-tabell

```sql
CREATE TABLE sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Socialstyrelsen"
  slug TEXT NOT NULL UNIQUE,             -- "socialstyrelsen"
  url TEXT NOT NULL,                     -- Bas-URL
  feed_url TEXT,                         -- RSS/Atom URL (null = web scrape)
  feed_type TEXT DEFAULT 'rss',          -- 'rss' | 'atom' | 'scrape'
  category TEXT NOT NULL,                -- Källgrupp (t.ex. "Välfärd, hälsa & utbildning")
  maps_to TEXT[],                        -- Vilka huvudområden källan täcker
  active BOOLEAN DEFAULT true,
  fetch_interval_minutes INT DEFAULT 360, -- 6 timmar
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Databas: `articles`-tabell

```sql
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,              -- Dedup via URL
  summary TEXT,                          -- Kort sammanfattning (från feed)
  content TEXT,                          -- Fulltext (om tillgänglig)
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  -- AI-fält (fylls i Sprint 3)
  ai_category TEXT,
  ai_subcategory TEXT,
  ai_relevance INT,
  ai_impact TEXT,
  ai_action TEXT,
  ai_timeframe TEXT,
  ai_summary TEXT,
  ai_analyzed_at TIMESTAMPTZ,
  -- Metadata
  org_id UUID,                           -- Multi-tenant (RLS)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_articles_source ON articles(source_id);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(ai_category);
CREATE INDEX idx_articles_url ON articles(url);
```

---

## Alla 25+ källor - Detaljplan

### Grupp 1: Styrning & digitalisering
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| SKR | RSS | skr.se/RSS | Styrning & Demokrati |
| DIGG | RSS | digg.se/nyheter/rss | Digitalisering & Teknik |
| Inera | RSS | inera.se/nyheter/rss | Digitalisering & Teknik |
| eSam | Scrape | esam.se/nyheter | Digitalisering & Teknik |
| Upphandlingsmyndigheten | RSS | uhmynd.se/rss | Styrning & Demokrati |

### Grupp 2: Välfärd, hälsa & utbildning
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| Socialstyrelsen | RSS | socialstyrelsen.se/rss | Välfärd & Omsorg |
| IVO | RSS | ivo.se/rss | Välfärd & Omsorg |
| Folkhälsomyndigheten | RSS | folkhalsomyndigheten.se/rss | Välfärd & Omsorg |
| Skolverket | RSS | skolverket.se/rss | Utbildning & Kompetens |
| Universitetskanslersämbetet | RSS | uka.se/rss | Utbildning & Kompetens |

### Grupp 3: Samhällsbyggnad, miljö & energi
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| Naturvårdsverket | RSS | naturvardsverket.se/rss | Klimat, Miljö & Samhällsbyggnad |
| Boverket | RSS | boverket.se/rss | Klimat, Miljö & Samhällsbyggnad |
| Energimyndigheten | RSS | energimyndigheten.se/rss | Klimat, Miljö & Samhällsbyggnad |

### Grupp 4: Trygghet & beredskap
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| MSB | RSS | msb.se/rss | Trygghet & Beredskap |
| FOI | RSS | foi.se/rss | Trygghet & Beredskap |
| BRÅ | RSS | bra.se/rss | Trygghet & Beredskap, Samhälle & Medborgare |

### Grupp 5: Ekonomi & arbetsmarknad
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| Ekonomistyrningsverket | RSS | esv.se/rss | Ekonomi & Resurser |
| Konjunkturinstitutet | RSS | konj.se/rss | Ekonomi & Resurser |
| Arbetsmiljöverket | RSS | av.se/rss | Arbetsgivare & Organisation |
| Statskontoret | RSS | statskontoret.se/rss | Arbetsgivare & Organisation |

### Grupp 6: Innovation & tillväxt
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| Vinnova | RSS | vinnova.se/rss | Innovation & Omställning |
| Tillväxtverket | RSS | tillvaxtverket.se/rss | Innovation & Omställning |
| PTS | RSS | pts.se/rss | Innovation & Omställning, Digitalisering |

### Grupp 7: Regeringen & länsstyrelserna
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| Regeringskansliet | RSS | regeringen.se/rss | Samtliga kategorier |
| Länsstyrelserna | RSS/Scrape | lansstyrelsen.se | Samtliga kategorier |

### Grupp 8: EU-institutioner
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| EU-kommissionen | RSS | ec.europa.eu/rss | Samtliga kategorier |
| EU Digital Strategy | RSS | digital-strategy.ec.europa.eu/rss | Digitalisering & Teknik |
| Europaparlamentet | RSS | europarl.europa.eu/rss | Samtliga kategorier |

### Grupp 9: Branschmedia
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| Dagens Samhälle | RSS | dagenssamhalle.se/rss | Samtliga kategorier |
| Computer Sweden | RSS | computersweden.se/rss | Digitalisering & Teknik |
| Altinget | RSS | altinget.se/rss | Styrning & Demokrati |

### Grupp 10: Forskning & statistik
| Källa | Typ | Feed URL | Täcker |
|-------|-----|----------|--------|
| SCB | RSS | scb.se/rss | Samtliga kategorier |
| Riksrevisionen | RSS | riksrevisionen.se/rss | Samtliga kategorier |

---

## Teknisk implementation

### Steg 1: Supabase-tabeller (Dag 1)
- [ ] Skapa `sources`-tabell med alla 25+ källor som seed-data
- [ ] Skapa `articles`-tabell med index
- [ ] Sätt upp RLS-policies (articles per organisation)
- [ ] Seed `sources`-tabellen med alla RSS-URLer

### Steg 2: RSS Parser Edge Function (Dag 2-3)
- [ ] Skapa Edge Function `fetch-sources`
- [ ] Generisk RSS/Atom-parser (xml2js eller fast-xml-parser)
- [ ] Dedup-logik: Skippa artiklar som redan finns (via URL)
- [ ] Felhantering: Logga misslyckade fetch, fortsätt med nästa källa
- [ ] Rate limiting: Max 2 requests/sekund

```typescript
// Pseudokod för Edge Function
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(URL, KEY)

  // Hämta aktiva källor som behöver uppdateras
  const { data: sources } = await supabase
    .from('sources')
    .select('*')
    .eq('active', true)
    .or(`last_fetched_at.is.null,last_fetched_at.lt.${sixHoursAgo}`)

  for (const source of sources) {
    if (source.feed_type === 'rss' || source.feed_type === 'atom') {
      const articles = await parseRSSFeed(source.feed_url)
      // Upsert artiklar (dedup via URL)
      await supabase.from('articles').upsert(articles, { onConflict: 'url' })
    } else if (source.feed_type === 'scrape') {
      const articles = await scrapeSource(source)
      await supabase.from('articles').upsert(articles, { onConflict: 'url' })
    }
    // Uppdatera last_fetched_at
    await supabase.from('sources').update({ last_fetched_at: new Date() })
      .eq('id', source.id)
  }
})
```

### Steg 3: Web Scraper för eSam + Länsstyrelserna (Dag 3-4)
- [ ] Skapa separat scraper-logik för källor utan RSS
- [ ] Cheerio-baserad HTML-parsing i Edge Function
- [ ] Identifiera CSS-selektorer för nyhetslistor på varje sajt
- [ ] Testa och validera att scraping fungerar

### Steg 4: Schemaläggning med pg_cron (Dag 4)
- [ ] Installera pg_cron extension i Supabase
- [ ] Schemalägg `fetch-sources` var 6:e timme
- [ ] Lägg till monitoring/logging-tabell för fetchresultat

```sql
-- Schemalägg hämtning var 6:e timme
SELECT cron.schedule(
  'fetch-all-sources',
  '0 */6 * * *',  -- Var 6:e timme
  $$
    SELECT net.http_post(
      url := 'https://<project>.supabase.co/functions/v1/fetch-sources',
      headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
    );
  $$
);
```

### Steg 5: RSS-URL-verifiering (Dag 1 - parallellt)
- [ ] Verifiera ALLA RSS-URLer manuellt (en del myndigheter byter format)
- [ ] Dokumentera faktiska feed-URLer i sources-tabellen
- [ ] Identifiera vilka som kräver scraping istället för RSS
- [ ] Testa parsing av varje feed

### Steg 6: Dashboard-koppling (Dag 5)
- [ ] Byt ut mock-data på Dashboard mot riktiga artiklar från Supabase
- [ ] Uppdatera Feed-sidan att läsa från `articles`-tabellen
- [ ] Lägg till source-namn och ikon per artikel
- [ ] Implementera filtrering och sökning mot databasen
- [ ] Admin-vy: Se fetchstatus per källa

---

## Prioriteringsordning

Vi implementerar källorna i denna ordning (baserat på RSS-tillgänglighet):

**Fas A - Enklast (har säker RSS):**
1. Regeringskansliet
2. MSB
3. SKR
4. DIGG
5. Skolverket
6. Socialstyrelsen
7. Naturvårdsverket
8. Vinnova

**Fas B - Sannolikt RSS:**
9. Boverket
10. Energimyndigheten
11. BRÅ
12. FOI
13. Arbetsmiljöverket
14. Folkhälsomyndigheten
15. PTS
16. Konjunkturinstitutet

**Fas C - Kräver verifiering/scraping:**
17. eSam (scraping)
18. Inera
19. Upphandlingsmyndigheten
20. ESV
21. Statskontoret
22. Tillväxtverket
23. UKÄ
24. Länsstyrelserna (scraping)

**Fas D - Branschmedia & EU:**
25. Dagens Samhälle
26. Computer Sweden
27. Altinget
28. EU-kommissionen
29. Europaparlamentet
30. SCB
31. Riksrevisionen

---

## Täckningsmatris: Källor → Huvudområden

| Huvudområde | Primärkällor | Sekundärkällor |
|-------------|-------------|----------------|
| Styrning & Demokrati | SKR, Regeringen, Riksrevisionen | Altinget, Statskontoret |
| Digitalisering & Teknik | DIGG, Inera, eSam, PTS | Computer Sweden, EU Digital |
| Välfärd & Omsorg | Socialstyrelsen, IVO, FoHM | SKR, Regeringen |
| Utbildning & Kompetens | Skolverket, UKÄ | SKR, Regeringen |
| Klimat, Miljö & Samhällsbyggnad | Naturvårdsverket, Boverket, Energimynd. | Regeringen, EU |
| Trygghet & Beredskap | MSB, FOI, BRÅ | Regeringen, Länsstyrelserna |
| Ekonomi & Resurser | ESV, Konj.inst., SCB | SKR, Riksrevisionen |
| Arbetsgivare & Organisation | Arbetsmiljöverket, Statskontoret | SKR |
| Samhälle & Medborgare | SCB, BRÅ, Länsstyrelserna | Dagens Samhälle |
| Innovation & Omställning | Vinnova, Tillväxtverket, PTS | EU, Computer Sweden |

---

## Definition of Done

- [ ] Minst 20 källor hämtar artiklar automatiskt via RSS
- [ ] Minst 2 källor fungerar via web scraping (eSam, ev. Länsstyrelserna)
- [ ] pg_cron kör var 6:e timme utan manuell intervention
- [ ] Dashboard och Feed visar riktiga artiklar (ej mock-data)
- [ ] Felhantering: Misslyckad fetch loggas och stoppar inte övriga
- [ ] Dedup: Inga dubblettartiklar i databasen
- [ ] Admin kan se fetchstatus per källa

---

## Kostnad: 0 kr

- Supabase Edge Functions: Gratis (500K invocations/mån)
- pg_cron: Ingår i Supabase Free
- RSS-hämtning: Gratis (publika flöden)
- Lagring: Supabase Free har 500MB (räcker för ~100K artiklar)

---

## Beroenden från Sprint 1

Innan Sprint 2 startar måste dessa vara klara:
- [x] Supabase client setup (browser, server, middleware)
- [ ] Riktigt Supabase-projekt kopplat (inte placeholder-URLer)
- [ ] Databastabeller skapade
- [ ] Deploy till Vercel (så Edge Functions kan anropas)
