"use client";

import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  categoryColors,
  paverkanColors,
  atgardColors,
  tidshorisontColors,
} from "@/lib/constants";
import type { Article } from "@/lib/data";

interface ArticleCardProps {
  article: Article;
  /** Visa relevansbar */
  showRelevance?: boolean;
  /** Visa tidshorisonten */
  showTimeframe?: boolean;
  /** Markera som relevant för användaren */
  isRelevant?: boolean;
  /** Kompakt variant utan sammanfattning */
  compact?: boolean;
}

export function ArticleCard({
  article,
  showRelevance = true,
  showTimeframe = true,
  isRelevant = false,
  compact = false,
}: ArticleCardProps) {
  return (
    <Link href={`/article/${article.id}`}>
      <Card
        className={`transition-shadow hover:shadow-md cursor-pointer ${
          isRelevant ? "ring-1 ring-primary/20" : ""
        }`}
      >
        <CardContent className={compact ? "space-y-1.5" : "space-y-2.5"}>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {isRelevant && (
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
            {showTimeframe && article.ai_timeframe && (
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

          {/* Titel */}
          <h3 className="font-semibold leading-snug">{article.title}</h3>

          {/* Sammanfattning */}
          {!compact && (article.ai_summary || article.summary) && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.ai_summary || article.summary}
            </p>
          )}

          {/* Footer: källa + datum + relevans */}
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

            {showRelevance && article.ai_relevance != null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Relevans</span>
                <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${article.ai_relevance}%` }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums">
                  {article.ai_relevance}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
