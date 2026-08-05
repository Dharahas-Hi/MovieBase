# MOVIEBASE

A movie & TV show database built with **React + Vite**.
Browse movies, TV shows, genres, trailers, and upcoming releases — fully
client-side, no backend required.

## 🚀 Live Demo

```
https://dharahas-hi.github.io/MovieBase/
```

## 📁 Project Structure

```
├── frontend/            # React + Vite single-page app
│   ├── src/             # Components, pages, services, context
│   └── public/          # Static assets (favicon, images)
└── .github/workflows/   # GitHub Pages deploy workflow
```

## 🛠️ Local Development

```bash
cd frontend
npm install
npm run dev
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_CORS_PROXY` | Optional proxy for API calls (e.g. `https://corsproxy.io/?`) — only needed if the content API is blocked on your network. |

- `.env` — local dev config (committed, proxy enabled by default)
- `.env.production` — production override (direct API calls, no proxy)

## 🚢 Deploying to GitHub Pages

This repo uses a **GitHub Actions workflow** (`.github/workflows/static.yml`)
that builds the app and publishes `frontend/dist` to GitHub Pages on every push
to `main`.

### One-time setup

1. Enable GitHub Pages: Repo → Settings → Pages → under **Build and
   deployment**, set **Source** to **GitHub Actions**.
2. **Push to `main`** — the workflow builds and deploys automatically. You can
   also trigger it manually from the **Actions** tab.

### How it works

- `BrowserRouter` uses `basename` so routes work under the `/MovieBase/` path.
- A `404.html` copy of `index.html` is added during the build so deep links
  (e.g. `/movie/123`) work on refresh/sharing.
- All fallback poster paths are base-aware, so images load under the subpath.

### Notes

- If API calls fail for some visitors, set `VITE_CORS_PROXY` in
  `frontend/.env.production` and re-deploy.
