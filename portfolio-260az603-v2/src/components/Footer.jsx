import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { socialLinks } from "@/data/socialLinks.jsx";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-card/40 py-16">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div
        aria-hidden
        className="absolute -bottom-32 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-conic-mesh"
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Link to="/" className="font-display text-3xl font-bold">
              <span className="gradient-text">Etty</span>
              <span className="text-foreground">.dev</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
              Crafting digital experiences that bridge{" "}
              <span className="font-serif-italic text-foreground">code</span> and{" "}
              <span className="font-serif-italic text-foreground">craft</span>.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Navigate
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/project", label: "Projects" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                    <ArrowUpRight
                      size={14}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Elsewhere
            </h4>
            <div className="flex gap-3">
              {socialLinks.map(({ name, url, icon: Icon }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="group relative grid h-11 w-11 place-items-center rounded-xl border border-border bg-secondary/40 text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:text-primary hover:glow-sm"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Open to opportunities & collaborations.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Kehinde Etti. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Built with React, Tailwind v4 & Framer Motion.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
