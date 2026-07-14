# JarScene specification

## Overview

- Target: `src/components/jar-scene.tsx`
- References: `full/jar-desktop.png`, `full/jar-mobile.png`
- Interaction model: click-driven memory pull with time-driven star release animation

## Exact desktop layout

- Full viewport, app cream background and soft yellow/pink radial glows.
- Three parchment-mask links fixed top-right, stacked with slight alternating rotations.
- Link font: Space Mono 13.12px; padding 7.68px 16px 8.32px 10.88px; kraft paper texture.
- Main heading: Cormorant Garamond 48px, line-height 48px, blue `rgb(44,107,179)`.
- Count copy: Space Mono 14px, line-height 20px, 12px top margin.
- Jar button: 520px x 676px desktop; transparent; real `/assets/mason-jar.png` object-contain.
- Torn kraft parchment strip sits horizontally behind the lower half of the jar.
- Each memory is represented by its matching 50px pastel PNG inside the glass.

## Mobile

- Viewport 390x844; menu remains top-right.
- Heading moves below menu; jar width about 320px and dominates the center.
- Kraft strip becomes full-width behind the lower jar.

## States

- Empty: redirect/render WelcomeScene.
- One memory: `one paper star waits inside.`
- Multiple: `<n> paper stars wait inside.`
- Jar click: disable repeat click, emit matching star fragments, then open selected memory in RevealCard.

