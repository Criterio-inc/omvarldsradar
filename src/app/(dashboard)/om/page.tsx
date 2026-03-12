"use client";

import {
  Radar,
  Building2,
  Globe,
  BookOpen,
  Sparkles,
  Shield,
  Users,
  Mail,
  Landmark,
  Newspaper,
  FlaskConical,
  Brain,
  CheckCircle2,
  HeartPulse,
  Leaf,
  TrendingUp,
  Rocket,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const sourceCategories = [
  {
    icon: Landmark,
    title: "Styrning & digitalisering",
    sources: ["SKR", "DIGG", "Inera", "eSam", "Upphandlingsmyndigheten"],
    color: "bg-blue-100 text-blue-700",
    maps: "Styrning & Demokrati, Digitalisering & Teknik",
  },
  {
    icon: HeartPulse,
    title: "Välfärd, hälsa & utbildning",
    sources: [
      "Socialstyrelsen",
      "IVO",
      "Folkhälsomyndigheten",
      "Skolverket",
      "Universitetskanslersämbetet",
    ],
    color: "bg-pink-100 text-pink-700",
    maps: "Välfärd & Omsorg, Utbildning & Kompetens",
  },
  {
    icon: Leaf,
    title: "Samhällsbyggnad, miljö & energi",
    sources: ["Naturvårdsverket", "Boverket", "Energimyndigheten"],
    color: "bg-teal-100 text-teal-700",
    maps: "Klimat, Miljö & Samhällsbyggnad",
  },
  {
    icon: Shield,
    title: "Trygghet & beredskap",
    sources: ["MSB", "FOI", "BRÅ"],
    color: "bg-slate-100 text-slate-700",
    maps: "Trygghet & Beredskap",
  },
  {
    icon: TrendingUp,
    title: "Ekonomi & arbetsmarknad",
    sources: [
      "Ekonomistyrningsverket",
      "Konjunkturinstitutet",
      "Arbetsmiljöverket",
      "Statskontoret",
    ],
    color: "bg-amber-100 text-amber-700",
    maps: "Ekonomi & Resurser, Arbetsgivare & Organisation",
  },
  {
    icon: Rocket,
    title: "Innovation & tillväxt",
    sources: ["Vinnova", "Tillväxtverket", "PTS"],
    color: "bg-cyan-100 text-cyan-700",
    maps: "Innovation & Omställning",
  },
  {
    icon: Building2,
    title: "Regeringen & länsstyrelserna",
    sources: ["Regeringskansliet", "SOU:er", "Propositioner", "Länsstyrelserna"],
    color: "bg-emerald-100 text-emerald-700",
    maps: "Samtliga kategorier",
  },
  {
    icon: Globe,
    title: "EU-institutioner",
    sources: ["EU-kommissionen", "Digital Strategy", "Europaparlamentet"],
    color: "bg-indigo-100 text-indigo-700",
    maps: "Samtliga kategorier",
  },
  {
    icon: Newspaper,
    title: "Branschmedia",
    sources: ["Dagens Samhälle", "Computer Sweden", "Altinget"],
    color: "bg-amber-100 text-amber-700",
    maps: "Samtliga kategorier",
  },
  {
    icon: FlaskConical,
    title: "Forskning & statistik",
    sources: ["SCB", "Riksrevisionen", "Kairos Future"],
    color: "bg-purple-100 text-purple-700",
    maps: "Samtliga kategorier",
  },
];

const aiCapabilities = [
  "Klassificerar varje artikel i 10 huvudområden med 52 underkategorier",
  "Bedömer relevans (0-100) för offentlig sektor",
  "Analyserar via tre tvärsgående linser: tidshorisont, påverkan och åtgärdskrav",
  "Genererar konsekvensanalys per kommunstorlek",
  "Föreslår konkreta åtgärder anpassade per verksamhetsområde",
  "Genererar veckovisa uppdateringar anpassade per roll",
];

const frameworks = [
  {
    name: "WEF Global Risks",
    description:
      "World Economic Forums ramverk för globala risker. Används för att identifiera och kategorisera risker inom teknologi, miljö, geopolitik, ekonomi och samhälle som kan påverka kommuner och regioner.",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    name: "Kairos Future TAIDA",
    description:
      "Scanning, Analyse, Imagine, Decide, Act. Ett svenskt framtidsanalysramverk som hjälper organisationer att systematiskt bevaka omvärlden, analysera trender och fatta strategiska beslut.",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    name: "DIGG/eSam",
    description:
      "Ramverk för digital mognad och informationssäkerhet i svensk offentlig sektor. Används för att bedöma hur väl kommuner och regioner lever upp till krav på digitalisering och säkerhet.",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
];

export default function OmPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Om OmvärldsRadar</h1>
        <p className="text-muted-foreground">
          AI-driven omvärldsbevakning för svensk offentlig sektor
        </p>
      </div>

      {/* Section 1: Om OmvärldsRadar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand)]">
              <Radar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Vad är OmvärldsRadar?</CardTitle>
              <CardDescription>
                Plattformen som ger offentlig sektor koll på omvärlden
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">
            OmvärldsRadar är en AI-driven plattform för omvärldsbevakning
            specifikt utvecklad för svenska kommuner och regioner. Vi samlar in,
            analyserar och sammanfattar relevant information från ett brett urval
            av myndigheter, branschmedia och EU-institutioner så att
            beslutsfattare i offentlig sektor alltid har en aktuell och
            kontextanpassad omvärldsbild.
          </p>

          <div className="rounded-lg border border-[var(--brand)]/20 bg-[var(--brand-muted)] p-4">
            <p className="text-sm font-medium text-[var(--brand)]">Vår vision</p>
            <p className="mt-1 text-sm italic leading-relaxed">
              &quot;Varje svensk kommun och region ska ha tillgång till en
              aktuell, relevant och kontextanpassad omvärldsbild.&quot;
            </p>
          </div>

          <p className="text-sm leading-relaxed">
            Genom att kombinera automatiserad datainsamling med avancerad
            AI-analys ger OmvärldsRadar beslutsfattare en helhetsbild av
            förändringar inom lagstiftning, teknik, samhälle och omvärld som
            påverkar deras verksamhet. Varje artikel klassificeras i 10
            huvudområden, analyseras via tre ramverk och bedöms utifrån relevans
            för just din organisation.
          </p>
        </CardContent>
      </Card>

      {/* Section 2: Källor vi bevakar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <BookOpen className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <CardTitle className="text-lg">Källor vi bevakar</CardTitle>
              <CardDescription>
                Över 25 svenska myndigheter, EU-institutioner och branschmedia
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sourceCategories.map((cat) => (
              <div
                key={cat.title}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${cat.color}`}
                  >
                    <cat.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-sm">{cat.title}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.sources.map((source) => (
                    <Badge key={source} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Täcker: {cat.maps}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">10 huvudområden med full täckning</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Våra källor är noggrant utvalda för att täcka samtliga
              bevakningsområden: Styrning & Demokrati, Digitalisering & Teknik,
              Välfärd & Omsorg, Utbildning & Kompetens, Klimat, Miljö &
              Samhällsbyggnad, Trygghet & Beredskap, Ekonomi & Resurser,
              Arbetsgivare & Organisation, Samhälle & Medborgare samt Innovation
              & Omställning.
            </p>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Nya källor läggs till kontinuerligt. Kontakta oss om du saknar en
            källa som är viktig för din organisation.
          </p>
        </CardContent>
      </Card>

      {/* Section 3: AI-stödet */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand)]/10">
              <Brain className="h-5 w-5 text-[var(--brand)]" />
            </div>
            <div>
              <CardTitle className="text-lg">AI-stödet</CardTitle>
              <CardDescription>
                Hur AI hjälper dig att förstå omvärlden
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed">
            OmvärldsRadar använder avancerad AI för att automatiskt analysera,
            klassificera och sammanfatta omvärldsinformation. AI:n gör det
            möjligt att hantera stora informationsmängder och leverera
            skräddarsydda insikter till varje organisation.
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Vad AI:n gör:</h3>
            <div className="space-y-2">
              {aiCapabilities.map((capability, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--brand)]" />
                  <span className="text-sm">{capability}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 text-sm font-semibold">Tre analysramverk</h3>
            <div className="space-y-3">
              {frameworks.map((fw) => (
                <div key={fw.name} className="rounded-lg border p-4 space-y-2">
                  <Badge variant="outline" className={fw.color}>
                    {fw.name}
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {fw.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-[var(--brand)]" />
            <span className="text-muted-foreground">
              OmvärldsRadar använder Anthropics Claude AI för analys, klassificering
              och uppdateringsgenerering.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Bakom OmvärldsRadar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Users className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <CardTitle className="text-lg">Bakom OmvärldsRadar</CardTitle>
              <CardDescription>
                Företagen och människorna bakom plattformen
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Critero Consulting AB</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Managementkonsulter med fokus på digitalisering och
                verksamhetsutveckling i svensk offentlig sektor. Lång erfarenhet
                av att stödja kommuner och regioner i deras
                digitaliseringsresa.
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Curago AB</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Teknologi- och innovationspartner med expertis inom AI,
                automation och modern systemutveckling. Ansvarar för den
                tekniska plattformen och AI-integrationen.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Kontakt</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@criteroconsulting.se</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>omvarldsradar.criteroconsulting.se</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
