# CURSUS AI

Career intelligence for aspiring AI Engineers. Upload a resume, compare it with a job description, and get a week-by-week learning roadmap, optionally enriched by a local AI model.

## What it does

| Page | What happens |
| --- | --- |
| Dashboard (`/`) | Shows your progress through the three steps and whether the backend and AI engine are reachable. |
| Resume Analyzer | Extracts skills, experience, education and projects from a PDF. The skill list is editable and shared with every other page. |
| Job Matcher | Measures how many of a job description's skills you already have and lists potential gaps. |
| Skill Gap Roadmap | Builds a 2 to 12 week plan. **Quick plan** is rule-based and instant. **AI-enhanced** adds a summary, gap explanations, projects and interview topics from a local Ollama model and takes about two minutes on a CPU-only machine. |

Roadmap topics can be ticked off as you learn them, and the dashboard shows what is up next. The interface follows your system's light or dark setting, with a switch in the sidebar to override it. Roadmaps print cleanly, with every week expanded.

## Accounts

Using the app requires an account. Sign up with a name, email and password; the password is hashed with Argon2id and never stored. Signing in sets an HttpOnly session cookie that lasts 30 days, or until the browser closes if you untick "Keep me signed in". Sessions are stored server-side, so signing out revokes them immediately. Repeated failed sign-ins from one address or for one email are blocked for 15 minutes after 8 failures.

Accounts and sessions live in a SQLite database at `backend/data/cursus.db`, created on first start. Set `DATABASE_URL` to use Postgres or another database supported by SQLAlchemy.

Your profile, job description, results and progress are stored in the browser's localStorage, scoped to the signed-in account. Nothing leaves your machine except calls to your own backend and Ollama.

## Running locally

You need three processes: Ollama (only for AI-enhanced roadmaps), the FastAPI backend and the Next.js frontend.

### 1. Ollama (optional)

```bash
ollama pull qwen3:4b
```

Ollama runs as a background service after installation. The app shows "AI ready" in the header when it can reach the model.

### 2. Backend

```bash
cd backend
python -m venv ../.venv
../.venv/Scripts/activate        # macOS/Linux: source ../.venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs on http://localhost:8000 and its interactive docs are at http://localhost:8000/docs.

Optional environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated frontend origins allowed to call the API. |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Where Ollama is listening. |
| `OLLAMA_MODEL` | `qwen3:4b` | Model used for AI-enhanced roadmaps. |
| `OLLAMA_TIMEOUT_SECONDS` | `240` | How long the backend waits for the model. |
| `OLLAMA_NUM_THREAD` | CPU cores minus one | Threads the model may use. One core is left free so the app stays responsive during generation. |
| `DATABASE_URL` | SQLite file in `backend/data/` | Any SQLAlchemy URL, for example `postgresql+psycopg://user:pass@host/db`. |
| `COOKIE_SECURE` | `false` | Set to `true` when serving over HTTPS so the session cookie is only sent encrypted. |
| `COOKIE_SAMESITE` | `lax` | Use `none` (with `COOKIE_SECURE=true`) only if the frontend and API are on different sites. |

Use `backend/requirements.txt`. The older `requirements.txt` at the repository root is missing `pypdf` and `httpx`.

To run the backend tests:

```bash
pip install -r requirements-dev.txt
pytest
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. If the backend runs elsewhere, copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_URL`.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Liveness check. |
| GET | `/api/v1/ai/status` | Whether Ollama is reachable and the model is installed. |
| POST | `/api/v1/auth/register` | Create an account and sign in. |
| POST | `/api/v1/auth/login` | Sign in; sets the session cookie. |
| POST | `/api/v1/auth/logout` | Revoke the session and clear the cookie. |
| GET | `/api/v1/auth/me` | The signed-in user, or 401. |
| POST | `/api/v1/resumes/analyze` | PDF upload; returns detected skills and resume sections. Requires sign-in, as do the routes below. |
| POST | `/api/v1/jobs/match` | Skill coverage of a job description. |
| POST | `/api/v1/skills/gap-analysis` | Rule-based prioritized gaps and weekly roadmap. |
| POST | `/api/v1/skills/ai-gap-analysis` | Rule-based roadmap plus AI-generated insights. Cancelling the request stops the model. |

## Limitations

- Skill detection uses a fixed vocabulary of about 50 common technical skills with aliases and plurals, so niche tools are not recognized.
- Scanned PDFs without selectable text are not supported.
- The coverage score counts detected skills. It is not a hiring probability.
