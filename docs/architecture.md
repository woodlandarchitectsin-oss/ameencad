# Architecture

AmeenCAD = **unmodified QCAD Community Edition** + **AmeenCAD add-on scripts** (+ later, branding and packaging). No QCAD source file is edited.

```
ameencad/                     ← repo root
├─ upstream-qcad/             pristine QCAD CE clone (never edited)
├─ build-qt5/                 build copy (Linux); build-win/ on Windows
│   └─ scripts/AmeenCAD/      ← deployed by tools/deploy-*.sh
├─ ameencad/
│   ├─ scripts/AmeenCAD/      custom code (QCAD ECMAScript add-on)
│   │   ├─ AmeenCAD.js        "Architecture" menu + toolbar
│   │   ├─ lib/WallGeometry.js   pure geometry, no QCAD deps (Node-testable)
│   │   ├─ lib/WallDocument.js   applies geometry via QCAD operations
│   │   ├─ Wall/              WALL command (2 points) + options toolbar (.ui)
│   │   └─ WallFromLine/      WALLLINE command (pick existing line)
│   └─ tests/
│       ├─ unit/              Node.js tests of WallGeometry.js
│       └─ qcad/              headless tests inside the QCAD engine
├─ tools/                     deploy and test scripts
└─ docs/
```

## Why scripts, not C++

QCAD's own commands (LINE, OFFSET, TRIM…) are ECMAScript add-ons on top of its C++ engine. Writing AmeenCAD tools the same way:
- uses the engine's real objects (`RDocument`, `RLineEntity`, `RLayer`, `RAddObjectsOperation`, undo stack, snapping, command line);
- needs no recompile — the same scripts run on the Linux and Windows builds;
- keeps custom code fully outside upstream, so QCAD updates are a simple re-clone.

C++ plugins remain available (QCAD plugin interface) if a tool needs speed later.

## Wall tool data flow

1. Action (`Wall.js` / `WallFromLine.js`) collects p1, p2 (mouse, snap or typed coordinates — QCAD handles `x,y`, `@dx,dy`, `@dist<angle`), thickness text and justification.
2. `AmeenWall.parseLength()` → mm (`9in` → 228.6 exactly); `computeBoundaries()` validates and returns two offset lines. Nothing touches the document if validation fails.
3. `AmeenWall.addToDocument()` starts a **transaction group**: (a) add A-WALL layer if missing, (b) add both boundaries (ByLayer colour/linetype/weight) and optionally delete the baseline. One UNDO reverts all of it.

## QCAD integration points used

| Need | QCAD API |
|---|---|
| Menu / toolbar / commands / shortcut | `RGuiAction` in `*Init.js`, `EAction.getMenu/getToolBar` |
| Point input, preview, Esc | `EAction` states, `RAction.PickCoordinate`/`PickEntity`, `getOperation(preview)` |
| Options toolbar | `.ui` files, auto-connected `slot<Name>Changed` |
| Undoable edits | `RAddObjectsOperation`, `doc.startTransactionGroup()` |
| File I/O | `RDocumentInterface.exportFile/importFile` (dxflib) |

## Planned modules (from the master brief)

Doors/windows/columns → `scripts/AmeenCAD/Door`, `Window`, … sharing `lib/`; layer presets/templates → `scripts/AmeenCAD/Standards`; drawing audit → `scripts/AmeenCAD/Audit`.
