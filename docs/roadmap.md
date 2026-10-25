# Roadmap

| Phase | Goal | Status (2026-10-20) |
|---|---|---|
| 1 | Environment audit & licensing | **Done** — see environment-audit.md, licensing-review.md |
| 2 | Build & launch unmodified foundation | **Done** — Linux and Windows (CI build 8, all tests pass on Windows) |
| 3 | Draw / save / reopen verified | **Done** on Linux (8/8) |
| 4 | Branded AmeenCAD app (name, icon, title, splash, installer) | Planned |
| 5 | Validate core 2D commands (LINE, PLINE, OFFSET, TRIM, …) | Planned — QCAD provides them; need recorded tests |
| 6 | Architectural wall tool | **Done** — 154 wall checks pass; corner clean-up in backlog |
| 7 | Doors, windows, columns, room areas, arch dimensions | Planned |
| 8 | DXF workflows, PDF, printing, layouts | Planned |
| 9 | Pilot on copies of real Woodland drawings | Planned |
| 10 | Stable Windows release + GPL source package | Planned; license model decision required first |

## Next smallest useful task

Hands-on check of the Windows zip on an office PC (draw walls with the mouse, save, reopen in AutoCAD/progeCAD). Then Phase 4 branding (AmeenCAD.exe name, icon, title, installer).

## Wall tool v2 backlog
- Clean corners/T-junctions between consecutive walls (currently each segment is independent, ends overlap at corners).
- End caps (close wall ends) as an option.
- Polyline baselines.
- Thickness presets: 4½" (114.3), 9" (228.6), 6" (152.4), 230 mm.
