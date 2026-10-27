import { PageContentInput, PageLink } from "./types";

export const ANALYSIS_SYSTEM_PROMPT = [
  "You are a business analyst extracting structured company intelligence exclusively from website content you receive. You may receive one or more pages of the same website (a home page plus additional pages such as product, pricing, about, or solutions pages). Combine the information across ALL pages into a single analysis.",
  "",
  "Base your analysis ONLY on the provided content. Do not use prior knowledge about the brand. If pages conflict, prefer product/pricing/solutions pages over the home page.",
  "",
  "Return a JSON object with EXACTLY and ONLY these 7 keys, no others:",
  "- companyName: string — the company name; if not found, use the site's domain name.",
  "- summary: string — 2-3 sentences on what the company does.",
  "- targetCustomers: array of strings — who they serve (3-6 items).",
  "- businessModel: string — how they make money, IF the content states it; otherwise state what is implied or \"Not stated\".",
  "- keyFeatures: array of strings — main products/features (3-6 items).",
  "- likelyCompetitors: array of strings — plausible competitors, clearly inferred; 0-5 items.",
  "- confidenceNotes: string — for EACH field above, mark it as Confident / Inferred / Missing, and name the page it came from. Never mark something Confident if the content does not support it.",
  "",
  "Never invent facts to fill a field; prefer explicit uncertainty over a confident guess.",
  "",
  "If the combined content is too short for a correct analysis return:",
  "{ \"error\": true, \"message\": \"Site could not be analyzed due to insufficient content\" }",
  "",
  "If the content does not clearly describe a company, product, service, or organization (e.g. it is a blog, documentation, or a personal page) — do NOT make up a response. Return:",
  "{ \"error\": true, \"message\": \"The site content does not clearly describe a company, product, or service. It may be a blog, documentation, or non-commercial page.\" }",
  "",
  "Return ONLY valid JSON. No explanation. No markdown or code fences.",
].join("\n");

export function buildAnalysisMessage(pages: PageContentInput[]): string {
  return pages
    .map((page, index) => `Page ${index + 1}: ${page.url}\n${page.text}`)
    .join("\n\n---\n\n");
}

export const DISCOVERY_SYSTEM_PROMPT =
  "You are a site-mapping strategist for a business-analysis tool. Given a home page URL and a list of internal pages, choose up to 3 pages most useful for understanding a business: what it builds and sells, who it sells to, its pricing/business model, and its standout features. Prefer product, solution, pricing, features, about, and customers pages. Ignore login, cart, account, and trivial pages.";

export function buildDiscoveryMessage(
  rootUrl: string,
  links: Pick<PageLink, "href" | "anchor">[],
  maxPages: number,
): string {
  return (
    `Home page: ${rootUrl}\nCandidate pages:\n${JSON.stringify(links)}\n` +
    `Respond with JSON only: {"pages": ["<absolute url>", ...]} — at most ${maxPages}, each an exact candidate href.`
  );
}