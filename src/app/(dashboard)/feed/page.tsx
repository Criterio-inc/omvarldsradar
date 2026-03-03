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

const categories = [
  "Alla",
  "Styrning & Demokrati",
  "Digitalisering & Teknik",
  "Välfärd & Omsorg",
  "Utbildning & Kompetens",
  "Klimat, Miljö & Samhällsbyggnad",
  "Trygghet & Beredskap",
  "Ekonomi & Resurser",
  "Arbetsgivare & Organisation",
  "Samhälle & Medborgare",
  "Innovation & Omställning",
];

const paverkanLevels = [
  "Alla",
  "Direkt reglering",
  "Indirekt påverkan",
  "Möjlighet",
  "Risk/hot",
];

const atgardLevels = [
  "Alla",
  "Agera nu",
  "Planera",
  "Bevaka",
  "Inspireras",
];

const mockArticles = [
  {
    id: "1",
    title: "NIS2-direktivet: Nya krav på cybersäkerhet för offentlig sektor träder i kraft",
    source: "Riksdagen.se",
    date: "2026-03-01",
    category: "Digitalisering & Teknik",
    subcategory: "Cybersäkerhet",
    paverkan: "Direkt reglering",
    atgard: "Agera nu",
    tidshorisont: "Akut (0-3 mån)",
    summary: "Det nya NIS2-direktivet innebär avsevärt skärpta krav på cybersäkerhet för kommuner och regioner. Alla organisationer måste genomföra riskanalyser och implementera tekniska skyddsåtgärder senast Q3 2026.",
    relevance: 94,
  },
  {
    id: "2",
    title: "AI-förordningen (EU AI Act): Kommuner måste klassificera AI-system",
    source: "EU-kommissionen",
    date: "2026-02-28",
    category: "Styrning & Demokrati",
    subcategory: "EU-reglering",
    paverkan: "Direkt reglering",
    atgard: "Planera",
    tidshorisont: "Kort sikt (3-12 mån)",
    summary: "EU:s AI-förordning kräver att alla kommuner som använder AI-system för myndighetsutövning klassificerar dessa som högrisk-system. Nya transparenskrav gäller från 2026.",
    relevance: 89,
  },
  {
    id: "3",
    title: "Statlig utredning föreslår ny modell för kommunal digitalisering",
    source: "Regeringskansliet",
    date: "2026-02-27",
    category: "Ekonomi & Resurser",
    subcategory: "Statsbidrag",
    paverkan: "Möjlighet",
    atgard: "Planera",
    tidshorisont: "Medellång sikt (1-3 år)",
    summary: "Utredningen 'Digital kommun 2030' föreslår gemensam digital infrastruktur för alla kommuner. Finansiering via statsbidrag och ny samordningsmyndighet föreslås.",
    relevance: 82,
  },
  {
    id: "4",
    title: "Ny rapport: Kriget i Ukraina påverkar kommunal beredskapsplanering",
    source: "MSB",
    date: "2026-02-26",
    category: "Trygghet & Beredskap",
    subcategory: "Krisberedskap",
    paverkan: "Indirekt påverkan",
    atgard: "Bevaka",
    tidshorisont: "Kort sikt (3-12 mån)",
    summary: "MSB:s senaste rapport visar att 67% av kommunerna behöver uppdatera sina beredskapsplaner. Särskilt fokus på energiförsörjning och vattensäkerhet.",
    relevance: 76,
  },
  {
    id: "5",
    title: "Befolkningsprognoser visar på ökad urbanisering 2026-2030",
    source: "SCB",
    date: "2026-02-25",
    category: "Samhälle & Medborgare",
    subcategory: "Demografi",
    paverkan: "Indirekt påverkan",
    atgard: "Bevaka",
    tidshorisont: "Lång sikt (3+ år)",
    summary: "SCB:s nya prognoser visar att 78 av 290 kommuner förväntas minska med mer än 5% till 2030. Konsekvenser för skatteunderlag och serviceförsörjning.",
    relevance: 71,
  },
  {
    id: "6",
    title: "EU:s klimatanpassningspaket kräver lokala åtgärdsplaner",
    source: "EU-kommissionen",
    date: "2026-02-24",
    category: "Klimat, Miljö & Samhällsbyggnad",
    subcategory: "Klimatanpassning",
    paverkan: "Direkt reglering",
    atgard: "Planera",
    tidshorisont: "Medellång sikt (1-3 år)",
    summary: "Nya EU-krav innebär att alla kommuner med över 20 000 invånare måste ta fram lokala klimatanpassningsplaner senast 2027. Omfattande rapporteringskrav följer.",
    relevance: 85,
  },
  {
    id: "7",
    title: "DIGG publicerar nya riktlinjer för öppna data i offentlig sektor",
    source: "DIGG",
    date: "2026-02-23",
    category: "Digitalisering & Teknik",
    subcategory: "E-tjänster & data",
    paverkan: "Indirekt påverkan",
    atgard: "Bevaka",
    tidshorisont: "Kort sikt (3-12 mån)",
    summary: "Myndigheten för digital förvaltning publicerar uppdaterade riktlinjer för hur kommuner och regioner ska tillgängliggöra öppna data. Fokus på maskinläsbarhet och standardformat.",
    relevance: 73,
  },
  {
    id: "8",
    title: "SKR: Kompetensförsörjningen är välfärdens största utmaning",
    source: "SKR",
    date: "2026-02-22",
    category: "Arbetsgivare & Organisation",
    subcategory: "Kompetensförsörjning",
    paverkan: "Risk/hot",
    atgard: "Agera nu",
    tidshorisont: "Akut (0-3 mån)",
    summary: "SKR:s senaste rapport visar att kommuner och regioner behöver rekrytera 410 000 personer fram till 2031. Störst brist inom äldreomsorg, skola och hälso- och sjukvård.",
    relevance: 88,
  },
  {
    id: "9",
    title: "Riksrevisionen granskar kommunernas ekonomiska hållbarhet",
    source: "Riksrevisionen",
    date: "2026-02-21",
    category: "Ekonomi & Resurser",
    subcategory: "Kommunal ekonomi",
    paverkan: "Indirekt påverkan",
    atgard: "Bevaka",
    tidshorisont: "Kort sikt (3-12 mån)",
    summary: "Riksrevisionens granskning visar att 45 kommuner riskerar att inte klara det lagstadgade balanskravet under 2026. Särskilt småkommuner med vikande skatteunderlag drabbas.",
    relevance: 68,
  },
  {
    id: "10",
    title: "NATO-medlemskapet medför nya krav på kommunal totalförsvarsplanering",
    source: "Försvarsdepartementet",
    date: "2026-02-20",
    category: "Trygghet & Beredskap",
    subcategory: "Totalförsvar",
    paverkan: "Direkt reglering",
    atgard: "Agera nu",
    tidshorisont: "Akut (0-3 mån)",
    summary: "Sveriges NATO-medlemskap innebär nya krav på kommunernas totalförsvarsplanering. Samtliga kommuner måste upprätta vårdplaner och säkerställa kritisk infrastruktur senast 2027.",
    relevance: 91,
  },
];

