# Build Report

Date: 2026-10-20 · Machine: Ubuntu 24.04 x86_64 VM, 2 cores (see environment-audit.md)

## 1. Attempts, in order (actual results)

| # | Source | Toolchain | Result |
|---|---|---|---|
| 1 | QCAD `master` 83bb2cff ("Version 27") | CMake + Ninja, Qt 6.4.2 | Configured OK. **Stopped**: the Qt 6 build needs the separate `qtjsapi`/`qcadjsapi` binding repos and Qt ≥ 6.5 (QCAD docs: 6.5.2); Ubuntu has 6.4.2. |
| 2 | QCAD `master` 83bb2cff | qmake, Qt 5.15.13 + Qt Script, GCC 13 | **Failed** in `src/gui`: new accessibility files (`RAccessibleFlatTree.cpp`, `RAccessibleNameFilter.cpp`, `RAccessibleValueLabel.cpp`) use Qt 6-only APIs (`QAccessibleSelectionInterface`, `QLabel::pixmap()` by value, `Qt::mightBeRichText`). 21 errors. Master is moving to Qt 6 only. |
| 3 | **QCAD release tag `v3.33.1.0`** (897079c2, 2026-09-08) | qmake, Qt 5.15.13 + Qt Script, GCC 13 | **Success** (make exit 0). |

**Decision:** pin the foundation to the latest stable release `v3.33.1.0`, not `master`. This is also what the Windows build uses.

## 2. Build shim (the only change, outside upstream)

Ubuntu ships Qt **5.15.13**; QCAD selects script bindings by exact Qt version and has folders up to 5.15.8. Copied `src/3rdparty/qt-labs-qtscriptgenerator-5.15.8` → `…-5.15.13` (and renamed its `.pro`). No source file edited. On Windows with Qt 5.15.2 no shim is needed (`…-5.15.2` exists).

## 3. Build output (Linux)

`build-qt5/release/qcad-bin`, `libqcadcore/entity/gui/operations/snap/spatialindex/ecmaapi/…so`, plugins `plugins/libqcaddxf.so`, `plugins/libqcadscripts.so`, Qt Script binding plugins. Reports `QCAD version 3.33.1`.

## 4. Runtime verification (executed)

| Check | How | Result |
|---|---|---|
| Engine starts headless | `qcad-bin -no-gui -autostart …` | OK |
| Draw → save → close → reopen (unmodified engine) | `SaveReopenSmokeTest.js`: line, circle, arc on a custom layer → DXF → fresh document → numeric compare (1e-9 mm) | **8/8 pass** |
| Full GUI launches, AmeenCAD menu/commands load, WALL starts and cancels cleanly | `GuiSmokeTest.js`, offscreen platform | **9/9 pass** |
| Visual check | `GuiScreenshot.js` draws a 4000 × 3000 room with 9 in walls; copy in `docs/images/ameencad_wall_screenshot.png` | Architecture menu and A-WALL layer visible |

Problem found and fixed during testing: passing the originally-added entity object to a later delete operation crashed the engine (segfault); the wall code now re-queries the baseline from the document before deleting it.

Not verified here: interactive mouse use, printing, PDF, anything on Windows.

## 5. Windows

Not built — this VM cannot run MSVC. Two prepared routes:
- `.github/workflows/windows-build.yml` — GitHub-hosted Windows runner: Qt 5.15.2 MSVC 2019 x64 + Qt Script, QCAD v3.33.1.0, AmeenCAD add-on, runs all tests **on Windows**, uploads a portable zip. Needs a GitHub repository. **Not yet run.**
- `docs/windows-build.md` — manual steps on the office PC.

## 6. Windows CI log (GitHub Actions, windows-2022)

| Run | Result | Cause → fix |
|---|---|---|
| 1 (40172874814) | Build failed | Runner used VS 2022; QCAD's .pro files only select the modern spatial index for `_MSC_VER=1929` (VS 2019), so the legacy one was built and fails under C++17 (`std::binary_function`). → pinned toolset v14.29 (VS 2019). |
| 3 (40173181072) | Build failed at link | Upstream `src/3rdparty/spatialindexnavel/spatialindexnavel.pro` omits `SIDX_DLL_EXPORT` (its CMakeLists.txt has it) → LNK2001. → workflow appends `DEFINES += SIDX_DLL_EXPORT` before qmake. |
| 4 (40173461122) | Build failed at link | With exports on, MSVC needs every exported class compiled, but the upstream .pro lists only R-tree sources (MVRTree/TPRTree missing; CMake lists all). → replaced with `patches/qcad/spatialindexnavel.pro` mirroring CMakeLists.txt (all 41 sources, `object_parallel_to_source` for duplicate file names). Verified on Linux: builds, 0 unresolved own symbols. |
| 5 (40173765005) | All libraries built; failed on `src/run/main.cpp` | `setlocale`/`LC_ALL` used without `#include <clocale>` (GCC includes it indirectly, MSVC doesn't). → workflow inserts `#include <clocale>`. |
