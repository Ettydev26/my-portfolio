import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";

const ProjectCard = ({ project }) => {
  const ref = useRef(null);

  // Mouse-following spotlight on hover
  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--mx", `${x}%`);
    ref.current.style.setProperty("--my", `${y}%`);
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMove}
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/50 transition-colors duration-300 hover:border-primary/50"
      style={{
        backgroundImage:
          "radial-gradient(450px circle at var(--mx,50%) var(--my,50%), rgba(192,132,252,0.10), transparent 40%)",
      }}
    >
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Action overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-3 bg-background/85 backdrop-blur-sm
                     opacity-0 pointer-events-none translate-y-2
                     group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0
                     focus-within:opacity-100 focus-within:pointer-events-auto
                     transition-all duration-400"
        >
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Live demo <ArrowUpRight size={15} />
            </a>
          )}
          {project.codeUrl && (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/70 px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/50 transition-all"
            >
              <Github size={15} /> Code
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-grow flex-col p-6">
        <h3 className="font-display text-xl font-bold text-foreground transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="mt-2 mb-4 flex-grow text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
