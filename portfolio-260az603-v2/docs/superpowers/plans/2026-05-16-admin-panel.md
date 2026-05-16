# Portfolio Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an authenticated admin panel at `/admin` so the portfolio owner can add, edit, delete, and reorder projects through a UI, with project data and images stored in Supabase.

**Architecture:** Single Vite + React SPA. Supabase provides the `projects` table, a public `project-images` storage bucket, and email/password auth. A `useProjects` hook centralizes reads + mutations; a `useAuth` hook centralizes session state. The admin route is unlinked (typed-URL access only) and protected by an auth gate that renders a login form when no session exists.

**Tech Stack:** React 19, Vite, Tailwind v4, Framer Motion, react-hook-form, react-router-dom, `@supabase/supabase-js`, `@dnd-kit/core` + `@dnd-kit/sortable`.

**Testing approach:** Manual verification at the end of each task (no test framework in the repo, per spec).

**Reference docs:**
- Spec: `docs/superpowers/specs/2026-05-16-admin-panel-design.md`
- Schema: `supabase/schema.sql` (already applied)

---

## Pre-implementation setup (user-driven, in the Supabase dashboard)

These steps are NOT part of any task — the user has confirmed they will handle them in the Supabase web UI before the implementation runs (or before the relevant later task at the latest).

1. **Storage bucket.** Storage → New bucket → name `project-images` → toggle **Public bucket** ON → Create.
2. **Auth user.** Authentication → Users → Add user → email `ettiolayinka4@gmail.com`, set a password.
3. **Disable signups.** Authentication → Providers → Email → toggle **Enable email signups** OFF (so no one else can create an account).
4. **RLS policies on `projects` table.** Authentication → Policies → `projects` → Enable RLS, then add four policies:
   - SELECT: target role `public`, USING `true`.
   - INSERT: target role `authenticated`, WITH CHECK `auth.email() = 'ettiolayinka4@gmail.com'`.
   - UPDATE: target role `authenticated`, USING `auth.email() = 'ettiolayinka4@gmail.com'`.
   - DELETE: target role `authenticated`, USING `auth.email() = 'ettiolayinka4@gmail.com'`.
5. **Storage policies on `project-images` bucket.** Storage → `project-images` → Policies → add three policies:
   - SELECT: role `public`, USING `bucket_id = 'project-images'`.
   - INSERT: role `authenticated`, WITH CHECK `bucket_id = 'project-images' AND auth.email() = 'ettiolayinka4@gmail.com'`.
   - DELETE: role `authenticated`, USING `bucket_id = 'project-images' AND auth.email() = 'ettiolayinka4@gmail.com'`.

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are already in `.env.local`.

---

## Task 1: Install dependencies and create the Supabase client

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/lib/supabase.js`

- [ ] **Step 1: Install runtime deps**

Run from `portfolio-260az603-v2/`:

```bash
npm install @supabase/supabase-js @dnd-kit/core @dnd-kit/sortable
```

Expected: three packages added to `dependencies` in `package.json`.

- [ ] **Step 2: Create the Supabase client**

Create `src/lib/supabase.js`:

```js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

- [ ] **Step 3: Verify it loads without error**

Run `npm run dev` and open the homepage. The site should load unchanged (the client is imported nowhere yet, so this only catches syntax errors).

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/supabase.js
git commit -m "feat(admin): install supabase + dnd-kit, add supabase client"
```

---

## Task 2: Create the `useAuth` hook

**Files:**
- Create: `src/hooks/useAuth.js`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useAuth.js`:

```js
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message ?? null;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, user: session?.user ?? null, loading, signIn, signOut };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAuth.js
git commit -m "feat(admin): add useAuth hook"
```

---

## Task 3: Create the `useProjects` hook (read + mutations)

**Files:**
- Create: `src/hooks/useProjects.js`

- [ ] **Step 1: Write the hook**

This hook owns both the public list fetch and the admin mutations. It exposes optimistic helpers for reorder.

Create `src/hooks/useProjects.js`:

