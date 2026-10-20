#!/usr/bin/env bash
# AmeenCAD — run all automated tests (unit + QCAD engine integration).
# Usage: tools/run-tests-linux.sh [QCAD_BUILD_DIR]
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QCAD="${1:-$ROOT/build-qt5}"
OUT="$ROOT/test-results"
mkdir -p "$OUT"
status=0

echo "== Unit tests (Node.js, pure geometry)"
node "$ROOT/ameencad/tests/unit/wall_geometry.test.js" | tee "$OUT/unit_results.txt" || status=1

"$ROOT/tools/deploy-linux.sh" "$QCAD"
cd "$QCAD"
for t in SaveReopenSmokeTest WallIntegrationTest; do
    echo "== $t (QCAD engine, headless)"
    rm -f "$OUT/${t}.log"
    LD_LIBRARY_PATH=release QT_QPA_PLATFORM=offscreen timeout 300 ./release/qcad-bin \
        -no-gui -allow-multiple-instances -autostart \
        "scripts/AmeenCAD/Tests/${t}.js" "$OUT" > "$OUT/${t}.log" 2>&1
    grep -E "^(PASS|FAIL)|passed, " "$OUT/${t}.log" || { echo "no results (see $OUT/${t}.log)"; status=1; }
    grep -q " 0 failed" "$OUT/${t}.log" || status=1
done
echo "== GuiSmokeTest (full GUI, offscreen)"
LD_LIBRARY_PATH=release QT_QPA_PLATFORM=offscreen timeout 300 ./release/qcad-bin \
    -allow-multiple-instances -no-show -locale en \
    -exec scripts/AmeenCAD/Tests/GuiSmokeTest.js "$OUT" -quit > "$OUT/GuiSmokeTest.log" 2>&1
cat "$OUT/gui_smoke_results.txt" 2>/dev/null || { echo "no GUI results"; status=1; }
grep -q " 0 failed" "$OUT/gui_smoke_results.txt" 2>/dev/null || status=1
echo "== overall: $([ $status -eq 0 ] && echo PASS || echo FAIL)"
exit $status
