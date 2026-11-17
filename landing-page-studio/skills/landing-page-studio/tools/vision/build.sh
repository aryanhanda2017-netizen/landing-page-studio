#!/usr/bin/env bash
# Build the on-device Vision tools (macOS only, needs the Xcode command line tools).
#   cutout <in.jpg> <out.png>   foreground cut-out with a real alpha channel (people on a plain backdrop work best)
#   faces <a.png> [b.png ...]   face boxes as fractions of each image (x, y from top-left, w, h)
set -euo pipefail
cd "$(dirname "$0")"
if [[ "$(uname)" != "Darwin" ]]; then echo "The Vision tools need macOS."; exit 1; fi
command -v swiftc >/dev/null || { echo "swiftc not found. Run: xcode-select --install"; exit 1; }
swiftc -O cutout.swift -o cutout
swiftc -O faces.swift -o faces
echo "built: $(pwd)/cutout and $(pwd)/faces"
