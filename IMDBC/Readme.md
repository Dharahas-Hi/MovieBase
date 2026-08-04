# MOVIEBASE

A movie & TV show database built with **React + Vite**, powered by the TMDB API.
Browse movies, TV shows, genres, trailers, and upcoming releases — fully
client-side, no backend required.

## 🚀 Live Demo

Once deployed, the site runs at:

```
https://<your-username>.github.io/MovieBase/
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
| `VITE_CORS_PROXY` | Optional proxy for TMDB API calls (e.g. `https://corsproxy.io/?`) — only needed if `api.themoviedb.org` is blocked on your network. |

- `.env` — local dev config (committed, proxy enabled by default)
- `.env.production` — production override (direct TMDB calls, no proxy)

## 🚢 Deploying to GitHub Pages

This repo uses a **GitHub Actions workflow** (`.github/workflows/deploy.yml`)
that builds the app and publishes `frontend/dist` to GitHub Pages on every push
to `main`.

### One-time setup

1. **Rename the repo** on GitHub to `MovieBase` (Settings → General → Repository
   name). GitHub Pages URLs must match the repo name — the app is built with
   `base: '/MovieBase/'` in `vite.config.js`.
2. **Enable GitHub Pages**: Repo → Settings → Pages → under **Build and
   deployment**, set **Source** to **GitHub Actions**.
3. **Push to `main`** — the workflow builds and deploys automatically. You can
   also trigger it manually from the **Actions** tab.

### How it works

- `BrowserRouter` uses `basename` so routes work under the `/MovieBase/` path.
- A `404.html` copy of `index.html` is added during the build so deep links
  (e.g. `/movie/123`) work on refresh/sharing.
- All fallback poster paths are base-aware, so images load under the subpath.

### Notes

- **TMDB API key** is embedded in the client — it's public by design (TMDB v3
  keys are meant for browser use).
- If TMDB calls fail for some visitors, set `VITE_CORS_PROXY` in
  `frontend/.env.production` and re-deploy.
