# AmeenCAD

2D architectural drafting for **Woodland Architects**, built on **QCAD Community Edition** (GPL v3).

Scope: 2D only — precise geometry, layers, blocks, dimensions, DXF, printing. No 3D/BIM/web.

## Status (2026-10-20)
- Foundation: QCAD CE **v3.33.1.0** (stable release), built from source with Qt 5.15 on Linux; all 162 automated checks pass (see `docs/build-report.md`, `docs/test-plan.md`).
- First custom feature: **Wall tool** (`WALL`, `WALLLINE`) — two parallel boundaries on layer `A-WALL`, centre/left/right justification, thickness in mm or inches (`9in` = 228.6 mm), single-step undo.
- Windows `.exe`: not yet built — push this repo to GitHub to run `.github/workflows/windows-build.yml`, or follow `docs/windows-build.md` on a Windows PC.
- License: GPL v3 — read `docs/licensing-review.md` before distributing.

## Layout
`upstream-qcad/` pristine QCAD · `ameencad/` AmeenCAD code & tests · `tools/` scripts · `docs/` reports.

## Build & test (Linux)
```bash
sudo apt-get install qtbase5-dev qtscript5-dev libqt5xmlpatterns5-dev libqt5svg5-dev \
     qttools5-dev qttools5-dev-tools libqt5opengl5-dev qtbase5-private-dev nodejs
git clone --depth 1 --branch v3.33.1.0 https://github.com/qcad/qcad.git build-qt5
cp -a build-qt5/src/3rdparty/qt-labs-qtscriptgenerator-5.15.8 build-qt5/src/3rdparty/qt-labs-qtscriptgenerator-5.15.13
mv build-qt5/src/3rdparty/qt-labs-qtscriptgenerator-5.15.13/qt-labs-qtscriptgenerator-5.15.8.pro \
   build-qt5/src/3rdparty/qt-labs-qtscriptgenerator-5.15.13/qt-labs-qtscriptgenerator-5.15.13.pro
cd build-qt5 && qmake -r qcad.pro CONFIG+=release && make -j$(nproc) && cd ..
tools/run-tests-linux.sh
```
(The 5.15.13 folder copy is only needed because Ubuntu ships Qt 5.15.13; match it to your Qt version.)

## Using the wall tool
Architecture menu → *Wall (2 Points)* (command `wall`, keys `W,A`) or *Wall from Line* (`wallline`, `W,L`).
Set thickness in the options toolbar (`230`, `9in`, `9"`, `0.75ft`) and baseline position (centre / left face / right face). Click or type points (`0,0`, `@4000,0`, `@4000<90`). Esc steps back, then cancels.
