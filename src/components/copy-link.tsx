"use client";

import { useState } from "react";
import { useSiteCopy } from "@/components/site-copy-provider";

export function CopyLink({ path, label }: { path: string; label: string }) {
  const copyText = useSiteCopy();
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

  return <button className="copy-link" onClick={copy} type="button" aria-live="polite">{status === "copied" ? copyText.copy_done : status === "error" ? copyText.copy_error : `${copyText.copy_action} ${label}`}</button>;
}
