"use client";

import { createContext, useContext } from "react";
import type { SiteCopy } from "@/lib/site-copy";

const SiteCopyContext = createContext<SiteCopy | null>(null);

export function SiteCopyProvider({ copy, children }: { copy: SiteCopy; children: React.ReactNode }) {
  return <SiteCopyContext.Provider value={copy}>{children}</SiteCopyContext.Provider>;
}

export function useSiteCopy() {
  const copy = useContext(SiteCopyContext);
  if (!copy) throw new Error("SiteCopyProvider is missing");
  return copy;
}
