"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  ExternalLink,
  CalendarDays,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const articleData = {
  id: "1",
  title:
    "NIS2-direktivet: Nya krav pa cybersakerhet for offentlig sektor trader i kraft",
  source: "Riksdagen.se",
  sourceUrl: "https://riksdagen.se",
  publishedDate: "2026-03-01",
  category: "EU-regelverk",
  subcategories: ["Cybersakerhet", "Offentlig sektor", "Kritisk infrastruktur"],
  impact: "KRITISK",
  relevance: 94,
  content: `NIS2-direktivet (Network and Information Security Directive 2) ar EU:s uppdaterade regelverk for cybersakerhet som traeder i kraft under 2026. Direktivet ersatter det tidigare NIS-direktivet och innebar avsevart skarpta krav for offentlig sektor.

For svenska kommuner och regioner innebar detta flera konkreta forandringar. Alla organisationer som klassar som leverantorer av samhallsviktiga tjanster maste genomfora systematiska riskanalyser av sina informationssystem. Darutover stalls krav pa implementering av tekniska och organisatoriska skyddsatgarder.

En viktig nyhet ar att NIS2 utvidgar kretsen av organisationer som omfattas. Tidigare var det framst storre aktorer som berordes, men nu inkluderas aven mindre kommuner och offentliga verksamheter. Direktivet staller aven krav pa incidentrapportering inom 24 timmar.

For att uppfylla kraven behover kommuner och regioner bland annat investera i:
- Systematisk riskhantering och sarbarhetsanalyser
- Tekniska skyddsatgarder som kryptering och atkomstkontroll
- Incidenthanteringsprocesser och rapporteringsrutiner
- Utbildning och kompetensuppbyggnad inom cybersakerhet
- Leverantorssakerhet och kontroll av tredjepartsrisker

Regeringen har givit MSB (Myndigheten for samhallsskydd och beredskap) i uppdrag att vara tillsynsmyndighet for NIS2 i Sverige. MSB arbetar for narvarande med att ta fram detaljerade foreskrifter och vagledning for hur direktivet ska implementeras i svenska forhallanden.`,
  aiAnalysis: {
    summary:
      "NIS2-direktivet innebar kraftigt skarpta cybersakerhetskrav for alla kommuner och regioner. Direktivet utvidgar kretsen av organisationer som berors och staller krav pa riskanalyser, tekniska skyddsatgarder, incidentrapportering och personalutbildning. Deadline for forsta rapportering ar Q3 2026.",
    impactAnalysis: {
      liten: {
        label: "Liten kommun",
        description: "Under 15 000 invanare",
        impact: "HOG",
        details:
          "Sma kommuner saknar ofta dedikerade IT-sakerhetsresurser. Kravs samverkan med andra kommuner eller extern expertis. Begransad budget kan gora det svarare att implementera samtliga krav i tid.",
      },
      medel: {
        label: "Medelstor kommun",
        description: "15 000 - 50 000 invanare",
        impact: "KRITISK",
        details:
          "Medelstora kommuner har ofta mer komplex IT-infrastruktur men inte alltid proportionerlig cybersakerhetskompetens. Risk for sarbarheter i aldre system. Behov av systematisk genomgang och prioritering.",
      },
      stor: {
        label: "Stor kommun / Region",
        description: "Over 50 000 invanare",
        impact: "KRITISK",
        details:
          "Stora organisationer har fler kritiska system och storre angreppsytor. Kraver omfattande riskanalyser och investeringar. Dock ofta battre formagor att hantera implementeringen tack vare storre resurser.",
      },
    },
    actions: [
      {
        text: "Genomfor en NIS2 gap-analys for att identifiera brister",
        done: false,
      },
      {
        text: "Utse en NIS2-ansvarig i organisationen",
        done: false,
      },
      {
        text: "Inventera kritiska informationssystem och beroenden",
        done: false,
      },
      {
        text: "Ta fram en handlingsplan med budget och tidslinje",
        done: false,
      },
      {
        text: "Anmal organisationen till MSB som tillsynsmyndighet",
        done: false,
      },
      {
        text: "Infor incidentrapporteringsrutin (24 timmars krav)",
        done: false,
      },
      {
        text: "Planera utbildning for personal och ledning",
        done: false,
      },
    ],
    frameworks: [
      { name: "WEF Global Risks", tags: ["Cybersakerhet", "Teknologirisk"] },
      { name: "Kairos Future TAIDA", tags: ["Hot", "Beslut", "Agerande"] },
      { name: "DIGG/eSam", tags: ["Informationssakerhet", "Digital mognad"] },
    ],
    keyDates: [
      { date: "2026-04-01", event: "Anmalan till MSB" },
      { date: "2026-06-30", event: "Forsta riskanalys klar" },
      { date: "2026-09-30", event: "Forsta statusrapport till MSB" },
      { date: "2027-01-01", event: "Alla tekniska skyddsatgarder pa plats" },
    ],
  },
};

