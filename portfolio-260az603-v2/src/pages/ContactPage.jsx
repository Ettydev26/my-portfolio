import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Send, Check, Loader2 } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import MagneticWrap from "@/components/MagneticWrap";
import { contactInfo, socialLinks } from "@/data/socialLinks.jsx";

const RECIPIENT = "ettiolayinka4@gmail.com";
const eased = [0.22, 1, 0.36, 1];

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Build a mailto: link so the form actually does something useful
    // (opens the user's email client pre-filled with their message).
    const subject = encodeURIComponent(`Portfolio inquiry from ${data.name}`);
    const body = encodeURIComponent(
      `Hi Kehinde,\n\n${data.message}\n\n— ${data.name}\n${data.email}`
    );
    const url = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`;

    // Tiny delay so the loading state is felt
    await new Promise((r) => setTimeout(r, 600));
    window.location.href = url;

    setIsSubmitting(false);
    setIsSubmitted(true);
    reset();
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <>
      <title>EttyDev — Contact</title>
      <meta
        name="description"
        content="Reach out for collaborations, freelance work, or just to say hi."
      />

      <div className="container mx-auto px-4 py-32">
        <SectionTitle eyebrow="Get in touch">Let's talk</SectionTitle>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: contact info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: eased }}
          >
            <h3 className="font-display text-3xl md:text-4xl font-bold mb-4 text-balance">
              Let&rsquo;s work{" "}
              <span className="font-serif-italic gradient-text">together</span>
            </h3>
            <p className="mb-8 max-w-md leading-relaxed text-muted-foreground">
              I&rsquo;m currently open to new opportunities. Whether you have a
              question, a brief, or just want to say hi — I&rsquo;ll get back to you.
            </p>

            <div className="space-y-3">
              {contactInfo.map(({ name, value, icon: Icon, href }) => {
                const Wrap = href ? "a" : "div";
                return (
                  <motion.div key={name} whileHover={{ x: 6 }}>
                    <Wrap
                      {...(href ? { href, "aria-label": `${name}: ${value}` } : {})}
                      className="flex items-start gap-4 rounded-2xl border border-border bg-card/40 p-4 transition-colors duration-300 hover:border-primary/50"
                    >
                      <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 text-primary">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {name}
                        </h4>
                        <p className="text-foreground">{value}</p>
                      </div>
                    </Wrap>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-12">
              <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Find me on
              </h4>
              <div className="flex gap-3">
                {socialLinks.map(({ name, url, icon: Icon }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="group grid h-12 w-12 place-items-center rounded-xl border border-border bg-secondary/50 text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:text-primary hover:glow-sm"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: eased }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 glow-sm">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-pink-500/20 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl"
              />

              <h3 className="relative font-display text-2xl md:text-3xl font-bold mb-6">
                Send a message
              </h3>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: eased }}
                    className="relative flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-10 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white glow"
                    >
                      <Check size={28} strokeWidth={3} />
                    </motion.div>
                    <div>
                      <h4 className="font-display text-2xl font-bold">
                        Message sent!
                      </h4>
                      <p className="mt-2 text-muted-foreground">
                        Your email client should be opening now. I&rsquo;ll reply
                        soon.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="relative space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <FloatInput
                      id="name"
                      label="Name"
                      error={errors.name}
                      registration={register("name", { required: "Name is required" })}
                    />
                    <FloatInput
                      id="email"
                      label="Email"
                      type="email"
                      error={errors.email}
                      registration={register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    <FloatTextarea
                      id="message"
                      label="Message"
                      error={errors.message}
                      registration={register("message", {
                        required: "Message is required",
                        minLength: { value: 10, message: "At least 10 characters" },
                      })}
                    />

                    <MagneticWrap className="block w-full" strength={0.15}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3.5 font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-70"
                      >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        <AnimatePresence mode="wait">
                          {isSubmitting ? (
                            <motion.span
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Loader2 size={18} className="animate-spin" />
                              Sending…
                            </motion.span>
                          ) : (
                            <motion.span
                              key="idle"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              Send message
                              <Send
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </MagneticWrap>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 h-72 overflow-hidden rounded-3xl border border-border">
              <iframe
                title="Lagos, Nigeria — map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.45932537554!2d3.1438721!3d6.5480357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2s!4v1645645404386!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(1.05)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

/* ------- Floating label inputs ------- */
const FloatInput = ({ id, label, type = "text", registration, error }) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      placeholder=" "
      {...registration}
      className={`peer w-full rounded-xl border bg-secondary/40 px-4 pb-2 pt-6 text-foreground placeholder-transparent
        focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition-all
        ${error ? "border-destructive" : "border-border hover:border-primary/40"}`}
    />
    <label
      htmlFor={id}
      className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.15em] text-muted-foreground transition-all
        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
        peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:uppercase peer-focus:tracking-[0.15em] peer-focus:text-primary"
    >
      {label}
    </label>
    {error && (
      <p className="mt-1 text-sm text-destructive">{error.message}</p>
    )}
  </div>
);

const FloatTextarea = ({ id, label, registration, error }) => (
  <div className="relative">
    <textarea
      id={id}
      rows={5}
      placeholder=" "
      {...registration}
      className={`peer w-full resize-none rounded-xl border bg-secondary/40 px-4 pb-2 pt-7 text-foreground placeholder-transparent
        focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition-all
        ${error ? "border-destructive" : "border-border hover:border-primary/40"}`}
    />
    <label
      htmlFor={id}
      className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.15em] text-muted-foreground transition-all
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
        peer-focus:top-2 peer-focus:text-xs peer-focus:uppercase peer-focus:tracking-[0.15em] peer-focus:text-primary"
    >
      {label}
    </label>
    {error && (
      <p className="mt-1 text-sm text-destructive">{error.message}</p>
    )}
  </div>
);

export default ContactPage;
