const Marquee = ({ items, speed = 36, reverse = false, className = "" }) => {
  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div
        className="flex gap-8 whitespace-nowrap will-change-transform"
        style={{
          animation: `marquee ${speed}s linear infinite${reverse ? " reverse" : ""}`,
          width: "max-content",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="font-display text-4xl md:text-6xl font-semibold text-foreground/40 flex items-center gap-8"
          >
            {item}
            <span className="text-primary/60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