```js
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const TABLE = "projects";
const BUCKET = "project-images";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) setError(error.message);
    else setProjects(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function uploadImage(file) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { image_url: data.publicUrl, image_path: path };
  }

  async function removeImage(path) {
    if (!path) return;
    await supabase.storage.from(BUCKET).remove([path]);
  }

  async function addProject({ file, ...fields }) {
    const { image_url, image_path } = await uploadImage(file);
    const nextOrder =
      (projects.length ? Math.max(...projects.map((p) => p.sort_order)) : 0) + 1;
    const row = {
      slug: slugify(fields.title),
      title: fields.title,
      description: fields.description,
      image_url,
      image_path,
      technologies: fields.technologies,
      categories: fields.categories,
      demo_url: fields.demo_url || null,
      code_url: fields.code_url || null,
      sort_order: nextOrder,
    };
    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select()
      .single();
    if (error) {
      await removeImage(image_path); // cleanup orphan
      throw new Error(error.message);
    }
    setProjects((cur) => [...cur, data]);
    return data;
  }

  async function updateProject(id, { file, ...fields }) {
    const existing = projects.find((p) => p.id === id);
    if (!existing) throw new Error("Project not found");

    let image_url = existing.image_url;
    let image_path = existing.image_path;
    if (file) {
      const uploaded = await uploadImage(file);
      image_url = uploaded.image_url;
      image_path = uploaded.image_path;
    }

    const updates = {
      slug: slugify(fields.title),
      title: fields.title,
      description: fields.description,
      image_url,
      image_path,
      technologies: fields.technologies,
      categories: fields.categories,
      demo_url: fields.demo_url || null,
      code_url: fields.code_url || null,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (file) await removeImage(image_path);
      throw new Error(error.message);
    }
    if (file) await removeImage(existing.image_path);
    setProjects((cur) => cur.map((p) => (p.id === id ? data : p)));
    return data;
  }

  async function deleteProject(id) {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
    await removeImage(target.image_path);
    setProjects((cur) => cur.filter((p) => p.id !== id));
  }

  async function reorderProjects(orderedIds) {
    const previous = projects;
    const optimistic = orderedIds
      .map((id, i) => {
        const p = previous.find((x) => x.id === id);
        return p ? { ...p, sort_order: i + 1 } : null;
      })
      .filter(Boolean);
    setProjects(optimistic);

    const updates = orderedIds.map((id, i) =>
      supabase.from(TABLE).update({ sort_order: i + 1 }).eq("id", id)
    );
    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError) {
      setProjects(previous); // rollback
      throw new Error(firstError.error.message);
    }
  }

  return {
    projects,
    loading,
    error,
    refetch,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useProjects.js
git commit -m "feat(admin): add useProjects hook with CRUD + reorder"
```

---

## Task 4: Wire the public `ProjectPage` to Supabase

**Files:**
- Modify: `src/pages/ProjectPage.jsx`

- [ ] **Step 1: Replace the static import with the hook**

Replace the contents of `src/pages/ProjectPage.jsx`:

```jsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import ProjectCard from "@/components/ProjectCard";
import { useProjects } from "@/hooks/useProjects";

const eased = [0.22, 1, 0.36, 1];

const categories = [
  { value: "all", label: "All" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "collab", label: "Collab" },
];

const SkeletonCard = () => (
  <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-card/40" />
);

const ProjectPage = () => {
  const [filter, setFilter] = useState("all");
  const { projects, loading } = useProjects();

  const filtered = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((p) => p.categories?.includes(filter)),
    [filter, projects]
  );

  return (
    <>
      <title>EttyDev — Projects</title>
      <meta name="description" content="A curated selection of my web, mobile and backend projects." />

      <div className="container mx-auto px-4 py-32">
        <SectionTitle eyebrow="Selected work">My Projects</SectionTitle>

        <LayoutGroup>
          <motion.div
            className="mb-14 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: eased }}
          >
            <div className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-border bg-card/50 p-1.5 backdrop-blur-md">
              {categories.map((cat) => {
                const active = filter === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setFilter(cat.value)}
                    className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            layout
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            <AnimatePresence mode="popLayout">
              {!loading &&
                filtered.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      ...project,
                      image: project.image_url,
                      demoUrl: project.demo_url,
                      codeUrl: project.code_url,
                    }}
                  />
                ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {!loading && filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center text-muted-foreground"
          >
            Nothing here yet. Check back soon.
          </motion.p>
        )}
      </div>
    </>
  );
};

export default ProjectPage;
```

Key notes:
- `categories` array is now defined inline (no longer imported from `projects.js`).
- The hook returns snake_case columns from Postgres; we adapt them to the existing `ProjectCard` prop shape (`image`, `demoUrl`, `codeUrl`).
- `project.categories?.includes(filter)` (with `?.`) is defensive — the field is `categories` not `category` now.

- [ ] **Step 2: Verify**

Run `npm run dev`. Visit `/project`. With an empty database (no seeded projects yet), you should see skeletons briefly, then "Nothing here yet."

Open browser devtools → Console: no errors. Network tab: a request to `<supabase-url>/rest/v1/projects?...` returns `200`.

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProjectPage.jsx
git commit -m "feat(admin): wire ProjectPage to supabase via useProjects"
```

---

## Task 5: Write the seed script

**Files:**
- Create: `scripts/seed.js`
- Create: `scripts/package.json` (so the script runs as ESM)

- [ ] **Step 1: Write the script**

The script reads existing image files from `src/assets/`, uploads them to the `project-images` bucket, and inserts the 6 corresponding rows into the `projects` table. It needs a `service_role` key (NOT the anon key) because RLS would otherwise block writes from a non-authenticated context.

Create `scripts/seed.js`:

```js
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars before running."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const BUCKET = "project-images";
const assets = path.resolve(__dirname, "..", "src", "assets");

