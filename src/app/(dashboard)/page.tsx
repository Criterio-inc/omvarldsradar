"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  CalendarClock,
  ArrowRight,
  ExternalLink,
  Database,
  Rss,
  Loader2,
  Info,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  fetchDashboardStats,
  fetchLatestArticles,
  type DashboardStats,
  type Article,
} from "@/lib/data";
import {
  categoryColors,
  atgardColors,
  paverkanColors,
  tidshorisontColors,
} from "@/lib/constants";

// ISO 8601 veckonummer (svensk standard)
function getISOWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Tidsanpassad hälsning
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "God morgon";
  if (hour >= 10 && hour < 17) return "Hej";
  if (hour >= 17 && hour < 23) return "God kväll";
  return "God natt";
}

interface UserPrefs {
  categories: string[];
}

export default function DashboardPage() {
  const weekNumber = getISOWeekNumber();
  const greeting = getGreeting();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);

  // Ladda användarpreferenser
  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch("/api/notifications/preferences");
        if (res.ok) {
          const data = await res.json();
          const prefs = data.preferences;
          if (prefs) {
            setUserPrefs({ categories: prefs.categories ?? [] });
          }
        }
      } catch {
        // silently fail
      }
    }
    loadPrefs();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        // Hämta fler artiklar så vi kan filtrera och ändå visa 5
        const [s, a] = await Promise.all([
          fetchDashboardStats(),
          fetchLatestArticles(30),
        ]);
        setStats(s);
        setArticles(a);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunde inte ladda data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtrera och prioritera artiklar baserat på användarens fokusområden
  const hasPrefs = userPrefs && userPrefs.categories.length > 0;

  function isRelevantToUser(article: Article): boolean {
    if (!userPrefs || userPrefs.categories.length === 0) return true;
    return !!(article.ai_category && userPrefs.categories.includes(article.ai_category));
  }

  // Sortera: relevanta artiklar först, sedan resten. Visa max 5.
  const displayedArticles = hasPrefs
    ? [
        ...articles.filter(isRelevantToUser),
        ...articles.filter((a) => !isRelevantToUser(a)),
      ].slice(0, 5)
    : articles.slice(0, 5);

  // Build trend data from real articles
  const trendData = articles.length > 0
    ? buildTrendData(articles)
    : defaultTrendData;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{greeting}!</h1>
        <p className="text-sm text-muted-foreground">
          Vecka {weekNumber} &middot; Här är din omvärldsbevakning
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          accent="stat-accent-blue"
          label="Artiklar totalt"
          value={loading ? null : stats?.totalArticles ?? 0}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          iconBg="bg-red-50 dark:bg-red-500/10"
          accent="stat-accent-red"
          label="Kräver åtgärd"
          value={loading ? null : stats?.actionRequired ?? 0}
          valueClass={stats?.actionRequired ? "text-red-600" : undefined}
        />
        <StatCard
          icon={<Database className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          accent="stat-accent-green"
          label="Källor"
          value={loading ? null : `${stats?.activeSources ?? 0} / ${stats?.totalSources ?? 0}`}
        />
        <StatCard
          icon={<Rss className="h-5 w-5 text-orange-600" />}
          iconBg="bg-orange-50 dark:bg-orange-500/10"
          accent="stat-accent-orange"
          label="RSS-redo"
          value={loading ? null : stats?.rssReady ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest insights */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {hasPrefs ? "Dina insikter" : "Senaste insikter"}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/feed">
                Visa alla <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : displayedArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <Info className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">Inga artiklar hämtade ännu</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats?.totalSources
                      ? `${stats.totalSources} källor konfigurerade (${stats.rssReady} med RSS). Artiklar hämtas automatiskt var 6:e timme.`
                      : "Konfigurera källor för att börja hämta artiklar."}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">Konfigurera källor</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayedArticles.map((article) => {
                const isRelevant = hasPrefs && isRelevantToUser(article);
                return (
                <Link key={article.id} href={`/article/${article.id}`}>
                  <Card className={`card-hover cursor-pointer ${isRelevant ? "ring-1 ring-primary/20 bg-primary/[0.02]" : ""}`}>
                    <CardContent className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {isRelevant && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px]">
                            <Star className="mr-0.5 h-3 w-3 fill-current" />
                            Relevant
                          </Badge>
                        )}
                        {article.ai_category && (
                          <Badge
                            variant="outline"
                            className={
                              categoryColors[article.ai_category] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            }
                          >
                            {article.ai_category}
                          </Badge>
                        )}
                        {article.ai_impact && (
                          <Badge
                            variant="outline"
                            className={
                              paverkanColors[article.ai_impact] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            }
                          >
                            {article.ai_impact}
                          </Badge>
                        )}
                        {article.ai_action && (
                          <Badge
                            variant="outline"
                            className={
                              atgardColors[article.ai_action] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            }
                          >
                            {article.ai_action}
                          </Badge>
                        )}
                        {article.ai_timeframe && (
                          <Badge
                            variant="outline"
                            className={
                              tidshorisontColors[article.ai_timeframe] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            }
                          >
                            {article.ai_timeframe}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold leading-snug">
                        {article.title}
                      </h3>

                      {(article.ai_summary || article.summary) && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.ai_summary || article.summary}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span>{article.source_name}</span>
                          <span>&middot;</span>
                          <span>
                            {article.published_at
                              ? new Date(article.published_at).toLocaleDateString("sv-SE")
                              : new Date(article.fetched_at).toLocaleDateString("sv-SE")}
                          </span>
                        </div>

                        {article.ai_relevance != null && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Relevans
                            </span>
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-[var(--brand)]"
                                style={{ width: `${article.ai_relevance}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {article.ai_relevance}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Trend overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Trendöversikt</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fördelning per kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      type="number"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} st`, "Artiklar"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {trendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Snabblänkar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/briefing">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Senaste briefing
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/search">
                  <FileText className="mr-2 h-4 w-4" />
                  Djupsök
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/settings">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Konfigurera bevakning
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Helper components ---

function StatCard({
  icon,
  iconBg,
  accent,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  iconBg: string;
  accent?: string;
  label: string;
  value: string | number | null;
  valueClass?: string;
}) {
  return (
    <Card className={`card-hover ${accent || ""}`}>
      <CardContent className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {value === null ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
          ) : (
            <p className={`text-2xl font-bold tracking-tight ${valueClass ?? ""}`}>{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Trend data helpers ---

const categoryColorMap: Record<string, string> = {
  "Styrning & Demokrati": "#3b82f6",
  "Digitalisering & Teknik": "#8b5cf6",
  "Välfärd & Omsorg": "#ec4899",
  "Utbildning & Kompetens": "#6366f1",
  "Klimat, Miljö & Samhällsbyggnad": "#14b8a6",
  "Trygghet & Beredskap": "#64748b",
  "Ekonomi & Resurser": "#f59e0b",
  "Arbetsgivare & Organisation": "#f97316",
  "Samhälle & Medborgare": "#10b981",
  "Innovation & Omställning": "#06b6d4",
};

const shortNames: Record<string, string> = {
  "Klimat, Miljö & Samhällsbyggnad": "Klimat, Miljö & Samh.",
  "Arbetsgivare & Organisation": "Arbetsgivare & Org.",
  "Innovation & Omställning": "Innovation & Omställn.",
};

function buildTrendData(articles: Article[]) {
  const counts: Record<string, number> = {};
  for (const a of articles) {
    const cat = a.ai_category || "Övrigt";
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name: shortNames[name] || name,
      value,
      color: categoryColorMap[name] || "#94a3b8",
    }));
}

const defaultTrendData = [
  { name: "Styrning & Demokrati", value: 0, color: "#3b82f6" },
  { name: "Digitalisering & Teknik", value: 0, color: "#8b5cf6" },
  { name: "Välfärd & Omsorg", value: 0, color: "#ec4899" },
  { name: "Klimat, Miljö & Samh.", value: 0, color: "#14b8a6" },
  { name: "Trygghet & Beredskap", value: 0, color: "#64748b" },
  { name: "Ekonomi & Resurser", value: 0, color: "#f59e0b" },
  { name: "Samhälle & Medborgare", value: 0, color: "#10b981" },
  { name: "Innovation & Omställn.", value: 0, color: "#06b6d4" },
];
