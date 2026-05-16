# EttyDev — Portfolio

A creative-developer portfolio for **Kehinde Etti**, built with React 19, Tailwind v4, Vite 6 and Framer Motion.

## Stack

- **React 19** + **react-router-dom v7**
- **Tailwind CSS v4** with custom design tokens
- **Framer Motion** for animation
- **shadcn/ui** primitives (Button, Card) on top of Radix
- **react-hook-form** for the contact form
- **lucide-react** for iconography
- Fonts: **Bricolage Grotesque**, **Geist**, **Instrument Serif** (Google Fonts)

## Features

- Custom cursor with magnetic interactive states
- Scroll-progress indicator
- Animated noise / grain overlay
- Mouse-tracked gradient orbs
- Letter-by-letter hero reveal
- Infinite tech-stack marquee
- 3D-tilt profile image with animated counter
- Project filter with shared-layout pill + FLIP grid
- Floating-label contact form with `mailto:` send
- Page transitions via `AnimatePresence`
- Custom 404 with glitch animation

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run lint
```

## Project structure

```
src/
├─ assets/             images and static assets
├─ components/
│  ├─ ui/              shadcn primitives (Button, Card)
│  ├─ AnimatedCounter.jsx
│  ├─ CustomCursor.jsx
│  ├─ Footer.jsx
│  ├─ GrainOverlay.jsx
│  ├─ MagneticWrap.jsx
│  ├─ Marquee.jsx
│  ├─ NavBar.jsx
│  ├─ ProjectCard.jsx
│  ├─ ScrollProgress.jsx
│  └─ SectionTitle.jsx
├─ data/
│  ├─ about.js         skills, experience, education
│  ├─ projects.js      project list + categories
│  └─ socialLinks.jsx  shared social + contact links
├─ lib/
│  └─ utils.ts         cn() helper (clsx + tailwind-merge)
├─ pages/
│  ├─ HomePage.jsx
│  ├─ AboutPage.jsx
│  ├─ ProjectPage.jsx
│  ├─ ContactPage.jsx
│  └─ NotFoundPage.jsx
├─ App.jsx             routes + global atmosphere
├─ index.css           tokens, keyframes, utilities
└─ main.jsx
```

## License

MIT
