"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  Plus,
  X,
  Loader2,
  Inbox,
  Search,
  TrendingUp,
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  koladaCategories,
  koladaCategoryColors,
  chartColors,
} from "@/lib/constants";

interface Municipality {
  code: string;
  name: string;
  type: string;
}

interface KPI {
  id: string;
  title: string;
  description: string | null;
  category: string;
  unit: string | null;
}

interface DataPoint {
  kpi_id: string;
  municipality_code: string;
  year: number;
  value: number | null;
}

// Kolada-data ligger typiskt 1-2 år efter. Senaste tillgängliga: ~2024
const LATEST_KOLADA_YEAR = new Date().getFullYear() - 1;
const DEFAULT_TREND_YEARS = Array.from(
  { length: 6 },
  (_, i) => LATEST_KOLADA_YEAR - 5 + i
);
// Tillgängliga år att välja från (2015 → senaste)
const AVAILABLE_YEARS = Array.from(
  { length: LATEST_KOLADA_YEAR - 2015 + 1 },
  (_, i) => 2015 + i
);

export default function JamforPage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<Municipality[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [kpiData, setKpiData] = useState<Record<string, DataPoint[]>>({});
  const [activeCategory, setActiveCategory] = useState("Ekonomi");
  const [yearFrom, setYearFrom] = useState(DEFAULT_TREND_YEARS[0]);
  const [yearTo, setYearTo] = useState(DEFAULT_TREND_YEARS[DEFAULT_TREND_YEARS.length - 1]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Ladda kommuner
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/kolada?action=municipalities");
        if (res.ok) {
          const json = await res.json();
          setMunicipalities(json.data || []);
        }
      } catch (err) {
        console.error("Kunde inte ladda kommuner:", err);
      } finally {
        setLoadingMunicipalities(false);
      }
    }
    load();
  }, []);

  // Ladda KPI:er för aktiv kategori
  useEffect(() => {
    async function load() {
      setLoadingKpis(true);
      try {
        const res = await fetch(
          `/api/kolada?action=kpis&category=${encodeURIComponent(activeCategory)}`
        );
        if (res.ok) {
          const json = await res.json();
          setKpis(json.data || []);
        }
      } catch (err) {
        console.error("Kunde inte ladda KPI:er:", err);
      } finally {
        setLoadingKpis(false);
      }
    }
    load();
  }, [activeCategory]);

  // Beräkna aktiva år baserat på val
  const selectedYears = Array.from(
    { length: yearTo - yearFrom + 1 },
    (_, i) => yearFrom + i
  );

  // Ladda data för valda kommuner + aktiva KPI:er + valda år
  const loadKpiData = useCallback(async () => {
    if (selectedMunicipalities.length === 0 || kpis.length === 0) {
      setKpiData({});
      return;
    }

    setLoadingData(true);
    const munCodes = selectedMunicipalities.map((m) => m.code).join(",");
    const years = selectedYears.join(",");
    const newData: Record<string, DataPoint[]> = {};

    try {
      // Hämta data för alla KPI:er parallellt
      await Promise.all(
        kpis.map(async (kpi) => {
          const res = await fetch(
            `/api/kolada?action=data&kpi=${kpi.id}&municipalities=${munCodes}&years=${years}`
          );
          if (res.ok) {
            const json = await res.json();
            newData[kpi.id] = json.data || [];
          }
        })
      );
      setKpiData(newData);
    } catch (err) {
      console.error("Kunde inte ladda KPI-data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [selectedMunicipalities, kpis, selectedYears.join(",")]);

  useEffect(() => {
    loadKpiData();
  }, [loadKpiData]);

  // Sökfilter
  const filteredMunicipalities = municipalities
    .filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedMunicipalities.some((s) => s.code === m.code)
    )
    .slice(0, 10);

  function addMunicipality(m: Municipality) {
    if (selectedMunicipalities.length >= 5) return;
    setSelectedMunicipalities([...selectedMunicipalities, m]);
    setSearchTerm("");
    setShowSearch(false);
  }

  function removeMunicipality(code: string) {
    setSelectedMunicipalities(
      selectedMunicipalities.filter((m) => m.code !== code)
    );
  }

  // Förbered stapeldiagram-data (senaste valda året)
  function getBarData(kpiId: string) {
    const points = kpiData[kpiId] || [];
    const latestYear = yearTo;
    return selectedMunicipalities
      .map((m) => {
        const point = points.find(
          (p) => p.municipality_code === m.code && p.year === latestYear
        );
        return {
          name: m.name,
          value: point?.value ?? null,
        };
      })
      .filter((d) => d.value !== null);
  }

  // Förbered linjediagram-data (trend över valda år)
  function getTrendData(kpiId: string) {
    const points = kpiData[kpiId] || [];
    return selectedYears.map((year) => {
      const row: Record<string, number | string | null> = { year: year.toString() };
      selectedMunicipalities.forEach((m) => {
        const point = points.find(
          (p) => p.municipality_code === m.code && p.year === year
        );
        row[m.name] = point?.value ?? null;
      });
      return row;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Jämför kommuner
        </h1>
        <p className="text-muted-foreground">
          Jämför nyckeltal mellan kommuner och regioner med data från Kolada.se
        </p>
      </div>

      {/* Kommun-väljare */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">
              Valda kommuner:
            </span>
            {selectedMunicipalities.map((m, i) => (
              <Badge
                key={m.code}
                className="gap-1 px-3 py-1 text-sm"
                style={{
                  backgroundColor: `${chartColors[i]}20`,
                  color: chartColors[i],
                  borderColor: `${chartColors[i]}40`,
                }}
                variant="outline"
              >
                {m.name}
                {m.type === "L" && " (region)"}
                <button
                  onClick={() => removeMunicipality(m.code)}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedMunicipalities.length < 5 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Lägg till
                </Button>
                {showSearch && (
                  <div className="absolute top-full left-0 mt-1 w-72 rounded-lg border bg-popover p-2 shadow-lg z-50">
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Sök kommun..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 pl-7 text-sm"
                        autoFocus
                      />
                    </div>
                    {loadingMunicipalities ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {filteredMunicipalities.length === 0 ? (
                          <p className="py-2 text-center text-xs text-muted-foreground">
                            {searchTerm
                              ? "Inga resultat"
                              : "Skriv för att söka"}
                          </p>
                        ) : (
                          filteredMunicipalities.map((m) => (
                            <button
                              key={m.code}
                              onClick={() => addMunicipality(m)}
                              className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                            >
                              <span>{m.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {m.type === "K" ? "Kommun" : "Region"}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedMunicipalities.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Lägg till minst en kommun för att börja jämföra nyckeltal.
            </p>
          )}

          {/* Årtalsval */}
          {selectedMunicipalities.length > 0 && (
            <div className="flex items-center gap-3 pt-2 border-t">
              <span className="text-sm font-medium text-muted-foreground">Period:</span>
              <select
                value={yearFrom}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setYearFrom(v);
                  if (v > yearTo) setYearTo(v);
                }}
                className="h-8 rounded-md border bg-background px-2 text-sm"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">—</span>
              <select
                value={yearTo}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setYearTo(v);
                  if (v < yearFrom) setYearFrom(v);
                }}
                className="h-8 rounded-md border bg-background px-2 text-sm"
              >
                {AVAILABLE_YEARS.filter((y) => y >= yearFrom).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                ({selectedYears.length} år)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI-kategorier */}
      {selectedMunicipalities.length > 0 && (
        <>
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
          >
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              {koladaCategories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {koladaCategories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-6">
                {loadingKpis ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : kpis.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Inbox className="mb-3 h-8 w-8 text-muted-foreground/50" />
                      <p className="font-medium">Inga KPI:er för {cat}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        KPI-definitioner behöver laddas in. Kör seed-kolada-kpis.sql i Supabase.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {kpis.map((kpi) => {
                      const barData = getBarData(kpi.id);
                      const trendData = getTrendData(kpi.id);
                      const hasData = barData.length > 0;

                      return (
                        <Card key={kpi.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-sm font-semibold">
                                  {kpi.title}
                                </CardTitle>
                                {kpi.description && (
                                  <CardDescription className="text-xs mt-0.5">
                                    {kpi.description}
                                  </CardDescription>
                                )}
                              </div>
                              {kpi.unit && (
                                <Badge variant="secondary" className="text-[10px] shrink-0">
                                  {kpi.unit}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {loadingData ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            ) : !hasData ? (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <BarChart3 className="mb-2 h-6 w-6 text-muted-foreground/30" />
                                <p className="text-xs text-muted-foreground">
                                  Ingen data tillgänglig
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Stapeldiagram — senaste året */}
                                <div className="h-[180px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                      <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(var(--border))"
                                      />
                                      <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        stroke="hsl(var(--muted-foreground))"
                                      />
                                      <YAxis
                                        tick={{ fontSize: 11 }}
                                        stroke="hsl(var(--muted-foreground))"
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: "hsl(var(--popover))",
                                          border: "1px solid hsl(var(--border))",
                                          borderRadius: "8px",
                                          fontSize: "12px",
                                        }}
                                      />
                                      <Bar
                                        dataKey="value"
                                        name={kpi.title}
                                        radius={[4, 4, 0, 0]}
                                      >
                                        {barData.map((entry, idx) => (
                                          <Cell
                                            key={idx}
                                            fill={
                                              chartColors[
                                                selectedMunicipalities.findIndex(
                                                  (m) => m.name === entry.name
                                                )
                                              ] || chartColors[0]
                                            }
                                          />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>

                                {/* Linjediagram — trend */}
                                <div>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium">
                                      Trend {yearFrom}–{yearTo}
                                    </span>
                                  </div>
                                  <div className="h-[160px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={trendData}>
                                        <CartesianGrid
                                          strokeDasharray="3 3"
                                          stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                          dataKey="year"
                                          tick={{ fontSize: 11 }}
                                          stroke="hsl(var(--muted-foreground))"
                                        />
                                        <YAxis
                                          tick={{ fontSize: 11 }}
                                          stroke="hsl(var(--muted-foreground))"
                                        />
                                        <Tooltip
                                          contentStyle={{
                                            backgroundColor: "hsl(var(--popover))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                          }}
                                        />
                                        <Legend
                                          iconSize={8}
                                          wrapperStyle={{ fontSize: "11px" }}
                                        />
                                        {selectedMunicipalities.map((m, i) => (
                                          <Line
                                            key={m.code}
                                            type="monotone"
                                            dataKey={m.name}
                                            stroke={chartColors[i]}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            connectNulls
                                          />
                                        ))}
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Info-fotnot */}
          <p className="text-xs text-muted-foreground italic text-center">
            Data hämtas från{" "}
            <a
              href="https://www.kolada.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand)] hover:underline"
            >
              Kolada.se
            </a>{" "}
            — Kommun- och regiondatabasen. Uppdateras automatiskt med 7 dagars cache.
          </p>
        </>
      )}
    </div>
  );
}