const projects = [
  {
    file: "moomentsImg.jpg",
    title: "Moooments",
    description:
      "A privacy-first photo-sharing platform for events. Attendees upload photos on the event day, share private albums and enjoy seamless file optimization.",
    technologies: ["React", "Django", "JWT", "AWS", "REST API"],
    categories: ["fullstack", "collab"],
    demo_url: "https://moooments.vercel.app/",
    code_url: null,
  },
  {
    file: "portfolioImg.png",
    title: "Portfolio Website",
    description:
      "A responsive portfolio site built with React, Tailwind v4 and Framer Motion. Animated, accessible, fast.",
    technologies: ["React", "Tailwind CSS", "Framer Motion"],
    categories: ["frontend"],
    demo_url: "https://example.com",
    code_url: null,
  },
  {
    file: "pdfexplorerImg.png",
    title: "PDF Explorer",
    description:
      "An AI-powered document workspace with intelligent search and analysis powered by Gemini.",
    technologies: ["React", "FastAPI", "Gemini API"],
    categories: ["fullstack"],
    demo_url: "https://pdf-explorer-woad.vercel.app/",
    code_url: "https://github.com",
  },
  {
    file: "hatsoffImg.png",
    title: "HatsOFF Store",
    description:
      "An e-commerce storefront with product listings, cart and secure Flutterwave checkout.",
    technologies: ["React", "Tailwind CSS", "Firebase", "Flutterwave"],
    categories: ["fullstack", "collab"],
    demo_url: "https://example.com",
    code_url: null,
  },
  {
    file: "placeholderImg.png",
    title: "Blog API",
    description:
      "A RESTful API for a blog platform with authentication, authorization and pagination.",
    technologies: ["Node.js", "Express", "MongoDB", "JWT"],
    categories: ["backend"],
    demo_url: null,
    code_url: "https://github.com",
  },
  {
    file: "placeholderImg.png",
    title: "Social Dashboard",
    description:
      "A dashboard surfacing analytics from across social platforms with interactive, responsive charts.",
    technologies: ["React", "Chart.js", "Tailwind CSS"],
    categories: ["frontend"],
    demo_url: "https://example.com",
    code_url: "https://github.com",
  },
];

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const filePath = path.join(assets, p.file);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing asset: ${filePath}`);
      process.exit(1);
    }
    const buffer = fs.readFileSync(filePath);
    const ext = p.file.split(".").pop().toLowerCase();
    const storagePath = `seed-${crypto.randomUUID()}.${ext}`;
    const contentType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: false });
    if (upErr) {
      console.error(`Upload failed for ${p.file}:`, upErr.message);
      process.exit(1);
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const row = {
      slug: slugify(p.title),
      title: p.title,
      description: p.description,
      image_url: pub.publicUrl,
      image_path: storagePath,
      technologies: p.technologies,
      categories: p.categories,
      demo_url: p.demo_url,
      code_url: p.code_url,
      sort_order: i + 1,
    };

    const { error: insErr } = await supabase.from("projects").insert(row);
    if (insErr) {
      console.error(`Insert failed for ${p.title}:`, insErr.message);
      process.exit(1);
    }
    console.log(`Seeded: ${p.title}`);
  }
  console.log("\nDone. 6 projects seeded.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Make scripts/ run as ESM**

Create `scripts/package.json`:

```json
{
  "type": "module"
}
```

This tells Node to treat `.js` files in this folder as ES modules so the `import` syntax works.

- [ ] **Step 3: Commit (do not run yet)**

```bash
git add scripts/seed.js scripts/package.json
git commit -m "chore(admin): add one-off seed script"
```

---

## Task 6: Run the seed script and clean up

**Files:**
- Delete: `src/data/projects.js`
- Delete: `src/assets/moomentsImg.jpg`, `portfolioImg.png`, `pdfexplorerImg.png`, `hatsoffImg.png`, `placeholderImg.png`
- Delete: `scripts/seed.js`, `scripts/package.json`, `scripts/` folder

- [ ] **Step 1: Get the service role key**

In Supabase dashboard → Settings → API → copy the `service_role` key (NOT the anon key). It bypasses RLS and is for server-side use only — never commit it.

- [ ] **Step 2: Run the seed**

From `portfolio-260az603-v2/` (PowerShell):

```powershell
$env:SUPABASE_URL = "https://<your-project-ref>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<paste-service-role-key>"
node scripts/seed.js
```

Expected output:

```
Seeded: Moooments
Seeded: Portfolio Website
Seeded: PDF Explorer
Seeded: HatsOFF Store
Seeded: Blog API
Seeded: Social Dashboard

