"use client";

import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  CalendarClock,
  ArrowRight,
  ExternalLink,
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

const paverkanColors: Record<string, string> = {
  "Direkt reglering": "bg-red-100 text-red-700 border-red-200",
  "Indirekt påverkan": "bg-orange-100 text-orange-700 border-orange-200",
  "Möjlighet": "bg-green-100 text-green-700 border-green-200",
  "Risk/hot": "bg-rose-100 text-rose-700 border-rose-200",
};

const atgardColors: Record<string, string> = {
  "Agera nu": "bg-red-100 text-red-700 border-red-200",
  "Planera": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Bevaka": "bg-blue-100 text-blue-700 border-blue-200",
  "Inspireras": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const tidshorisontColors: Record<string, string> = {
  "Akut (0-3 mån)": "bg-red-50 text-red-600 border-red-200",
  "Kort sikt (3-12 mån)": "bg-orange-50 text-orange-600 border-orange-200",
  "Medellång sikt (1-3 år)": "bg-blue-50 text-blue-600 border-blue-200",
  "Lång sikt (3+ år)": "bg-slate-50 text-slate-600 border-slate-200",
};

const mockInsights = [
  {
    id: "1",
    title:
      "NIS2-direktivet: Nya krav på cybersäkerhet för offentlig sektor träder i kraft",
    source: "Riksdagen.se",
    date: "2026-03-01",
    category: "Digitalisering & Teknik",
    paverkan: "Direkt reglering",
    atgard: "Agera nu",
    tidshorisont: "Akut (0-3 mån)",
    summary:
      "Det nya NIS2-direktivet innebär avsevärt skärpta krav på cybersäkerhet för kommuner och regioner. Alla organisationer måste genomföra riskanalyser och implementera tekniska skyddsåtgärder senast Q3 2026.",
    relevance: 94,
  },
  {
    id: "2",
    title:
      "AI-förordningen (EU AI Act): Kommuner måste klassificera AI-system",
    source: "EU-kommissionen",
    date: "2026-02-28",
    category: "Styrning & Demokrati",
    paverkan: "Direkt reglering",
    atgard: "Planera",
    tidshorisont: "Kort sikt (3-12 mån)",
    summary:
      "EU:s AI-förordning kräver att alla kommuner som använder AI-system för myndighetsutövning klassificerar dessa som högrisk-system. Nya transparenskrav gäller från 2026.",
    relevance: 89,
  },
  {
    id: "3",
    title:
      "Statlig utredning föreslår ny modell för kommunal digitalisering",
    source: "Regeringskansliet",
    date: "2026-02-27",
    category: "Ekonomi & Resurser",
    paverkan: "Möjlighet",
    atgard: "Planera",
    tidshorisont: "Medellång sikt (1-3 år)",
    summary:
      "Utredningen 'Digital kommun 2030' föreslår gemensam digital infrastruktur för alla kommuner. Finansiering via statsbidrag och ny samordningsmyndighet föreslås.",
    relevance: 82,
  },
  {
    id: "4",
    title: "Ny rapport: Kriget i Ukraina påverkar kommunal beredskapsplanering",
    source: "MSB",
    date: "2026-02-26",
    category: "Trygghet & Beredskap",
    paverkan: "Indirekt påverkan",
    atgard: "Bevaka",
    tidshorisont: "Kort sikt (3-12 mån)",
    summary:
      "MSB:s senaste rapport visar att 67% av kommunerna behöver uppdatera sina beredskapsplaner. Särskilt fokus på energiförsörjning och vattensäkerhet.",
    relevance: 76,
  },
  {
    id: "5",
    title: "Befolkningsprognoser visar på ökad urbanisering 2026-2030",
    source: "SCB",
    date: "2026-02-25",
    category: "Samhälle & Medborgare",
    paverkan: "Indirekt påverkan",
    atgard: "Bevaka",
    tidshorisont: "Lång sikt (3+ år)",
    summary:
      "Statistiska centralbyråns nya prognoser visar att 78 av 290 kommuner förväntas minska med mer än 5% till 2030. Konsekvenser för skatteunderlag och serviceförsörjning.",
    relevance: 71,
  },
];

const trendData = [
  { name: "Styrning & Demokrati", value: 18, color: "#3b82f6" },
  { name: "Digitalisering & Teknik", value: 22, color: "#8b5cf6" },
  { name: "Välfärd & Omsorg", value: 8, color: "#ec4899" },
  { name: "Utbildning & Kompetens", value: 5, color: "#6366f1" },
  { name: "Klimat, Miljö & Samh.", value: 12, color: "#14b8a6" },
  { name: "Trygghet & Beredskap", value: 14, color: "#64748b" },
  { name: "Ekonomi & Resurser", value: 9, color: "#f59e0b" },
  { name: "Arbetsgivare & Org.", value: 4, color: "#f97316" },
  { name: "Samhälle & Medborgare", value: 5, color: "#10b981" },
  { name: "Innovation & Omställn.", value: 3, color: "#06b6d4" },
];

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff / oneWeek + start.getDay() + 1) / 7);
}

export default function DashboardPage() {
  const weekNumber = getWeekNumber();

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nya denna vecka</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Kräver åtgärd nu
              </p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <CalendarClock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nästa briefing</p>
              <p className="text-2xl font-bold text-green-700">mån 10 mar</p>
            </div>
          </CardContent>
        </Card>
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

          <div className="space-y-3">
            {mockInsights.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`}>
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardContent className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          categoryColors[article.category] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {article.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={paverkanColors[article.paverkan]}
                      >
                        {article.paverkan}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={atgardColors[article.atgard]}
                      >
                        {article.atgard}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={tidshorisontColors[article.tidshorisont]}
                      >
                        {article.tidshorisont}
                      </Badge>
                    </div>

                    <h3 className="font-semibold leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span>{article.source}</span>
                        <span>&middot;</span>
                        <span>{article.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Relevans
                        </span>
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-[var(--brand)]"
                            style={{ width: `${article.relevance}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {article.relevance}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
                      tickFormatter={(v) => `${v}%`}
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
                      formatter={(value) => [`${value}%`, "Andel"]}
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
