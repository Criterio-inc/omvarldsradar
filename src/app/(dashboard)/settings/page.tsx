"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Bell,
  Save,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Calendar,
  Lightbulb,
  Mail,
  Clock,
  Zap,
} from "lucide-react";
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
import { roleColors } from "@/lib/constants";

const focusAreas = [
  { id: "styrning-demokrati", label: "Styrning & Demokrati" },
  { id: "digitalisering-teknik", label: "Digitalisering & Teknik" },
  { id: "valfard-omsorg", label: "Välfärd & Omsorg" },
  { id: "utbildning-kompetens", label: "Utbildning & Kompetens" },
  { id: "klimat-miljo-samhallsbyggnad", label: "Klimat, Miljö & Samhällsbyggnad" },
  { id: "trygghet-beredskap", label: "Trygghet & Beredskap" },
  { id: "ekonomi-resurser", label: "Ekonomi & Resurser" },
  { id: "arbetsgivare-organisation", label: "Arbetsgivare & Organisation" },
  { id: "samhalle-medborgare", label: "Samhälle & Medborgare" },
  { id: "innovation-omstallning", label: "Innovation & Omställning" },
];

const actionLevelOptions = [
  {
    id: "Agera nu",
    label: "Agera nu",
    icon: AlertTriangle,
    color: "text-red-600",
    description: "Kritiska förändringar som kräver omedelbar uppmärksamhet — t.ex. nya EU-regler med kort implementeringstid",
  },
  {
    id: "Planera",
    label: "Planera",
    icon: Calendar,
    color: "text-amber-600",
    description: "Kommande förändringar som behöver planering — t.ex. lagändringar som träder i kraft inom 6-12 månader",
  },
  {
    id: "Bevaka",
    label: "Bevaka",
    icon: Eye,
    color: "text-blue-600",
    description: "Utvecklingar att följa och bevaka löpande — t.ex. pågående utredningar eller trender",
  },
  {
    id: "Inspireras",
    label: "Inspireras",
    icon: Lightbulb,
    color: "text-green-600",
    description: "Goda exempel och innovation — t.ex. framgångsrika kommunala projekt eller internationella förebilder",
  },
];

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

