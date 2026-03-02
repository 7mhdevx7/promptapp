# promptapp

MVP for creating, versioning, organizing, and searching prompts.

## Stack

- Next.js 15 (App Router)
- TypeScript (strict)
- Upstash Redis
- Auth.js v4 (credentials)
- Hexagonal Architecture
- Zod
- TailwindCSS

## Prerequisites

- Node.js 20+
- npm or yarn
- Upstash Redis account (free tier works)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random 32+ char string. Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app. Use `http://localhost:3000` for local dev |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL from the console |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token from the console |

### 3. Configure Upstash Redis

1. Go to [https://console.upstash.com](https://console.upstash.com)
2. Create a new Redis database (choose the region closest to your Vercel deployment)
3. Copy the **REST URL** and **REST Token** from the database details page
4. Paste them into `.env.local`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Register and log in

1. Navigate to `/register` to create an account
2. Log in at `/login`
3. You will be redirected to the dashboard

## Deploy to Vercel

1. Push the repo to GitHub
2. Import in [https://vercel.com](https://vercel.com)
3. Add the environment variables in the Vercel project settings
4. Deploy

## Type check

```bash
npm run type-check
```

## Project structure

```
app/           Next.js pages and API route wrappers
components/    React UI components
src/
  domain/      Entities, value objects, repository interfaces
  application/ Use cases and DTOs
  infrastructure/ Redis adapters and auth config
  interfaces/
    api/        API handler implementations
    web/        Lib utilities and type declarations
```
