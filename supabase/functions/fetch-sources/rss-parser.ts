// ============================================================
// OmvärldsRadar — Tool: RSS/Atom Parser
// Parsar XML-feeds utan externa beroenden (ren regex + DOM)
// Hanterar både RSS 2.0 och Atom-format
// ============================================================

interface ParsedArticle {
  title: string;
  url: string;
  summary: string | null;
  published_at: string | null;
}

/**
 * Parsar en RSS- eller Atom-feed och returnerar artiklar
 */
export function parseFeed(
  xml: string,
  feedType: "rss" | "atom"
): ParsedArticle[] {
  if (feedType === "atom") {
    return parseAtom(xml);
  }
  return parseRSS(xml);
}

/**
 * Parsar RSS 2.0-format
 * Struktur: <rss><channel><item>...</item></channel></rss>
 */
function parseRSS(xml: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];
  const items = extractBlocks(xml, "item");

  for (const item of items) {
    const title = extractTag(item, "title");
    const link = extractTag(item, "link");

    if (!title || !link) continue;

    articles.push({
      title: cleanText(title),
      url: cleanUrl(link),
      summary: cleanText(extractTag(item, "description")) || null,
      published_at: parseDate(
        extractTag(item, "pubDate") || extractTag(item, "dc:date")
      ),
    });
  }

  return articles;
}

/**
 * Parsar Atom-format
 * Struktur: <feed><entry>...</entry></feed>
 */
function parseAtom(xml: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];
  const entries = extractBlocks(xml, "entry");

  for (const entry of entries) {
    const title = extractTag(entry, "title");

    // Atom-links kan vara <link href="..." /> eller <link>...</link>
    const linkHref = extractAttr(entry, "link", "href");
    const linkText = extractTag(entry, "link");
    const link = linkHref || linkText;

    if (!title || !link) continue;

    articles.push({
      title: cleanText(title),
      url: cleanUrl(link),
      summary:
        cleanText(extractTag(entry, "summary")) ||
        cleanText(extractTag(entry, "content")) ||
        null,
      published_at: parseDate(
        extractTag(entry, "published") || extractTag(entry, "updated")
      ),
    });
  }

  return articles;
}

// --- Helpers ---

/**
 * Extraherar alla block av en viss tagg (t.ex. alla <item>...</item>)
 */
function extractBlocks(xml: string, tag: string): string[] {
  const blocks: string[] = [];
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let match;

  while ((match = regex.exec(xml)) !== null) {
    blocks.push(match[0]);
  }

  return blocks;
}

/**
 * Extraherar innehållet i en specifik tagg
 */
function extractTag(xml: string, tag: string): string | null {
  // Hantera CDATA: <tag><![CDATA[...]]></tag>
  const cdataRegex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`,
    "i"
  );
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1];

  // Normal tag: <tag>...</tag>
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Extraherar ett attribut från en self-closing tagg
 * T.ex. <link href="https://..." />
 */
function extractAttr(
  xml: string,
  tag: string,
  attr: string
): string | null {
  // Prioritera rel="alternate" för Atom-links
  const altRegex = new RegExp(
    `<${tag}[^>]*rel=["']alternate["'][^>]*${attr}=["']([^"']+)["']`,
    "i"
  );
  const altMatch = xml.match(altRegex);
  if (altMatch) return altMatch[1];

  // Omvänd ordning: href före rel
  const altRegex2 = new RegExp(
    `<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*rel=["']alternate["']`,
    "i"
  );
  const altMatch2 = xml.match(altRegex2);
  if (altMatch2) return altMatch2[1];

  // Fallback: första link med href
  const regex = new RegExp(
    `<${tag}[^>]*${attr}=["']([^"']+)["']`,
    "i"
  );
  const match = xml.match(regex);
  return match ? match[1] : null;
}

/**
 * Rensa HTML-taggar och entities från text
 */
function cleanText(text: string | null): string {
  if (!text) return "";

  return text
    .replace(/<[^>]+>/g, "")           // Ta bort HTML-taggar
    .replace(/&nbsp;/g, " ")           // Non-breaking space
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Avkoda ALLA numeriska decimal-entiteter (&#229;=å, &#228;=ä, &#246;=ö, etc.)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    // Avkoda ALLA numeriska hex-entiteter (&#xE5;=å, etc.)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, " ")             // Normalisera whitespace
    .trim();
}

/**
 * Rensa och validera URL
 */
function cleanUrl(url: string): string {
  return url.trim().replace(/\s+/g, "");
}

/**
 * Parsa diverse datumformat till ISO-string
 */
function parseDate(dateStr: string | null): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr.trim());
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}
