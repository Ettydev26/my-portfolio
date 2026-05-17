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
