#!/usr/bin/env bash
# AmeenCAD — copy AmeenCAD add-on scripts and tests into a built QCAD tree.
# Usage: tools/deploy-linux.sh [QCAD_BUILD_DIR]   (default: ./build-qt5)
# Custom code lives in ./ameencad and is never mixed into ./upstream-qcad.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QCAD="${1:-$ROOT/build-qt5}"
DEST="$QCAD/scripts/AmeenCAD"

[ -d "$QCAD/scripts" ] || { echo "No QCAD scripts dir at $QCAD/scripts" >&2; exit 1; }
rm -rf "$DEST"
mkdir -p "$DEST"
cp -a "$ROOT/ameencad/scripts/AmeenCAD/." "$DEST/"
# 'Tests' folders are skipped by QCAD's add-on scanner, so tests never show in menus.
mkdir -p "$DEST/Tests"
cp -a "$ROOT/ameencad/tests/qcad/." "$DEST/Tests/"
echo "Deployed AmeenCAD scripts to $DEST"
