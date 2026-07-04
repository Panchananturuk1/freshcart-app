## FreshCart

FreshCart is a mobile-first grocery delivery application built with Next.js, Prisma, cookie-based authentication, and a responsive app-style UI inspired by modern grocery apps.

## Stack

- Next.js App Router
- Prisma ORM
- Local SQLite for development
- Vercel-ready Postgres Prisma schema for deployment
- Signed cookie auth with hashed passwords
- Zustand for client-side app state

## Authentication

- `POST /api/auth/register` creates a user with a hashed password and signs them in
- `POST /api/auth/login` validates credentials and restores the session
- `GET /api/auth/session` returns the current signed-in user
- `POST /api/auth/logout` clears the session cookie
- Protected routes:
  - Signed-in required: `/account`, `/checkout`, `/order/*`
  - Admin or ops required: `/admin/*`, `/ops/*`

## Database Modes

### Local development

FreshCart uses SQLite locally so the project runs immediately in the sandbox:

```bash
npm run db:push
```

This uses `prisma/schema.prisma` and the local `.env` file.

### Vercel / Postgres deployment

FreshCart includes a dedicated Postgres Prisma schema at `prisma/schema.postgres.prisma`.

Set these environment variables in Vercel:

```bash
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
AUTH_SECRET=
```

Then generate and push the Postgres schema:

```bash
npm run db:generate:postgres
npm run db:push:postgres
```

For production deployment, point `src/lib/db.ts` at the generated Prisma client using the Postgres schema workflow and use your Neon or Supabase connection strings in Vercel.

## Getting Started

Install dependencies, sync the local database, and start the development server:

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quality Checks

```bash
npm run check
npm run build
```

## Demo Account

- Email: `jamie@example.com`
- Password: `freshcart123`

## Notes

- Local auth currently persists against SQLite.
- Admin route protection is active, but customer registration creates `CUSTOMER` users only.
- To create an admin user, update the `role` column in the database for a known account or add a seed script next.
