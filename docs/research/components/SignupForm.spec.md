# SignupForm specification

## Overview

- Target: `src/components/signup-form.tsx`
- Reference: `full/signup-desktop.png`
- Interaction: email validation and mock/real magic-link request

## Layout

- Back link top-left.
- Center heading `sign up`, blue Cormorant.
- Exact copy: `save your jar in the cloud and open it on any device.`
- Torn neutral paper sheet with visually hidden Email label, placeholder `you@example.com` and full-width `email me a magic link` button.
- Button disabled until a valid email exists.

## Behavior

- Submit shows a sending state then a local success message when cloud auth is not configured.
- No additional dependency or backend is introduced during clone-only phase.
