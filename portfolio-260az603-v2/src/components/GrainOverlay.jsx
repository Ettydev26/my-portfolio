const GrainOverlay = () => (
  <div
    aria-hidden
    className="noise-overlay pointer-events-none fixed inset-0 z-[90] opacity-[0.06] mix-blend-overlay"
    style={{ animation: "grain 8s steps(10) infinite" }}
  />
);

export default GrainOverlay;
