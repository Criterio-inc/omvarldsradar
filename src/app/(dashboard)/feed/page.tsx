"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Filter, SlidersHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  Klimat: "bg-teal-100 text-teal-700 border-teal-200",
  Ekonomi: "bg-amber-100 text-amber-700 border-amber-200",
};

const categories = [
  "Alla",
  "EU-regelverk",
  "Teknik",
  "Sakerhetspolitik",
  "Nationella reformer",
  "Demografi",
  "Klimat",
  "Ekonomi",
];

const impactLevels = ["Alla", "KRITISK", "HOG", "MEDEL", "LAG"];

const mockArticles = [
  {
    id: "1",
    title: "NIS2-direktivet: Nya krav pa cybersakerhet for offentlig sektor trader i kraft",
    source: "Riksdagen.se",
    date: "2026-03-01",
    category: "EU-regelverk",
    impact: "KRITISK",
    summary: "Det nya NIS2-direktivet innebar avsevart skarpta krav pa cybersakerhet for kommuner och regioner. Alla organisationer maste genomfora riskanalyser och implementera tekniska skyddsatgarder senast Q3 2026.",
    relevance: 94,
  },
  {
    id: "2",
    title: "AI-forordningen (EU AI Act): Kommuner maste klassificera AI-system",
    source: "EU-kommissionen",
    date: "2026-02-28",
    category: "EU-regelverk",
    impact: "HOG",
    summary: "EU:s AI-forordning kraver att alla kommuner som anvander AI-system for myndighetsutovning klassificerar dessa som hogrisk-system. Nya transparenskrav galler fran 2026.",
    relevance: 89,
  },
  {
    id: "3",
    title: "Statlig utredning foreslar ny modell for kommunal digitalisering",
    source: "Regeringskansliet",
    date: "2026-02-27",
    category: "Nationella reformer",
    impact: "HOG",
    summary: "Utredningen 'Digital kommun 2030' foreslar gemensam digital infrastruktur for alla kommuner. Finansiering via statsbidrag och ny samordningsmyndighet foreslas.",
    relevance: 82,
  },
  {
    id: "4",
    title: "Ny rapport: Kriget i Ukraina paverkar kommunal beredskapsplanering",
    source: "MSB",
    date: "2026-02-26",
    category: "Sakerhetspolitik",
    impact: "MEDEL",
    summary: "MSB:s senaste rapport visar att 67% av kommunerna behover uppdatera sina beredskapsplaner. Sarskilt fokus pa energiforsorjning och vattensakerhet.",
    relevance: 76,
  },
  {
    id: "5",
    title: "Befolkningsprognoser visar pa okad urbanisering 2026-2030",
    source: "SCB",
    date: "2026-02-25",
    category: "Demografi",
    impact: "MEDEL",
    summary: "SCB:s nya prognoser visar att 78 av 290 kommuner forvantas minska med mer an 5% till 2030. Konsekvenser for skatteunderlag och serviceforsorjning.",
    relevance: 71,
  },
  {
    id: "6",
    title: "EU:s klimatanpassningspaket kraver lokala atgardsplaner",
    source: "EU-kommissionen",
    date: "2026-02-24",
    category: "Klimat",
    impact: "HOG",
    summary: "Nya EU-krav innebar att alla kommuner med over 20 000 invanare maste ta fram lokala klimatanpassningsplaner senast 2027. Omfattande rapporteringskrav foljer.",
    relevance: 85,
  },
  {
    id: "7",
    title: "DIGG publicerar nya riktlinjer for oppna data i offentlig sektor",
    source: "DIGG",
    date: "2026-02-23",
    category: "Teknik",
    impact: "MEDEL",
    summary: "Myndigheten for digital forvaltning publicerar uppdaterade riktlinjer for hur kommuner och regioner ska tillgangliggora oppna data. Fokus pa maskinlasbarhet och standardformat.",
    relevance: 73,
  },
  {
    id: "8",
    title: "Ny lag om whistleblowing: Kommuner maste inratta rapporteringskanaler",
    source: "Riksdagen.se",
    date: "2026-02-22",
    category: "Nationella reformer",
    impact: "HOG",
    summary: "Fran 1 juli 2026 maste alla kommuner med fler an 50 anstallda ha interna rapporteringskanaler for visselblasare. Krav pa oberoende utredning och skydd for anmalare.",
    relevance: 78,
  },
  {
    id: "9",
    title: "Riksrevisionen granskar kommunernas ekonomiska hallbarhet",
    source: "Riksrevisionen",
    date: "2026-02-21",
    category: "Ekonomi",
    impact: "MEDEL",
    summary: "Riksrevisionens granskning visar att 45 kommuner riskerar att inte klara det lagstadgade balanskravet under 2026. Sarskilt smakommuner med vikande skatteunderlag drabbas.",
    relevance: 68,
  },
  {
    id: "10",
    title: "NATO-medlemskapet medfor nya krav pa kommunal totalforsvarsplanering",
    source: "Forsvarsdepartementet",
    date: "2026-02-20",
    category: "Sakerhetspolitik",
    impact: "KRITISK",
    summary: "Sveriges NATO-medlemskap innebar nya krav pa kommunernas totalforsvarsplanering. Samtliga kommuner maste upprata vardplaner och sakerstalla kritisk infrastruktur senast 2027.",
    relevance: 91,
  },
];

export default function FeedPage() {
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [selectedImpact, setSelectedImpact] = useState("Alla");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = mockArticles.filter((article) => {
    if (selectedCategory !== "Alla" && article.category !== selectedCategory)
      return false;
    if (selectedImpact !== "Alla" && article.impact !== selectedImpact)
      return false;
    if (
      searchQuery &&
      !article.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !article.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Flodet</h1>
        <p className="text-muted-foreground">
          Alla bevakade artiklar och forandringar
        </p>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Sok
              </label>
              <Input
                placeholder="Sok i artiklar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Kategori
              </label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-40">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Paverkan
              </label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
              >
                {impactLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("Alla");
                setSelectedImpact("Alla");
                setSearchQuery("");
              }}
            >
              <Filter className="mr-1 h-3 w-3" />
              Rensa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Visar {filteredArticles.length} av {mockArticles.length} artiklar
        </p>
      </div>

      {/* Article list */}
      <div className="space-y-3">
        {filteredArticles.map((article) => (
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

                <h3 className="font-semibold leading-snug">{article.title}</h3>

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

        {filteredArticles.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Filter className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="font-medium">Inga artiklar matchar filtret</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prova att andra filterinstallningarna
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
