# ChessCheese

A local-only Next.js + TypeScript chess analysis workspace. PGNs and evaluations stay in browser memory; there are no accounts, database, upload endpoints, or remote engine calls.

## Run locally

Requires Node.js 20.9 or newer and pnpm. From this directory:

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:3000. For a production preview, run `pnpm build` followed by `pnpm start`. Run the focused parser and grading tests with `pnpm test`.

## Use

The app opens with Morphy's Opera Game. Import PGN by pasting text or selecting a file (up to 2 MB). A PGN containing multiple header-separated games exposes a game selector. Custom starting FENs are supported. Click Analyze game to evaluate all mainline positions. Click a move, use the navigation buttons or left/right arrow keys, or click the evaluation chart to review a position. Click a piece and a legal destination to explore a temporary variation; promotion offers all four pieces. Return to game restores the imported mainline. Variations are not included in the batch analysis.

## Analysis model

Stockfish 18 lite single-threaded runs as a dedicated Web Worker. Installation copies its JavaScript, WASM and license into `public/engine`; no CDN or cross-origin isolation is needed. Each position searches to the selected depth, capped at 2 seconds. The displayed depth is the actual completed depth. The engine is terminated on cancellation or game changes, and stale results are discarded.

Evaluations are normalized to White's perspective. Move loss is `max(0, (before − after) × moverSign)` with White = +1 and Black = −1. Classification thresholds are Best ≤10 cp (or the engine's best move), Excellent ≤25, Good ≤50, Inaccuracy ≤100, Mistake ≤200, otherwise Blunder. Unanalyzed moves remain ungraded. Mate is displayed separately and mapped to a large signed score for loss calculations, making labels near mate approximate. Independent shallow searches can disagree; these labels are heuristics, not a commercial accuracy metric. Position evaluation uses FEN and does not preserve threefold repetition history.

The responsive board supports click/tap moves, castling, en passant and promotion through chess.js legality checks. Refreshing clears imported games and results. PGN comments and sidelines are parsed but only the mainline is reviewed. A feature-detected, read-only WebMCP tool exposes the currently visible position in supported browsers.

## Third-party software

- chess.js: BSD-2-Clause, https://github.com/jhlywa/chess.js
- Stockfish.js 18.0.8: GPL-3.0, https://github.com/nmrugg/stockfish.js/tree/v18.0.8
- Stockfish source and build instructions: https://github.com/nmrugg/stockfish.js
- Engine license included at `public/engine/COPYING.txt`.

Keep the engine license and provide corresponding source in compliance with GPL-3.0 if redistributing. This local MVP is not published.

## Selected move review

`Evaluation.best` remains the single source for Stockfish's UCI move. The board arrow and review panel both use the engine alternative from **before** the selected move (`results[ply - 1]`). The board still shows the position after the move, so the recommended source square can now be empty. A circular classification badge marks the played move’s destination; last-move highlights remain visible. Both overlays hide at the initial position and in temporary variations. The arrow hides when the prior evaluation has no valid best move; the badge hides when classification is unavailable. Flipping the board rotates both overlays, with badge placement kept near the destination’s visual top-right corner and clamped at board edges.

`lib/review.ts` derives reviews once from the existing results, calling the unchanged `moveGrade` classification logic in `lib/chess.ts`. The explorer, selected review and summary consume that derived data without maintaining another analysis store. Partial analysis does not produce fabricated losses or labels.

Opening detection does not exist yet. `OpeningBookLookup` is the extension point for a future locally bundled, licensed opening dataset mapping normalized positions to book UCI moves. A detector would normalize FEN keys (including side-to-move/castling/en-passant policy), check legal moves against the dataset, and be passed to `deriveReviews`. The Book icon and type are ready; no external API, dataset, or automatic early-move labeling has been added.
