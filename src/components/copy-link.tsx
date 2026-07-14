"use client";

import { useState } from "react";

export function CopyLink({ path, label }: { path: string; label: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${location.origin}${path}`);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
    }
  }

  return <button className="copy-link" onClick={copy} type="button" aria-live="polite">{status === "copied" ? "đã sao chép ✓" : status === "error" ? "không sao chép được" : `sao chép ${label}`}</button>;
}
