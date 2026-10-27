# Analysator

Analysator is a tool that acts as a website analyst. It takes in a URL, normalizes it to its origin, discovers related pages on the site, uses an LLM to infer and select the top 3 most relevant pages (plus the origin/home page), fetches and aggregates their content, and returns a structured output that includes Company name, short description, Business Model, Key features, Target Market and Likely competitors based on the full site context.

## Screenshots

![Screenshot](https://raw.githubusercontent.com/oluwabillionz96/analyzer/main/public/analysator.webp)
![Loading skeleton](https://raw.githubusercontent.com/oluwabillionz96/analyzer/main/public/analysator-loading-v2.webp)
![Analysis result](https://raw.githubusercontent.com/oluwabillionz96/analyzer/main/public/analysator-result-v2.webp)

## Features

- Analyzes entire websites (not just landing pages) to extract structured business intelligence
- Discovers related pages from the site and selects the top 3 most relevant pages (LLM-inferred)
- Aggregates content from the origin/home page and the top 3 most relevant pages to build a fuller site context
- Extracts company name, summary, business model, target market and likely competitors based on aggregated site content
- AI confidence notes on inferred vs. explicitly stated information
- Dynamic example URLs populated from most searched sites in the database
- Persistent history sidebar with sortable filters (most recent, oldest, most searched, least searched)
- Responsive design with mobile-optimized sidebar behavior
- Skeleton loading states for smooth user experience
- Navigation between home and analysis pages
- Cached results in PostgreSQL to avoid redundant API calls, re-analyzed on cache hit once older than 3 days

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- PostgreSQL (database)
- Browserless (headless content fetching)
- Cheerio (HTML parsing)
- Groq API (AI inference)
- Lucide React (icons)

## Prerequisites

- Node.js 20+
- PostgreSQL database
- A Browserless API key + request URL
- A Groq API key + request URL

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your PostgreSQL database and create the required tables (see Database Schema below)
4. Set up environment variables: `cp example.env .env.local` and update with your API keys and database URL
5. Run the development server: `npm run dev`

## Database Schema

You'll need to create a PostgreSQL table with the following structure:

```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  "companyName" TEXT,
  summary TEXT,
  "targetCustomers" JSONB,
  "businessModel" TEXT,
  "keyFeatures" JSONB,
  "likelyCompetitors" JSONB,
  "confidenceNotes" TEXT,
  searchcount INTEGER DEFAULT 1,
  is_success BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_updated_content_at TIMESTAMP DEFAULT NOW(),
  error TEXT,
  pagecontent TEXT
);

CREATE INDEX idx_analyses_origin ON analyses(origin);
CREATE INDEX idx_analyses_searchcount ON analyses(searchcount);
CREATE INDEX idx_analyses_updated_at ON analyses(updated_at);
CREATE INDEX idx_analyses_last_updated_content_at ON analyses(last_updated_content_at);
```

## Environment Variables

| Variable              | Description                 |
| --------------------- | --------------------------- |
| `BROWSERLESS_API_KEY` | Your Browserless API key    |
| `BROWSERLESS_URL`     | Browserless API request URL |
| `GROQ_API_KEY`        | Your Groq API key           |
| `GROQ_REQUEST_URL`    | Groq inference endpoint     |
| `DATABASE_CONNECTION_STRING`        | Your POSTGRES database url  |

## How it works

1. User submits URL via POST request to `/api/analyze` (or clicks a suggested URL from the hero section)
2. Server normalizes the URL to its origin and discovers related pages on the site.
3. An LLM infers and selects the top 3 most relevant pages for analysis.
4. Server fetches content from the origin/home page and those top 3 pages via Browserless, strips unwanted elements (e.g footer, nav, etc) and parses HTML with Cheerio; content is aggregated to build the site context.
5. Sends the aggregated cleaned text to Groq with a structured system prompt
6. Parses Groq's JSON response -> returns structured analysis to client
7. Analysis is cached in PostgreSQL and becomes available in the searchable history sidebar
8. On a repeat request the cached row is returned and its `searchcount` is incremented, but if `last_updated_content_at` is more than 3 days old the site is re-analyzed and the cached row is refreshed in place

## Project Structure

```txt
app/
  page.tsx              - main landing page UI with hero, features, and how-it-works sections
  analysis/
    page.tsx            - analysis results page with back-to-home navigation
  api/
    analyze/
      route.ts          - POST handler for analysis requests
    history/
      route.ts          - GET handler for fetching sorted/paginated history
    pastAnalyzes/
      route.ts          - PATCH handler for retrieving specific analysis by ID
components/
  hero-section.tsx      - hero with input form and dynamic example URLs
  features-section.tsx  - "What you get" feature grid
  how-it-works.tsx      - three-step process explanation
  history-section.tsx   - sortable sidebar with past analyses
  analysis-card.tsx     - result display
  error-card.tsx        - error display
  history-card.tsx      - individual history item display
  app-layout.tsx        - main layout wrapper
  footer.tsx            - footer component
libs/
  analyze-page.ts       - orchestration for fetching, extracting, and analyzing page content
  db.ts                 - PostgreSQL connection pool
  db-utils.ts           - database query helpers
  get-analysis.ts       - Groq inference call and structured system prompt
  get-page-content.ts   - Browserless content fetch, HTML cleanup and truncation
  page-discovery.ts     - page discovery utilities
  prompt.ts             - prompt definitions
  rate-limit-store.ts   - rate limiting storage
  rate-limits.ts        - rate limiting logic
  readable-stream-async-iterable.d.ts - Type augmentation for async iteration over ReadableStream
  stream-response.ts    - streaming response helpers
  utils.ts              - client-side utility functions
  utils-server.ts       - server-side utility functions
  types.ts              - shared type definitions
  context/
    app-context.tsx     - global state management
  hooks/
    use-app-context.ts  - context hook
    use-is-mobile.ts    - responsive design hook
```

## Limitations

- Currently can't correctly discern the difference between a company or product websites and a generic blog or news site
- Aggregated site content is truncated to fit model/context constraints
- Runs on free tier of Browserless and Groq

## Acknowledgements

- [Browserless](https://www.browserless.io/)
- [Groq](https://groq.com/)
- [Cheerio](https://cheerio.js.org/)
