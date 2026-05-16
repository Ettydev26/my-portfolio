# Portfolio Admin Panel — Design

**Date:** 2026-05-16
**Status:** Approved (pending final spec review)

## Goal

Add an authenticated admin panel to the portfolio site so the owner can add, edit, delete, and reorder projects through a UI — no code edits or redeploys required for content changes. The panel must feel cohesive with the site's existing aesthetic (dark theme, purple→pink gradient accents, Framer Motion animations, blurred glass cards).

## Non-goals

- Markdown / rich-text editing for descriptions (plain text only).
- Multiple admin users or per-user permissions.
- Versioning, soft-delete, or undo of destructive actions.
- In-browser image cropping or editing.
- SEO sitemap regeneration on project changes.
- Click/visit analytics on individual projects.

These can be revisited later as additions, not changes to this design.

## Architecture

```
┌──────────────────────┐      ┌─────────────────────┐
│  React app (Vite)    │ ───▶ │  Supabase           │
│                      │      │   • projects table  │
│  /          home     │      │   • storage bucket  │
│  /project   list     │      │   • auth (email/pw) │
│  /admin     login +  │      └─────────────────────┘
│             dashboard│
└──────────────────────┘
```

- The site stays a single Vite + React SPA. No new server, no SSR.
- Supabase provides three primitives: a `projects` table, a `project-images` storage bucket, and email/password auth.
- A `useProjects()` hook fetches the list from Supabase; both `ProjectPage` (public) and `AdminDashboard` (admin) consume it.
- A `useAuth()` hook exposes the current session and sign-in/out helpers.
- The `supabase` client at `src/lib/supabase.js` uses only the `anon` key (safe for the browser). Writes are gated by Row Level Security policies that check the JWT email.
- The admin route is unlinked — accessible only by typing `/admin` directly.

## Data shape

### `public.projects` table

| Column         | Type          | Notes                                                            |
|----------------|---------------|------------------------------------------------------------------|
| `id`           | uuid (PK)     | `gen_random_uuid()`                                              |
| `slug`         | text unique   | Derived from title; keeps URLs stable across renames.            |
| `title`        | text          |                                                                  |
| `description`  | text          | Plain text.                                                      |
| `image_url`    | text          | Public Supabase Storage URL.                                     |
| `image_path`   | text          | Storage object path, so deletes can clean up the file.           |
| `technologies` | text[]        | Free-form chips ("React", "Django", etc.).                       |
| `categories`   | text[]        | Constrained in the UI to `frontend / backend / fullstack / collab`. |
| `demo_url`     | text null     |                                                                  |
| `code_url`     | text null     |                                                                  |
| `sort_order`   | int           | Controls display order on the public list.                       |
| `created_at`   | timestamptz   | Default `now()`.                                                 |
| `updated_at`   | timestamptz   | Refreshed by `touch_updated_at()` trigger.                       |

Status: **table created in Supabase** via `supabase/schema.sql`.

### Storage bucket

- Name: `project-images`
- Public read, authenticated write.
- Files keyed by `{uuid}.{ext}` so renames don't break links.

### Row Level Security

Configured in the Supabase dashboard (Authentication → Policies), not in `schema.sql`:

- `SELECT` on `projects`: allowed for `anon` and `authenticated` (no condition).
- `INSERT / UPDATE / DELETE` on `projects`: allowed for `authenticated` where `auth.email() = 'ettiolayinka4@gmail.com'`.
- Mirror policies on `storage.objects` for the `project-images` bucket.

### Auth

- Email/password via Supabase Auth.
- Single admin user, created manually in Supabase → Authentication → Users with email `ettiolayinka4@gmail.com`.
- New signups disabled at the Supabase project level.

## Pages and components

```
src/
├── lib/
│   └── supabase.js              ← Supabase client (uses VITE_SUPABASE_URL/ANON_KEY)
├── hooks/
│   ├── useProjects.js           ← fetch list (public + admin reuse)
│   └── useAuth.js               ← current user + signIn / signOut
├── pages/
│   └── admin/
│       ├── AdminPage.jsx        ← /admin route; gates on auth
│       ├── LoginForm.jsx        ← email + password card
│       └── AdminDashboard.jsx   ← card grid + slide-over panel
└── components/
    └── admin/
        ├── AdminProjectCard.jsx ← portfolio card + edit/delete overlay
        ├── EditPanel.jsx        ← slide-over sheet wrapping the form
        ├── ProjectForm.jsx      ← react-hook-form, all fields
        ├── ImageDropzone.jsx    ← drag/drop, preview, upload
        ├── TagInput.jsx         ← chips for technologies
        └── CategoryToggles.jsx  ← multi-select pills for categories
```

### Files modified

