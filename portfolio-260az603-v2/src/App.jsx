import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProjectPage from "./pages/ProjectPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";

import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import GrainOverlay from "./components/GrainOverlay";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route element={<HomePage />}      path="/" />
          <Route element={<AboutPage />}     path="/about" />
          <Route element={<ProjectPage />}   path="/project" />
          <Route element={<ContactPage />}   path="/contact" />
          <Route element={<NotFoundPage />}  path="*" />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <GrainOverlay />

      <Navbar />
      <ScrollToTop />

      <main>
        <AnimatedRoutes />
      </main>

      <Footer />
    </>
  );
}

export default App;
