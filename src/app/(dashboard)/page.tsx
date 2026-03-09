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

const categoryColors: Record<string, string> = {
  "Styrning & Demokrati": "bg-blue-100 text-blue-700 border-blue-200",
  "Digitalisering & Teknik": "bg-purple-100 text-purple-700 border-purple-200",
  "Välfärd & Omsorg": "bg-pink-100 text-pink-700 border-pink-200",
  "Utbildning & Kompetens": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Klimat, Miljö & Samhällsbyggnad": "bg-teal-100 text-teal-700 border-teal-200",
  "Trygghet & Beredskap": "bg-slate-100 text-slate-700 border-slate-200",
  "Ekonomi & Resurser": "bg-amber-100 text-amber-700 border-amber-200",
  "Arbetsgivare & Organisation": "bg-orange-100 text-orange-700 border-orange-200",
  "Samhälle & Medborgare": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Innovation & Omställning": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const atgardColors: Record<string, string> = {
  "Agera nu": "bg-red-100 text-red-700 border-red-200",
  "Planera": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Bevaka": "bg-blue-100 text-blue-700 border-blue-200",
  "Inspireras": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const paverkanColors: Record<string, string> = {
  "Direkt reglering": "bg-red-100 text-red-700 border-red-200",
  "Indirekt påverkan": "bg-orange-100 text-orange-700 border-orange-200",
  "Möjlighet": "bg-green-100 text-green-700 border-green-200",
  "Risk/hot": "bg-rose-100 text-rose-700 border-rose-200",
};

const tidshorisontColors: Record<string, string> = {
  "Akut (0-3 mån)": "bg-red-50 text-red-600 border-red-200",
  "Kort sikt (3-12 mån)": "bg-orange-50 text-orange-600 border-orange-200",
  "Medellång sikt (1-3 år)": "bg-blue-50 text-blue-600 border-blue-200",
  "Lång sikt (3+ år)": "bg-slate-50 text-slate-600 border-slate-200",
};

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff / oneWeek + start.getDay() + 1) / 7);
}

export default function DashboardPage() {
  const weekNumber = getWeekNumber();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([
          fetchDashboardStats(),
          fetchLatestArticles(5),
        ]);
        setStats(s);
        setArticles(a);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Build trend data from real articles
  const trendData = articles.length > 0
    ? buildTrendData(articles)
    : defaultTrendData;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">God morgon!</h1>
        <p className="text-muted-foreground">
          Vecka {weekNumber} &mdash; Här är din omvärldsbevakning
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-100"
          label="Artiklar totalt"
          value={loading ? null : stats?.totalArticles ?? 0}
        />
        <StatCard
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          iconBg="bg-red-100"
          label="Kräver åtgärd"
          value={loading ? null : stats?.actionRequired ?? 0}
          valueClass={stats?.actionRequired ? "text-red-600" : undefined}
        />
        <StatCard
          icon={<Database className="h-6 w-6 text-green-600" />}
          iconBg="bg-green-100"
          label="Källor"
          value={loading ? null : `${stats?.activeSources ?? 0} / ${stats?.totalSources ?? 0}`}
        />
        <StatCard
          icon={<Rss className="h-6 w-6 text-orange-600" />}
          iconBg="bg-orange-100"
          label="RSS-redo"
          value={loading ? null : stats?.rssReady ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest insights */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Senaste insikter</h2>
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
          ) : articles.length === 0 ? (
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
              {articles.map((article) => (
                <Link key={article.id} href={`/article/${article.id}`}>
                  <Card className="transition-shadow hover:shadow-md cursor-pointer">
                    <CardContent className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
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
              ))}
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
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number | null;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {value === null ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
          ) : (
            <p className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</p>
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
