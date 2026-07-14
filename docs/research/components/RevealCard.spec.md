# RevealCard specification

## Overview

- Target: `src/components/reveal-card.tsx`
- Reference: `full/reveal-desktop.png`
- Interaction: modal-like full-screen reveal

## Layout

- Fixed inset layer, z-index 50, same cream/radial app background with many matching floating star sprites.
- Center torn paper max-width 448px; sky/lavender/sage/etc color according to the memory.
- Tape image centered at the top, close `x` at top-right.
- Text is centered, quoted, Space Mono 24px / 39px on desktop.
- Date centered below in muted ink, 16px.
- Optional image is contained above text.
- Buttons `tuck it back` and `unfold another` use pale mixed-paper backgrounds, 14px Space Mono.

## Behavior

- Close and tuck call `onClose`.
- Unfold another calls `onPullAnother`; hide/disable if no memories.
- Escape closes; overlay does not delete or mutate a memory.

