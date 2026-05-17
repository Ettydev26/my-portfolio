import { useEffect, useState } from "react";

let toasts = [];
const listeners = new Set();
let nextId = 0;

function emit() {
  for (const l of listeners) l(toasts);
}

export function pushToast(message, opts = {}) {
  const id = ++nextId;
  toasts = [...toasts, { id, message, kind: opts.kind ?? "error", onRetry: opts.onRetry }];
  emit();
  setTimeout(() => dismissToast(id), opts.duration ?? 5000);
  return id;
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts() {
  const [snapshot, setSnapshot] = useState(toasts);
  useEffect(() => {
    listeners.add(setSnapshot);
    return () => listeners.delete(setSnapshot);
  }, []);
  return snapshot;
}
