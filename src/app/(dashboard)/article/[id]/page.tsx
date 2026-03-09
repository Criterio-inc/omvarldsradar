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
    "NIS2-direktivet: Nya krav på cybersäkerhet för offentlig sektor träder i kraft",
  source: "Riksdagen.se",
  sourceUrl: "https://riksdagen.se",
  publishedDate: "2026-03-01",
  category: "Digitalisering & Teknik",
  subcategory: "Cybersäkerhet",
  paverkan: "Direkt reglering",
  atgard: "Agera nu",
  tidshorisont: "Akut (0-3 mån)",
  relevance: 94,
  content: `NIS2-direktivet (Network and Information Security Directive 2) är EU:s uppdaterade regelverk för cybersäkerhet som träder i kraft under 2026. Direktivet ersätter det tidigare NIS-direktivet och innebär avsevärt skärpta krav för offentlig sektor.

För svenska kommuner och regioner innebär detta flera konkreta förändringar. Alla organisationer som klassar som leverantörer av samhällsviktiga tjänster måste genomföra systematiska riskanalyser av sina informationssystem. Därutöver ställs krav på implementering av tekniska och organisatoriska skyddsåtgärder.

En viktig nyhet är att NIS2 utvidgar kretsen av organisationer som omfattas. Tidigare var det främst större aktörer som berördes, men nu inkluderas även mindre kommuner och offentliga verksamheter. Direktivet ställer även krav på incidentrapportering inom 24 timmar.

För att uppfylla kraven behöver kommuner och regioner bland annat investera i:
- Systematisk riskhantering och sårbarhetsanalyser
- Tekniska skyddsåtgärder som kryptering och åtkomstkontroll
- Incidenthanteringsprocesser och rapporteringsrutiner
- Utbildning och kompetensuppbyggnad inom cybersäkerhet
- Leverantörssäkerhet och kontroll av tredjepartsrisker

Regeringen har givit MSB (Myndigheten för samhällsskydd och beredskap) i uppdrag att vara tillsynsmyndighet för NIS2 i Sverige. MSB arbetar för närvarande med att ta fram detaljerade föreskrifter och vägledning för hur direktivet ska implementeras i svenska förhållanden.`,
  aiAnalysis: {
    summary:
      "NIS2-direktivet innebär kraftigt skärpta cybersäkerhetskrav för alla kommuner och regioner. Direktivet utvidgar kretsen av organisationer som berörs och ställer krav på riskanalyser, tekniska skyddsåtgärder, incidentrapportering och personalutbildning. Deadline för första rapportering är Q3 2026.",
    impactAnalysis: {
      liten: {
        label: "Liten kommun",
        description: "Under 15 000 invånare",
        impact: "HÖG",
        details:
          "Små kommuner saknar ofta dedikerade IT-säkerhetsresurser. Kräver samverkan med andra kommuner eller extern expertis. Begränsad budget kan göra det svårare att implementera samtliga krav i tid.",
      },
      medel: {
        label: "Medelstor kommun",
        description: "15 000 - 50 000 invånare",
        impact: "KRITISK",
        details:
          "Medelstora kommuner har ofta mer komplex IT-infrastruktur men inte alltid proportionerlig cybersäkerhetskompetens. Risk för sårbarheter i äldre system. Behov av systematisk genomgång och prioritering.",
      },
      stor: {
        label: "Stor kommun / Region",
        description: "Över 50 000 invånare",
        impact: "KRITISK",
        details:
          "Stora organisationer har fler kritiska system och större angreppsytor. Kräver omfattande riskanalyser och investeringar. Dock ofta bättre förmågor att hantera implementeringen tack vare större resurser.",
      },
    },
    actions: [
      {
        text: "Genomför en NIS2 gap-analys för att identifiera brister",
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
        text: "Anmäl organisationen till MSB som tillsynsmyndighet",
        done: false,
      },
      {
        text: "Inför incidentrapporteringsrutin (24 timmars krav)",
        done: false,
      },
      {
        text: "Planera utbildning för personal och ledning",
        done: false,
      },
    ],
    frameworks: [
      { name: "WEF Global Risks", tags: ["Cybersäkerhet", "Teknologirisk"] },
      { name: "Kairos Future TAIDA", tags: ["Hot", "Beslut", "Agerande"] },
      { name: "DIGG/eSam", tags: ["Informationssäkerhet", "Digital mognad"] },
    ],
    keyDates: [
      { date: "2026-04-01", event: "Anmälan till MSB" },
      { date: "2026-06-30", event: "Första riskanalys klar" },
      { date: "2026-09-30", event: "Första statusrapport till MSB" },
      { date: "2027-01-01", event: "Alla tekniska skyddsåtgärder på plats" },
    ],
  },
};

import {
  impactColors,
  impactCardColors,
  categoryColors,
  paverkanColors,
  atgardColors,
  tidshorisontColors,
  frameworkColors,
} from "@/lib/constants";

export default function ArticleDetailPage() {
  const article = articleData;
  const analysis = article.aiAnalysis;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/feed">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Tillbaka till flödet
        </Link>
      </Button>

      {/* Article header */}
      <div className="space-y-4">
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
          <Badge variant="secondary" className="text-xs">
            {article.subcategory}
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
              <CardTitle className="text-base">Artikelinnehåll</CardTitle>
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
                Automatiskt genererad analys baserad på WEF, Kairos Future och
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
                  Påverkan per kommunstorlek
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(analysis.impactAnalysis).map(
                    ([key, data]) => (
                      <Card
                        key={key}
                        className={`border-l-4 ${impactCardColors[data.impact] || "border-l-gray-500"}`}
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
                            className={impactColors[data.impact] || "bg-gray-100 text-gray-700 border-gray-200"}
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
                  Rekommenderade åtgärder
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
                Relevansbedömning
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
                  Baserat på din kommunprofil och valda fokusområden
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cross-cutting lenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Analysdimensioner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Tidshorisont</p>
                <Badge
                  variant="outline"
                  className={tidshorisontColors[article.tidshorisont]}
                >
                  {article.tidshorisont}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Påverkan</p>
                <Badge
                  variant="outline"
                  className={paverkanColors[article.paverkan]}
                >
                  {article.paverkan}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Åtgärd</p>
                <Badge
                  variant="outline"
                  className={atgardColors[article.atgard]}
                >
                  {article.atgard}
                </Badge>
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
                <span className="font-semibold">Kritisk påverkan</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Denna förändring kräver omedelbar uppmärksamhet och
                agerande från kommunledningen. Se rekommenderade åtgärder.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
