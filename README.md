# Art Showcase

A mobile-first personal gallery for sharing artwork with family and friends. Visitors browse published pieces; the artist uploads and manages everything from a password-protected admin area.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Vercel Blob** for image storage
- **Vercel Postgres** for artwork metadata and site settings
- **iron-session** for admin authentication

## Setup

### 1. Create the Vercel project

Push this repo to GitHub and import it in the [Vercel dashboard](https://vercel.com/new).

### 2. Add storage

In your Vercel project → **Storage**:

1. Create a **Postgres** database
2. Create a **Blob** store

Vercel will inject `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` automatically.

### 3. Run the database schema

In the Postgres **Query** tab, paste and run the contents of [`db/schema.sql`](db/schema.sql).

### 4. Set environment variables

In Vercel → **Settings → Environment Variables**, add:

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Password for `/admin/login` |
| `SESSION_SECRET` | Random string, at least 32 characters |

Redeploy after adding variables.

### 5. Local development

```bash
npm install
vercel link
vercel env pull .env.local
npm run dev
```

- Gallery: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Copy [`.env.example`](.env.example) if you prefer to set variables manually.

## Usage

1. Sign in at `/admin/login` with your admin password.
2. Upload artwork (JPEG, PNG, or WebP) with optional title, medium, year, and description.
3. Reorder pieces with **Up** / **Down**, toggle **Published**, or delete from the manage list.
4. Update your artist name, tagline, and bio under **Site settings**.
5. Share the public gallery URL with family and friends.

## Project structure

```
app/
  page.tsx              Public gallery
  art/[id]/page.tsx     Artwork detail + Open Graph tags
  admin/                Login + dashboard
  api/                  Auth, upload, artworks, settings
components/             Gallery UI + admin forms
lib/                    Database, blob, auth helpers
db/schema.sql           Postgres schema
```

## Deploy checklist

- [ ] Postgres and Blob stores linked to the project
- [ ] `db/schema.sql` executed
- [ ] `ADMIN_PASSWORD` and `SESSION_SECRET` set
- [ ] Deploy succeeded
- [ ] Admin login works
- [ ] Test upload appears on the public gallery
