# Supported Formats

Status per the checklist rules (TESTED only with a recorded test).

| Format | Read | Write | Status | Notes |
|---|---|---|---|---|
| DXF (via dxflib) | yes | yes | TESTED for lines, arcs, circles, layers, units (2026-10-20) | Other entities (dimensions, hatches, blocks, text) — PLANNED round-trip tests |
| DWG | no | no | UNSUPPORTED in QCAD CE | Requires ODA SDK (paid) or LibreDWG (GPL, incomplete). See licensing-review.md |
| PDF | — | QCAD print/PDF export exists | PLANNED (not tested) | |
| SVG | import add-on exists | export exists | PLANNED (not tested) | |
| Printing | — | QCAD print preview | PLANNED (not tested) | |

AutoCAD-compatibility is **not claimed**.
