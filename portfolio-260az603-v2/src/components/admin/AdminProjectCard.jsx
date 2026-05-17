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
