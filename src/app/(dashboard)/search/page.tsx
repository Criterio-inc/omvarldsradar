"use client";

import { useState } from "react";
import { Search, Clock, Sparkles, ArrowRight, Radar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const recentSearches = [
  {
    query: "NIS2 cybersäkerhet kommuner",
    date: "2026-03-01",
    results: 8,
  },
  {
    query: "AI Act klassificering myndighetsutövning",
    date: "2026-02-28",
    results: 5,
  },
  {
    query: "totalförsvarsplanering NATO",
    date: "2026-02-27",
    results: 12,
  },
  {
    query: "klimatanpassning EU krav 2027",
    date: "2026-02-25",
    results: 6,
  },
  {
    query: "kompetensförsörjning välfärd",
    date: "2026-02-24",
    results: 9,
  },
];

const suggestedTopics = [
  "Cybersäkerhet",
  "AI-reglering",
  "Totalförsvar",
  "Klimatanpassning",
  "Kompetensförsörjning",
  "Öppna data",
  "Äldreomsorg",
  "Kommunal ekonomi",
  "Integration",
  "Megatrender",
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  }

  function handleTopicClick(topic: string) {
    setSearchQuery(topic);
    setHasSearched(true);
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
                  if (!e.target.value) setHasSearched(false);
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

      {hasSearched ? (
        /* AI search result placeholder */
        <Card className="border-[var(--brand)]/20 bg-[var(--brand-muted)]">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand)]/10">
              <Sparkles className="h-8 w-8 text-[var(--brand)]" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-semibold">
                AI-driven sökning kommer i nästa fas
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                I nästa version kommer du kunna ställa frågor på naturligt språk
                och få AI-genererade svar baserade på alla bevakade källor. Till
                exempel: &quot;Vilka EU-regelverk påverkar min kommun
                2026?&quot;
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm">
              <Radar className="h-4 w-4 text-[var(--brand)]" />
              <span className="text-muted-foreground">
                Drivet av Claude AI + Exa.ai
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Recent searches */
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Senaste sökningar
          </h2>

          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => {
                  setSearchQuery(search.query);
                  setHasSearched(true);
                }}
              >
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{search.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {search.date} &middot; {search.results} resultat
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
