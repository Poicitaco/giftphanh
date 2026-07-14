# Page topology

## `/welcome`

- Full-viewport welcome scene on parchment background.
- Falling decorative stars settle along the bottom edge.
- Centered title, description, and `create a star` button.
- Button navigates to `/add`.
- Button navigates to `/add`.

## `/`

- Three parchment-strip links at top-right: add a star, view all stars, sign up.
- Center heading and memory count above a real mason-jar image.
- A torn kraft-paper strip sits behind the jar; saved star images sit inside the glass.
- Clicking the jar plays the paper-star release animation, then opens a full-screen reveal layer.

## `/memories`

- Back link, heading/count, date filter, torn-paper memory cards and delete buttons.
- Card click opens the same reveal layer as the jar.
- Delete opens a confirmation sheet with `keep it` and `let go`.

## `/sign-up`

- Centered magic-link form on a torn sheet, with email validation and feedback state.

## `/add`

- Fixed-height, full-viewport composer with a back link.
- Centered heading and quote.
- Torn paper composer: 300-character textarea, date input, photo upload and live counter.
- Submit is disabled for blank text and saves the memory to browser storage before returning to `/`.