- `src/App.jsx` — register `<Route path="/admin/*" element={<AdminPage />} />`.
- `src/pages/ProjectPage.jsx` — replace `import { projects } from "@/data/projects"` with `const { projects, loading } = useProjects()`; add a skeleton/loading state.

### Files deleted (after migration)

- `src/data/projects.js`
- `src/assets/moomentsImg.jpg`, `portfolioImg.png`, `pdfexplorerImg.png`, `hatsoffImg.png`, `placeholderImg.png` (once uploaded to Storage).
- `scripts/seed.js` (one-off migration script — deleted once it has run successfully).

### Styling

Everything reuses the existing palette and primitives: `bg-card/50`, `border-border`, `bg-gradient-to-r from-purple-500 to-pink-500`, Framer Motion variants, `MagneticWrap`, and `GrainOverlay` where they fit. The slide-over panel uses backdrop blur to echo the filter-pill aesthetic on `/project`.

## User flows

### First-time setup (one-off)

1. Supabase project already created. Schema applied via `supabase/schema.sql`.
2. Create `project-images` bucket in Storage tab; mark public.
3. Add user `ettiolayinka4@gmail.com` in Authentication → Users with a password.
4. Add the four RLS policies on `projects` and the bucket policies on `storage.objects`.
5. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in `.env.local` (and in the deploy host's env settings).
6. Run `node scripts/seed.js` once locally to upload the existing five images to Storage and insert the 6 rows. Verify on `/project`. Delete the script and the old asset files.

### Adding a project

1. Visit `/admin` → log in.
2. Click **+ Add new project** in the top-left of the grid.
3. Empty slide-over opens. Fill title (slug auto-derives), description, drop an image (preview appears immediately), add tech tags (type + Enter), toggle categories, paste demo/code URLs.
4. Click **Save**. Image uploads to Storage, row inserts, panel closes, card fades in at the end of the grid.

### Editing

- Hover a card → `Edit` and `Delete` buttons fade in over the image.
- Click **Edit** → slide-over opens prefilled. Image dropzone shows the current image with a "Replace" affordance.
- Save updates the row. If the image was replaced, the old Storage object is removed.

### Deleting

- Click **Delete** on a card → buttons swap to an inline `Sure? [Yes] [Cancel]`.
- Confirm → row and Storage object both removed → card animates out.

### Reordering

- Grab a card → drag to a new position → other cards animate to make room (`@dnd-kit/sortable` + Framer `LayoutGroup`).
- On drop, `sort_order` for every affected card is written in a single batch update. Optimistic UI; reverts on failure.

### Auth

- `/admin` while unauthenticated → renders `LoginForm`.
- Successful login → renders `AdminDashboard`.
- Top-right of dashboard: email chip with dropdown → "Sign out."
- Session persists across reloads (Supabase auth default).

## Error handling

- Network failure on save / delete: bottom-right toast with a Retry button. Optimistic UI rolls back.
- Image > 5 MB or non-image type: inline dropzone error before any upload begins.
- Validation: missing title, missing description, missing image, or empty categories array → inline form errors via react-hook-form. Save button disabled until valid.
- Failed image upload (Storage 4xx/5xx): the row is not inserted; user sees the error inline; can retry.
- Failed row insert after a successful image upload: orphaned image is deleted in a cleanup step so Storage doesn't accumulate garbage.
- `/admin` with an expired token: silently treated as logged out → shows login form.

## Environment variables

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Both come from Supabase → Project Settings → API. Stored in `.env.local` (gitignored via `*.local`) and in the deploy provider's env settings (Vercel/Netlify).

## Testing

Manual verification, not automated. This is a single-user admin panel — formal tests would be overkill. Verification checklist:

- After migration, `/project` shows the same 6 projects, same images, same filtering behavior.
- Adding a project shows it on `/project` without a refresh-and-rebuild.
- Editing a project's title/description/image/tags reflects on `/project`.
- Dragging to reorder persists across a full page refresh.
- Deleting removes both the row and the Storage object (check the Storage UI).
- Logging out and revisiting `/admin` shows the login form, not the dashboard.
- An unauthenticated direct fetch to `projects` returns rows (RLS read policy works).
- An unauthenticated client attempting to write returns a permission error (RLS write policy works).

## Dependencies to add

```
@supabase/supabase-js
@dnd-kit/core
@dnd-kit/sortable
```

`react-hook-form` is already installed.

## Open items deferred to implementation

- Skeleton/loading state visual for `ProjectPage` while Supabase fetch resolves.
- Exact slide-over animation timing (likely matches existing route-transition easing `[0.22, 1, 0.36, 1]`).
- Toast component: reuse anything in `components/ui` if it fits, otherwise a small local component.