Done. 6 projects seeded.
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, visit `/project`. All 6 projects should render with the correct images and tags. Filtering by category should work.

Stop the dev server.

- [ ] **Step 4: Delete the now-unused files**

```bash
rm src/data/projects.js
rm src/assets/moomentsImg.jpg
rm src/assets/portfolioImg.png
rm src/assets/pdfexplorerImg.png
rm src/assets/hatsoffImg.png
rm src/assets/placeholderImg.png
rm -r scripts
```

- [ ] **Step 5: Verify the build still works**

```bash
npm run build
```

Expected: build completes with no errors. (If a build error mentions a missing import from `@/data/projects`, that means another file still references it — grep for `data/projects` and fix.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): seed projects to supabase, remove static data"
```

---

## Task 7: Add the `/admin` route and auth gate

**Files:**
- Create: `src/pages/admin/AdminPage.jsx`
- Create: `src/pages/admin/LoginForm.jsx`
- Create: `src/pages/admin/AdminDashboard.jsx` (stub for now)
- Modify: `src/App.jsx`

- [ ] **Step 1: Stub the dashboard**

Create `src/pages/admin/AdminDashboard.jsx`:

```jsx
const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-display text-3xl">Admin (stub)</h1>
      <p className="mt-2 text-muted-foreground">Logged in. Dashboard coming next.</p>
    </div>
  );
};

export default AdminDashboard;
```

- [ ] **Step 2: Write the login form**

Create `src/pages/admin/LoginForm.jsx`:

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const LoginForm = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await signIn(email, password);
    setSubmitting(false);
    if (err) setError(err);
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-md"
      >
        <h1 className="font-display text-2xl">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin access only.
        </p>

        <label className="mt-6 block text-sm">
          <span className="text-muted-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-muted-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </motion.form>
    </div>
  );
};

export default LoginForm;
```

- [ ] **Step 3: Write the auth gate**

Create `src/pages/admin/AdminPage.jsx`:

```jsx
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";

const AdminPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  return user ? <AdminDashboard /> : <LoginForm />;
};

export default AdminPage;
```

- [ ] **Step 4: Register the route**

Edit `src/App.jsx`. Add the import and a new `<Route>`:

```jsx
import AdminPage from "./pages/admin/AdminPage";
```

Inside the `<Routes>` block (after the existing routes, before `NotFoundPage`):

```jsx
<Route element={<AdminPage />}     path="/admin" />
```

- [ ] **Step 5: Verify**

Run `npm run dev`, visit `/admin`. You should see the login form. Try logging in with `ettiolayinka4@gmail.com` and the password you set in Supabase. After submitting, the page should swap to the dashboard stub.

If login fails with "Invalid login credentials," the user does not exist yet — re-check pre-implementation setup step 2.

Refresh the page while logged in — the dashboard should still show (session persisted).

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin src/App.jsx
git commit -m "feat(admin): add /admin route, login form, auth gate"
```

---

## Task 8: Build `AdminProjectCard`

**Files:**
- Create: `src/components/admin/AdminProjectCard.jsx`

- [ ] **Step 1: Write the component**

A card visually styled like `ProjectCard` but with `Edit` and `Delete` buttons over a hover overlay, plus an inline delete confirm.

Create `src/components/admin/AdminProjectCard.jsx`:

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, GripVertical } from "lucide-react";

const AdminProjectCard = ({ project, onEdit, onDelete, dragHandleProps }) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/50"
    >
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={project.image_url}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <button
          type="button"
          {...dragHandleProps}
          className="absolute left-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/85 backdrop-blur-sm opacity-0 pointer-events-none translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-300">
          {!confirming ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-medium text-foreground hover:border-destructive/60 hover:text-destructive transition-all"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground">Sure?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(project);
                  setConfirming(false);
                }}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-border bg-secondary/70 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-grow flex-col p-5">
        <h3 className="font-display text-lg font-bold text-foreground">{project.title}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.categories?.map((c) => (
            <span
              key={c}
              className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

export default AdminProjectCard;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminProjectCard.jsx
git commit -m "feat(admin): add AdminProjectCard with hover actions"
```

---

## Task 9: Build the dashboard shell (grid + sign-out)

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx`

- [ ] **Step 1: Replace the stub**

Replace `src/pages/admin/AdminDashboard.jsx` with:

```jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import AdminProjectCard from "@/components/admin/AdminProjectCard";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { projects, loading, deleteProject } = useProjects();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  // EditPanel wiring comes in a later task.

  async function handleDelete(project) {
    try {
      await deleteProject(project.id);
    } catch (e) {
      console.error(e); // toast wiring comes later
    }
  }

  return (
    <div className="container mx-auto px-4 py-32">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Admin</p>
          <h1 className="font-display text-3xl">Projects</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus size={16} /> Add new project
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[320px] animate-pulse rounded-2xl border border-border bg-card/40" />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
          <p className="text-muted-foreground">No projects yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click <span className="text-foreground">+ Add new project</span> to create your first one.
          </p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <AdminProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => setEditing(p)}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* EditPanel mount point — wired in Task 15 */}
    </div>
  );
};

