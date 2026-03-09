-- ============================================================
-- OmvärldsRadar - Komplett databasschema
-- Kör detta i Supabase SQL Editor (hela filen på en gång)
-- ============================================================

-- 1. ORGANISATIONS
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'municipality' CHECK (type IN ('municipality', 'region', 'government_agency', 'other')),
  municipality_code TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES (kopplade till Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  notification_preferences JSONB DEFAULT '{
    "email_frequency": "weekly",
    "categories": [],
    "enabled": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SOURCES (globala, delas av alla organisationer)
CREATE TABLE sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  feed_url TEXT,
  feed_type TEXT NOT NULL DEFAULT 'rss' CHECK (feed_type IN ('rss', 'atom', 'scrape')),
  category TEXT NOT NULL,
  maps_to TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  fetch_interval_minutes INT DEFAULT 360,
  last_fetched_at TIMESTAMPTZ,
  last_fetch_status TEXT DEFAULT 'pending' CHECK (last_fetch_status IN ('pending', 'success', 'error')),
  last_fetch_error TEXT,
  article_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ARTICLES
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  -- AI-klassificering (fylls av Haiku i Sprint 3)
  ai_category TEXT,
  ai_subcategory TEXT,
  ai_relevance INT CHECK (ai_relevance >= 0 AND ai_relevance <= 100),
  ai_impact TEXT CHECK (ai_impact IN ('Direkt reglering', 'Indirekt påverkan', 'Möjlighet', 'Risk/hot', NULL)),
  ai_action TEXT CHECK (ai_action IN ('Agera nu', 'Planera', 'Bevaka', 'Inspireras', NULL)),
  ai_timeframe TEXT CHECK (ai_timeframe IN ('Akut (0-3 mån)', 'Kort sikt (3-12 mån)', 'Medellång sikt (1-3 år)', 'Lång sikt (3+ år)', NULL)),
  -- AI-djupanalys (fylls av Sonnet i Sprint 3, enbart relevans >70)
  ai_summary TEXT,
  ai_consequences TEXT,
  ai_recommended_actions TEXT,
  ai_frameworks JSONB DEFAULT '[]'::jsonb,
  ai_analyzed_at TIMESTAMPTZ,
  -- Multi-tenant
  org_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_articles_source ON articles(source_id);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(ai_category);
CREATE INDEX idx_articles_relevance ON articles(ai_relevance DESC);
CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_org ON articles(org_id);
CREATE INDEX idx_articles_fetched ON articles(fetched_at DESC);

-- 5. FETCH LOG (observerbarhet för det agentiska flödet)
CREATE TABLE fetch_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
  articles_found INT DEFAULT 0,
  articles_new INT DEFAULT 0,
  articles_skipped INT DEFAULT 0,
  error_message TEXT,
  duration_ms INT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_fetch_log_source ON fetch_log(source_id);
CREATE INDEX idx_fetch_log_started ON fetch_log(started_at DESC);

-- 6. BRIEFINGS (genererade av AI-agenten)
CREATE TABLE briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  article_count INT DEFAULT 0,
  categories_covered TEXT[] DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  sent_to TEXT[] DEFAULT '{}'
);

CREATE INDEX idx_briefings_org ON briefings(org_id);
CREATE INDEX idx_briefings_period ON briefings(period_end DESC);

-- 7. NOTIFICATION QUEUE (e-postkö)
CREATE TABLE notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('briefing', 'alert', 'digest')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error_message TEXT,
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Profiles: användare ser sin egen profil + kollegor i samma org
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view org members"
  ON profiles FOR SELECT
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Organizations: användare ser sin egen organisation
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Articles: användare ser artiklar för sin organisation + globala (org_id IS NULL)
CREATE POLICY "Users can view org articles"
  ON articles FOR SELECT
  USING (org_id IS NULL OR org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Briefings: användare ser briefings för sin organisation
CREATE POLICY "Users can view org briefings"
  ON briefings FOR SELECT
  USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Notification queue: användare ser sina egna notifieringar
CREATE POLICY "Users can view own notifications"
  ON notification_queue FOR SELECT
  USING (profile_id = auth.uid());

-- Sources: alla kan läsa (globala)
-- (Ingen RLS på sources — de är publika)

-- ============================================================
-- AUTO-SKAPA PROFIL VID REGISTRERING
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- UPPDATERA article_count PÅ SOURCES
-- ============================================================

CREATE OR REPLACE FUNCTION update_source_article_count()
RETURNS trigger AS $$
BEGIN
  UPDATE sources
  SET article_count = (SELECT COUNT(*) FROM articles WHERE source_id = NEW.source_id)
  WHERE id = NEW.source_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_article_inserted
  AFTER INSERT ON articles
  FOR EACH ROW EXECUTE FUNCTION update_source_article_count();

-- ============================================================
-- SERVICE ROLE POLICIES (för Edge Functions)
-- ============================================================

-- Edge Functions kör med service_role key och bypasas RLS,
-- men vi skapar ändå insert-policies för tydlighet:

CREATE POLICY "Service can insert articles"
  ON articles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can insert fetch_log"
  ON fetch_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can insert briefings"
  ON briefings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can insert notifications"
  ON notification_queue FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update notifications"
  ON notification_queue FOR UPDATE
  USING (true);
