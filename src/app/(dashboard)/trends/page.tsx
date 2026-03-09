"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  fetchTrendData,
  type TrendWeekly,
  type TrendCategory,
  type TrendImpact,
} from "@/lib/data";

const RADIAN = Math.PI / 180;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCustomizedLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function TrendsPage() {
  const [weekly, setWeekly] = useState<TrendWeekly[]>([]);
  const [categories, setCategories] = useState<TrendCategory[]>([]);
  const [impact, setImpact] = useState<TrendImpact[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTrendData();
      setWeekly(data.weekly);
      setCategories(data.categories);
      setImpact(data.impact);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasData = weekly.length > 0 || categories.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Trender</h1>
        <p className="text-muted-foreground">
          Analys och trender över tid i bevakade källor
        </p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="font-medium">Inga trenddata ännu</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Trender visas automatiskt när artiklar har hämtats och
              analyserats.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top row: Area chart + Pie chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Articles per week */}
            {weekly.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Artiklar per vecka
                  </CardTitle>
                  <CardDescription>
                    Senaste {weekly.length} veckorna
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={weekly}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="week"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "13px",
                          }}
                          formatter={(value) => [value, "Artiklar"]}
                        />
                        <defs>
                          <linearGradient
                            id="colorArticles"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#1e6b8a"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#1e6b8a"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="articles"
                          stroke="#1e6b8a"
                          strokeWidth={2}
                          fill="url(#colorArticles)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category distribution pie chart */}
            {categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Kategorifördelning
                  </CardTitle>
                  <CardDescription>
                    Fördelning av artiklar per ämnesområde
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={110}
                          dataKey="value"
                          stroke="white"
                          strokeWidth={2}
                        >
                          {categories.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "13px",
                          }}
                          formatter={(value) => [value, "Artiklar"]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={56}
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => (
                            <span className="text-[10px] text-muted-foreground">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Impact levels over time */}
          {impact.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Påverkanstyp över tid
                </CardTitle>
                <CardDescription>
                  Fördelning av artiklar per påverkanstyp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={impact}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "13px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => {
                          const labels: Record<string, string> = {
                            direkt: "Direkt reglering",
                            indirekt: "Indirekt påverkan",
                            mojlighet: "Möjlighet",
                            risk: "Risk/hot",
                          };
                          return (
                            <span className="text-xs text-muted-foreground">
                              {labels[value] || value}
                            </span>
                          );
                        }}
                      />
                      <Bar
                        dataKey="direkt"
                        stackId="a"
                        fill="#ef4444"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="indirekt"
                        stackId="a"
                        fill="#f97316"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="mojlighet"
                        stackId="a"
                        fill="#22c55e"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="risk"
                        stackId="a"
                        fill="#e11d48"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