export default AdminDashboard;
```

- [ ] **Step 2: Verify**

`npm run dev` → `/admin` (already logged in). You should see:
- Header with "Admin / Projects", an `+ Add new project` button, your email + sign-out icon
- 6 project cards in a responsive grid
- Hovering a card reveals `Edit` and `Delete` buttons; clicking `Delete` swaps in `Sure? Yes / Cancel`
- Clicking the sign-out icon returns you to the login form

Test delete on one project: confirm it disappears and that `/project` (public) no longer shows it. Then re-add it later via the admin UI (which we'll build next), or restore it manually for now via Supabase.

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "feat(admin): dashboard shell with delete + sign-out"
```

---

## Task 10: Build `ImageDropzone`

**Files:**
- Create: `src/components/admin/ImageDropzone.jsx`

- [ ] **Step 1: Write the component**

Custom drop zone — no new dependency. Accepts a file via drop or click, validates size + type, shows preview.

Create `src/components/admin/ImageDropzone.jsx`:

```jsx
import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

const ImageDropzone = ({ value, file, onFile, error: externalError }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const previewUrl = file ? URL.createObjectURL(file) : value || null;

  function validateAndSet(f) {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) {
      setError("Only PNG, JPEG, or WebP images are allowed.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Image is too large (max 5 MB).");
      return;
    }
    setError(null);
    onFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  function clear() {
    setError(null);
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const shownError = externalError || error;

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors ${
          dragOver
            ? "border-primary bg-primary/10"
            : "border-border bg-input/40 hover:border-primary/60"
        }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <UploadCloud size={28} />
            <p className="mt-2 text-sm">Drop image here or click to upload</p>
            <p className="mt-0.5 text-xs">PNG / JPEG / WebP, up to 5 MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          onChange={(e) => validateAndSet(e.target.files?.[0])}
          className="hidden"
        />
      </div>
      {shownError && <p className="mt-2 text-xs text-destructive">{shownError}</p>}
    </div>
  );
};

export default ImageDropzone;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/ImageDropzone.jsx
git commit -m "feat(admin): add ImageDropzone with drag, preview, validation"
```

---

## Task 11: Build `TagInput`

**Files:**
- Create: `src/components/admin/TagInput.jsx`

- [ ] **Step 1: Write the component**

A chips input: type a value, press Enter (or comma) to add. Backspace on an empty input removes the last chip.

Create `src/components/admin/TagInput.jsx`:

```jsx
import { useState } from "react";
import { X } from "lucide-react";

const TagInput = ({ value = [], onChange, placeholder = "Add a tag…" }) => {
  const [draft, setDraft] = useState("");

  function add(raw) {
    const v = raw.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setDraft("");
  }

  function remove(t) {
    onChange(value.filter((x) => x !== t));
  }

  function onKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-input/40 p-2">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="text-primary/80 hover:text-primary"
            aria-label={`Remove ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={value.length ? "" : placeholder}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default TagInput;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/TagInput.jsx
git commit -m "feat(admin): add TagInput chip component"
```

---

## Task 12: Build `CategoryToggles`

**Files:**
- Create: `src/components/admin/CategoryToggles.jsx`

- [ ] **Step 1: Write the component**

Fixed pill toggles for the four allowed categories.

Create `src/components/admin/CategoryToggles.jsx`:

```jsx
const OPTIONS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "collab", label: "Collab" },
];

