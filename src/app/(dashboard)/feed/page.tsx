"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchArticles, type Article } from "@/lib/data";

const categoryColors: Record<string, string> = {
  "Styrning & Demokrati": "bg-blue-100 text-blue-700 border-blue-200",
  "Digitalisering & Teknik": "bg-purple-100 text-purple-700 border-purple-200",
  "Välfärd & Omsorg": "bg-pink-100 text-pink-700 border-pink-200",
  "Utbildning & Kompetens": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Klimat, Miljö & Samhällsbyggnad": "bg-teal-100 text-teal-700 border-teal-200",
  "Trygghet & Beredskap": "bg-slate-100 text-slate-700 border-slate-200",
  "Ekonomi & Resurser": "bg-amber-100 text-amber-700 border-amber-200",
  "Arbetsgivare & Organisation": "bg-orange-100 text-orange-700 border-orange-200",
  "Samhälle & Medborgare": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Innovation & Omställning": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const paverkanColors: Record<string, string> = {
  "Direkt reglering": "bg-red-100 text-red-700 border-red-200",
  "Indirekt påverkan": "bg-orange-100 text-orange-700 border-orange-200",
  "Möjlighet": "bg-green-100 text-green-700 border-green-200",
  "Risk/hot": "bg-rose-100 text-rose-700 border-rose-200",
};

const atgardColors: Record<string, string> = {
  "Agera nu": "bg-red-100 text-red-700 border-red-200",
  "Planera": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Bevaka": "bg-blue-100 text-blue-700 border-blue-200",
  "Inspireras": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const tidshorisontColors: Record<string, string> = {
  "Akut (0-3 mån)": "bg-red-50 text-red-600 border-red-200",
  "Kort sikt (3-12 mån)": "bg-orange-50 text-orange-600 border-orange-200",
  "Medellång sikt (1-3 år)": "bg-blue-50 text-blue-600 border-blue-200",
  "Lång sikt (3+ år)": "bg-slate-50 text-slate-600 border-slate-200",
};

const categories = [
  "Alla",
  "Styrning & Demokrati",
  "Digitalisering & Teknik",
  "Välfärd & Omsorg",
  "Utbildning & Kompetens",
  "Klimat, Miljö & Samhällsbyggnad",
  "Trygghet & Beredskap",
  "Ekonomi & Resurser",
  "Arbetsgivare & Organisation",
  "Samhälle & Medborgare",
  "Innovation & Omställning",
];

const PAGE_SIZE = 20;

export default function FeedPage() {
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const { articles: data, count } = await fetchArticles({
        category: selectedCategory,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setArticles(data);
      setTotalCount(count);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, page]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Client-side search filter (on loaded articles)
  const displayed = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.ai_summary || a.summary || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : articles;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Flödet</h1>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("Alla");
                setSearchQuery("");
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Laddar..."
            : `Visar ${displayed.length} av ${totalCount} artiklar`}
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
          {displayed.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="space-y-2.5">
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
                            className="h-full rounded-full bg-[var(--brand)]"
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
          ))}

          {displayed.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Filter className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="font-medium">
                  {totalCount === 0
                    ? "Inga artiklar hämtade ännu"
                    : "Inga artiklar matchar filtret"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {totalCount === 0
                    ? "Artiklar hämtas automatiskt var 6:e timme från konfigurerade källor."
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