function getInitials(name: string, email: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

export default function SettingsPage() {
  // --- Organisation state ---
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("municipality");
  const [orgSize, setOrgSize] = useState("medel");
  const [orgLoading, setOrgLoading] = useState(true);

  // --- Team state ---
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  // --- Focus areas state ---
  const [areas, setAreas] = useState(
    focusAreas.map((a) => ({ ...a, checked: false }))
  );

  // --- Notification state ---
  const [weeklyBriefing, setWeeklyBriefing] = useState(true);
  const [acuteAlerts, setAcuteAlerts] = useState(true);
  const [trendDigest, setTrendDigest] = useState(false);
  const [actionLevels, setActionLevels] = useState<string[]>(["Agera nu", "Bevaka"]);
  const [prefsLoading, setPrefsLoading] = useState(true);

  // --- Save state ---
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load organization data
  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch("/api/settings/org");
        if (res.ok) {
          const data = await res.json();
          if (data.org) {
            setOrgName(data.org.name || "");
            setOrgType(data.org.type || "kommun");
            setOrgSize(data.org.size || "medel");
          }
        }
      } catch {
        // silently fail
      } finally {
        setOrgLoading(false);
      }
    }
    loadOrg();
  }, []);

  // Load notification preferences + focus areas
  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch("/api/notifications/preferences");
        if (res.ok) {
          const data = await res.json();
          const prefs = data.preferences;
          if (prefs) {
            setWeeklyBriefing(prefs.weekly_briefing ?? true);
            setAcuteAlerts(prefs.acute_alerts ?? true);
            setTrendDigest(prefs.trend_digest ?? false);

            // Ladda fokusområden från DB
            const savedCategories: string[] = prefs.categories ?? [];
            if (savedCategories.length > 0) {
              setAreas(
                focusAreas.map((a) => ({
                  ...a,
                  checked: savedCategories.includes(a.label),
                }))
              );
            } else {
              // Default: alla utom de 4 sista
              setAreas(
                focusAreas.map((a, i) => ({
                  ...a,
                  checked: i < 3 || i === 4 || i === 5 || i === 9,
                }))
              );
            }

            // Ladda action levels
            const savedLevels: string[] = prefs.action_levels ?? ["Agera nu", "Bevaka"];
            setActionLevels(savedLevels);
          }
        }
      } catch {
        // silently fail
      } finally {
        setPrefsLoading(false);
      }
    }
    loadPrefs();
  }, []);

  // Load team
  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.users || []);
      }
    } catch {
      // silently fail — user may not be admin
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  function toggleArea(id: string) {
    setAreas((prev) =>
      prev.map((area) =>
        area.id === id ? { ...area, checked: !area.checked } : area
      )
    );
  }

  function toggleActionLevel(levelId: string) {
    setActionLevels((prev) =>
      prev.includes(levelId)
        ? prev.filter((l) => l !== levelId)
        : [...prev, levelId]
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      // Spara notifieringar + fokusområden + action levels
      const prefsRes = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            enabled: weeklyBriefing || acuteAlerts || trendDigest,
            email_frequency: weeklyBriefing ? "weekly" : "none",
            weekly_briefing: weeklyBriefing,
            acute_alerts: acuteAlerts,
            trend_digest: trendDigest,
            categories: areas.filter((a) => a.checked).map((a) => a.label),
            action_levels: actionLevels,
          },
        }),
      });

      if (!prefsRes.ok) {
        const errData = await prefsRes.json().catch(() => ({}));
        console.error("[Settings] Prefs save failed:", errData);
        setSaveError(`Kunde inte spara inställningar: ${errData.error || prefsRes.statusText}`);
        return;
      }

      // Spara organisationsdata (kan misslyckas om ingen org kopplad — det är OK)
      try {
        const orgRes = await fetch("/api/settings/org", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: orgName,
            type: orgType,
            size: orgSize,
          }),
        });
        if (!orgRes.ok) {
          console.warn("[Settings] Org save skipped (no org linked)");
        }
      } catch {
        // Org-save kan misslyckas om ingen org kopplad — stör inte prefs-save
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[Settings] Save error:", err);
      setSaveError("Ett oväntat fel uppstod vid sparning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Inställningar</h1>
        <p className="text-muted-foreground">
          Hantera din organisation, bevakningsprofil och notifieringar
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
              {orgLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Organisationsnamn
                      </label>
                      <Input
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="T.ex. Sundsvalls kommun"
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
                        <option value="municipality">Kommun</option>
                        <option value="region">Region</option>
                        <option value="government_agency">Myndighet</option>
                        <option value="other">Annat / Företag</option>
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
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fokusområden</CardTitle>
              <CardDescription>
                Välj vilka ämnesområden som är mest relevanta för din
                organisation. Bevakningsresultaten och dina notifieringar anpassas efter dina val.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prefsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
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
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                      />
                      <span className="text-sm font-medium">{area.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Åtgärdsnivåer</CardTitle>
              <CardDescription>
                Välj vilka typer av åtgärder du vill se och bli notifierad om.
                Artiklarna i ditt flöde prioriteras efter dina val.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prefsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {actionLevelOptions.map((level) => {
                    const Icon = level.icon;
                    const isSelected = actionLevels.includes(level.id);
                    return (
                      <label
                        key={level.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                          isSelected
                            ? "border-primary/50 bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleActionLevel(level.id)}
                          className="mt-0.5 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${level.color}`} />
                            <span className="text-sm font-medium">{level.label}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {level.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Spara ändringar
            </Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                Ändringarna har sparats
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-600 font-medium">
                {saveError}
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
                Användare som har tillgång till OmvärldsRadar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : teamMembers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Inga teammedlemmar hittade
                </p>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={member.id}>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                            {getInitials(member.full_name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {member.full_name || member.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            roleColors[member.role] ||
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }
                        >
                          {member.role === "admin" ? "Admin" : "Användare"}
                        </Badge>
                      </div>
                      {index < teamMembers.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <p className="text-sm text-muted-foreground">
                Använd adminsidan för att bjuda in och hantera användare
              </p>
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  Gå till Admin
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifieringar */}
        <TabsContent value="notifieringar" className="mt-6 space-y-6">
          {/* Förklaring */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-start gap-3 pt-5">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Veckobriefing</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    AI-sammanfattning av veckans viktigaste omvärldsförändringar.
                    Skickas varje måndag morgon.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
              <CardContent className="flex items-start gap-3 pt-5">
                <Zap className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Akuta larm</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Omedelbar e-post när artiklar med &ldquo;Agera nu&rdquo; publiceras
                    inom dina fokusområden.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
              <CardContent className="flex items-start gap-3 pt-5">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Trenddigest</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Månatlig sammanfattning av trender och mönster i dina
                    bevakningsområden. Kommande funktion.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

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
              {prefsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Veckobriefing</p>
                      <p className="text-sm text-muted-foreground">
                        AI-sammanfattning varje måndag morgon
                      </p>
                    </div>
                    <button
                      onClick={() => setWeeklyBriefing(!weeklyBriefing)}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                        weeklyBriefing ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          weeklyBriefing ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Akuta varningar</p>
                      <p className="text-sm text-muted-foreground">
                        Omedelbar e-post vid &ldquo;Agera nu&rdquo;-artiklar i dina fokusområden
                      </p>
                    </div>
                    <button
                      onClick={() => setAcuteAlerts(!acuteAlerts)}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                        acuteAlerts ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          acuteAlerts ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Trendsammanfattning</p>
                        <Badge variant="outline" className="text-xs">Kommande</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Månadsvis översikt av trender (aktiveras snart)
                      </p>
                    </div>
                    <button
                      onClick={() => setTrendDigest(!trendDigest)}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                        trendDigest ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          trendDigest ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || prefsLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Spara inställningar
            </Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                Inställningarna har sparats
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-600 font-medium">
                {saveError}
              </span>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
