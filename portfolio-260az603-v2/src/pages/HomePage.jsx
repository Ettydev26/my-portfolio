import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MagneticWrap from "@/components/MagneticWrap";
import Marquee from "@/components/Marquee";
import { techStack } from "@/data/about";

const eased = [0.22, 1, 0.36, 1];

const TITLE = "Kehinde";

const HomePage = () => {
  // Mouse-tracked parallax for gradient orbs
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const handle = (e) => {
      const rx = e.clientX / window.innerWidth - 0.5;
      const ry = e.clientY / window.innerHeight - 0.5;
      mx.set(rx);
      my.set(ry);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [mx, my]);

  const orb1X = useTransform(smx, (v) => v * -60);
  const orb1Y = useTransform(smy, (v) => v * -60);
  const orb2X = useTransform(smx, (v) => v * 40);
  const orb2Y = useTransform(smy, (v) => v * 40);
  const orb3X = useTransform(smx, (v) => v * -25);
  const orb3Y = useTransform(smy, (v) => v * 25);

  return (
    <>
      <title>EttyDev — Full-Stack &amp; AI Engineer</title>

      <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
        {/* Background atmosphere */}
        <motion.div
          aria-hidden
          className="absolute top-1/4 -left-32 h-[28rem] w-[28rem] rounded-full bg-cyan-600/25 blur-[120px] orb-soft"
          style={{ x: orb1X, y: orb1Y }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/3 right-0 h-[26rem] w-[26rem] rounded-full bg-sky-500/25 blur-[120px] orb-soft"
          style={{ x: orb2X, y: orb2Y }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-teal-400/15 blur-[120px] orb-soft"
          style={{ x: orb3X, y: orb3Y }}
        />

        <div aria-hidden className="absolute inset-0 bg-grid-pattern" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-5xl">
            {/* Availability pill */}
            <motion.div
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: eased }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Open to Full-Stack &amp; AI roles
              </span>
            </motion.div>

            {/* Hero headline */}
            <h1 className="font-display text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.95] text-balance">
              <span className="block text-foreground/70">
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: eased, delay: 0.1 }}
                  className="inline-block"
                >
                  Hi, I&rsquo;m
                </motion.span>
              </span>
              <span className="block leading-[1]">
                {TITLE.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 60, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.7,
                      ease: eased,
                      delay: 0.35 + i * 0.05,
                    }}
                    className="inline-block text-primary"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {ch}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                  className="inline-block text-foreground"
                >
                  .
                </motion.span>
              </span>
            </h1>

            {/* Subtitle */}
            <motion.h2
              className="mt-8 max-w-3xl text-2xl md:text-4xl font-medium text-muted-foreground text-balance"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: eased, delay: 1 }}
            >
              Full-Stack &amp;{" "}
              <span className="font-serif-italic text-primary">AI</span>{" "}
              Engineer.
            </motion.h2>

            <motion.p
              className="mt-6 max-w-2xl text-lg text-muted-foreground/90 leading-relaxed text-pretty"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: eased, delay: 1.15 }}
            >
              I build production web apps and the AI inside them — Python and
              FastAPI backends, React and TypeScript frontends, and LLM-powered
              features that do real work for real users.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-12 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: eased, delay: 1.3 }}
            >
              <MagneticWrap>
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-6 text-white border-0 glow-sm hover:from-cyan-600 hover:to-sky-600"
                >
                  <Link to="/project">
                    View my work
                    <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </MagneticWrap>
              <MagneticWrap>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-primary/40 bg-transparent px-6 text-foreground hover:bg-primary/10 hover:border-primary"
                >
                  <Link to="/contact">
                    <MessageCircle className="mr-1" />
                    Let&rsquo;s talk
                  </Link>
                </Button>
              </MagneticWrap>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-border/60 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              {[
                ["5+", "years coding"],
                ["20+", "projects shipped"],
                ["12+", "tools mastered"],
                ["AI", "LLM-powered products"],
              ].map(([num, label]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-primary">
                    {num}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { duration: 0.5, delay: 1.8 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MousePointer2 size={16} />
            <span className="text-[10px] uppercase tracking-[0.25em]">
              scroll
            </span>
          </div>
        </motion.div>
      </section>

      {/* Tech marquee */}
      <section className="border-y border-border/60 bg-background/40 py-10 backdrop-blur-sm">
        <Marquee items={techStack} speed={45} />
      </section>
    </>
  );
};

export default HomePage;