const CategoryToggles = ({ value = [], onChange }) => {
  function toggle(v) {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition-all ${
              active
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "border border-border bg-card/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryToggles;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/CategoryToggles.jsx
git commit -m "feat(admin): add CategoryToggles pill group"
```

---

## Task 13: Build `ProjectForm`

**Files:**
- Create: `src/components/admin/ProjectForm.jsx`

- [ ] **Step 1: Write the form**

Wires `react-hook-form` with `ImageDropzone`, `TagInput`, `CategoryToggles`. Validates required fields. Exposes submit + cancel callbacks.

Create `src/components/admin/ProjectForm.jsx`:

```jsx
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ImageDropzone from "./ImageDropzone";
import TagInput from "./TagInput";
import CategoryToggles from "./CategoryToggles";

const ProjectForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const [file, setFile] = useState(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      technologies: initial?.technologies ?? [],
      categories: initial?.categories ?? [],
      demo_url: initial?.demo_url ?? "",
      code_url: initial?.code_url ?? "",
    },
  });

  async function submit(values) {
    const isNew = !initial;
    if (isNew && !file) {
      setError("image", { type: "required", message: "An image is required." });
      return;
    }
    if (!values.categories.length) {
      setError("categories", {
        type: "required",
        message: "Pick at least one category.",
      });
      return;
    }
    clearErrors();
    await onSubmit({ ...values, file });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex h-full flex-col gap-5">
      <div>
        <label className="text-sm text-muted-foreground">Image</label>
        <div className="mt-1">
          <ImageDropzone
            value={initial?.image_url}
            file={file}
            onFile={(f) => {
              setFile(f);
              if (f) clearErrors("image");
            }}
            error={errors.image?.message}
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Title</label>
        <input
          {...register("title", { required: "Title is required." })}
          className="mt-1 w-full rounded-lg border border-border bg-input/40 px-3 py-2 outline-none focus:border-primary"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Description</label>
        <textarea
          rows={4}
          {...register("description", { required: "Description is required." })}
          className="mt-1 w-full resize-y rounded-lg border border-border bg-input/40 px-3 py-2 outline-none focus:border-primary"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Technologies</label>
        <Controller
          control={control}
          name="technologies"
          render={({ field }) => (
            <div className="mt-1">
              <TagInput value={field.value} onChange={field.onChange} />
            </div>
          )}
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Categories</label>
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <div className="mt-1">
              <CategoryToggles
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  if (v.length) clearErrors("categories");
                }}
              />
            </div>
          )}
        />
        {errors.categories && (
          <p className="mt-1 text-xs text-destructive">{errors.categories.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm text-muted-foreground">Demo URL</label>
          <input
            type="url"
            {...register("demo_url")}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-border bg-input/40 px-3 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Code URL</label>
          <input
            type="url"
            {...register("code_url")}
            placeholder="https://github.com/..."
            className="mt-1 w-full rounded-lg border border-border bg-input/40 px-3 py-2 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border bg-secondary/70 px-4 py-2 text-sm hover:border-primary/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/ProjectForm.jsx
git commit -m "feat(admin): add ProjectForm wiring all inputs"
```

---

## Task 14: Build `EditPanel` (slide-over)

**Files:**
- Create: `src/components/admin/EditPanel.jsx`

- [ ] **Step 1: Write the slide-over**

A right-side slide-over with backdrop + Escape-to-close + body scroll lock.

Create `src/components/admin/EditPanel.jsx`:

```jsx
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const EditPanel = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card/95 backdrop-blur-md"
          >
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditPanel;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/EditPanel.jsx
git commit -m "feat(admin): add EditPanel slide-over"
```

---

## Task 15: Wire Add + Edit into the dashboard

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx`

- [ ] **Step 1: Replace the dashboard with the wired version**

Replace `src/pages/admin/AdminDashboard.jsx`:

```jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import AdminProjectCard from "@/components/admin/AdminProjectCard";
import EditPanel from "@/components/admin/EditPanel";
import ProjectForm from "@/components/admin/ProjectForm";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { projects, loading, addProject, updateProject, deleteProject } =
    useProjects();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAddSubmit(values) {
    setSubmitting(true);
    try {
      await addProject(values);
      setAdding(false);
    } catch (e) {
      console.error(e);
      alert(`Could not add project: ${e.message}`); // replaced with toast in Task 17
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(values) {
    setSubmitting(true);
    try {
      await updateProject(editing.id, values);
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert(`Could not save changes: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(project) {
    try {
      await deleteProject(project.id);
    } catch (e) {
      console.error(e);
      alert(`Could not delete: ${e.message}`);
    }
  }

  return (
    <div className="container mx-auto px-4 py-32">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Admin</p>
          <h1 className="font-display text-3xl">Projects</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus size={16} /> Add new project
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[320px] animate-pulse rounded-2xl border border-border bg-card/40" />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
          <p className="text-muted-foreground">No projects yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click <span className="text-foreground">+ Add new project</span> to create your first one.
          </p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <AdminProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => setEditing(p)}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <EditPanel
        open={adding}
        title="Add new project"
        onClose={() => !submitting && setAdding(false)}
      >
        <ProjectForm
          onSubmit={handleAddSubmit}
          onCancel={() => setAdding(false)}
          submitting={submitting}
        />
      </EditPanel>

      <EditPanel
        open={!!editing}
        title="Edit project"
        onClose={() => !submitting && setEditing(null)}
      >
        {editing && (
          <ProjectForm
            initial={editing}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditing(null)}
            submitting={submitting}
          />
        )}
      </EditPanel>
    </div>
  );
};

