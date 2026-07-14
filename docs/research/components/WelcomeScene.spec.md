# WelcomeScene specification

## Overview

- Target: `src/components/welcome-scene.tsx`
- Screenshots: `home-desktop.png`, `home-mobile.png`
- Interaction model: time-driven decoration plus click navigation

## Structure and styles

- Full viewport, overflow hidden, parchment image over warm radial gradients.
- Center content max-width 512px and vertically centered.
- Title line one: Cormorant Garamond, blue `#2c6bb3`, 72px mobile and 96px desktop.
- Title line two: Waiting for the Sunrise, yellow `#f3ca16`, matching size.
- Description: Space Mono, black, 12px mobile and 14px desktop, relaxed line height.
- CTA: parchment strip, star icon, Space Mono; hover raises slightly.
- Decorative PNG stars use the eight downloaded pastel variants, falling then settling at the bottom.

## Responsive behavior

- Desktop uses a broad 1440px star field and 96px title.
- Mobile uses a 390px field, 72px title, and preserves a single centered column.

