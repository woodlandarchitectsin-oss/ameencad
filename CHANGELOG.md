# Changelog

## 0.1.0 — 2026-10-20 (development)
- Environment audit, licensing review, third-party notices.
- QCAD CE pinned to release v3.33.1.0 (master is Qt 6-only in gui) and built from source on Linux with Qt 5.15.13 + Qt Script.
- GitHub Actions workflow for a tested Windows x64 portable build.
- Added AmeenCAD add-on: "Architecture" menu/toolbar; `WALL` and `WALLLINE` commands; A-WALL layer auto-creation; centre/left/right justification; mm/cm/m/in/ft thickness parsing; grouped undo.
- Tests: Node unit tests for wall geometry; QCAD-engine integration tests (geometry, invalid input, undo/redo, DXF save/reopen); foundation save/reopen smoke test.