export default AdminDashboard;
```

- [ ] **Step 2: Verify Add**

`npm run dev` → `/admin`. Click `+ Add new project`. Slide-over appears. Try:
- Submitting empty → see "Title is required", "Description is required", "An image is required", "Pick at least one category".
- Filling everything and saving → the panel closes, a new card appears at the end of the grid, `/project` (public) shows it.

- [ ] **Step 3: Verify Edit**

Hover an existing card → click `Edit`. Panel opens with all fields prefilled, including the current image. Change the title and save. Card updates; `/project` reflects the change.

Replace the image: click the X on the dropzone preview → drop a new file → save. The new image shows everywhere; the old file is removed from Storage (check Supabase → Storage UI to confirm).

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "feat(admin): wire add + edit flows via EditPanel + ProjectForm"
```

---

## Task 16: Wire drag-to-reorder

**Files:**
- Modify: `src/pages/admin/AdminDashboard.jsx`
- Modify: `src/components/admin/AdminProjectCard.jsx` (consume `dragHandleProps`)

The card already accepts `dragHandleProps`. Now we provide them via `@dnd-kit/sortable`.

- [ ] **Step 1: Add a `SortableCard` wrapper**

In `src/pages/admin/AdminDashboard.jsx`, add a small wrapper component at the top of the file (after imports). Full updated imports + helper:

```jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import AdminProjectCard from "@/components/admin/AdminProjectCard";
import EditPanel from "@/components/admin/EditPanel";
import ProjectForm from "@/components/admin/ProjectForm";

const SortableCard = ({ project, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <AdminProjectCard
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};
```

- [ ] **Step 2: Use DndContext around the grid**

Inside the `AdminDashboard` body, modify the `useProjects` destructure to also pull `reorderProjects`, and replace the `motion.div layout` grid block with a DndContext-wrapped one:

```jsx
const { projects, loading, addProject, updateProject, deleteProject, reorderProjects } =
  useProjects();

const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

async function handleDragEnd(event) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;
  const oldIndex = projects.findIndex((p) => p.id === active.id);
  const newIndex = projects.findIndex((p) => p.id === over.id);
  const next = arrayMove(projects, oldIndex, newIndex);
  try {
    await reorderProjects(next.map((p) => p.id));
  } catch (e) {
    console.error(e);
    alert(`Could not reorder: ${e.message}`);
  }
}
```

Replace the existing grid block:

```jsx
{!loading && projects.length > 0 && (
  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <SortableContext items={projects.map((p) => p.id)} strategy={rectSortingStrategy}>
      <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <SortableCard
              key={project.id}
              project={project}
              onEdit={(p) => setEditing(p)}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </SortableContext>
  </DndContext>
)}
```

- [ ] **Step 3: Verify**

`npm run dev` → `/admin`. Hover a card → the grip handle (vertical-dots icon) appears top-left. Grab it → drag the card to a new position → release.

- The grid animates as cards make room.
- After release, refresh the page — the new order persists.
- Visit `/project` — the public list reflects the new order.

If dragging feels too eager (drags on simple click), increase `activationConstraint.distance`.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminDashboard.jsx
git commit -m "feat(admin): drag-to-reorder via @dnd-kit"
```

---

## Task 17: Add toast notifications, replace `alert(...)`

**Files:**
- Create: `src/components/admin/Toaster.jsx`
- Create: `src/hooks/useToast.js`
- Modify: `src/pages/admin/AdminDashboard.jsx`

- [ ] **Step 1: Write the toast store hook**

Tiny global toast store using a module-level subscriber pattern — no external library.

Create `src/hooks/useToast.js`:

```js
import { useEffect, useState } from "react";

let toasts = [];
const listeners = new Set();
let nextId = 0;

function emit() {
  for (const l of listeners) l(toasts);
}

