# Building AmeenCAD on Windows (10/11 x64)

**Status: NOT YET EXECUTED.** These steps follow QCAD's published compilation instructions and the Qt 5 route that was verified on Linux in this project. Run them on the office PC (or a Windows CI runner) and record the results in `docs/build-report.md`.

## 1. Install (all free)

| Tool | Version | Notes |
|---|---|---|
| Visual Studio 2019 Build Tools *or* VS 2022 with the **v142 (2019) toolset** | MSVC 2019 x64 | Workload "Desktop development with C++" |
| Qt (online installer, free Qt account) | **Qt 5.15.2 → MSVC 2019 64-bit** | Also tick **Qt Script (deprecated)**. 5.15.2 is the last Qt 5 with free open-source binaries |
| jom (optional, faster nmake) | latest | from Qt installer "Developer and Designer Tools" |
| Git for Windows | latest | |

Disk: ~15 GB for Qt + VS; ~5 GB for the build.

## 2. Get the source

```bat
mkdir C:\ameencad & cd C:\ameencad
git clone --depth 1 --branch v3.33.1.0 https://github.com/qcad/qcad.git upstream-qcad
xcopy /E /I upstream-qcad build-win
```
Copy this project's `ameencad\` and `tools\` folders into `C:\ameencad\`.

> Do **not** place `qtjsapi` / `qcadjsapi` next to the build folder — qmake picks them up automatically and the Qt 5 build then fails.

`src\3rdparty\qt-labs-qtscriptgenerator-5.15.2` already exists upstream, so no shim is needed for Qt 5.15.2.

## 3. Build (x64 Native Tools Command Prompt for VS 2019)

```bat
set PATH=C:\Qt\5.15.2\msvc2019_64\bin;%PATH%
cd C:\ameencad\build-win
qmake -r qcad.pro CONFIG+=release
jom release            (or: nmake release)
```
Do **not** pass `CONFIG+=ractivated` — that flag is for RibbonSoft's commercial edition.

Output: `release\qcad.exe` plus `release\*.dll` and plugin DLLs.

## 4. Deploy AmeenCAD scripts and test

```bat
xcopy /E /I /Y C:\ameencad\ameencad\scripts\AmeenCAD  C:\ameencad\build-win\scripts\AmeenCAD
xcopy /E /I /Y C:\ameencad\ameencad\tests\qcad        C:\ameencad\build-win\scripts\AmeenCAD\Tests
cd C:\ameencad\build-win
release\qcad.exe -no-gui -allow-multiple-instances -autostart scripts\AmeenCAD\Tests\WallIntegrationTest.js C:\ameencad\test-results
release\qcad.exe
```
Expect `wall_integration_results.txt` ending in "0 failed", and an **Architecture** menu with *Wall (2 Points)* and *Wall from Line*.

## 5. Package (Phase 4/10)

`windeployqt release\qcad.exe` collects Qt DLLs; then build an installer (Inno Setup, free). Branding (exe name, icon, title "AmeenCAD") is Phase 4 work.

## Qt 6 route (not recommended yet)

QCAD's Qt 6 build needs Qt 6.5.2 + Qt5Compat and the `qtjsapi` / `qcadjsapi` repositories beside the source, built with CMake + Ninja. Revisit once the Qt 5 build is stable on Windows.
