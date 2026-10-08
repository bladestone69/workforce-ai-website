# Drift Protocol website demo

Source reviewed: `F:/MarcelProjects/Projects/Games/drift_protocol/` (`index.html`, `style.css`, `game.js`, and `docs/gdd.md`). The website demo is a small, self-contained adaptation in `drift-demo.js`, not a copy of the full production build.

It keeps the source game's core feel and numerical physics: 900×500 arena, 9px drone radius, additive four-way thrust of 0.28, speed cap of 7.5, and wall bounce factor of 0.44. The fixed ECHO-7 course has three alternating gates and one dock goal. Start/Restart is provided; keyboard thrust works while the canvas is focused and touch players drag on the arena to thrust. The run timer begins with the first thrust, and an optional local best time is saved under `lockdown:drift-demo:best`.

No level select, missions, store, or custom-level loading from the original project are included. This keeps the public demo to one replayable level and avoids modifying the source game folder. The same demo is available on the Games service page and the dedicated Drift Protocol project page. The project page includes original generated key art, a target-date countdown, and private prototype feedback. Feedback is saved in private Vercel Blob storage and emailed to the studio; comments are not displayed publicly.
