"use client";

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

const weeklyData = [
  { week: "V3", articles: 8 },
  { week: "V4", articles: 12 },
  { week: "V5", articles: 15 },
  { week: "V6", articles: 11 },
  { week: "V7", articles: 9 },
  { week: "V8", articles: 14 },
  { week: "V9", articles: 18 },
  { week: "V10", articles: 12 },
];

const categoryData = [
  { name: "Styrning & Demokrati", value: 18, color: "#3b82f6" },
  { name: "Digitalisering & Teknik", value: 22, color: "#8b5cf6" },
  { name: "Välfärd & Omsorg", value: 8, color: "#ec4899" },
  { name: "Utbildning & Kompetens", value: 5, color: "#6366f1" },
  { name: "Klimat, Miljö & Samh.", value: 12, color: "#14b8a6" },
  { name: "Trygghet & Beredskap", value: 14, color: "#64748b" },
  { name: "Ekonomi & Resurser", value: 9, color: "#f59e0b" },
  { name: "Arbetsgivare & Org.", value: 4, color: "#f97316" },
  { name: "Samhälle & Medborgare", value: 5, color: "#10b981" },
  { name: "Innovation & Omst.", value: 3, color: "#06b6d4" },
];

const frameworkData = [
  { name: "WEF Global Risks", covered: 85, total: 100, color: "#3b82f6" },
  { name: "Kairos Future TAIDA", covered: 72, total: 100, color: "#10b981" },
  { name: "DIGG/eSam", covered: 91, total: 100, color: "#8b5cf6" },
];

const impactData = [
  { name: "V3", direkt: 2, indirekt: 3, mojlighet: 2, risk: 1 },
  { name: "V4", direkt: 3, indirekt: 4, mojlighet: 3, risk: 2 },
  { name: "V5", direkt: 2, indirekt: 5, mojlighet: 5, risk: 3 },
  { name: "V6", direkt: 3, indirekt: 3, mojlighet: 3, risk: 2 },
  { name: "V7", direkt: 1, indirekt: 3, mojlighet: 3, risk: 2 },
  { name: "V8", direkt: 4, indirekt: 4, mojlighet: 4, risk: 2 },
  { name: "V9", direkt: 3, indirekt: 6, mojlighet: 6, risk: 3 },
  { name: "V10", direkt: 2, indirekt: 4, mojlighet: 4, risk: 2 },
];

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Trender</h1>
        <p className="text-muted-foreground">
          Analys och trender över tid i bevakade källor
        </p>
      </div>

      {/* Top row: Area chart + Pie chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Articles per week */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Artiklar per vecka</CardTitle>
            <CardDescription>Senaste 8 veckorna</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyData}
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
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
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
                      <stop offset="5%" stopColor="#1e6b8a" stopOpacity={0.3} />
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

        {/* Category distribution pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kategorifördelning</CardTitle>
            <CardDescription>
              Fördelning av artiklar per ämnesområde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={110}
                    dataKey="value"
                    stroke="white"
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [`${value}%`, "Andel"]}
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
      </div>

      {/* Bottom row: Framework coverage + Impact over time */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Framework coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ramverkstäckning</CardTitle>
            <CardDescription>
              Hur väl bevakningens artiklar täcker respektive analysramverk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={frameworkData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [`${value}%`, "Täckning"]}
                  />
                  <Bar dataKey="covered" radius={[4, 4, 0, 0]} barSize={48}>
                    {frameworkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Impact levels over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Påverkanstyp över tid
            </CardTitle>
            <CardDescription>
              Fördelning av artiklar per påverkanstyp de senaste 8 veckorna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={impactData}
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
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
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
      </div>
    </div>
  );
}
