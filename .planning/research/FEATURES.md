# Feature Research: SEO & AI Discoverability + Keyword Podium

**Domain:** Senior developer portfolio — SEO, structured data, AI/bot discoverability, and AI-trend keyword positioning
**Researched:** 2026-06-13
**Confidence:** MEDIUM-HIGH (Part A mechanics are well-established/HIGH confidence; Part B trend rankings are MEDIUM — based on 2026 web sources, cross-checked across multiple independent articles, but trend journalism inherently has some hype-amplification bias)

---

## PART A — SEO / Discoverability Feature Landscape

### Table Stakes (Expected — Missing = Looks Broken/Unprofessional)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `generateMetadata` per route (title, description) | Every modern Next.js site has unique, descriptive `<title>`/`<meta description>`. Missing → generic "localhost" or framework-default titles in search results and shared links — instant signal of an unfinished/student project. | LOW | Already scoped (D-feature in PROJECT.md). EN canonical, ES via locale param. |
| Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) | This is THE feature recruiters/clients actually experience: pasting the URL into LinkedIn DM, WhatsApp, Slack, email. No OG image = ugly/blank link preview = looks unmaintained. | LOW-MEDIUM | 1200x630px is the long-standing safe size; 2026 sources confirm 1200x600 (2:1) renders cleanly on all major platforms without cropping. Static OG image (not per-route) is sufficient for a single-page portfolio — generate ONE professional image with name, role, status, tagline. |
| `twitter:card` (summary_large_image) | X/LinkedIn fall back to OG but Twitter-card meta avoids inconsistent rendering on X. | LOW | Trivial addition alongside OG tags — same image, same content. |
| `<link rel="canonical">` | Prevents duplicate-content confusion between `/en`, `/es`, `/`, and any trailing-slash variants. Without it, Google may index the wrong locale or split authority. | LOW | EN canonical per D-locked decision. Canonical must match what's actually served — Google treats canonical as a *hint*, not a directive, and will override it if signals (internal links, sitemap, hreflang) conflict. |
| `hreflang` (en/es + x-default) | Tells Google "this content exists in these languages at these URLs" — prevents the wrong-language page ranking for a given searcher's locale. | LOW-MEDIUM | Needs to be bidirectional and self-referencing (EN page declares both EN and ES alternates + itself; ES page does the same). `x-default` → EN (matches "EN canonical" decision). |
| `robots.txt` | Baseline file every crawler checks first. Missing isn't fatal (Google still crawls) but it's a 404 that looks neglected, and it's the place to explicitly ALLOW AI crawlers (a differentiator here — see below). | LOW | Default Next.js `app/robots.ts` is trivial — `Allow: /` for everything, explicit sitemap reference. |
| `sitemap.xml` | Standard discovery aid for Google/Bing. For a small single-page-ish site the SEO value is marginal, but its absence is a "smell" that signals an unfinished site to anyone running an automated audit (including AI agents that check for it). | LOW | `app/sitemap.ts` — trivial for a handful of routes (`/en`, `/es`, maybe `/en#section` anchors are NOT separate sitemap entries). |
| `<html lang>` matching actual rendered locale | Screen readers, translation tools, and Google's language detection all read this. Currently derived from cookie (bug per PROJECT.md) — must match the route segment (`/en` → `lang="en"`, `/es` → `lang="es"`). | LOW | Already scoped as a fix (D-item). Quick win, real SEO/accessibility impact. |
| Favicon + apple-touch-icon + web manifest basics | Browser tab, bookmark, "Add to Home Screen" — table stakes for "this is a real, finished site" perception. | LOW | Likely already present from v1 — verify, don't rebuild. |
| Fast LCP / good Core Web Vitals | Google's ranking algorithm and AI crawlers both factor in page speed/quality signals indirectly (a slow/broken page gets deprioritized in re-crawl frequency). Already a v2.1 goal independent of SEO. | (already scoped) | Reinforces — SEO and performance goals are aligned, not competing, here. |

