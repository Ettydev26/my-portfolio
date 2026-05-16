import MoomentsImg from "@/assets/moomentsImg.jpg";
import PortfolioImg from "@/assets/portfolioImg.png";
import PDFExplorerImg from "@/assets/pdfexplorerImg.png";
import HatsOffImg from "@/assets/hatsoffImg.png";
import PlaceholderImg from "@/assets/placeholderImg.png";

export const projects = [
  {
    id: "moooments",
    title: "Moooments",
    description:
      "A privacy-first photo-sharing platform for events. Attendees upload photos on the event day, share private albums and enjoy seamless file optimization.",
    image: MoomentsImg,
    technologies: ["React", "Django", "JWT", "AWS", "REST API"],
    category: ["fullstack", "collab"],
    demoUrl: "https://moooments.vercel.app/",
  },
  {
    id: "portfolio",
    title: "Portfolio Website",
    description:
      "A responsive portfolio site built with React, Tailwind v4 and Framer Motion. Animated, accessible, fast.",
    image: PortfolioImg,
    technologies: ["React", "Tailwind CSS", "Framer Motion"],
    category: ["frontend"],
    demoUrl: "https://example.com",
  },
  {
    id: "pdf-explorer",
    title: "PDF Explorer",
    description:
      "An AI-powered document workspace with intelligent search and analysis powered by Gemini.",
    image: PDFExplorerImg,
    technologies: ["React", "FastAPI", "Gemini API"],
    category: ["fullstack"],
    demoUrl: "https://pdf-explorer-woad.vercel.app/",
    codeUrl: "https://github.com",
  },
  {
    id: "hatsoff",
    title: "HatsOFF Store",
    description:
      "An e-commerce storefront with product listings, cart and secure Flutterwave checkout.",
    image: HatsOffImg,
    technologies: ["React", "Tailwind CSS", "Firebase", "Flutterwave"],
    category: ["fullstack", "collab"],
    demoUrl: "https://example.com",
  },
  {
    id: "blog-api",
    title: "Blog API",
    description:
      "A RESTful API for a blog platform with authentication, authorization and pagination.",
    image: PlaceholderImg,
    technologies: ["Node.js", "Express", "MongoDB", "JWT"],
    category: ["backend"],
    codeUrl: "https://github.com",
  },
  {
    id: "social-dashboard",
    title: "Social Dashboard",
    description:
      "A dashboard surfacing analytics from across social platforms with interactive, responsive charts.",
    image: PlaceholderImg,
    technologies: ["React", "Chart.js", "Tailwind CSS"],
    category: ["frontend"],
    demoUrl: "https://example.com",
    codeUrl: "https://github.com",
  },
];

export const categories = [
  { value: "all", label: "All" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "collab", label: "Collab" },
];
