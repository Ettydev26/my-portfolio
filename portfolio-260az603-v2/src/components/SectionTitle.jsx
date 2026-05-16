import { motion } from "framer-motion";

const SectionTitle = ({ children, eyebrow, className = "" }) => {
  return (
    <motion.div
      className={`flex flex-col items-center mb-16 text-center ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {eyebrow && (
        <motion.span
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {eyebrow}
        </motion.span>
      )}
      <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
        <span className="gradient-text">{children}</span>
      </h2>
      <div className="mt-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        <span className="block h-px w-16 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
      </div>
    </motion.div>
  );
};

export default SectionTitle;