### Differentiators (Sets This Portfolio Apart — Competitive Edge for Recruiter/AI Discovery)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| JSON-LD `Person` schema (+ optional `ProfilePage`, `WorkExample`/`CreativeWork` for featured projects) | This is the highest-leverage machine-readable signal for an individual's portfolio. Google can surface a Knowledge Panel-style rich result; more importantly, LLM-based tools (ChatGPT browsing, Claude with web search, Perplexity, AI recruiting copilots) that fetch a page get a clean, unambiguous, structured fact-base about who Tomás is, what he does, where he works, and his social/profile links — instead of having to infer from prose. | LOW-MEDIUM | Server-rendered `<script type="application/ld+json">` in `<head>` — zero runtime cost (matches D-locked "server-side, zero runtime cost" framing). Key fields: `name`, `jobTitle`, `description`, `url`, `image`, `email`, `address` (locality/region/country — NOT full street address), `sameAs` (LinkedIn, GitHub if public), `knowsAbout` (array of skills/technologies — THIS is where keyword podium terms belong, see Part B), `worksFor` (Organization for current employer, optional/be careful with NDA-sensitive employer framing). |
| `knowsAbout` / `hasOccupation` structured skill list in JSON-LD | 2026 sources emphasize: structured data with `knowsAbout` establishes topical authority and helps AI systems disambiguate "who does what" rather than confusing entities. For a developer, this is the direct machine-readable equivalent of a skills section — and it's where AI-trend keywords (Part B) get their highest-trust placement. | LOW | Must mirror what's visibly on the page (the "About"/"Stack" sections) — schema that claims skills not shown in visible content is exactly the "misleading schema" anti-pattern flagged by 2026 SEO guidance, and can actively HURT trust signals. |
| `llms.txt` | A markdown file at `/llms.txt` giving AI agents/IDE tools (Cursor, Claude Code, Continue, Cline, and increasingly recruiting-agent browsing tools) a curated, concise summary of the site: who Tomás is, links to key pages/sections, and a short structured bio. | LOW | **Honest framing required**: 2026 evidence shows adoption is real but narrow — ~10% of domains analyzed have one, and the major AI crawlers (GPTBot, ClaudeBot, OAI-SearchBot) do NOT request it in meaningful volume and it has no proven effect on AI retrieval/ranking as of 2026. The actual value is "developer-experience play" — if a recruiter or technical evaluator points an AI coding tool (Claude Code, Cursor) AT the portfolio repo or site, `llms.txt` makes that tool's summary of "who is this person" cleaner and faster. Given Tomás's AI-protagonist positioning, shipping `llms.txt` is ALSO itself a signal ("this person ships for AI-agent consumption, not just humans") — the artifact doubles as a positioning statement. Treat as low-cost, modest-but-real value, NOT as a primary discoverability lever. |
| AI-crawler-aware `robots.txt` (explicit `Allow` for GPTBot, ClaudeBot, Google-Extended, PerplexityBot, etc.) | Many sites in 2026 are *blocking* AI crawlers by default (training-data concerns). For a portfolio whose entire goal is "be found and understood by AI agents doing candidate research," explicitly ALLOWING these bots is a deliberate, differentiated choice — and an easy one, since there's no proprietary content to protect. | LOW | Explicitly list and allow: `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `Claude-SearchBot`, `Google-Extended`, `PerplexityBot`, `Bingbot`. This is a 10-line addition to `robots.ts` with outsized "we thought about this" signaling value relative to its cost. |
| `Organization`/`sameAs` linking to LinkedIn + GitHub | Entity-resolution: Google's Knowledge Graph and AI tools cross-reference `sameAs` URLs to confirm "this person = this LinkedIn profile = this GitHub." Strengthens trust and dedupes identity across the web. | LOW | Pure data — list LinkedIn (already in content) and GitHub if the owner has a public profile worth linking (verify before adding). |
| Per-section anchors with descriptive, stable IDs + matching sitemap fragments (optional) | Improves "jump link" sharing (e.g., sharing a direct link to "Experience" section) and gives AI tools addressable sub-sections of the single page. | LOW | Nice-to-have, not critical — single-page portfolios rarely need sitemap fragment entries; anchors alone (already likely present from nav) cover this. |
| Dynamic OG image generation (`next/og` / `@vercel/og`) showing live "Available" status | A more advanced differentiator: instead of a static OG image, generate one server-side that always reflects current availability status/role — useful if status changes over time. | MEDIUM | EXPLICITLY OUT OF SCOPE per "no new features beyond design" non-goal and v2.1 minimal-footprint philosophy — flagged here only as a *future* (v2.2+) consideration. A single well-designed static OG image is the correct v2.1 choice. |

