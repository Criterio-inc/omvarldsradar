"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Filter,
  SlidersHorizontal,
  Loader2,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchArticles, type Article } from "@/lib/data";
import {
  categoryColors,
  paverkanColors,
  atgardColors,
  tidshorisontColors,
  categories,
} from "@/lib/constants";

const PAGE_SIZE = 20;

interface UserPrefs {
  categories: string[];
  action_levels: string[];
}

export default function FeedPage() {
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showRelevant, setShowRelevant] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);

  // Load user preferences for personalized filtering
  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch("/api/notifications/preferences");
        if (res.ok) {
          const data = await res.json();
          const prefs = data.preferences;
          if (prefs) {
            setUserPrefs({
              categories: prefs.categories ?? [],
              action_levels: prefs.action_levels ?? [],
            });
          }
        }
      } catch {
        // silently fail
      }
    }
    loadPrefs();
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { articles: data, count } = await fetchArticles({
        category: selectedCategory,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setArticles(data);
      setTotalCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda artiklar");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, page]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Check if article is relevant to user's preferences
  function isRelevantToUser(article: Article): boolean {
    if (!userPrefs) return true;
    const matchesCategory =
      userPrefs.categories.length === 0 ||
      (article.ai_category && userPrefs.categories.includes(article.ai_category));
    const matchesAction =
      userPrefs.action_levels.length === 0 ||
      (article.ai_action && userPrefs.action_levels.includes(article.ai_action));
    return !!(matchesCategory || matchesAction);
  }

  // Apply filters
  let displayed = articles;

  // Search filter
  if (searchQuery) {
    displayed = displayed.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.ai_summary || a.summary || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }

  // Personalized filter
  if (showRelevant && userPrefs) {
    displayed = displayed.filter(isRelevantToUser);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasPrefs = userPrefs && (userPrefs.categories.length > 0 || userPrefs.action_levels.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Flödet</h1>
        <p className="text-muted-foreground">
          Alla bevakade artiklar och förändringar
        </p>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Sök
              </label>
              <Input
                placeholder="Sök i artiklar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-56">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Kategori
              </label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {hasPrefs && (
              <Button
                variant={showRelevant ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRelevant(!showRelevant)}
                className={showRelevant ? "bg-primary text-primary-foreground" : ""}
              >
                <Star className={`mr-1 h-3 w-3 ${showRelevant ? "fill-current" : ""}`} />
                Relevant för dig
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("Alla");
                setSearchQuery("");
                setShowRelevant(false);
                setPage(0);
              }}
            >
              <Filter className="mr-1 h-3 w-3" />
              Rensa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Laddar..."
            : `Visar ${displayed.length} av ${totalCount} artiklar${showRelevant ? " (filtrerat på dina intressen)" : ""}`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Föregående
            </Button>
            <span className="text-sm text-muted-foreground">
              Sida {page + 1} av {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Nästa
            </Button>
          </div>
        )}
      </div>

      {/* Article list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((article) => {
            const isRelevant = hasPrefs && isRelevantToUser(article);
            return (
              <Link key={article.id} href={`/article/${article.id}`}>
                <Card className={`transition-shadow hover:shadow-md cursor-pointer ${isRelevant && !showRelevant ? "ring-1 ring-primary/20" : ""}`}>
                  <CardContent className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {isRelevant && !showRelevant && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px]">
                          <Star className="mr-0.5 h-3 w-3 fill-current" />
                          Relevant
                        </Badge>
                      )}
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
                      {article.ai_timeframe && (
                        <Badge
                          variant="outline"
                          className={
                            tidshorisontColors[article.ai_timeframe] ||
                            "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {article.ai_timeframe}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold leading-snug">{article.title}</h3>

                    {(article.ai_summary || article.summary) && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.ai_summary || article.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span>{article.source_name}</span>
                        <span>&middot;</span>
                        <span>
                          {article.published_at
                            ? new Date(article.published_at).toLocaleDateString("sv-SE")
                            : new Date(article.fetched_at).toLocaleDateString("sv-SE")}
                        </span>
                      </div>

                      {article.ai_relevance != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Relevans
                          </span>
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${article.ai_relevance}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {article.ai_relevance}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {displayed.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Filter className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="font-medium">
                  {totalCount === 0
                    ? "Inga artiklar hämtade ännu"
                    : showRelevant
                    ? "Inga artiklar matchar dina bevakningsområden"
                    : "Inga artiklar matchar filtret"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {totalCount === 0
                    ? "Artiklar hämtas automatiskt var 6:e timme från konfigurerade källor."
                    : showRelevant
                    ? "Justera dina fokusområden och åtgärdsnivåer i Inställningar."
                    : "Prova att ändra filterinställningarna"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
