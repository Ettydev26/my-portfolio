import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MagneticWrap from "@/components/MagneticWrap";

const eased = [0.22, 1, 0.36, 1];

const NotFoundPage = () => {
  return (
    <>
      <title>EttyDev — Page Not Found</title>
      <meta name="description" content="The page you're looking for doesn't exist." />

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        {/* Atmosphere */}
        <div aria-hidden className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" style={{ animation: "orb 12s ease-in-out infinite" }} />
        <div aria-hidden className="absolute bottom-1/4 right-0 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" style={{ animation: "orb 16s ease-in-out infinite reverse" }} />
        <div aria-hidden className="absolute inset-0 bg-grid-pattern" />

        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: eased }}
        >
          {/* Glitch 404 */}
          <motion.div
            className="relative inline-block font-display font-bold leading-none"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: eased, delay: 0.1 }}
          >
            <span className="relative block text-[clamp(8rem,22vw,18rem)] gradient-text">
              404
              <span aria-hidden className="glitch-layer r block">404</span>
              <span aria-hidden className="glitch-layer b block">404</span>
            </span>
          </motion.div>

          <motion.h2
            className="font-display mt-4 text-3xl md:text-4xl font-semibold text-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="font-serif-italic">Oops.</span> Page not found.
          </motion.h2>

          <motion.p
            className="mx-auto mt-4 max-w-md text-muted-foreground text-pretty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The page you&rsquo;re looking for doesn&rsquo;t exist, was moved, or
            slipped into another dimension entirely.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MagneticWrap>
              <Button
                asChild
                className="h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 text-white border-0 glow-sm hover:from-purple-600 hover:to-pink-600"
              >
                <Link to="/">
                  <ArrowLeft className="mr-1" />
                  Back home
                </Link>
              </Button>
            </MagneticWrap>
            <MagneticWrap>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-primary/40 bg-transparent px-6 text-foreground hover:bg-primary/10 hover:border-primary"
              >
                <Link to="/contact">
                  <MessageCircle className="mr-1" />
                  Contact
                </Link>
              </Button>
            </MagneticWrap>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFoundPage;
