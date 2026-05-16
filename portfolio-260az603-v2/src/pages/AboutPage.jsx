import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import SectionTitle from "@/components/SectionTitle";
import AnimatedCounter from "@/components/AnimatedCounter";
import Profilepic from "@/assets/profilepic.jpg";
import { skills, experiences, education } from "@/data/about";

const eased = [0.22, 1, 0.36, 1];

/* -------- 3D-tilt profile image -------- */
const TiltImage = () => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 14 });
  const sy = useSpring(y, { stiffness: 120, damping: 14 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: eased }}
      className="relative"
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="gradient-border relative overflow-hidden rounded-3xl"
      >
        <img
          src={Profilepic}
          alt="Kehinde Etti — portrait"
          className="h-[520px] w-full object-cover"
          style={{ transform: "translateZ(0)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="font-serif-italic text-xl text-foreground/90">
            “Code is a craft. Pixels matter.”
          </p>
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-6 -right-6 rounded-2xl border border-border bg-card px-6 py-4 glow-sm"
        initial={{ scale: 0, rotate: -8 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, type: "spring", stiffness: 160 }}
      >
        <span className="font-display text-3xl font-bold gradient-text">
          <AnimatedCounter to={5} suffix="+" />
        </span>
        <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
          years experience
        </span>
      </motion.div>
    </motion.div>
  );
};

const AboutPage = () => {
  return (
    <>
      <title>EttyDev — About</title>
      <meta name="description" content="Background, skills, and experience of Kehinde Etti." />

      <div className="container mx-auto px-4 py-32">
        <SectionTitle eyebrow="About">A bit about me</SectionTitle>

        <div className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <TiltImage />

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: eased }}
            className="flex flex-col justify-center"
          >
            <h3 className="font-display text-3xl md:text-4xl font-bold mb-6 text-balance">
              Passionate about creating{" "}
              <span className="font-serif-italic gradient-text">
                digital experiences
              </span>
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-pretty">
              <p>
                I&rsquo;m a Full Stack Developer with 5+ years of professional
                experience designing and delivering high-quality software. I
                architect and implement RESTful APIs in Python with Django and
                FastAPI — scalable, secure and maintainable.
              </p>
              <p>
                On the frontend, I build highly responsive, accessible interfaces
                with React, leveraging modern state management and
                component-driven development for seamless experiences.
              </p>
              <p>
                I also build mobile apps with Flutter and Dart — native-compiled
                applications that run smoothly across Android and iOS.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {["RESTful APIs", "Component-driven UI", "Type-safe code", "Pixel-perfect motion"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Skills */}
        <SectionTitle eyebrow="Toolkit">Skills</SectionTitle>
        <div className="mb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((group, i) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: eased }}
            >
              <Card className="group relative h-full overflow-hidden border-border bg-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:glow-sm">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-xl text-primary">
                    {group.glyph}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {group.category}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {group.items.map((s) => (
                    <li key={s} className="flex items-center text-muted-foreground">
                      <span className="mr-3 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Experience */}
        <SectionTitle eyebrow="Journey">Experience</SectionTitle>
        <div className="mx-auto mb-32 max-w-3xl space-y-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden border-border bg-card/50 p-8 transition-colors duration-300 hover:border-primary/50">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-amber-400" />
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">{exp.title}</h3>
                    <p className="font-medium text-primary">{exp.company}</p>
                  </div>
                  <span className="w-fit rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {exp.period}
                  </span>
                </div>
                <p className="leading-relaxed text-muted-foreground">{exp.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <SectionTitle eyebrow="Studies">Education</SectionTitle>
        <div className="mx-auto max-w-3xl space-y-6">
          {education.map((edu, i) => (
            <motion.div
              key={edu.degree}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden border-border bg-card/50 p-8 transition-colors duration-300 hover:border-primary/50">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-amber-400" />
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">{edu.degree}</h3>
                    <p className="font-medium text-primary">{edu.institution}</p>
                  </div>
                  <span className="w-fit rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {edu.period}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AboutPage;
