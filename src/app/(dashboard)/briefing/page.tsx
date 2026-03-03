"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const importantItems = [
  {
    title: "NIS2-direktivet trader i kraft",
    description:
      "Nya cybersakerhetskrav for offentlig sektor. Kommuner och regioner maste genomfora riskanalyser, implementera tekniska skyddsatgarder och utbilda personal. Deadline for forsta rapportering: Q3 2026.",
    impact: "KRITISK",
    category: "EU-regelverk",
    actionRequired: true,
  },
  {
    title: "EU AI Act: Klassificeringskrav for AI-system",
    description:
      "Alla AI-system som anvands for myndighetsutovning maste klassificeras och registreras. Sarskilt relevant for kommuner som anvander AI i beslutsstod, chatbotar och arendehantering.",
    impact: "HOG",
    category: "EU-regelverk",
    actionRequired: true,
  },
  {
    title: "NATO-anpassning av totalforsvarsplanering",
    description:
      "Forsvarsdepartementet har publicerat nya riktlinjer for kommunal totalforsvarsplanering i linje med NATO-standarden. Rorande vardplaner, kritisk infrastruktur och samverkan med Forsvarsmakten.",
    impact: "KRITISK",
    category: "Sakerhetspolitik",
    actionRequired: false,
  },
];

const deadlines = [
  {
    date: "2026-03-15",
    title: "Remissvar: Digital kommun 2030",
    description: "Sista dag for att lamna remissvar pa utredningen.",
  },
  {
    date: "2026-04-01",
    title: "NIS2: Anmalan till tillsynsmyndighet",
    description: "Alla organisationer som omfattas maste anmala sig.",
  },
  {
    date: "2026-06-30",
    title: "AI Act: Klassificeringsrapport",
    description: "Forsta rapporten over anvanda AI-system ska vara inlamnad.",
  },
  {
    date: "2026-07-01",
    title: "Visselblasarlagen: Rapporteringskanal",
    description:
      "Alla kommuner med 50+ anstallda maste ha interna rapporteringskanaler.",
  },
];

const recommendations = [
  {
    title: "Genomfor NIS2 gap-analys",
    description:
      "Kartlagg nuvarande cybersakerhetsstatus mot NIS2-kraven. Prioritera identifiering av kritiska informationssystem och tillgangar.",
    priority: "Hog",
    status: "ej_paborjad",
  },
  {
    title: "Inventera AI-system",
    description:
      "Skapa en fullstandig inventering av alla AI-system som anvands i verksamheten, inklusive tredjepartslosningar och chatbotar.",
    priority: "Hog",
    status: "ej_paborjad",
  },
  {
    title: "Uppdatera beredskapsplan",
    description:
      "Granska och uppdatera den kommunala beredskapsplanen i linje med MSB:s nya rekommendationer och NATO-anpassningen.",
    priority: "Medel",
    status: "pagaende",
  },
  {
    title: "Lamna remissvar pa Digital kommun 2030",
    description:
      "Ta stallning till forslagen i utredningen och formulera ett remissvar. Deadline: 15 mars 2026.",
    priority: "Medel",
    status: "ej_paborjad",
  },
  {
    title: "Planera for klimatanpassningsplan",
    description:
      "Paborja arbetet med den lokala klimatanpassningsplanen som EU-regelverket kraver senast 2027.",
    priority: "Lag",
    status: "ej_paborjad",
  },
];

const archivedBriefings = [
  { date: "2026-02-24", title: "Vecka 9 - Veckobriefing", articles: 14 },
  { date: "2026-02-17", title: "Vecka 8 - Veckobriefing", articles: 11 },
  { date: "2026-02-10", title: "Vecka 7 - Veckobriefing", articles: 9 },
  { date: "2026-02-03", title: "Vecka 6 - Veckobriefing", articles: 16 },
  { date: "2026-01-27", title: "Vecka 5 - Veckobriefing", articles: 12 },
];

const statusLabels: Record<string, string> = {
  ej_paborjad: "Ej paborjad",
  pagaende: "Pagaende",
  klar: "Klar",
};

const statusColors: Record<string, string> = {
  ej_paborjad: "bg-slate-100 text-slate-700 border-slate-200",
  pagaende: "bg-blue-100 text-blue-700 border-blue-200",
  klar: "bg-green-100 text-green-700 border-green-200",
};

const priorityColors: Record<string, string> = {
  Hog: "text-red-600",
  Medel: "text-orange-600",
  Lag: "text-green-600",
};

export default function BriefingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Briefing</h1>
        <p className="text-muted-foreground">
          Sammanfattade insikter och rekommendationer
        </p>
      </div>

      <Tabs defaultValue="senaste">
        <TabsList>
          <TabsTrigger value="senaste">Senaste</TabsTrigger>
          <TabsTrigger value="arkiv">Arkiv</TabsTrigger>
        </TabsList>

        <TabsContent value="senaste" className="mt-6 space-y-6">
          {/* Briefing header */}
          <Card className="border-l-4 border-l-[var(--brand)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[var(--brand)]" />
                <CardTitle>Veckobriefing - Vecka 10</CardTitle>
              </div>
              <CardDescription>
                Genererad 3 mars 2026 &middot; Baserad pa 12 bevakade artiklar
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Veckans viktigaste */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Veckans viktigaste
            </h2>

            <div className="space-y-3">
              {importantItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          item.impact === "KRITISK"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-orange-100 text-orange-700 border-orange-200"
                        }
                      >
                        {item.impact}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-200"
                      >
                        {item.category}
                      </Badge>
                      {item.actionRequired && (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-700 border-amber-200"
                        >
                          Atgard kravs
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Kommande deadlines */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-blue-500" />
              Kommande deadlines
            </h2>

            <Card>
              <CardContent>
                <div className="space-y-4">
                  {deadlines.map((deadline, index) => (
                    <div key={index}>
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <CalendarDays className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{deadline.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {deadline.date}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {deadline.description}
                          </p>
                        </div>
                      </div>
                      {index < deadlines.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Rekommenderade atgarder */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Rekommenderade atgarder
            </h2>

            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-muted">
                        <span className="text-xs font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge
                            variant="outline"
                            className={statusColors[rec.status]}
                          >
                            {statusLabels[rec.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rec.description}
                        </p>
                        <p className="text-xs">
                          Prioritet:{" "}
                          <span
                            className={`font-medium ${priorityColors[rec.priority]}`}
                          >
                            {rec.priority}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="arkiv" className="mt-6 space-y-4">
          <div className="space-y-3">
            {archivedBriefings.map((briefing, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-shadow hover:shadow-md"
              >
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{briefing.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {briefing.date} &middot; {briefing.articles} artiklar
                        analyserade
                      </p>
                    </div>
                    <Badge variant="secondary">{briefing.date}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