### Anti-Features (Looks Good, Causes Problems — Do NOT Build)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Keyword-stuffed `<meta keywords>` tag | "More keywords = more SEO" is a persistent myth from ~2005-era SEO folklore. | `meta keywords` has been ignored by Google since ~2009 and can read as spammy if scraped by AI tools doing trust-scoring. Wastes bytes, adds nothing. | Put real keyword terms into VISIBLE content (About/Stack/Experience sections) and into `knowsAbout` in JSON-LD — both already planned. |
| AI-generated fake "schema-only" claims (skills/certs in JSON-LD not shown on page) | Tempting to "pad" the structured data with every trending AI term to maximize AI-agent matchability. | Directly contradicts 2026 guidance: schema must match visible content or it actively damages trust signals (and, more importantly for THIS project, would be factually dishonest about Tomás's profile — explicitly forbidden by the quality gate). | Every term in JSON-LD `knowsAbout` must trace to something genuinely in `common.json` stack/experience/about content. Part B below flags exactly which terms pass this test. |
| Separate `/blog` or `/articles` section purely for SEO content velocity | "Publish content regularly to rank better" is standard SEO advice for content sites. | Explicitly a non-goal ("No CMS or blog"). Also: a portfolio's SEO value comes from being a clean, authoritative, single source of truth about ONE person — not from competing in content marketing, which is a different game requiring ongoing investment this project doesn't want. | Skip entirely. The portfolio's SEO strategy is "be the definitive, structured, fast, machine-readable answer to 'who is Tomás Pérez'" — not "rank for generic tutorial queries." |
| `ai.txt` (a competing/adjacent emerging spec to `llms.txt`) | Some 2026 articles propose `ai.txt` as a more "permissions-focused" complement to `llms.txt`. | Adoption is even lower than `llms.txt`, no major crawler honors it, and shipping TWO speculative files is over-engineering for a personal portfolio. Diminishing returns past `robots.txt` (AI-crawler allowlist) + `llms.txt`. | Ship `robots.txt` (with AI crawler allowlist) + `llms.txt` only. Skip `ai.txt`. |
| Hreflang for every possible locale variant (en-US, en-GB, en-AU...) | "More hreflang = more international reach" reasoning. | Over-engineering — the site has exactly 2 content locales (en, es). Region-variant hreflang for a 2-language personal portfolio adds maintenance surface for zero realistic benefit (a recruiter in London and one in Austin get the same EN page either way). | `en`, `es`, and `x-default` (→ en) only. |
| Heavy client-side JSON-LD injection via `useEffect` | If someone implements this carelessly, schema gets injected only after JS executes. | Many crawlers (including some AI crawlers and unfurlers) do NOT execute JS, or execute it with limits — client-injected JSON-LD may simply not be seen. Defeats the entire purpose. | Server-render JSON-LD in the route's `generateMetadata`/page component (RSC), exactly as PROJECT.md already specifies ("server-side, zero runtime cost"). |

---

## Feature Dependencies

```
generateMetadata (per-locale title/description)
    └──requires──> <html lang> fix (locale must be known server-side at render time)
                       └──requires──> SSR content fix (i18next async hook removal — already scoped)

JSON-LD Person schema
    └──requires──> Real content as source of truth (common.json) — no fabricated fields
    └──enhances──> robots.txt AI-crawler allowlist (structured data is wasted if bots are blocked)

knowsAbout (keyword podium terms in JSON-LD)
    └──requires──> Same terms visible in page content (About/Stack sections)
                       └──conflicts-if-violated──> "schema must match visible content" SEO guidance (anti-pattern)

OG image
    └──enhances──> Open Graph meta tags (image is referenced by og:image)
    └──independent-of──> JSON-LD, llms.txt (can ship separately)

hreflang + canonical
    └──requires──> Per-locale routes already exist ([lang] segment routing — already in place per D-09)

llms.txt
    └──enhances──> JSON-LD Person + visible content (llms.txt should SUMMARIZE, not duplicate-define, facts)
    └──independent-of──> robots.txt AI allowlist (different mechanism — llms.txt is content navigation, robots.txt is access control)

Keyword Podium terms (Part B)
    └──feeds-into──> Title tag, meta description (1-2 highest-ranked terms only — see framing recommendations)
    └──feeds-into──> JSON-LD knowsAbout (broader set, ~5-8 terms)
    └──feeds-into──> Visible "Stack > AI Tooling" section (source of truth — already exists in common.json)
    └──must-NOT-appear-in──> meta keywords tag (deprecated, anti-feature)
```

### Dependency Notes

- **`<html lang>` fix must land before/with `generateMetadata`**: both depend on knowing the resolved locale server-side. The PROJECT.md SSR fix (removing the i18next async hook) is the actual prerequisite — metadata and lang attribute are consumers of that fix, not separate problems.
- **JSON-LD `knowsAbout` must mirror visible content**: this is the single most important dependency for honesty AND for SEO trust. The roadmap should sequence "decide keyword podium → update visible Stack/About copy if needed → THEN write JSON-LD" — not the reverse. Schema should describe what's already true on the page, never aspirational.
- **`llms.txt` is the lowest-dependency, lowest-risk item**: it's a static file with no build-time coupling to anything else. Can be done in any phase, even first, as a quick win — but its actual discoverability impact is modest per 2026 evidence, so it shouldn't consume disproportionate planning time.
- **Robots.txt AI-allowlist enhances everything else**: JSON-LD, OG tags, and llms.txt are all wasted effort if AI crawlers are blocked (default-deny is common in many starter templates/CDN configs). Verify current `robots.txt`/CDN-level bot rules first — this could be a one-line fix with outsized leverage.

---

## MVP Definition (v2.1.0 SEO scope)

### Launch With (v1 of this milestone)

- [ ] SSR content fix (i18next hook removal) — prerequisite for everything metadata-related
- [ ] `<html lang>` fix (derive from route locale)
- [ ] `generateMetadata` per locale: title, description, OG tags, twitter:card, canonical, hreflang (en/es/x-default)
- [ ] Static OG image (1200x630, professional, includes name/role/status/tagline)
- [ ] `robots.txt` with explicit AI-crawler allowlist (GPTBot, ClaudeBot, OAI-SearchBot, Claude-SearchBot, Google-Extended, PerplexityBot, Bingbot)
- [ ] `sitemap.xml` (en, es routes)
- [ ] JSON-LD `Person` schema with `knowsAbout` populated from the keyword podium (Part B) — server-rendered, zero runtime cost
- [ ] `llms.txt` — concise machine-readable summary + links

### Add After Validation (v1.x — if time/scope allows within v2.1)

- [ ] `ProfilePage` + `CreativeWork`/`WorkExample` JSON-LD for featured projects (Zurich/Santander, DJ Presskit, Tienda Lo Quiero Acá) — adds depth to the entity graph
- [ ] `Organization` schema + `sameAs` for LinkedIn (and GitHub if applicable)

### Future Consideration (v2.2+)

- [ ] Dynamic OG image generation reflecting live availability status (`@vercel/og`)
- [ ] `FAQPage` schema if a "common questions from recruiters" micro-section is ever added
- [ ] Sitemap fragments / addressable sub-sections for AI agents (low value for single-page site — revisit only if site grows to multi-page)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| SSR fix + `<html lang>` | HIGH | LOW | P1 |
| `generateMetadata` (title/desc/OG/canonical/hreflang) | HIGH | LOW | P1 |
| OG image | HIGH (real-world share preview) | LOW-MEDIUM | P1 |
| JSON-LD Person + knowsAbout | HIGH (AI-agent discoverability) | LOW-MEDIUM | P1 |
| robots.txt AI-allowlist | MEDIUM-HIGH (cheap, high signal) | LOW | P1 |
| sitemap.xml | LOW-MEDIUM | LOW | P2 |
| llms.txt | LOW-MEDIUM (modest proven impact, but cheap + positioning value) | LOW | P2 |
| JSON-LD ProfilePage/CreativeWork for projects | MEDIUM | MEDIUM | P2 |
| sameAs Organization links | LOW-MEDIUM | LOW | P2 |
| Dynamic OG image | LOW (marginal over static) | MEDIUM | P3 |

---

# PART B — The Keyword Podium (AI-in-Development Trends, 2026)

## Methodology & Honesty Framework

Every term below was checked against Tomás's REAL profile from `my-app/public/locales/en/common.json`:

- **Stack > AI Tooling** lists exactly 5 items: `Claude Code` (Daily), `AI-Driven Development` (Daily), `Harness Engineering` (Active), `LLM Orchestration` (Active), `Agentic Workflows` (Active).
- No mention of: RAG, vector databases, LangChain/LangGraph, prompt engineering as a discrete deliverable, MCP server development, fine-tuning, model training, or AI/ML engineering roles.
- `quickFacts` lists English as **"B2 — Upper Intermediate"** in the actual site content — this CONTRADICTS the milestone brief's claim of "English C1." **Flag for the owner**: the `about-me` field separately links to an EF SET certificate claimed as C1 in the milestone brief, but `quickFacts` and `hero.facts.english` both currently say B2. This is a content consistency issue independent of SEO — recommend resolving before publishing English-first metadata that may reference proficiency level. (Not a keyword issue, but surfaced because it's a factual-accuracy gate similar to the keyword honesty checks below.)

