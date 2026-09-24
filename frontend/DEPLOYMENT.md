# Deploying Ledger (FastAPI + React)

Two ways to deploy this, both documented below:

- **Vercel** (§4) — two projects from this repo, one for the frontend, one
  for the FastAPI backend. Recommended if you're already using Vercel.
- **Single container** (§1–3, §5) — one Docker image serving both the API
  and the built frontend, deployable to Render/Fly/Railway/anywhere that
  runs a container.

## 1. Run it locally first

```bash
# terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# terminal 2 — frontend (dev mode, hot reload)
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to `localhost:8000`, so
the form's requests reach FastAPI without any extra config.

## 2. Build the single deployable image

The `Dockerfile` at the project root does this in two stages:
1. Builds the React app (`npm run build` → `dist/`)
2. Copies `dist/` into a Python image alongside `backend/`, and runs FastAPI
   with `uvicorn`. `backend/main.py` serves `dist/` directly and falls back
   to `index.html` for client-side routes (so `/dashboard`, `/predict`, etc.
   work on a hard refresh too).

```bash
docker build -t ledger-app .
docker run -p 8000:8000 ledger-app
```

Visit `http://localhost:8000` — this is now the exact container you'll
deploy, running the real model.

## 3. Push it to a host

Any container host works. Two common free/cheap options:

### Render
1. Push this repo to GitHub.
2. Render dashboard → **New → Web Service** → connect the repo.
3. Render auto-detects the `Dockerfile`. Leave build/start commands blank
   (the Dockerfile's `CMD` handles it).
4. Set the port to `8000` (or leave default — Render reads `EXPOSE`).
5. Deploy. You get a public URL like `https://ledger-app.onrender.com`
   serving both the UI and `/api/predict`.

### Fly.io
```bash
fly launch          # detects the Dockerfile, creates fly.toml
fly deploy
```

### Railway
Railway dashboard → **New Project → Deploy from GitHub** → it detects the
Dockerfile automatically → Deploy.

All three: since the frontend and API share one origin in this setup, you
don't need to touch CORS or set `VITE_API_URL` — `predict.js` calls the
relative path `/api/predict`, which resolves correctly wherever the
container is hosted.

## 4. Deploying on Vercel

Vercel now natively runs FastAPI as a Vercel Function, so both pieces can
live on Vercel — as **two separate Vercel projects from the same repo**
(one for the frontend, one for the backend). This is more reliable than
trying to serve both from a single Python function, and it's how Vercel's
own docs recommend structuring a split frontend/backend repo.

### 4a. Backend project

1. Push this repo to GitHub (if you haven't already).
2. Vercel dashboard → **Add New → Project** → import the repo.
3. In the import screen, set **Root Directory** to `backend`.
4. Framework Preset: Vercel auto-detects FastAPI from `main.py` (it exports
   an `app` instance, which is exactly what Vercel looks for). Leave build
   command blank — Vercel installs `backend/requirements.txt` automatically.
5. Deploy. You'll get a URL like `https://ledger-api.vercel.app`.
6. Sanity check it: visit `https://ledger-api.vercel.app/api/health` — you
   should see `{"status": "ok"}`.

`backend/vercel.json` sets a 30s function timeout, giving scikit-learn and
the model file room to load on a cold start.

### 4b. Frontend project

1. Same repo, **Add New → Project** again, this time leave **Root
   Directory** as `.` (the project root).
2. Framework Preset: Vercel auto-detects **Vite**. Build command
   `npm run build`, output directory `dist` — both are the defaults, no
   changes needed.
3. Add an environment variable:
   ```
   VITE_API_URL = https://ledger-api.vercel.app
   ```
   (use the URL from step 4a). `src/api/predict.js` reads this automatically.
4. Deploy. You'll get a URL like `https://ledger-app.vercel.app`.

CORS is already handled: `backend/main.py` allows any `*.vercel.app` origin
(covers both your production URL and Vercel's per-branch preview URLs), so
you won't need to touch it again as you keep deploying.

From here on, every `git push` redeploys both projects independently.

## 5. Alternative: single container (Render/Fly/Railway)

If you'd rather run one service instead of two Vercel projects, the
`Dockerfile` at the project root builds the frontend and serves it *and*
the API from one FastAPI process — no CORS config needed at all since
everything shares one origin.

```bash
docker build -t ledger-app .
docker run -p 8000:8000 ledger-app
```

Push that same Dockerfile to Render, Fly.io, or Railway — all three
auto-detect it:

- **Render**: dashboard → New → Web Service → connect repo → deploy (build/start
  commands stay blank, the Dockerfile's `CMD` handles it).
- **Fly.io**: `fly launch` then `fly deploy`.
- **Railway**: New Project → Deploy from GitHub → deploy.

## Notes on the model

- `backend/loan_default_model.pkl` is a scikit-learn `DecisionTreeClassifier`
  trained on 24 one-hot-encoded columns (see the detailed comment at the top
  of `backend/main.py` for the exact column order and category mapping).
- It was trained under scikit-learn 1.6.1 — `requirements.txt` pins
  `scikit-learn>=1.6,<1.7` to avoid version-mismatch warnings/behavior
  differences on load.
- The tree has no depth limit (`max_depth=None`), which typically means it
  fit the training data very closely. That's a modeling choice from the
  notebook, not something the backend changes — if you retrain with
  different hyperparameters, just drop the new `.pkl` in `backend/` with the
  same filename and column order.
