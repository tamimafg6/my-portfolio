# Portfolio Monorepo

> Bilingual (EN/FR) portfolio with an admin panel, hosted on Vercel with a Supabase database.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-hosted-black)](https://vercel.com/)

## Architecture

```
portfolio-monorepo/
├── frontend/   # Next.js 15 app (pages, admin panel, /api proxy routes, admin login)
├── backend/    # Express.js API (Drizzle ORM -> Supabase Postgres, Supabase Storage)
└── docker-compose.yml   # Optional local stack (Postgres + backend + frontend)
```

- **Frontend** (Vercel project, root `frontend/`): renders the site. Its `/api/*` routes proxy to the backend; any `/api/*` path without a matching route is rewritten to the backend (`API_URL`).
- **Backend** (Vercel project, root `backend/`): Express app served as a single Vercel Function (`backend/api/index.js` + `backend/vercel.json`).
- **Database**: Supabase Postgres (portfolio tables only).
- **File storage**: Supabase Storage bucket (private), accessed through its S3-compatible API. The resume and profile photo are served via short-lived presigned URLs.

### Admin login

There are no user accounts. The admin page asks for a single password, checked against the `ADMIN_PASSWORD` environment variable. On success the frontend issues a signed JWT (HS256, `ADMIN_TOKEN_SECRET`, 7 days) in an httpOnly `admin_token` cookie. The backend verifies the same token for every admin-only endpoint, so both projects must share `ADMIN_TOKEN_SECRET`.

## Environment variables

See [`frontend/.env.example`](./frontend/.env.example) and [`backend/.env.example`](./backend/.env.example).

| Project  | Variables |
| -------- | --------- |
| frontend | `API_URL`, `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET`, `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` |
| backend  | `DATABASE_URL`, `ADMIN_TOKEN_SECRET`, `FRONTEND_URL`, `CLOUDFLARE_TURNSTILE_SECRET_KEY`, `STORAGE_*` |

Use the Supabase **transaction pooler** connection string (port 6543) for `DATABASE_URL` on Vercel.

## Local development

```bash
npm run install:all

# Option A: everything in Docker (local Postgres)
npm run docker:up

# Option B: run directly (point backend/.env DATABASE_URL at Supabase or a local Postgres)
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api (health: http://localhost:8080/health)

### Database schema and seed data

```bash
cd backend
npm run db:generate   # generate SQL from src/db/schema/portfolio.ts
npm run db:migrate    # apply to DATABASE_URL
npm run db:seed       # load initial portfolio content
```

## Deployment (Vercel)

Both projects deploy from this GitHub repo:

1. **Backend project**: Root Directory `backend`, Framework "Other" (settings come from `backend/vercel.json`). Set the backend env vars.
2. **Frontend project**: Root Directory `frontend`, Framework Next.js. Set `API_URL=https://<backend-domain>/api` plus the other frontend env vars.
3. Set the backend's `FRONTEND_URL` to the frontend's production URL.

Uploads are limited to 4 MB because Vercel Functions accept request bodies up to 4.5 MB.

## API Endpoints

**Base URL:** `/api`

- `GET /api/skills`, `GET /api/projects`, `GET /api/experience`, `GET /api/education`, `GET /api/hobbies`, `GET /api/testimonials` - public content
- `POST/PUT/DELETE` on the above - admin only (Bearer admin token)
- `POST /api/contact` - contact form (Turnstile protected)
- `GET /api/contact/messages` - admin only
- `GET /api/resume/file?locale=en|fr`, `GET /api/profile/photo` - redirect to presigned storage URLs
- `POST /api/resume/upload`, `POST /api/profile/photo/upload` - admin only

## License

Private - © 2026 Tamim Afghanyar

## Author

**Tamim Afghanyar**

- GitHub: [@tamimafg6](https://github.com/tamimafg6)
- LinkedIn: [Tamim Afghanyar](https://www.linkedin.com/in/tamim-afghanyar-2026852b3)
- Email: tamim.afghanyar@gmail.com
