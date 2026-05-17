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
