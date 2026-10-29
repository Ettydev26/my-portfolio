import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import ProjectCard from "@/components/ProjectCard";
import { projects as staticProjects } from "@/data/projects";

// Projects are hardcoded in src/data/projects.js for now.
// Supabase loading is switched off; to re-enable, restore the useProjects() hook here.
const projects = staticProjects.map((p) => ({ ...p, categories: p.category }));
const loading = false;

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

  const filtered = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((p) => p.categories?.includes(filter)),
    [filter]
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
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
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
                    project={project}
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
