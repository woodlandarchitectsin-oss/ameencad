# Test Plan & Feature Checklist

Run everything: `tools/run-tests-linux.sh` (Linux) · GitHub workflow (Windows).
Latest run: 2026-10-20, Linux, QCAD 3.33.1 — **all 162 checks passed** (results in `test-results/`).

| Suite | Engine | Checks | Result |
|---|---|---|---|
| `tests/unit/wall_geometry.test.js` | Node.js (pure geometry) | 75 | 75 pass |
| `tests/qcad/SaveReopenSmokeTest.js` | QCAD headless | 8 | 8 pass |
| `tests/qcad/WallIntegrationTest.js` | QCAD headless | 70 | 70 pass |
| `tests/qcad/GuiSmokeTest.js` | QCAD full GUI (offscreen) | 9 | 9 pass |

## Wall tool acceptance tests (brief §10)

| Requirement | Test | Status |
|---|---|---|
| Horizontal baseline | REF 0,0→4000,0, 9 in: distance 228.600000000 mm at both ends | TESTED |
| Vertical baseline | 0,0→0,4000 | TESTED |
| Diagonal baseline | 30° and 45° (unit) / 30° (engine) | TESTED |
| Negative coordinates | −5000,−3000→−1000,−3000; negative diagonal, 115 mm | TESTED |
| Invalid input | NaN/∞ thickness, NaN coords, missing point, bad text "abc", bad justification | TESTED |
| Zero-length baseline | rejected, document unchanged | TESTED |
| Zero / negative thickness | rejected, document unchanged, no layer created | TESTED |
| Undo / redo | one undo removes both boundaries **and** the new A-WALL layer; redo restores; second wall undone alone | TESTED |
| Save and reopen | DXF export → import: layer, 2 boundaries, coordinates identical (1e-6 mm), 228.6 mm, unit mm | TESTED |
| Baseline preserved | position and layer unchanged | TESTED |
| Delete-baseline option | baseline removed; undo restores it | TESTED |
| A-WALL created if missing / reused if present | | TESTED |
| Locked A-WALL | refused, nothing changed | TESTED |
| Cancellation (Esc) | GUI: tool started and killed, drawing unchanged | TESTED (programmatic); mouse/keyboard by hand: PLANNED |
| 9 in → 228.6 mm | parse `9in`, `9"`, `0.75ft` exactly 228.6 | TESTED |

## Feature status

| Feature | Status |
|---|---|
| Unmodified QCAD build (Linux) | TESTED |
| Unmodified QCAD build (Windows) | PLANNED |
| DXF save/reopen: lines, arcs, circles, layers | TESTED |
| DXF: blocks, text, dimensions, hatches | PLANNED |
| WALL / WALLLINE commands | TESTED |
| Wall corner clean-up | PLANNED |
| Core QCAD commands (LINE, OFFSET, TRIM…) | IMPLEMENTED (upstream), not yet tested by us |
| PDF, printing, layouts | PLANNED |
| DWG | UNSUPPORTED |
| AmeenCAD branding (name/icon/installer) | PLANNED |
