# Analysator

Analysator is a tool that acts as a landing page's analyst. It takes in a URL and returns a structured output that includes Company name, short description, Business Model, Key features, Target Market and Likely competitors all based on the pages content.

## Screenshots

![Screenshot](/analysator1.webp)
![Loading skeleton](/analysator-loading.webp)
![Analysis result](/analysator-result.webp)

## Features

- Takes in a url and returns a structured output
- Extracts company name, summary, business model, target market and likely competitors based on the pages content
- Confidence note on what the AI implied or was unsure about

## Tech Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Browserless (headless content fetching)
- Cheerio (HTML parsing)
- Groq API (AI inference)

## Prerequisites

- Node.js 20+
- A Browserless API key + request URL
- A Groq API key + request URL

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables: `cp example.env .env.local and update with your API keys
4. Run the development server: `npm run dev`

## Environment Variables

Variable | Description
-------- | -----------
`BROWSERLESS_API_KEY` | Your Browserless API key
`BROWSERLESS_URL` | Browserless API request URL
`GROQ_API_KEY` | Your Groq API key
`GROQ_REQUEST_URL` | Groq inference endpoint

## How it works

1. User submits URL via POST request to `/api/analyze`
2. Server fetches page's content via Browserless, strips unwanted elements (e.g footer, nav, etc) and Parses HTML with Cheerio.
3. Sends cleaned text to Groq with a structured system prompt
4. Parses Groq's JSON response -> returns structured analysis to client

## Project Structure

app/
    page.tsx           - main UI
    api/
        analyze.ts     - POST handler for analysis requests
components/
    analysis-card.tsx  - result display
    error-card.tsx     - error display
libs/
    utils.ts          - client-side utility functions
    utils-server.ts   - server-side utility functions
    types.ts          - shared type definitions

## Limitations

- Currently can't correctly discern the difference between a company or product websites and a generic blog or news site
- Site Contents are truncated to ~10K characters
- Runs on free tier of Browserless and Groq

## Acknowledgements

- [Browserless](https://www.browserless.io/)
- [Groq](https://groq.com/)
- [Cheerio](https://cheerio.js.org/)