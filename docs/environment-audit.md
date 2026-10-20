# Environment Audit

Audited: 2026-10-20 (all values below were read from the machine, not assumed).

## Where the work ran

| Item | Finding |
|---|---|
| Environment | Claude cloud workspace (Linux VM). **Not Windows, not WSL.** |
| OS / arch | Ubuntu 24.04.5 LTS, x86_64, kernel 6.18 |
| CPU / RAM | 2 cores, 7.8 GiB |
| Disk | 252 GB volume, ~31 GB free at audit time |
| Compilers | GCC/G++ 13.3.0, Clang (present) |
| Build tools | CMake 3.28.3, GNU Make, Git 2.43.0; Ninja installed during audit |
| Qt (before) | Only Qt 5 runtime libraries; no Qt dev packages |
| Qt (installed) | Qt 5.15.13 dev + Qt Script 5.15.13 + XmlPatterns (apt); Qt 6.4.2 dev (apt) |
| Node.js | v22.22.0 (used only for pure-geometry unit tests) |
| Windows SDK / MSVC | **None — cannot exist on this Linux VM** |
| Network | Package registries + GitHub reachable; most other sites blocked |
| User's own computer | A link to the user's computer was reported, but the device bridge returned "not connected" — no access to the Windows PC this session |

## Repository state

- `/home/claude` contained no project, no Git repository and no CAD source before work began. Nothing was overwritten or deleted.
- Created `/home/claude/ameencad/` with:
  - `upstream-qcad/` — pristine clone of github.com/qcad/qcad, commit `83bb2cff` ("Version 27", 2026-10-19). `git status` clean.
  - `build-qt5/` — build copy, checked out at release tag **v3.33.1.0** (master did not build with Qt 5 — see build-report). Only build shim: Qt-Script binding folder copied from 5.15.8 to 5.15.13.
  - `ameencad/` — all AmeenCAD custom code and tests.
  - `reference/` — `qtjsapi` and `qcadjsapi` clones (Qt 6 scripting bindings), kept for evaluation only.

## Consequence for a Windows product

This VM can build and test **the Linux build of the same source**, which validates the engine, the AmeenCAD scripts and file round-trips. It **cannot produce or run `AmeenCAD.exe`**. The Windows build must be done on a Windows 10/11 x64 PC (or a Windows CI runner) — see `docs/windows-build.md`.
