"use client";
import { useState } from "react";
export function CopyLink({ path, label }: { path: string; label: string }) { const [copied, setCopied] = useState(false); async function copy() { await navigator.clipboard.writeText(`${location.origin}${path}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } return <button className="copy-link" onClick={copy} type="button">{copied ? "copied ✓" : `copy ${label}`}</button>; }