export default function FeedPage() {
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [selectedPaverkan, setSelectedPaverkan] = useState("Alla");
  const [selectedAtgard, setSelectedAtgard] = useState("Alla");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = mockArticles.filter((article) => {
    if (selectedCategory !== "Alla" && article.category !== selectedCategory)
      return false;
    if (selectedPaverkan !== "Alla" && article.paverkan !== selectedPaverkan)
      return false;
    if (selectedAtgard !== "Alla" && article.atgard !== selectedAtgard)
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
        <h1 className="text-2xl font-bold tracking-tight">Flödet</h1>
        <p className="text-muted-foreground">
          Alla bevakade artiklar och förändringar
        </p>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Sök
              </label>
              <Input
                placeholder="Sök i artiklar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-56">
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
            <div className="w-full sm:w-44">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Påverkan
              </label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                value={selectedPaverkan}
                onChange={(e) => setSelectedPaverkan(e.target.value)}
              >
                {paverkanLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-40">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Åtgärdskrav
              </label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                value={selectedAtgard}
                onChange={(e) => setSelectedAtgard(e.target.value)}
              >
                {atgardLevels.map((level) => (
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
                setSelectedPaverkan("Alla");
                setSelectedAtgard("Alla");
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
                Prova att ändra filterinställningarna
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
