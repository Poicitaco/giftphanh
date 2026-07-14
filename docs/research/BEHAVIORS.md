# Behaviors

- Welcome stars fall vertically with randomized size, drift, rotation, duration and final resting height.
- The primary welcome button routes to `/add`.
- Composer counter updates from `0/300` to the current trimmed/untrimmed input length; submit enables when text is non-blank.
- Date defaults to today using a native date input.
- Photo button opens an `image/*` file picker and displays a preview after selection.
- Submit creates a UUID memory, trims text, assigns a random pastel star/paper color and rotation, and persists it under `memory-jar:memories:v1`.
- Jar view renders a real mason jar and one folded star per persisted memory. Clicking anywhere on the jar chooses a random memory other than the last pull when possible.
- Pull animation emits several matching paper-star sprites before a full-screen reveal layer appears.
- Reveal layer shows the memory text, formatted date and optional photo; close or `tuck it back` returns to the prior page, while `unfold another` chooses another available memory.
- The memories gallery filters by exact memory date, opens any card in the reveal layer, and confirms deletion before removing storage data.
- Sign-up validates an email before enabling the magic-link button. The local clone may simulate delivery until cloud auth is configured.
- Responsive model is breakpoint-driven: the same single-column composition scales down at mobile widths.
