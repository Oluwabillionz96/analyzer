# Analysator

Analysator is a tool that acts as a landing page's analyst. It takes in a URL and returns a structured output that includes Company name, short description, Business Model, Key features, Target Market and Likely competitors all based on the pages content.

## Screenshots

![Screenshot](https://raw.githubusercontent.com/oluwabillionz96/analyzer/main/public/analysator.webp)
![Loading skeleton](https://raw.githubusercontent.com/oluwabillionz96/analyzer/main/public/analysator-loading-v2.webp)
![Analysis result](https://raw.githubusercontent.com/oluwabillionz96/analyzer/main/public/analysator-result-v2.webp)

## Features

- Analyzes landing pages and extracts structured business intelligence
- Extracts company name, summary, business model, target market and likely competitors based on the pages content
- AI confidence notes on inferred vs. explicitly stated information
- Dynamic example URLs populated from most searched sites in the database
- Persistent history sidebar with sortable filters (most recent, oldest, most searched, least searched)
- Responsive design with mobile-optimized sidebar behavior
- Skeleton loading states for smooth user experience
- Navigation between home and analysis pages
- Cached results in PostgreSQL to avoid redundant API calls

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- PostgreSQL (database)
- Browserless (headless content fetching)
- Cheerio (HTML parsing)
- Groq API (AI inference)

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
  url TEXT NOT NULL,
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
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analyses_url ON analyses(url);
CREATE INDEX idx_analyses_searchcount ON analyses(searchcount);
CREATE INDEX idx_analyses_updated_at ON analyses(updated_at);
```

## Environment Variables

| Variable              | Description                 |
| --------------------- | --------------------------- |
| `BROWSERLESS_API_KEY` | Your Browserless API key    |
| `BROWSERLESS_URL`     | Browserless API request URL |
| `GROQ_API_KEY`        | Your Groq API key           |
| `GROQ_REQUEST_URL`    | Groq inference endpoint     |
| `DATABASE_URL`        | Your POSTGRES database url  |

## How it works

1. User submits URL via POST request to `/api/analyze` (or clicks a suggested URL from the hero section)
2. Server fetches page's content via Browserless, strips unwanted elements (e.g footer, nav, etc) and parses HTML with Cheerio.
3. Sends cleaned text to Groq with a structured system prompt
4. Parses Groq's JSON response -> returns structured analysis to client
5. Analysis is cached in PostgreSQL and becomes available in the searchable history sidebar

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
      route.ts          - GET handler for retrieving specific analysis by ID
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
  db.ts                 - PostgreSQL connection pool
  db-utils.ts           - database query helpers
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
- Site Contents are truncated to ~10K characters
- Runs on free tier of Browserless and Groq

## Acknowledgements

- [Browserless](https://www.browserless.io/)
- [Groq](https://groq.com/)
- [Cheerio](https://cheerio.js.org/)
