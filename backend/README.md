# ShambaLink API

This small Node.js API provides the first persistent backend for the static site:

- `GET /api/health` — service health check
- `GET /api/listings?search=maize&role=farmer` — marketplace listings
- `POST /api/interests` — stores farmer, agent, or buyer onboarding interest
- `POST /api/questions` — records an unanswered AI question for the ShambaLink team
- `POST /api/visits` — records an anonymous page visit
- `GET /api/visits` — returns recent visits for the owner with `Authorization: Bearer $ADMIN_TOKEN`

## Run locally

```bash
cd backend
copy .env.example .env
npm start
```

The API currently stores development data in `backend/data/store.json` (ignored from version control). Set `DATA_FILE` to a durable volume in production. The relational production schema is in `backend/database.sql`; it creates `listings`, `interests`, and `unanswered_questions` tables for PostgreSQL. Apply it to a managed PostgreSQL database before migrating the API storage layer:

```bash
psql "$DATABASE_URL" -f database.sql
```

Set `ALLOWED_ORIGIN` to the exact frontend origin rather than `*`.
Set a long random `ADMIN_TOKEN` to protect the owner visit log. Set `VISIT_WEBHOOK_URL` to an HTTPS webhook for an external notification on each new visit. The webhook receives only the page path, referrer, language, ID, and timestamp.

The current frontend remains usable without an API. To connect it, set `window.SHAMBALINK_API_URL` before `script.js` loads, for example:

```html
<script>window.SHAMBALINK_API_URL = "https://api.Shambalink.com";</script>
<script src="script.js"></script>
```

This is an initial production-shaped API, not an authentication or payment system. The JSON adapter remains the local fallback; use the schema and a managed PostgreSQL connection for production data, then add managed authentication, rate limiting, and HTTPS before accepting sensitive or commercial data.

## Deploy

`render.yaml` defines a Render web service with a persistent disk for the JSON store. After deploying, copy the service URL into `window.SHAMBALINK_API_URL` in `index.html`, then redeploy the GitHub Pages site. GitHub Pages can host the frontend, but it cannot run this Node.js process itself.
