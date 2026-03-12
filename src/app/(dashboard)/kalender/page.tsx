"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  Loader2,
  Inbox,
  List,
  LayoutGrid,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  categoryColors,
  atgardColors,
} from "@/lib/constants";
import {
  fetchCalendarArticles,
  type CalendarArticle,
} from "@/lib/data";

const urgencyConfig: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string; icon: typeof AlertTriangle }
> = {
  akut: {
    label: "Akut (0-3 mån)",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-l-red-500",
    icon: AlertTriangle,
  },
  kort: {
    label: "Kort sikt (3-12 mån)",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-l-orange-500",
    icon: Clock,
  },
  medel: {
    label: "Medellång sikt (1-3 år)",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-l-blue-500",
    icon: CalendarClock,
  },
  lang: {
    label: "Lång sikt (3+ år)",
    color: "text-slate-700 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-l-slate-400",
    icon: CalendarClock,
  },
};

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Förfallen";
  if (diffDays === 0) return "Idag";
  if (diffDays === 1) return "Imorgon";
  if (diffDays < 7) return `Om ${diffDays} dagar`;
  if (diffDays < 30) return `Om ${Math.ceil(diffDays / 7)} veckor`;
  if (diffDays < 365) return `Om ${Math.ceil(diffDays / 30)} månader`;
  return `Om ${Math.round(diffDays / 365 * 10) / 10} år`;
}

export default function KalenderPage() {
  const [articles, setArticles] = useState<CalendarArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCalendarArticles();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda kalenderdata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Gruppera efter urgency
  const grouped = articles.reduce<Record<string, CalendarArticle[]>>((acc, article) => {
    const key = article.urgency;
    if (!acc[key]) acc[key] = [];
    acc[key].push(article);
    return acc;
  }, {});

  const urgencyOrder = ["akut", "kort", "medel", "lang"];

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
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Regelverkskalender
        </h1>
        <p className="text-muted-foreground">
          Kommande deadlines och åtgärder sorterade efter tidshorisont
        </p>
      </div>

      {/* Sammanfattningskort */}
      <div className="grid gap-3 sm:grid-cols-4">
        {urgencyOrder.map((key) => {
          const config = urgencyConfig[key];
          const count = grouped[key]?.length ?? 0;
          return (
            <Card key={key} className={`border-l-4 ${config.borderColor}`}>
              <CardContent className="flex items-center gap-3 py-3">
                <config.icon className={`h-5 w-5 ${config.color}`} />
                <div>
                  <p className="text-2xl font-bold tabular-nums">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="font-medium">Inga kommande deadlines</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Artiklar med åtgärdskrav och tidshorisonter visas här när de har hämtats och analyserats.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="tidslinje">
          <TabsList>
            <TabsTrigger value="tidslinje" className="gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              Tidslinje
            </TabsTrigger>
            <TabsTrigger value="lista" className="gap-1.5">
              <List className="h-3.5 w-3.5" />
              Lista
            </TabsTrigger>
          </TabsList>

          {/* Tidslinje-vy */}
          <TabsContent value="tidslinje" className="mt-6">
            <div className="space-y-8">
              {urgencyOrder.map((key) => {
                const items = grouped[key];
                if (!items?.length) return null;
                const config = urgencyConfig[key];

                return (
                  <div key={key}>
                    {/* Sektionsrubrik */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor}`}>
                        <config.icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <h2 className="font-semibold">{config.label}</h2>
                        <p className="text-xs text-muted-foreground">
                          {items.length} {items.length === 1 ? "artikel" : "artiklar"}
                        </p>
                      </div>
                    </div>

                    {/* Tidslinje-element */}
                    <div className="relative ml-4 border-l-2 border-muted pl-6 space-y-4">
                      {items.map((article) => (
                        <div key={article.id} className="relative">
                          {/* Tidslinjepunkt */}
                          <div
                            className={`absolute -left-[31px] top-2 h-4 w-4 rounded-full border-2 border-background ${
                              key === "akut"
                                ? "bg-red-500"
                                : key === "kort"
                                ? "bg-orange-500"
                                : key === "medel"
                                ? "bg-blue-500"
                                : "bg-slate-400"
                            }`}
                          />

                          <Link href={`/article/${article.id}`}>
                            <Card className="transition-shadow hover:shadow-md cursor-pointer">
                              <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {article.ai_category && (
                                      <Badge
                                        variant="outline"
                                        className={
                                          categoryColors[article.ai_category] ||
                                          "bg-gray-100 text-gray-700 border-gray-200"
                                        }
                                      >
                                        {article.ai_category}
                                      </Badge>
                                    )}
                                    {article.ai_action && (
                                      <Badge
                                        variant="outline"
                                        className={
                                          atgardColors[article.ai_action] ||
                                          "bg-gray-100 text-gray-700 border-gray-200"
                                        }
                                      >
                                        {article.ai_action}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className={`text-xs font-medium ${config.color}`}>
                                    {formatDeadline(article.estimated_deadline)}
                                  </span>
                                </div>

                                <h3 className="font-semibold leading-snug">
                                  {article.title}
                                </h3>

                                {(article.ai_summary || article.summary) && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {article.ai_summary || article.summary}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{article.source_name}</span>
                                  <span>&middot;</span>
                                  <span>
                                    Deadline:{" "}
                                    {new Date(article.estimated_deadline).toLocaleDateString("sv-SE")}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Lista-vy */}
          <TabsContent value="lista" className="mt-6">
            <div className="space-y-6">
              {urgencyOrder.map((key) => {
                const items = grouped[key];
                if (!items?.length) return null;
                const config = urgencyConfig[key];

                return (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-3">
                      <config.icon className={`h-4 w-4 ${config.color}`} />
                      <h2 className="font-semibold text-sm">{config.label}</h2>
                      <Badge variant="secondary" className="text-xs">
                        {items.length}
                      </Badge>
                    </div>

                    <Card>
                      <CardContent className="divide-y">
                        {items.map((article) => (
                          <Link
                            key={article.id}
                            href={`/article/${article.id}`}
                            className="flex items-start gap-4 py-3 first:pt-0 last:pb-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                          >
                            <div
                              className={`mt-1 h-3 w-3 rounded-full shrink-0 ${
                                key === "akut"
                                  ? "bg-red-500"
                                  : key === "kort"
                                  ? "bg-orange-500"
                                  : key === "medel"
                                  ? "bg-blue-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-sm line-clamp-1">
                                  {article.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                <span>{article.source_name}</span>
                                <span>&middot;</span>
                                <span>{formatDeadline(article.estimated_deadline)}</span>
                                {article.ai_category && (
                                  <>
                                    <span>&middot;</span>
                                    <span>{article.ai_category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {article.ai_action && (
                              <Badge
                                variant="outline"
                                className={`shrink-0 text-xs ${
                                  atgardColors[article.ai_action] ||
                                  "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {article.ai_action}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
