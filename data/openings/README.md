# Local opening data

The files `a.tsv` through `e.tsv` come from the
[lichess-org/chess-openings](https://github.com/lichess-org/chess-openings)
project. The collection is dedicated to the public domain under CC0, as stated
in its upstream README. `scripts/build-opening-book.mjs` compiles these named
ECO lines into the position-based index used by the browser.

`supplemental.tsv` contains reviewed move-order transpositions that are useful
for move-by-move classification but are not represented as separate upstream
named lines.