export function pushToast(message, opts = {}) {
  const id = ++nextId;
  toasts = [...toasts, { id, message, kind: opts.kind ?? "error", onRetry: opts.onRetry }];
  emit();
  setTimeout(() => dismissToast(id), opts.duration ?? 5000);
  return id;
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts() {
  const [snapshot, setSnapshot] = useState(toasts);
  useEffect(() => {
    listeners.add(setSnapshot);
    return () => listeners.delete(setSnapshot);
  }, []);
  return snapshot;
}
```

- [ ] **Step 2: Write the Toaster component**

Create `src/components/admin/Toaster.jsx`:

```jsx
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { dismissToast, useToasts } from "@/hooks/useToast";

const Toaster = () => {
  const toasts = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm backdrop-blur-md ${
              t.kind === "error"
                ? "border-destructive/40 bg-destructive/15 text-foreground"
                : "border-primary/30 bg-primary/10 text-foreground"
            }`}
          >
            <span className="flex-1">{t.message}</span>
            {t.onRetry && (
              <button
                type="button"
                onClick={() => {
                  t.onRetry();
                  dismissToast(t.id);
                }}
                className="rounded-md border border-border bg-secondary/70 px-2 py-1 text-xs hover:border-primary/40"
              >
                Retry
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
```

- [ ] **Step 3: Replace `alert(...)` calls and mount the Toaster**

In `src/pages/admin/AdminDashboard.jsx`:

Add imports:

```jsx
import Toaster from "@/components/admin/Toaster";
import { pushToast } from "@/hooks/useToast";
```

Replace each `alert(...)` with `pushToast(...)`. Concretely:

```jsx
// in handleAddSubmit catch:
pushToast(`Could not add project: ${e.message}`, { onRetry: () => handleAddSubmit(values) });

// in handleEditSubmit catch:
pushToast(`Could not save changes: ${e.message}`, { onRetry: () => handleEditSubmit(values) });

// in handleDelete catch:
pushToast(`Could not delete: ${e.message}`, { onRetry: () => handleDelete(project) });

// in handleDragEnd catch:
pushToast(`Could not reorder: ${e.message}`);
```

Mount `<Toaster />` once at the end of the dashboard's returned JSX (just before the closing `</div>`):

```jsx
<Toaster />
```

- [ ] **Step 4: Verify**

`npm run dev` → `/admin`. Simulate a failure: in Supabase dashboard, briefly disable the INSERT RLS policy for `projects`, then try to add a project. You should see a toast at bottom-right with a Retry button instead of an alert dialog.

Re-enable the policy. Click Retry → success → toast dismisses.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/Toaster.jsx src/hooks/useToast.js src/pages/admin/AdminDashboard.jsx
git commit -m "feat(admin): toasts replace alerts, with retry support"
```

---

## Task 18: Final manual verification + production build

**Files:** none (verification only)

- [ ] **Step 1: Run the full verification checklist**

Start dev server: `npm run dev`. Walk through, ticking each:

- [ ] `/` (home) and `/project` (public) render without errors.
- [ ] `/project` shows the seeded projects with images and tags. Filtering by category works.
- [ ] `/admin` while logged out → login form. Bad password → error message displays.
- [ ] Login with correct credentials → dashboard.
- [ ] **Add:** Create a new project (any title, drop any image). New card appears at end of grid; `/project` shows it.
- [ ] **Validation:** Submitting an empty form shows inline errors for title, description, image, categories.
- [ ] **Edit (text only):** Change a project's description. `/project` reflects the change after a refresh.
- [ ] **Edit (image replace):** Replace an image. Public site shows the new image. Supabase Storage UI shows the new file and the old one is gone.
- [ ] **Delete:** Click delete on a card → inline `Sure?` → Yes → card disappears. `/project` no longer shows it. Storage UI: image file deleted.
- [ ] **Reorder:** Drag a card. Order persists after refresh. `/project` reflects the new order.
- [ ] **Sign out:** Returns to the login form. `/admin` again still shows login (not a stale dashboard).
- [ ] **Direct write attempt without auth:** Open browser devtools console and run:
  ```js
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
  await sb.from("projects").insert({ slug: "x", title: "x", description: "x", image_url: "x", image_path: "x" });
  ```
  Expect an error with code matching an RLS violation (e.g. `42501`). This confirms anonymous writes are blocked.

If any item fails, fix it before moving on.

- [ ] **Step 2: Run a production build**

```bash
npm run build
```

Expected: build succeeds with no errors. (Warnings about chunk size are OK.)

- [ ] **Step 3: Commit any final fixes (if any)**

```bash
git status
# if anything is uncommitted from verification fixes:
git add -A
git commit -m "fix(admin): tweaks from final verification"
```

- [ ] **Step 4: (Optional) Push and deploy**

The deploy host (Vercel/Netlify) needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in its environment-variables UI. Once they're set, pushing the branch will trigger an auto-deploy (if you've set that up) — the live site will then read from Supabase, and `/admin` will work in production.

```bash
git push
```

---

## Self-review notes

Coverage of the spec:

- **Architecture / data flow** — Tasks 1–4.
- **Data shape & RLS** — schema already applied; RLS in pre-implementation setup.
- **`useProjects`, `useAuth` hooks** — Tasks 2, 3.
- **`/admin` route + auth gate + LoginForm** — Task 7.
- **AdminDashboard + AdminProjectCard** — Tasks 8, 9, 15.
- **Form components (ImageDropzone, TagInput, CategoryToggles, ProjectForm, EditPanel)** — Tasks 10–14.
- **Add / edit / delete flows** — Task 15 (Add + Edit), Task 9 (Delete via card).
- **Drag-to-reorder** — Task 16.
- **Migration (seed + delete projects.js + delete assets)** — Tasks 5, 6.
- **Skeleton/loading state for ProjectPage** — Task 4 (`SkeletonCard`).
- **Error handling via toast + retry** — Task 17.
- **Manual verification** — Task 18.

Out-of-scope items from the spec (markdown, multiple admins, versioning, image cropping, sitemap, analytics) are intentionally not in any task.