**Honesty rule applied:** A term is ranked HIGH only if (a) it has strong, current 2026 demand signal, AND (b) it maps DIRECTLY to something in the existing stack/experience content without rhetorical inflation.

---

## The Podium

### 🥇 1st Place: "Agentic Workflows" / "Agentic Engineering"

**Why valuable (2026 signal):** This is the dominant framing of the year. Multiple independent 2026 sources (Firecrawl's "Top 13 Agentic AI Trends 2026", Medium's "From Vibe to Agentic: The 2026 Maturation of AI-Driven Development", NxCode's "Agentic Engineering" guide) converge on "agentic" as the term that *replaced* "vibe coding" as the serious/production framing. Gartner is cited predicting 40% of enterprise apps will include task-specific AI agents by end of 2026 (up from <5% in 2025), and that 60% of new code will be AI-generated by year's end. "Agentic engineering" is explicitly framed as "vibe coding for production" — i.e., the SENIOR, structured version of AI-assisted development, which is exactly the positioning a backend/architecture-oriented senior dev wants (vs. the more junior/hobbyist connotation "vibe coding" carries).

**Recruiter/search demand signal:** MEDIUM-HIGH and rising — this is a 2026-native term (emerged from the "vibe coding" backlash), so historical search-volume data is thin, but its appearance across job-trend articles, Gartner-cited reports, and dedicated "agentic engineering" guides indicates it's becoming the standard vocabulary for "developer who directs AI agents responsibly."

**Honesty check:** PASS, DIRECT MATCH. `Stack > AI Tooling` literally lists "Agentic Workflows" as Active. No inflation needed — use as-is.

**Recommended use:** Visible content (Stack section — already there) + JSON-LD `knowsAbout` + candidate for meta description supporting phrase (not the primary H1 term, but a strong secondary).

---

### 🥈 2nd Place: "AI-Driven Development" (with "Agentic AI" as a close synonym pairing)

**Why valuable (2026 signal):** "AI-Driven Development" is the umbrella term bridging "this developer uses AI daily as a core practice" — broader and more recruiter-legible than "agentic," which some hiring managers outside the AI-native bubble may not yet recognize. The Medium 2026 piece frames the entire year's narrative as the maturation arc *of* AI-driven development (vibe → agentic). Pairing "AI-Driven Development" (broad, searchable, recognizable) with "Agentic AI/Workflows" (specific, current, signals depth) covers both the recruiter who searches generically and the technical evaluator who knows the nuance.

**Recruiter/search demand signal:** MEDIUM-HIGH. "AI-driven development" is more broadly searched/used in job postings and LinkedIn headlines than "agentic" alone — it's the phrase a non-specialist recruiter is more likely to type. Functions as the accessible on-ramp; "agentic" is the credibility signal for technical readers.

**Honesty check:** PASS, DIRECT MATCH. Listed as "Daily" in Stack > AI Tooling — the HIGHEST frequency rating in that entire category, arguably making this the single most defensible AI claim Tomás has.

**Recommended use:** Strong candidate for TITLE TAG / H1 framing — "Daily" usage + broad recognizability makes it the best primary anchor. Pair with "Agentic" terms in supporting copy/meta description for depth.

---

### 🥉 3rd Place: "Harness Engineering"

**Why valuable (2026 signal):** This is the SLEEPER differentiator. Web research surfaced a cluster of 2026-dated articles specifically defining "harness engineering" (MindStudio: "Why Your Agent Wrapper Drives More Performance Than the Model"; Martin Fowler's site publishing on "Harness engineering for coding agent users"; Red Hat Developer's "Harness engineering: Structured workflows for AI-assisted development", April 2026). The concept — "Agent = Model + Harness," and that harness design produces measured 6x performance gaps (Stanford/Tsinghua cited) for the SAME underlying model — is a genuinely emerging, technically substantive concept, not hype-only. Crucially, it's a term that signals SENIOR/ARCHITECTURE-level thinking about AI tooling (designing the scaffolding/environment around agents) rather than just "I use Cursor." This aligns perfectly with a backend/architecture-oriented senior profile.

**Recruiter/search demand signal:** LOW-MEDIUM volume (it's a newer, more niche term — Martin Fowler + Red Hat Developer + MindStudio coverage signals it's reaching "serious engineering discourse" but not yet mainstream recruiter vocabulary). However, the QUALITY of the signal is high: a recruiter or technical screener who DOES search this term, or an AI agent that encounters it in `knowsAbout`, will correctly read it as "this person thinks about AI tooling architecturally, not just as a feature consumer."

**Honesty check:** PASS, DIRECT MATCH. Listed as "Active" in Stack > AI Tooling. This is also the term MOST likely to be unfamiliar to a generic recruiter — but that's fine, because it's positioned as a SUPPORTING/differentiator term (JSON-LD knowsAbout, About-section detail), not the primary hook. It rewards the technical reader/AI agent that does deeper analysis.

**Recommended use:** JSON-LD `knowsAbout` (high value for AI-agent parsing — a string match against a relatively rare, technically precise term is a strong signal). Could also appear in an expanded "Currently working on" / About blurb if the owner wants to spell out what it means in practice (e.g., "designing the feedback loops and constraints that make AI coding agents reliable in production codebases").

---

### Honorable Mentions (Ranked 4-8, with honesty flags)

| Rank | Term | 2026 Demand Signal | Honesty Check | Recommendation |
|------|------|---------------------|----------------|-----------------|
| 4 | **"LLM Orchestration"** | MEDIUM-HIGH. Multiple 2026 sources (orq.ai, aimultiple's "Top 22 frameworks and gateways", getmaxim.ai) confirm this is an active, growing category with named frameworks (LangGraph, LlamaIndex, Haystack, Semantic Kernel) and is described as "a fundamental component of AI development." | PASS — listed as "Active" in Stack > AI Tooling. | Use in JSON-LD `knowsAbout`. Slightly more niche/technical than "agentic" — good for the technical-evaluator audience, less so for generalist recruiters. Do NOT imply hands-on use of a SPECIFIC named framework (LangChain/LangGraph) unless that's separately verified — "LLM Orchestration" as a CONCEPT/PRACTICE is what's claimed, not a specific tool. |
| 5 | **"AI Pair Programming" / "AI Coding Agents"** | MEDIUM-HIGH. 2026 sources describe AI coding agents as mainstream — "Claude Code shipping engineering code 30% faster," "40 minutes saved per AI interaction." This is now an EXPECTED baseline skill, not a differentiator — but still a relevant search term recruiters use ("experience with AI coding tools"). | PASS via "Claude Code (Daily)" — Claude Code IS an AI pair-programming/coding-agent tool. | Good for VISIBLE content (e.g., "About" or a brief callout: "I pair-program daily with Claude Code"). Lower priority for JSON-LD/title — it's table-stakes phrasing now, not a differentiator, but still worth a visible mention since it's concretely true and recognizable to non-specialist recruiters. |
| 6 | **"Context Engineering"** | MEDIUM, rising fast. 2026 sources (Neo4j, Elastic, arXiv paper "Context Engineering: From Prompts to Corporate Multi-Agent Architecture") frame this as the evolutionary successor to prompt engineering — "95% of data teams plan to invest in context engineering training during 2026," "82% of IT/data leaders agree prompt engineering alone is insufficient." This is a genuinely hot, NOT-fading term as of mid-2026. | CONDITIONAL / STRETCH. Nothing in `common.json` explicitly names "context engineering." HOWEVER — it is arguably an implicit, real-world byproduct of "Harness Engineering" + "LLM Orchestration" + "Agentic Workflows" combined (context engineering is literally the discipline of managing what information agents have access to — which overlaps heavily with harness/orchestration work). | DO NOT add as a standalone claim without owner confirmation. If the owner confirms this is genuinely part of their daily practice (likely, given the adjacent terms ARE claimed), it could be ADDED to the Stack > AI Tooling list in `common.json` as a 6th item — but that's a CONTENT change, which is a roadmap decision, not something this research should silently assume. Flagging as a HIGH-VALUE term WORTH ASKING THE OWNER ABOUT. |
| 7 | **"Vibe Coding"** | Still searched/discussed in 2026, but explicitly framed by 2026 sources as the THING THAT WAS SUPERSEDED — "From Vibe to Agentic" (Medium), "Vibe Coding vs Agentic Coding: A Beginner's Guide" (sourcedesk.io). It now carries a slightly junior/hobbyist/prototype connotation in serious engineering discourse, in contrast to "agentic engineering" which is explicitly the production/senior framing. | N/A — DO NOT USE regardless of truth-value. | AVOID as a positioning term. Even if technically true that Tomás has done "vibe coding," using this term for a SENIOR portfolio risks under-positioning relative to "agentic" framing. This is a fading-relative-to-agentic term, not a fading-absolute term — it still gets traffic, but as the BEGINNER comparison point, which is the wrong association for this profile. |
| 8 | **"RAG" / "Retrieval-Augmented Generation"** | HIGH demand in the broader AI/ML engineering market — "84% of production AI assistants use RAG," "RAG tutorial searches up 340%." This is real and growing. | FAIL for direct claim. Nothing in `common.json` (stack, projects, experience) mentions RAG, vector databases, embeddings, or retrieval systems. Including this would be CLASSIC KEYWORD STUFFING — claiming a hot AI/ML term with zero evidentiary backing in the actual portfolio content. | DO NOT USE. This is the clearest example of "high search demand but would be a false/stretch claim." If the owner builds something RAG-related in the future (e.g., a project using embeddings/vector search), it becomes legitimate THEN — not now. Explicitly excluded from podium. |

### Additional Terms Investigated and Rejected

| Term | Verdict | Reason |
|------|---------|--------|
| "Model Context Protocol (MCP)" / "MCP Developer" | REJECTED for keyword positioning (but relevant to the PROJECT separately) | 2026 sources confirm MCP is "the default agent integration layer for serious production work" with real job-market salary data (~$60/hr average for MCP developer roles). HOWEVER — Tomás's content shows no MCP development experience. Note: the v2.0.0 PROJECT.md itself uses MCP tooling (HeroUI MCP, shadcn MCP) as BUILD-TIME tooling for THIS project — that's a meta-fact about how the portfolio was built, not a claim about Tomás's professional MCP expertise, and conflating the two would be a stretch. Could be an interesting "behind the scenes" note (e.g., "this portfolio itself was built using MCP-based tooling") but that's a content/positioning decision for the owner, not a keyword to claim as a skill. |
| "Prompt Engineering" | REJECTED, fading relative to "Context Engineering" | 2026 sources explicitly title articles "Prompt Engineering Is Dead: Why Context Engineering Is the Only Skill That Matters in 2026." Even if true of Tomás's practice, it's the WEAKER, more dated-sounding term vs. terms #1, #2, #4, and the conditional #6. |
| "AI Agents" (generic) | PARTIALLY USEFUL as connective phrase, not standalone | Too generic/broad to be a distinct podium entry — it's the connective tissue underlying "Agentic Workflows," "Harness Engineering," and "LLM Orchestration." Fine to use in flowing prose ("designs workflows where AI agents..."), but doesn't deserve its own podium slot. |
| "AI-Native Developer" / "AI-First Engineer" | REJECTED as a TITLE/role claim | 2026 sources confirm "AI Engineer" is the #1 fastest-growing job title (143% YoY) and note proliferation of titles like "AI-Native Developer." BUT — Tomás's actual role is "Full-stack Developer (Backend-oriented)" / "Backend Developer." Adopting an "AI-Native Developer" ROLE TITLE would misrepresent his actual job function — he's a backend/full-stack dev who USES AI tools heavily, not an AI/ML engineer building AI products. The honest framing is "[Full-stack/Backend Developer] who works AI-augmented daily" — not "AI-Native Developer" as a job title. This distinction is the crux of the "AI-protagonist but honest" brief. |

---

## Recommended Title / H1 / Meta-Description Framing

### Core positioning formula

> **[Real role: Backend-oriented Full-stack Developer]** who works **[Daily AI-Driven Development practice, framed via Agentic Workflows]** — backed by **[real, verifiable experience: enterprise platforms, SaaS, 3+ years]**.

The honest differentiator is NOT "I am an AI engineer" (false) — it's **"I am a senior backend/full-stack developer whose daily practice is already AI-augmented/agentic, evidenced by real production work."** This is a TRUE and CURRENTLY RARE positioning (most "AI-driven dev" content comes from AI/ML specialists or hobbyist vibe-coders, not from backend engineers doing hexagonal-architecture NestJS work at an enterprise insurance platform). That gap IS the differentiator.

### Title tag (EN canonical) — recommend ~50-60 chars

Options (pick one, A/B-testable):

- **A (role + AI-driven, broad):** `Tomás Pérez — Backend-Oriented Full-Stack Developer | AI-Driven Development`
- **B (agentic framing, more 2026-current):** `Tomás Pérez — Full-Stack Developer | Agentic AI-Driven Development`
- **C (status + role + AI, most recruiter-direct):** `Tomás Pérez | Full-Stack Developer (Backend) — Available · AI-Augmented Workflows`

**Recommendation: Option B.** "Agentic" is the 2026-current term (per podium #1) and pairs naturally with "AI-Driven Development" (podium #2, "Daily"). It reads as current without being a buzzword salad, and doesn't overclaim a job title that isn't his.

### H1 (visible, on-page)

The existing `identity.tagline` ("Creating software that solves real problems not just technical ones.") is strong as emotional positioning but carries ZERO keyword weight. Recommend the H1 retain the personal tagline (brand voice matters for human visitors) while a SECONDARY heading/subhead near the top carries the keyword-rich framing, e.g.:

> H1: "Creating software that solves real problems, not just technical ones."
> Subhead/role-line (already exists as `tagHighlight`): "3+ years building with Node.js, React, Next.js, NestJS and TypeScript — working AI-augmented, agentic-first, every day."

This is a MINIMAL content edit (append a clause to the existing `tagHighlight` or add a new short line) that injects podium terms #1/#2 into VISIBLE content — satisfying the JSON-LD "must match visible content" requirement for free.

### Meta description (~150-160 chars)

> `Tomás Pérez — Backend-oriented Full-Stack Developer (Node.js, NestJS, React, Next.js, TypeScript). 3+ years shipping enterprise platforms, AI-driven & agentic workflows daily. Open to remote/freelance.`

This packs: real role, real stack (table-stakes keywords for traditional tech recruiting — don't lose these to AI buzzwords), podium #1+#2 (agentic/AI-driven), real experience proof (enterprise platforms), and the CTA (open to remote/freelance) — all true, all traceable to `common.json`.

### JSON-LD `knowsAbout` recommended array (ordered by podium rank)

```
["Agentic Workflows", "AI-Driven Development", "Harness Engineering", "LLM Orchestration",
 "Node.js", "NestJS", "TypeScript", "React", "Next.js", "Hexagonal Architecture",
 "Clean Architecture", "SOLID Principles", "PostgreSQL", "Redis", "Claude Code"]
```

Rationale: AI-trend terms FIRST (this is the "protagonist" positioning the owner wants AI agents to key on), immediately followed by the core technical stack (so traditional ATS/recruiter-tool keyword matching on "NestJS"/"Node.js"/"TypeScript" — which is HIGH-CONFIDENCE table-stakes demand — isn't sacrificed for AI positioning). "Claude Code" as a named tool is a nice concrete, verifiable, specific signal (more credible than only abstract category terms).

### Where each term type belongs (dependency summary for roadmap)

| Term category | Title tag | Meta description | H1/visible copy | JSON-LD knowsAbout |
|----------------|-----------|-------------------|-------------------|---------------------|
| "Agentic" (podium #1) | Yes (1x) | Optional | Yes (subhead) | Yes |
| "AI-Driven Development" (podium #2) | Optional (alt to Agentic) | Yes | Yes (subhead) | Yes |
| "Harness Engineering" (podium #3) | No (too niche for title) | No | Optional (About detail) | Yes |
| "LLM Orchestration" (#4) | No | No | Optional | Yes |
| "AI Pair Programming"/"Claude Code" (#5) | No | Optional | Yes (concrete, credible) | Yes (as "Claude Code") |
| "Context Engineering" (#6, conditional) | No | No | No (pending owner confirmation) | Conditional — only if added to common.json first |
| Core stack (Node.js, NestJS, React, etc.) | No (too long) | Yes | Already present | Yes |

---

## Sources

**Part A (SEO mechanics):**
- [JSON-LD for SEO in 2026: The Complete Structured Data Guide](https://netstager.ae/blog/json-ld-for-modern-seo/)
- [Schema Markup Best Practices 2026: JSON-LD & Audit - Geneo](https://geneo.app/blog/schema-markup-best-practices-2026-json-ld-audit/)
- [Structured Data for Developers: JSON-LD Patterns That Work in 2026](https://usamasoft.com/blog/structured-data-json-ld-developers)
- [llms.txt Explained (May 2026): The Honest Guide](https://codersera.com/blog/llms-txt-complete-guide-2026/)
- [llms.txt vs robots.txt vs ai.txt: The Honest Guide](https://glasp.co/articles/llms-txt-ai-crawler-control)
- [The AI User-Agent Landscape in 2026: A Complete Reference](https://nohacks.co/blog/ai-user-agents-landscape-2026)
- [AI Crawler Access Control: The 2026 Decision Matrix](https://www.digitalapplied.com/blog/ai-crawler-access-control-2026-robots-llms-txt-decision-matrix)
- [Open Graph Tags: Boost Social Sharing and SEO in 2026](https://www.imarkinfotech.com/open-graph-tags-boost-social-sharing-and-seo-in-2026/)
- [Canonical Tags & SEO Architecture: 2026 Strategy](https://seeklab.io/blog/canonical-tags-seo-architecture-2026-strategy/)
- [15 Essential SEO Tags in 2026](https://www.link-assistant.com/news/html-tags-for-seo.html)
- [AI in Hiring: From Resume Parsing to Candidate Shortlisting](https://www.bizworkhq.com/blog/ai-recruitment-resume-parsing-to-candidate-shortlisting/)

**Part B (Keyword trends):**
- [From Vibe to Agentic: The 2026 Maturation of AI-Driven Development (Medium)](https://medium.com/technologai/from-vibe-to-agentic-the-2026-maturation-of-ai-driven-development-1bfb0844b5a6)
- [Top 13 Agentic AI Trends to Watch in 2026 (Firecrawl)](https://www.firecrawl.dev/blog/agentic-ai-trends)
- [Agentic Engineering: Complete Guide to AI-First Software Development Beyond Vibe Coding (NxCode)](https://www.nxcode.io/resources/news/agentic-engineering-complete-guide-vibe-coding-ai-agents-2026)
- [Vibe Coding vs Agentic Coding: A Beginner's AI Guide (sourcedesk.io)](https://www.sourcedesk.io/blog/vibe-coding-vs-agentic-coding-what-beginners-need-to-know-about-ai-driven-software-development-in-2026)
- [What is Harness Engineering? A Complete Introduction (2026)](https://harnessengineering.academy/blog/what-is-harness-engineering-introduction-2026/)
- [What Is Harness Engineering? Why Your Agent Wrapper Drives More Performance Than the Model (MindStudio)](https://www.mindstudio.ai/blog/what-is-harness-engineering)
- [How Stripe Ships 1,300 AI PRs a Week: Harness Engineering (MindStudio)](https://www.mindstudio.ai/blog/what-is-harness-engineering-beyond-prompt-context-engineering)
- [Harness engineering for coding agent users (Martin Fowler)](https://martinfowler.com/articles/harness-engineering.html)
- [Harness engineering: Structured workflows for AI-assisted development (Red Hat Developer, April 2026)](https://developers.redhat.com/articles/2026/04/07/harness-engineering-structured-workflows-ai-assisted-development)
- [Context engineering vs. prompt engineering (Elasticsearch Labs)](https://www.elastic.co/search-labs/blog/context-engineering-vs-prompt-engineering)
- [Why AI teams are moving from prompt engineering to context engineering (Neo4j)](https://neo4j.com/blog/agentic-ai/context-engineering-vs-prompt-engineering/)
- [Context Engineering: From Prompts to Corporate Multi-Agent Architecture (arXiv)](https://arxiv.org/pdf/2603.09619)
- [Prompt Engineering Is Dead: Why Context Engineering Is the Only Skill That Matters in 2026 (Medium)](https://rustcodeweb.medium.com/prompt-engineering-is-dead-why-context-engineering-is-the-only-skill-that-matters-in-2026-cdb1fe0b349b)
- [LLM Orchestration in 2026: Frameworks + Best Practices (orq.ai)](https://orq.ai/blog/llm-orchestration)
- [LLM Orchestration in 2026: Top 22 frameworks and gateways (aimultiple)](https://aimultiple.com/llm-orchestration)
- [$50-$82/hr Mcp Developer Job Jobs (ZipRecruiter, May 2026)](https://www.ziprecruiter.com/Jobs/Mcp-Developer-Job)
- [Hire MCP Developers from India (Workforce Next)](https://workforcenext.in/hire/mcp-developers/)
- [The State of AI Coding Agents (2026): From Pair Programming to Autonomous AI Teams (Medium)](https://medium.com/@dave-patten/the-state-of-ai-coding-agents-2026-from-pair-programming-to-autonomous-ai-teams-b11f2b39232a)
- [Software developer jobs rose in 2026 despite AI fears (Technical.ly)](https://technical.ly/workforce/software-developer-jobs-rise-2026-builders/)
- [Fastest Growing AI Roles in 2026: Data and Rankings (HeroHunt)](https://www.herohunt.ai/blog/fastest-growing-ai-roles-in-2026-data-and-rankings/)
- [AI Job Titles in 2026: A CTO's Guide to the Naming Chaos](https://www.ivanturkovic.com/2026/04/24/ai-job-titles-2026-naming-chaos/)
- [RAG Developers Demand in AI Job Market (CREDO SYSTEMZ)](https://www.credosystemz.com/blog/why-are-rag-developers-in-high-demand-in-the-ai-job-market/)
- [RAG: The Only AI Skill Web Devs Need (Develop Yourself / brianjenney.substack.com)](https://brianjenney.substack.com/p/277-rag-the-only-ai-skill-web-devs-fcb)

---

*Feature research for: Senior developer portfolio — SEO & AI discoverability (v2.1.0)*
*Researched: 2026-06-13*
