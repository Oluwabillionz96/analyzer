import { PageLink } from "./types";
import { getOrigin } from "./utils-server";

const GROQ_MODEL = "openai/gpt-oss-20b";
const MAX_CANDIDATES = 25;
const MAX_PATH_DEPTH = 3;
const MAX_RANKED_PAGES = 3;

const ASSET_EXTENSION =
  /\.(png|jpe?g|gif|svg|webp|avif|ico|bmp|pdf|zip|rar|7z|tar|gz|css|js|mjs|json|xml|mp[34]|webm|ogg|wav|woff2?|ttf|eot|webmanifest)(\?.*)?$/i;

const NOISE_PATH_SEGMENTS = new Set([
  "login",
  "log-in",
  "signin",
  "sign-in",
  "register",
  "signup",
  "sign-up",
  "reset-password",
  "forgot-password",
  "cart",
  "checkout",
  "account",
  "admin",
  "logout",
  "wp-admin",
  "wp-includes",
  "wp-content",
  "password",
]);

function normalizeHref(href: string): string | null {
  try {
    const url = new URL(href);
    url.hash = "";
    const path =
      url.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
    return `${url.origin}${path}${url.search}`;
  } catch {
    return null;
  }
}

export function filterCandidateLinks(
  links: PageLink[],
  rootUrl: string,
): PageLink[] {
  const rootOrigin = getOrigin(rootUrl);
  const seen = new Set<string>();
  const candidates: PageLink[] = [];

  for (const link of links) {
    if (getOrigin(link.href) !== rootOrigin) continue;

    const href = normalizeHref(link.href);
    if (!href) continue;
    if (seen.has(href)) continue;

    const url = new URL(href);
    if (url.pathname === "/") continue;

    if (ASSET_EXTENSION.test(url.pathname.toLowerCase())) continue;

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length > MAX_PATH_DEPTH) continue;
    if (
      segments.some((segment) => NOISE_PATH_SEGMENTS.has(segment.toLowerCase()))
    ) {
      continue;
    }

    seen.add(href);
    candidates.push({ href, origin: url.origin, anchor: link.anchor });

    if (candidates.length >= MAX_CANDIDATES) break;
  }

  return candidates;
}

async function rankDiscoveryPages(
  rootUrl: string,
  candidates: PageLink[],
  apiKey?: string,
): Promise<string[]> {
  const groqUrl = process.env.GROQ_REQUEST_URL;
  if (!groqUrl || !apiKey || candidates.length === 0) return [];

  const list = candidates.map((c) => ({ href: c.href, anchor: c.anchor }));

  try {
    const response = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a site-mapping strategist for a business-analysis tool. Given a home page URL and a list of internal pages, choose up to 3 pages most useful for understanding a business: what it builds and sells, who it sells to, its pricing/business model, and its standout features. Prefer product, solution, pricing, features, about, and customers pages. Ignore login, cart, account, and trivial pages.",
          },
          {
            role: "user",
            content:
              `Home page: ${rootUrl}\nCandidate pages:\n${JSON.stringify(list)}\n` +
              `Respond with JSON only: {"pages": ["<absolute url>", ...]} — at most ${MAX_RANKED_PAGES}, each an exact candidate href.`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("Page ranking request failed", { status: response.status });
      return [];
    }

    const aiData = await response.json();
    const content = JSON.parse(aiData.choices[0].message.content);
    const picked: string[] = Array.isArray(content.pages) ? content.pages : [];

    const candidateHrefs = new Set(candidates.map((c) => c.href));
    const unique: string[] = [];
    for (const href of picked) {
      if (typeof href !== "string") continue;
      if (!candidateHrefs.has(href)) continue;
      if (unique.includes(href)) continue;
      unique.push(href);
      if (unique.length >= MAX_RANKED_PAGES) break;
    }
    return unique;
  } catch (error) {
    console.warn("Page ranking failed", { error });
    return [];
  }
}

export default async function discoverPages(
  rootUrl: string,
  links: PageLink[],
  apiKey?: string,
): Promise<string[]> {
  const candidates = filterCandidateLinks(links, rootUrl);
  if (candidates.length === 0) return [];
  return rankDiscoveryPages(rootUrl, candidates, apiKey);
}
