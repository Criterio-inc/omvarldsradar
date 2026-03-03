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

const impactColors: Record<string, string> = {
  KRITISK: "bg-red-100 text-red-700 border-red-200",
  HOG: "bg-orange-100 text-orange-700 border-orange-200",
  MEDEL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LAG: "bg-green-100 text-green-700 border-green-200",
};

const categoryColors: Record<string, string> = {
  "EU-regelverk": "bg-blue-100 text-blue-700 border-blue-200",
  Teknik: "bg-purple-100 text-purple-700 border-purple-200",
  Sakerhetspolitik: "bg-slate-100 text-slate-700 border-slate-200",
  "Nationella reformer": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Demografi: "bg-pink-100 text-pink-700 border-pink-200",
};

const mockInsights = [
  {
    id: "1",
    title:
      "NIS2-direktivet: Nya krav pa cybersakerhet for offentlig sektor trader i kraft",
    source: "Riksdagen.se",
    date: "2026-03-01",
    category: "EU-regelverk",
    impact: "KRITISK",
    summary:
      "Det nya NIS2-direktivet innebar avsevart skarpta krav pa cybersakerhet for kommuner och regioner. Alla organisationer maste genomfora riskanalyser och implementera tekniska skyddsatgarder senast Q3 2026.",
    relevance: 94,
  },
  {
    id: "2",
    title:
      "AI-forordningen (EU AI Act): Kommuner maste klassificera AI-system",
    source: "EU-kommissionen",
    date: "2026-02-28",
    category: "EU-regelverk",
    impact: "HOG",
    summary:
      "EU:s AI-forordning kraver att alla kommuner som anvander AI-system for myndighetsutovning klassificerar dessa som hogrisk-system. Nya transparenskrav galler fran 2026.",
    relevance: 89,
  },
  {
    id: "3",
    title:
      "Statlig utredning foreslar ny modell for kommunal digitalisering",
    source: "Regeringskansliet",
    date: "2026-02-27",
    category: "Nationella reformer",
    impact: "HOG",
    summary:
      "Utredningen 'Digital kommun 2030' foreslar gemensam digital infrastruktur for alla kommuner. Finansiering via statsbidrag och ny samordningsmyndighet foreslas.",
    relevance: 82,
  },
  {
    id: "4",
    title: "Ny rapport: Kriget i Ukraina paverkar kommunal beredskapsplanering",
    source: "MSB",
    date: "2026-02-26",
    category: "Sakerhetspolitik",
    impact: "MEDEL",
    summary:
      "MSB:s senaste rapport visar att 67% av kommunerna behover uppdatera sina beredskapsplaner. Sarskilt fokus pa energiforsorjning och vattensakerhet.",
    relevance: 76,
  },
  {
    id: "5",
    title: "Befolkningsprognoser visar pa okad urbanisering 2026-2030",
    source: "SCB",
    date: "2026-02-25",
    category: "Demografi",
    impact: "MEDEL",
    summary:
      "Statistiska centralbyrans nya prognoser visar att 78 av 290 kommuner forvantas minska med mer an 5% till 2030. Konsekvenser for skatteunderlag och serviceforsorjning.",
    relevance: 71,
  },
];

const trendData = [
  { name: "EU-regelverk", value: 34, color: "#3b82f6" },
  { name: "Teknologiskiften", value: 22, color: "#8b5cf6" },
  { name: "Sakerhetspolitik", value: 18, color: "#64748b" },
  { name: "Nationella reformer", value: 14, color: "#10b981" },
  { name: "Demografi", value: 12, color: "#ec4899" },
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
          Vecka {weekNumber} &mdash; Har ar din omvarldsbevakning
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
                Kritiska forandringar
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
              <p className="text-sm text-muted-foreground">Nasta briefing</p>
              <p className="text-2xl font-bold text-green-700">man 10 mar</p>
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
                        className={impactColors[article.impact]}
                      >
                        {article.impact}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          categoryColors[article.category] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {article.category}
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
          <h2 className="text-lg font-semibold">Trendoversikt</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fordelning per kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
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
                      width={120}
                      fontSize={12}
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
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
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
                Snabbllankar
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
                  Djupsok
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
