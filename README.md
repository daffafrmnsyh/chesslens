# Chesslens

Chesslens is a browser-based chess game review tool built with Next.js, TypeScript, chess.js, and Stockfish.

Import a PGN, analyze the game locally in your browser, review move quality, inspect engine recommendations, explore alternative lines, and revisit key turning points without uploading your games to a remote analysis server.

## Live Demo

https://chesslens-ten.vercel.app

## Features

- Import PGN by paste or file upload
- Review a game move by move
- Stockfish-powered position evaluation
- Move classifications:
  - Book
  - Best
  - Excellent
  - Good
  - Inaccuracy
  - Mistake
  - Blunder
- Best-move arrows
- Evaluation timeline
- Move Explorer
- Temporary variation exploration
- Opening detection with local opening data
- Checkmate and draw terminal-state handling
- Board flip
- Promotion support
- Responsive desktop and mobile layout
- Local-only game analysis
- No account or database required

## How It Works

Chesslens runs game analysis directly in the browser.

PGNs and engine evaluations are kept in browser memory. There are no user accounts, cloud databases, PGN upload endpoints, or remote engine-analysis calls.

The basic flow is:

1. Import a PGN
2. Choose the desired analysis depth
3. Run Stockfish analysis
4. Review each move
5. Inspect move classification and engine evaluation
6. Explore alternative lines directly on the board
7. Return to the original game at any time

The landing page is available at `/`, while the analysis workspace lives at `/analysis`.

## Tech Stack

- Next.js
- React
- TypeScript
- chess.js
- Stockfish.js / Stockfish 18
- Web Workers
- SVG chess pieces
- CSS

## Run Locally

Requires Node.js 20.9 or newer and pnpm.

Install dependencies:

```sh
pnpm install
```

Start the development server:

```sh
pnpm dev
```

Open:

```text
http://127.0.0.1:3000
```

For a production preview:

```sh
pnpm build
pnpm start
```

Run the test suite with:

```sh
pnpm test
```

## Using Chesslens

Chesslens opens with a sample game so the review interface can be explored immediately.

You can import another game by:

- pasting PGN text
- selecting a `.pgn` file

PGN files up to 2 MB are supported.

A PGN containing multiple header-separated games exposes a game selector.

Custom starting FENs are also supported.

After importing a game:

1. choose an analysis depth
2. click **Analyze game**
3. select any move to review the resulting position

You can navigate through the game using:

- the move list
- Previous / Next controls
- keyboard arrow keys
- the Evaluation Timeline
Using Chesslens

Chesslens opens with a sample game so the review interface can be explored immediately.

You can import another game by:

pasting PGN text
selecting a .pgn file

PGN files up to 2 MB are supported.

A PGN containing multiple header-separated games exposes a game selector.

Custom starting FENs are also supported.

After importing a game:

choose an analysis depth
click Analyze game
select any move to review the resulting position

You can navigate through the game using:

the move list
Previous / Next controls
keyboard arrow keys
the Evaluation Timeline
Game Review

Each analyzed move receives a derived review based on the engine evaluation before and after the move.

Current classifications include:

Book
Best
Excellent
Good
Inaccuracy
Mistake
Blunder

The review panel can show:

the move played
move classification
evaluation change
engine recommendation when available
opening information when recognized

The board can also display a correction arrow based on Stockfish's recommended move from the position before the selected move.

Analysis Model

Stockfish 18 lite runs in the browser using a dedicated Web Worker.

The engine JavaScript, WASM, and related files are bundled with the application, so analysis does not require a remote engine service.

Each position is analyzed using the selected search depth with runtime safeguards to prevent excessively long searches.

The displayed evaluation is normalized to White's perspective:

positive evaluation = advantage for White
negative evaluation = advantage for Black

Move loss is derived from the difference between the evaluation before and after the played move from the perspective of the player who moved.

Current classification thresholds are heuristic:

Best        <= 10 cp or engine best move
Excellent   <= 25 cp
Good        <= 50 cp
Inaccuracy  <= 100 cp
Mistake     <= 200 cp
Blunder     > 200 cp

Mate positions are handled separately.

Because independent engine searches may complete at different depths, classifications near tactical or mating positions should be treated as practical review guidance rather than an authoritative commercial accuracy metric.

Evaluation Timeline

The Evaluation Timeline shows how the engine evaluation changes throughout the game.

It provides a quick way to identify:

turning points
major mistakes
tactical swings
positions worth reviewing

Selecting a point on the timeline moves the board to the corresponding position.

Variation Mode

You can explore alternative moves directly from the currently displayed board position.

When a legal move is played outside the imported mainline, Chesslens enters a temporary variation.

Variation mode:

starts from the currently selected position
allows moves for both sides
evaluates the resulting position with Stockfish
shows engine recommendations
keeps the original imported game unchanged

Use Return to Game to leave the variation and return to the imported mainline.

Temporary variations are not included in the original batch analysis.

Opening Detection

Chesslens includes local opening recognition based on normalized board positions.

When a known position is recognized, the review interface may show:

opening family
variation name
ECO code
Book classification for recognized theoretical moves

Opening recognition is based on the current board position rather than permanently assuming the game remains in book after a deviation.

The opening dataset is local and intentionally limited, so not every opening or transposition will be recognized.

Terminal Positions

Chesslens detects and handles terminal game states including:

checkmate
stalemate
insufficient material
repetition where supported by the available game history
fifty-move-rule conditions where supported

Terminal positions use explicit win/draw presentation instead of normal centipawn evaluation.

Board Interaction

The chessboard uses chess.js legality checks and supports:

normal legal moves
castling
en passant
promotion
board flipping
click/tap interaction

Promotion provides all four standard options:

Queen
Rook
Bishop
Knight
Privacy

Chesslens is designed as a local-first analysis tool.

Game data and engine evaluations remain in browser memory during the session.

Chesslens does not currently use:

user accounts
a database
cloud PGN storage
remote Stockfish analysis

Refreshing the page clears imported games and analysis results.

Limitations

Chesslens is an independent side project and is not intended to reproduce commercial chess-platform accuracy systems.

Current limitations include:

opening coverage is intentionally incomplete
classifications use heuristic centipawn-loss thresholds
analysis results may vary slightly depending on completed engine depth
repetition-related evaluation depends on available move history
imported PGN comments and sidelines are parsed, but only the mainline is reviewed
temporary variations are not included in batch analysis
no cloud persistence
no account synchronization
no multiplayer functionality
Third-Party Software

Chesslens uses open-source software and artwork.

chess.js

License: BSD-2-Clause

https://github.com/jhlywa/chess.js

Stockfish.js

Stockfish 18 is used for browser-based chess analysis.

License: GNU GPL v3

https://github.com/nmrugg/stockfish.js

Additional licensing information is available in:

LICENSES/Stockfish-GPL-3.0.txt
Chess Piece Artwork

Chess piece artwork by Cburnett.

Source: Wikimedia Commons

License: BSD 3-Clause

Additional attribution and licensing information is available in:

THIRD_PARTY_NOTICES.md
LICENSES/Cburnett-BSD-3-Clause.txt
Independence

Chesslens is an independent project.

It is not affiliated with, endorsed by, or sponsored by Chess.com, Lichess, Stockfish, or any other chess platform or organization.

Support

If you enjoy Chesslens and want to support the project:

https://saweria.co/daffafrmnsyh

Author

Built by Daffa Firmansyah.

Chesslens is an experimental product-design and engineering project focused on making chess game review easier to understand and explore.
