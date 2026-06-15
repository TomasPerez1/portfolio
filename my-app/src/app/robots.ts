import type { MetadataRoute } from "next";

const SITE_URL = "https://tomasperezdev.space";

/**
 * AI crawler user-agents explicitly allowed (CRAWL-01). The portfolio WANTS to be
 * indexed by AI candidate-search bots/agents, so each is opted in by name in addition
 * to the catch-all rule.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
