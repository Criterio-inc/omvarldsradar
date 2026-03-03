"use client";

import { useState } from "react";
import { Building2, Users, Bell, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const focusAreas = [
  { id: "styrning-demokrati", label: "Styrning & Demokrati", checked: true },
  { id: "digitalisering-teknik", label: "Digitalisering & Teknik", checked: true },
  { id: "valfard-omsorg", label: "Välfärd & Omsorg", checked: true },
  { id: "utbildning-kompetens", label: "Utbildning & Kompetens", checked: false },
  { id: "klimat-miljo-samhallsbyggnad", label: "Klimat, Miljö & Samhällsbyggnad", checked: true },
  { id: "trygghet-beredskap", label: "Trygghet & Beredskap", checked: true },
  { id: "ekonomi-resurser", label: "Ekonomi & Resurser", checked: false },
  { id: "arbetsgivare-organisation", label: "Arbetsgivare & Organisation", checked: false },
  { id: "samhalle-medborgare", label: "Samhälle & Medborgare", checked: false },
  { id: "innovation-omstallning", label: "Innovation & Omställning", checked: true },
];

const teamMembers = [
  {
    name: "Pär Levander",
    email: "par.levander@critero.se",
    role: "Admin",
    initials: "PL",
  },
  {
    name: "Anna Svensson",
    email: "anna.svensson@critero.se",
    role: "Användare",
    initials: "AS",
  },
  {
    name: "Erik Johansson",
    email: "erik.johansson@kommun.se",
    role: "Användare",
    initials: "EJ",
  },
  {
    name: "Maria Andersson",
    email: "maria.andersson@kommun.se",
    role: "Användare",
    initials: "MA",
  },
];

const roleColors: Record<string, string> = {
  Admin: "bg-blue-100 text-blue-700 border-blue-200",
  "Användare": "bg-slate-100 text-slate-700 border-slate-200",
};

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("Exempelkommun");
  const [orgType, setOrgType] = useState("kommun");
  const [orgSize, setOrgSize] = useState("medel");
  const [areas, setAreas] = useState(focusAreas);
  const [weeklyBriefing, setWeeklyBriefing] = useState(true);
  const [acuteAlerts, setAcuteAlerts] = useState(true);
  const [trendDigest, setTrendDigest] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleArea(id: string) {
    setAreas((prev) =>
      prev.map((area) =>
        area.id === id ? { ...area, checked: !area.checked } : area
      )
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inställningar</h1>
        <p className="text-muted-foreground">
          Hantera din organisation, team och notifieringar
        </p>
      </div>

      <Tabs defaultValue="profil">
        <TabsList>
          <TabsTrigger value="profil">
            <Building2 className="mr-1.5 h-4 w-4" />
            Kommunprofil
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-1.5 h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifieringar">
            <Bell className="mr-1.5 h-4 w-4" />
            Notifieringar
          </TabsTrigger>
        </TabsList>

        {/* Kommunprofil */}
        <TabsContent value="profil" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organisationsinformation</CardTitle>
              <CardDescription>
                Grundläggande information om din organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Organisationsnamn
                  </label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Organisationstyp
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                  >
                    <option value="kommun">Kommun</option>
                    <option value="region">Region</option>
                    <option value="myndighet">Myndighet</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Storlek
                </label>
                <select
                  className="h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                  value={orgSize}
                  onChange={(e) => setOrgSize(e.target.value)}
                >
                  <option value="liten">Liten (under 15 000 invånare)</option>
                  <option value="medel">
                    Medel (15 000 - 50 000 invånare)
                  </option>
                  <option value="stor">Stor (över 50 000 invånare)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fokusområden</CardTitle>
              <CardDescription>
                Välj vilka ämnesområden som är mest relevanta för din
                organisation. Bevakningsresultaten anpassas efter dina val.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((area) => (
                  <label
                    key={area.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={area.checked}
                      onChange={() => toggleArea(area.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)] accent-[var(--brand)]"
                    />
                    <span className="text-sm font-medium">{area.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
            >
              <Save className="mr-1.5 h-4 w-4" />
              Spara ändringar
            </Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                Ändringarna har sparats
              </span>
            )}
          </div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teammedlemmar</CardTitle>
              <CardDescription>
                Hantera vilka som har tillgång till OmvärldsRadar i din
                organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-[var(--brand)] text-xs text-white">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <Badge variant="outline" className={roleColors[member.role]}>
                        {member.role}
                      </Badge>
                    </div>
                    {index < teamMembers.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bjud in teammedlem</CardTitle>
              <CardDescription>
                Skicka en inbjudan till en ny användare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="e-post@kommun.se"
                  className="max-w-sm"
                />
                <Button
                  className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
                >
                  Bjud in
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifieringar */}
        <TabsContent value="notifieringar" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                E-postnotifieringar
              </CardTitle>
              <CardDescription>
                Välj vilka notifieringar du vill få via e-post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Veckobriefing</p>
                  <p className="text-sm text-muted-foreground">
                    En sammanfattning av veckans viktigaste omvärldsförändringar
                    varje måndag morgon
                  </p>
                </div>
                <button
                  onClick={() => setWeeklyBriefing(!weeklyBriefing)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    weeklyBriefing ? "bg-[var(--brand)]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      weeklyBriefing ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Akuta varningar</p>
                  <p className="text-sm text-muted-foreground">
                    Omedelbar notifiering vid kritiska förändringar som påverkar
                    din kommun direkt
                  </p>
                </div>
                <button
                  onClick={() => setAcuteAlerts(!acuteAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    acuteAlerts ? "bg-[var(--brand)]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      acuteAlerts ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Trendsammanfattning</p>
                  <p className="text-sm text-muted-foreground">
                    En månadsvis översikt över trender och utvecklingar i dina
                    bevakningsområden
                  </p>
                </div>
                <button
                  onClick={() => setTrendDigest(!trendDigest)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    trendDigest ? "bg-[var(--brand)]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      trendDigest ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
            >
              <Save className="mr-1.5 h-4 w-4" />
              Spara inställningar
            </Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                Inställningarna har sparats
              </span>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
