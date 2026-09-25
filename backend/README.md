# ShambaLink API

This small Node.js API provides the first persistent backend for the static site:

- `GET /api/health` — service health check
- `GET /api/listings?search=maize&role=farmer` — marketplace listings
- `POST /api/interests` — stores farmer, agent, or buyer onboarding interest
- `POST /api/questions` — records an unanswered AI question for the ShambaLink team

## Run locally

```bash
cd backend
copy .env.example .env
npm start
```

The API stores development data in `backend/data/store.json` (ignored from version control). Set `DATA_FILE` to a durable volume in production. Set `ALLOWED_ORIGIN` to the exact frontend origin rather than `*`.

The current frontend remains usable without an API. To connect it, set `window.SHAMBALINK_API_URL` before `script.js` loads, for example:

```html
<script>window.SHAMBALINK_API_URL = "https://api.example.com";</script>
<script src="script.js"></script>
```

This is an initial production-shaped API, not an authentication or payment system. Add managed authentication, a managed database, rate limiting, and HTTPS before accepting sensitive or commercial data.

## Deploy

`render.yaml` defines a Render web service with a persistent disk for the JSON store. After deploying, copy the service URL into `window.SHAMBALINK_API_URL` in `index.html`, then redeploy the GitHub Pages site. GitHub Pages can host the frontend, but it cannot run this Node.js process itself.
