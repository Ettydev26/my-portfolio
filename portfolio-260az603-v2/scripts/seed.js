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
