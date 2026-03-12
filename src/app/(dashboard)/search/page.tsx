"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  Loader2,
  Inbox,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ArticleCard } from "@/components/article-card";
import {
  categoryColors,
  paverkanColors,
  atgardColors,
  tidshorisontColors,
} from "@/lib/constants";
import {
  advancedSearchArticles,
  type Article,
  type SearchFilters,
} from "@/lib/data";

const PAGE_SIZE = 20;

const suggestedTopics = [
  "Cybersäkerhet",
  "AI-reglering",
  "Totalförsvar",
  "Klimatanpassning",
  "Kompetensförsörjning",
  "Öppna data",
  "Äldreomsorg",
  "Kommunal ekonomi",
];

const allCategories = Object.keys(categoryColors);
const allImpacts = Object.keys(paverkanColors);
const allActions = Object.keys(atgardColors);
const allTimeframes = Object.keys(tidshorisontColors);

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [relevanceMin, setRelevanceMin] = useState(0);
  const [sortBy, setSortBy] = useState<"date" | "relevance">("date");

  const [results, setResults] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    selectedCategories.length +
    selectedImpacts.length +
    selectedActions.length +
    selectedTimeframes.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (relevanceMin > 0 ? 1 : 0);

  const doSearch = useCallback(
    async (searchQuery: string, pageNum: number = 0) => {
      setLoading(true);
      setHasSearched(true);
      try {
        const filters: SearchFilters = {
          query: searchQuery || undefined,
          categories: selectedCategories.length ? selectedCategories : undefined,
          impacts: selectedImpacts.length ? selectedImpacts : undefined,
          actions: selectedActions.length ? selectedActions : undefined,
          timeframes: selectedTimeframes.length ? selectedTimeframes : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          relevanceMin: relevanceMin > 0 ? relevanceMin : undefined,
          sortBy,
          limit: PAGE_SIZE,
          offset: pageNum * PAGE_SIZE,
        };

        const { articles, count } = await advancedSearchArticles(filters);
        setResults(articles);
        setTotalCount(count);
      } catch {
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategories, selectedImpacts, selectedActions, selectedTimeframes, dateFrom, dateTo, relevanceMin, sortBy]
  );

  // Auto-search when filters change (if user has already searched)
  useEffect(() => {
    if (hasSearched) {
      setPage(0);
      doSearch(query, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedImpacts, selectedActions, selectedTimeframes, dateFrom, dateTo, relevanceMin, sortBy]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    doSearch(query, 0);
  }

  function handleTopicClick(topic: string) {
    setQuery(topic);
    setPage(0);
    doSearch(topic, 0);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    doSearch(query, newPage);
  }

  function toggleArrayItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item)
      ? arr.filter((x) => x !== item)
      : [...arr, item];
  }

  function clearAllFilters() {
    setQuery("");
    setSelectedCategories([]);
    setSelectedImpacts([]);
    setSelectedActions([]);
    setSelectedTimeframes([]);
    setDateFrom("");
    setDateTo("");
    setRelevanceMin(0);
    setSortBy("date");
    setPage(0);
    setHasSearched(false);
    setResults([]);
    setTotalCount(0);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Sök</h1>
        <p className="text-muted-foreground">
          Sök och filtrera bland alla bevakade artiklar
        </p>
      </div>

      {/* Sökfält + föreslagna ämnen */}
      <Card>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Sök artiklar, trender, ämnesområden..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-11 pl-10"
                  autoFocus
                />
              </div>
              <Button type="submit" className="h-11 px-6">
                <Search className="mr-2 h-4 w-4" />
                Sök
              </Button>
            </div>
          </form>

          {!hasSearched && (
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map((topic) => (
                <Button
                  key={topic}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filterpanel — utfällbar */}
      <Card>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} aktiva
                </Badge>
              )}
            </div>
            {showFilters ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showFilters && (
            <div className="space-y-5 pt-2">
              {/* Rad 1: Kategorier */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Kategori
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setSelectedCategories(toggleArrayItem(selectedCategories, cat))
                      }
                    >
                      <Badge
                        variant="outline"
                        className={`cursor-pointer transition-all ${
                          selectedCategories.includes(cat)
                            ? categoryColors[cat] + " ring-2 ring-primary/30"
                            : "bg-muted/50 text-muted-foreground border-muted hover:bg-muted"
                        }`}
                      >
                        {cat}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rad 2: Påverkan + Åtgärd + Tidshorisont */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Påverkan
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allImpacts.map((impact) => (
                      <button
                        key={impact}
                        type="button"
                        onClick={() =>
                          setSelectedImpacts(toggleArrayItem(selectedImpacts, impact))
                        }
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer transition-all ${
                            selectedImpacts.includes(impact)
                              ? paverkanColors[impact] + " ring-2 ring-primary/30"
                              : "bg-muted/50 text-muted-foreground border-muted hover:bg-muted"
                          }`}
                        >
                          {impact}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Åtgärd
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() =>
                          setSelectedActions(toggleArrayItem(selectedActions, action))
                        }
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer transition-all ${
                            selectedActions.includes(action)
                              ? atgardColors[action] + " ring-2 ring-primary/30"
                              : "bg-muted/50 text-muted-foreground border-muted hover:bg-muted"
                          }`}
                        >
                          {action}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Tidshorisont
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allTimeframes.map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() =>
                          setSelectedTimeframes(toggleArrayItem(selectedTimeframes, tf))
                        }
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer transition-all ${
                            selectedTimeframes.includes(tf)
                              ? tidshorisontColors[tf] + " ring-2 ring-primary/30"
                              : "bg-muted/50 text-muted-foreground border-muted hover:bg-muted"
                          }`}
                        >
                          {tf}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rad 3: Datum + relevans + sortering */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Datum från
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Datum till
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Minsta relevans: {relevanceMin}%
                  </label>
                  <Slider
                    value={[relevanceMin]}
                    onValueChange={([val]) => setRelevanceMin(val)}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    Sortering
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "date" | "relevance")}
                  >
                    <option value="date">Senast hämtade</option>
                    <option value="relevance">Högst relevans</option>
                  </select>
                </div>
              </div>

              {/* Rensa filter-knapp */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Rensa alla filter
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {activeFilterCount} filter aktiva
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultat */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : hasSearched ? (
        <div className="space-y-4">
          {/* Resultaträknare + pagination top */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {totalCount === 0
                ? "Inga resultat"
                : `${totalCount} träffar${query ? ` för "${query}"` : ""}`}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Föregående
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  Sida {page + 1} av {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Nästa
                </Button>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="font-medium">Inga resultat</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prova att ändra sökord eller justera filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  showRelevance={true}
                  showTimeframe={true}
                />
              ))}
            </div>
          )}

          {/* Pagination bottom */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
              >
                Föregående
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                Sida {page + 1} av {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
              >
                Nästa
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
