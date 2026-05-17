import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const LoginForm = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await signIn(email, password);
    setSubmitting(false);
    if (err) setError(err);
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-md"
      >
        <h1 className="font-display text-2xl">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin access only.
        </p>

        <label className="mt-6 block text-sm">
          <span className="text-muted-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="text-muted-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </motion.form>
    </div>
  );
};

export default LoginForm;
