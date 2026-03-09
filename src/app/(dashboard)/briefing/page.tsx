"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  FileText,
  Mail,
  Loader2,
  Inbox,
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
import {
  categoryColors,
  paverkanColors,
  atgardColors,
} from "@/lib/constants";
import {
  fetchLatestBriefing,
  fetchBriefingArchive,
  fetchUrgentArticles,
  type Briefing,
  type Article,
} from "@/lib/data";

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [archive, setArchive] = useState<Briefing[]>([]);
  const [urgentArticles, setUrgentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, a, u] = await Promise.all([
        fetchLatestBriefing(),
        fetchBriefingArchive(10),
        fetchUrgentArticles(5),
      ]);
      setBriefing(b);
      setArchive(a);
      setUrgentArticles(u);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Briefing</h1>
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
          {briefing ? (
            <>
              {/* Briefing header */}
              <Card className="border-l-4 border-l-[var(--brand)]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[var(--brand)]" />
                    <CardTitle>{briefing.title}</CardTitle>
                  </div>
                  <CardDescription>
                    Genererad{" "}
                    {new Date(briefing.generated_at).toLocaleDateString("sv-SE")}{" "}
                    &middot; Baserad på {briefing.article_count} bevakade
                    artiklar
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Briefing content */}
              <Card>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {briefing.content.split("\n\n").map((paragraph, index) => (
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

              {/* Categories covered */}
              {briefing.categories_covered.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {briefing.categories_covered.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className={
                        categoryColors[cat] ||
                        "bg-gray-100 text-gray-700 border-gray-200"
                      }
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="font-medium">Inga briefings genererade ännu</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Briefings skapas automatiskt varje vecka baserat på bevakade
                  artiklar. Den första genereras när artiklar har hämtats.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Urgent articles requiring action */}
          {urgentArticles.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Kräver åtgärd
                </h2>
                <div className="space-y-3">
                  {urgentArticles.map((article) => (
                    <Link key={article.id} href={`/article/${article.id}`}>
                      <Card className="transition-shadow hover:shadow-md cursor-pointer">
                        <CardContent className="space-y-2">
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
                            {article.ai_impact && (
                              <Badge
                                variant="outline"
                                className={
                                  paverkanColors[article.ai_impact] ||
                                  "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {article.ai_impact}
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
                          <h3 className="font-semibold">{article.title}</h3>
                          {article.ai_summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.ai_summary}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Upcoming deadlines — articles with acute timeframe */}
          {urgentArticles.some((a) => a.ai_timeframe === "Akut (0-3 mån)") && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Akuta tidsfrister
                </h2>
                <Card>
                  <CardContent>
                    <div className="space-y-4">
                      {urgentArticles
                        .filter((a) => a.ai_timeframe === "Akut (0-3 mån)")
                        .map((article, index, arr) => (
                          <div key={article.id}>
                            <Link href={`/article/${article.id}`}>
                              <div className="flex items-start gap-4 cursor-pointer hover:bg-muted/30 rounded-lg p-1 -m-1 transition-colors">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                  <CalendarDays className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium">
                                    {article.title}
                                  </h4>
                                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                                    {article.ai_summary || article.summary}
                                  </p>
                                </div>
                              </div>
                            </Link>
                            {index < arr.length - 1 && (
                              <Separator className="mt-4" />
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="arkiv" className="mt-6 space-y-4">
          {archive.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="font-medium">Inget arkiv ännu</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tidigare briefings visas här efterhand.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {archive.map((b) => (
                <Card
                  key={b.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                >
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{b.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(b.generated_at).toLocaleDateString("sv-SE")}{" "}
                          &middot; {b.article_count} artiklar analyserade
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {new Date(b.generated_at).toLocaleDateString("sv-SE")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
