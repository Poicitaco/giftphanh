# MemoryComposer specification

## Overview

- Target: `src/components/memory-composer.tsx`
- Screenshots: `add-desktop.png`, `add-mobile.png`
- Interaction model: input, native date selection, local image upload, local save

## Structure and styles

- Back link at top-left with muted coral arrow.
- Heading: Cormorant Garamond, blue `#2c6bb3`, 24px mobile / 36px desktop.
- Quote: Space Mono, 12px mobile / 14px desktop.
- Torn paper max-width 448px, parchment mask, sage/lavender craft texture, tape overlay and 28px ruled lines.
- Textarea: italic serif, 18px mobile / 20px desktop, six rows, 300 characters.
- Native date input, live count, image picker and preview.
- Full-width outlined submit button with pastel star; disabled at 40% opacity.

## States

- Blank: submit disabled, count `0/300`.
- Text entered: count updates and submit enables.
- Photo chosen: preview and remove action appear without uploading externally.
- Submit: save to localStorage and navigate to `/`.

