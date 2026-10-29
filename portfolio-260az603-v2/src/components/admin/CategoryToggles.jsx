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
                ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white"
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
