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
  { name: "EU-regelverk", value: 34, color: "#3b82f6" },
  { name: "Teknologiskiften", value: 22, color: "#8b5cf6" },
  { name: "Sakerhetspolitik", value: 18, color: "#64748b" },
  { name: "Nationella reformer", value: 14, color: "#10b981" },
  { name: "Demografi", value: 7, color: "#ec4899" },
  { name: "Klimat", value: 5, color: "#14b8a6" },
];

const frameworkData = [
  { name: "WEF Global Risks", covered: 85, total: 100, color: "#3b82f6" },
  { name: "Kairos Future TAIDA", covered: 72, total: 100, color: "#10b981" },
  { name: "DIGG/eSam", covered: 91, total: 100, color: "#8b5cf6" },
];

const impactData = [
  { name: "V3", kritisk: 1, hog: 3, medel: 3, lag: 1 },
  { name: "V4", kritisk: 2, hog: 4, medel: 4, lag: 2 },
  { name: "V5", kritisk: 1, hog: 5, medel: 6, lag: 3 },
  { name: "V6", kritisk: 2, hog: 3, medel: 4, lag: 2 },
  { name: "V7", kritisk: 0, hog: 3, medel: 4, lag: 2 },
  { name: "V8", kritisk: 3, hog: 4, medel: 5, lag: 2 },
  { name: "V9", kritisk: 2, hog: 6, medel: 7, lag: 3 },
  { name: "V10", kritisk: 1, hog: 4, medel: 5, lag: 2 },
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
      fontSize={12}
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
        <h1 className="text-2xl font-bold tracking-tight">Trender</h1>
        <p className="text-muted-foreground">
          Analys och trender over tid i bevakade kallor
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
            <div className="h-[300px]">
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
            <CardTitle className="text-base">Kategorifordelning</CardTitle>
            <CardDescription>
              Fordelning av artiklar per amnesomrade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">
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
            <CardTitle className="text-base">Ramverkstackning</CardTitle>
            <CardDescription>
              Hur val bevakningens artiklar tacker respektive analysramverk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                    formatter={(value) => [`${value}%`, "Tackning"]}
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
              Paverkansniva over tid
            </CardTitle>
            <CardDescription>
              Fordelning av artiklar per paverkansniva de senaste 8 veckorna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                        kritisk: "Kritisk",
                        hog: "Hog",
                        medel: "Medel",
                        lag: "Lag",
                      };
                      return (
                        <span className="text-xs text-muted-foreground">
                          {labels[value] || value}
                        </span>
                      );
                    }}
                  />
                  <Bar
                    dataKey="kritisk"
                    stackId="a"
                    fill="#ef4444"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="hog"
                    stackId="a"
                    fill="#f97316"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="medel"
                    stackId="a"
                    fill="#eab308"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="lag"
                    stackId="a"
                    fill="#22c55e"
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
