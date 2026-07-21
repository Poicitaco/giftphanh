"use client";

import { useState } from "react";
import { useSiteCopy } from "@/components/site-copy-provider";

export function PaperDatePicker({ id, name }: { id?: string; name: string }) {
  const copy = useSiteCopy();
  const [mode, setMode] = useState<"manual" | "scheduled">("manual");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  const combinedValue = mode === "scheduled" && dateStr && timeStr ? `${dateStr}T${timeStr}` : "";

  return (
    <fieldset className="paper-date-picker">
      <legend className="sr-only">{copy.create_open_at_label}</legend>
      <input type="hidden" id={id} name={name} value={combinedValue} />
      
      <div className="paper-date-options">
        <label className={`paper-radio-label ${mode === "manual" ? "is-active" : ""}`}>
          <input 
            type="radio" 
            name={`${name}-mode`} 
            value="manual" 
            checked={mode === "manual"} 
            onChange={() => setMode("manual")} 
          />
          <span className="radio-indicator" aria-hidden="true" />
          <span>{copy.create_open_manual}</span>
        </label>
        
        <label className={`paper-radio-label ${mode === "scheduled" ? "is-active" : ""}`}>
          <input 
            type="radio" 
            name={`${name}-mode`} 
            value="scheduled" 
            checked={mode === "scheduled"} 
            onChange={() => setMode("scheduled")} 
          />
          <span className="radio-indicator" aria-hidden="true" />
          <span>{copy.create_open_scheduled}</span>
        </label>
      </div>

      {mode === "scheduled" && (
        <div className="paper-date-inputs">
          <label>
            <span>{copy.create_open_date}</span>
            <input 
              type="date" 
              value={dateStr} 
              onChange={(e) => setDateStr(e.target.value)} 
              required={mode === "scheduled"} 
            />
          </label>
          <label>
            <span>{copy.create_open_time}</span>
            <input 
              type="time" 
              value={timeStr} 
              onChange={(e) => setTimeStr(e.target.value)} 
              required={mode === "scheduled"} 
            />
          </label>
        </div>
      )}
    </fieldset>
  );
}