const impactColors: Record<string, string> = {
  KRITISK: "bg-red-100 text-red-700 border-red-200",
  HOG: "bg-orange-100 text-orange-700 border-orange-200",
  MEDEL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LAG: "bg-green-100 text-green-700 border-green-200",
};

const impactCardColors: Record<string, string> = {
  KRITISK: "border-l-red-500",
  HOG: "border-l-orange-500",
  MEDEL: "border-l-yellow-500",
  LAG: "border-l-green-500",
};

const frameworkColors: Record<string, string> = {
  "WEF Global Risks": "bg-blue-100 text-blue-700 border-blue-200",
  "Kairos Future TAIDA": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "DIGG/eSam": "bg-purple-100 text-purple-700 border-purple-200",
};

export default function ArticleDetailPage() {
  const article = articleData;
  const analysis = article.aiAnalysis;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/feed">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Tillbaka till flodet
        </Link>
      </Button>

      {/* Article header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={impactColors[article.impact]}
          >
            {article.impact}
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-200"
          >
            {article.category}
          </Badge>
          {article.subcategories.map((sub) => (
            <Badge key={sub} variant="secondary" className="text-xs">
              {sub}
            </Badge>
          ))}
        </div>

        <h1 className="text-2xl font-bold leading-tight lg:text-3xl">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ExternalLink className="h-4 w-4" />
            {article.source}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {article.publishedDate}
          </span>
          <div className="flex items-center gap-2">
            <span>Relevans:</span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--brand)]"
                style={{ width: `${article.relevance}%` }}
              />
            </div>
            <span className="font-medium">{article.relevance}%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="mr-1.5 h-4 w-4" />
            Spara
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-1.5 h-4 w-4" />
            Dela
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Article content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Artikelinnehall</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {article.content.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="mb-4 leading-relaxed text-foreground last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="border-[var(--brand)]/20">
            <CardHeader className="bg-[var(--brand-muted)] rounded-t-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--brand)]" />
                <CardTitle className="text-base">AI-analys</CardTitle>
              </div>
              <CardDescription>
                Automatiskt genererad analys baserad pa WEF, Kairos Future och
                DIGG-ramverken
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Summary */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Sammanfattning
                </h3>
                <p className="text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              <Separator />

              {/* Impact per municipality size */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Paverkan per kommunstorlek
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(analysis.impactAnalysis).map(
                    ([key, data]) => (
                      <Card
                        key={key}
                        className={`border-l-4 ${impactCardColors[data.impact]}`}
                      >
                        <CardContent className="space-y-2 pt-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">
                              {data.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {data.description}
                          </p>
                          <Badge
                            variant="outline"
                            className={impactColors[data.impact]}
                          >
                            {data.impact}
                          </Badge>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {data.details}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>

              <Separator />

              {/* Recommended actions */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Rekommenderade atgarder
                </h3>
                <div className="space-y-2">
                  {analysis.actions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          action.done
                            ? "border-green-500 bg-green-500"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {action.done && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{action.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Relevance score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Relevansbedomning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg
                    className="h-24 w-24 -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="var(--brand)"
                      strokeWidth="8"
                      strokeDasharray={`${article.relevance * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold">
                    {article.relevance}
                  </span>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Baserat pa din kommunprofil och valda fokusomraden
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Framework tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Ramverkstaggar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.frameworks.map((fw) => (
                <div key={fw.name} className="space-y-1.5">
                  <Badge
                    variant="outline"
                    className={
                      frameworkColors[fw.name] ||
                      "bg-gray-100 text-gray-700 border-gray-200"
                    }
                  >
                    {fw.name}
                  </Badge>
                  <div className="flex flex-wrap gap-1">
                    {fw.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Key dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Viktiga datum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.keyDates.map((kd, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--brand)]">
                        {kd.date}
                      </p>
                      <p className="text-sm">{kd.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact level */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-semibold">Kritisk paverkan</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Denna forandring kraver omedelbar uppmarksamhet och
                agerande fran kommunledningen. Se rekommenderade atgarder.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
