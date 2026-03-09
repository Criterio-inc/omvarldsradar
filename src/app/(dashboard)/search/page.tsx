"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  ExternalLink,
  Inbox,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  categoryColors,
  paverkanColors,
  atgardColors,
} from "@/lib/constants";
import { searchArticles, type Article } from "@/lib/data";

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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doSearch(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      const data = await searchArticles(query.trim());
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sökningen misslyckades");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(searchQuery);
  }

  function handleTopicClick(topic: string) {
    setSearchQuery(topic);
    doSearch(topic);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Sök</h1>
        <p className="text-muted-foreground">
          Sök i alla bevakade källor och analyser
        </p>
      </div>

      {/* Search input */}
      <Card>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sök artiklar, trender, ämnesområden..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setHasSearched(false);
                    setResults([]);
                  }
                }}
                className="h-12 pl-12 text-base"
                autoFocus
              />
            </div>
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
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : hasSearched ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {results.length} resultat för &quot;{searchQuery}&quot;
          </p>

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="font-medium">Inga resultat</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prova att söka med andra ord eller bredare termer.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((article) => (
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
                      </div>

                      <h3 className="font-semibold leading-snug">
                        {article.title}
                      </h3>

                      {(article.ai_summary || article.summary) && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.ai_summary || article.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                        <ExternalLink className="h-3 w-3" />
                        <span>{article.source_name}</span>
                        <span>&middot;</span>
                        <span>
                          {article.published_at
                            ? new Date(
                                article.published_at
                              ).toLocaleDateString("sv-SE")
                            : new Date(
                                article.fetched_at
                              ).toLocaleDateString("sv-SE")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
