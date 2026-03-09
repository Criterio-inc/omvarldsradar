"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  CalendarDays,
  Sparkles,
  Loader2,
  FileQuestion,
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
import { Separator } from "@/components/ui/separator";
import {
  categoryColors,
  paverkanColors,
  atgardColors,
  tidshorisontColors,
} from "@/lib/constants";
import { fetchArticleById, type Article } from "@/lib/data";

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<(Article & { source_url?: string; content?: string; ai_consequences?: string; ai_recommended_actions?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const id = params.id as string;
      const data = await fetchArticleById(id);
      setArticle(data as typeof article);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/feed">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Tillbaka till flödet
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileQuestion className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="font-medium">Artikeln hittades inte</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Artikeln kan ha tagits bort eller så är länken felaktig.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAnalysis = article.ai_category || article.ai_summary;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/feed">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Tillbaka till flödet
        </Link>
      </Button>

      {/* Article header */}
      <div className="space-y-4">
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
          {article.ai_subcategory && (
            <Badge variant="secondary" className="text-xs">
              {article.ai_subcategory}
            </Badge>
          )}
          {article.ai_impact && (
            <Badge
              variant="outline"
              className={paverkanColors[article.ai_impact]}
            >
              {article.ai_impact}
            </Badge>
          )}
          {article.ai_action && (
            <Badge
              variant="outline"
              className={atgardColors[article.ai_action]}
            >
              {article.ai_action}
            </Badge>
          )}
          {article.ai_timeframe && (
            <Badge
              variant="outline"
              className={tidshorisontColors[article.ai_timeframe]}
            >
              {article.ai_timeframe}
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-tight lg:text-3xl">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ExternalLink className="h-4 w-4" />
            {article.source_name}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {article.published_at
              ? new Date(article.published_at).toLocaleDateString("sv-SE")
              : new Date(article.fetched_at).toLocaleDateString("sv-SE")}
          </span>
          {article.ai_relevance != null && (
            <div className="flex items-center gap-2">
              <span>Relevans:</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[var(--brand)]"
                  style={{ width: `${article.ai_relevance}%` }}
                />
              </div>
              <span className="font-medium">{article.ai_relevance}%</span>
            </div>
          )}
        </div>

        {article.url && (
          <Button variant="outline" size="sm" asChild>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Läs originalkällan
            </a>
          </Button>
        )}
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article content / summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {article.content ? "Artikelinnehåll" : "Sammanfattning"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {(article.content || article.ai_summary || article.summary || "Inget innehåll tillgängligt.")
                  .split("\n\n")
                  .map((paragraph, index) => (
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

          {/* AI Analysis */}
          {hasAnalysis ? (
            <Card className="border-[var(--brand)]/20">
              <CardHeader className="bg-[var(--brand-muted)] rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--brand)]" />
                  <CardTitle className="text-base">AI-analys</CardTitle>
                </div>
                <CardDescription>
                  Automatiskt genererad analys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {article.ai_summary && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Sammanfattning
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {article.ai_summary}
                    </p>
                  </div>
                )}

                {article.ai_consequences && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Konsekvensanalys
                      </h3>
                      <p className="text-sm leading-relaxed">
                        {article.ai_consequences}
                      </p>
                    </div>
                  </>
                )}

                {article.ai_recommended_actions && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Rekommenderade åtgärder
                      </h3>
                      <div className="text-sm leading-relaxed">
                        {article.ai_recommended_actions
                          .split("\n")
                          .map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0">
                              {line}
                            </p>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="mb-3 h-6 w-6 text-muted-foreground/50" />
                <p className="font-medium text-sm">
                  AI-analys ej genomförd ännu
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Analys genereras automatiskt för artiklar med hög relevans.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Relevance score */}
          {article.ai_relevance != null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Relevansbedömning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <svg
                      className="h-24 w-24 -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="var(--brand)"
                        strokeWidth="8"
                        strokeDasharray={`${article.ai_relevance * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold">
                      {article.ai_relevance}
                    </span>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Baserat på din kommunprofil och valda fokusområden
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cross-cutting lenses */}
          {(article.ai_timeframe || article.ai_impact || article.ai_action) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Analysdimensioner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {article.ai_timeframe && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Tidshorisont
                    </p>
                    <Badge
                      variant="outline"
                      className={tidshorisontColors[article.ai_timeframe]}
                    >
                      {article.ai_timeframe}
                    </Badge>
                  </div>
                )}
                {article.ai_impact && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Påverkan
                    </p>
                    <Badge
                      variant="outline"
                      className={paverkanColors[article.ai_impact]}
                    >
                      {article.ai_impact}
                    </Badge>
                  </div>
                )}
                {article.ai_action && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Åtgärd
                    </p>
                    <Badge
                      variant="outline"
                      className={atgardColors[article.ai_action]}
                    >
                      {article.ai_action}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Source info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Källa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{article.source_name}</p>
              <p className="text-sm text-muted-foreground">
                Hämtad:{" "}
                {new Date(article.fetched_at).toLocaleDateString("sv-SE")}
              </p>
              {article.url && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    Öppna originalkälla
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
