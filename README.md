# SalesDuo — Backend

This is the backend API for SalesDuo. It provides endpoints to:

- Scrape Amazon product pages for an ASIN (title, bullets, description).
- Call an AI model (OpenAI Responses API) to generate optimized title, bullets, description and keywords.
- Persist original and optimized copies in MySQL using Drizzle ORM.

Contents
- `src/` — Express server, controllers, services, and Drizzle schema.
- `docker-compose.yml` — local MySQL service used for development.

Quick start (dev)

1. Install dependencies and start the local DB

   ```powershell
   cd backend
   npm install
   npm run db:up
   ```

2. Configure environment variables

   Create `backend/.env` (not checked into git) with these variables:

   ```text
   DATABASE_URL=mysql://root:password@127.0.0.1:3306/salesduo
   OPENAI_API_KEY=sk-<your-key>
   PORT=3000
   ```

3. Apply DB schema and start server

   ```powershell
   npm run db:push   # push drizzle schema to the DATABASE_URL
   npm run dev       # starts nodemon + tsx
   ```

Endpoints

- POST /api/runs
  - Body: `{ "asin": "<ASIN>" }`
  - Behavior: ensures original data exists (scrapes if necessary), creates a run, calls AI to optimize, stores optimized data, and returns `{ run, original, optimized }` on success.

- GET /api/runs
  - Returns recent completed runs. Query parameters: `limit`, `offset`.

- GET /api/runs/:asin
  - Returns completed runs for the provided ASIN (history view).

Key files
- `src/services/scrape.service.ts` — Cheerio + axios scraping logic and cleaning heuristics.
- `src/services/ai.service.ts` — Builds prompts and calls OpenAI Responses API. Expects JSON-only responses using a specific schema.
- `src/controllers/runs.controller.ts` — Coordinates scraping, AI calls, and DB writes.
- `src/db/schema.ts` — Drizzle ORM schema for runs, original_data and optimized_data.

AI prompt summary

- System persona: ecommerce copy expert
- Output: JSON-only using the schema:

  {
    "title": "optimized title (string, <=200 chars)",
    "bullets": ["bullet1","bullet2",...],
    "description": "optimized description (string)",
    "keywords": ["kw1","kw2", ...]
  }

- The service includes a retry if the response isn't parseable JSON.

Notes & caveats

- The scraper targets `https://www.amazon.in/dp/<ASIN>` by default. Change the URL template if you want another marketplace.
- Scraping Amazon may be rate-limited or blocked — for production, consider a headless browser, proxies, or an official product data API.
- Keep `OPENAI_API_KEY` private. The code expects it in the environment.

Troubleshooting

- If `db:push` fails, ensure `DATABASE_URL` is correct and MySQL is reachable (check `docker-compose logs`).
- If AI calls fail, verify `OPENAI_API_KEY` is valid and has access to the Responses API.

Next steps (optional)

- Add `backend/.env.example` with placeholders.
- Export SQL migration or a small script to automatically create the DB and run `db:push`.