import MoomentsImg from "@/assets/moomentsImg.jpg";
import PDFExplorerImg from "@/assets/pdfexplorerImg.png";
import HatsOffImg from "@/assets/hatsoffImg.png";
import AshiriImg from "@/assets/ashiriImg.jpg";

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
    id: "ashiri",
    title: "Àṣhírí",
    description:
      "An e-commerce store for an artisanal tank-top brand, with reviews, a community gallery and an admin dashboard.",
    image: AshiriImg,
    technologies: ["Angular", "TypeScript", "PostgreSQL", "Paystack"],
    category: ["fullstack", "collab"],
    demoUrl: "https://ashiri.vercel.app/",
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
];

export const categories = [
  { value: "all", label: "All" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "collab", label: "Collab" },
];
