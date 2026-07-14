# MemoriesGallery specification

## Overview

- Target: `src/components/memories-gallery.tsx`
- Reference: `full/memories-desktop.png`
- Interaction: filter, reveal, delete confirmation

## Layout and content

- Full-height cream/radial background, back link top-left.
- Content max-width about 732px; heading Cormorant blue, text `your paper stars`.
- Count: `N folded and kept.`; empty: `no stars folded yet.`
- Right-aligned `filter by date` control using a parchment strip.
- Dropdown listbox options: all dates plus each unique formatted date; Escape/outside click closes.
- Cards are torn colored paper with small star, memory text and formatted date.
- Delete control appears on each card and is labeled `let this star go`.

## Delete dialog

- Full-screen app-background layer and centered torn sheet.
- Heading `let this star go?`
- Copy `this memory will drift out of your little jar for good.`
- Buttons `keep it` and `let go`; only `let go` deletes.

