# Licensing Review — AmeenCAD on QCAD Community Edition

Status: technical review from the actual source tree (`upstream-qcad`, release `v3.33.1.0`; master `83bb2cff` has the same license files). **This is not legal advice**; have an IP lawyer confirm before selling or distributing.

## 1. What the source tree actually says

| Component | License (from files in repo) | Obligation for AmeenCAD |
|---|---|---|
| QCAD core (C++) and scripts | GPL v3 + optional linking exception (`LICENSE.txt`, `gpl-3.0-exceptions.txt`) | Source of the whole program must be offered to everyone who receives the binary |
| dxflib (DXF read/write) | **GPL v2 or later, no exception**; commercial license sold separately by RibbonSoft | Pulls the combined binary under GPL regardless of QCAD's exception |
| opennurbs | Public domain | None |
| spatialindexnavel | MIT | Keep copyright notice |
| stemmer | BSD 2-Clause | Keep copyright notice |
| Icons & documentation | CC BY 3.0 | Attribution to RibbonSoft/QCAD |
| Fonts | GPLv3+exc. (osifont), Hershey terms, VL-Gothic license, public domain CXF, Qt fonts per `fonts/qt/LICENSES.txt` | Ship the license files |
| Qt 5 (incl. Qt Script) | LGPL v3 (as shipped by QCAD, `lgpl.txt`) | Dynamic linking; ship LGPL text; let users replace Qt DLLs |

The QCAD exception only lets *independent* modules link to QCAD libraries under other terms. AmeenCAD's tools are written against QCAD's API and run inside its script engine, so they are treated here as **derived work → GPL v3**.

## 2. What this means for the business

**Allowed:**
- Rebranding as AmeenCAD, adding features, using it inside Woodland Architects without publishing anything (GPL obligations start only on distribution).
- **Selling** AmeenCAD installers, support, training, templates and block libraries.

**Required if you give or sell the program to anyone:**
- Provide complete corresponding source (QCAD + all AmeenCAD code + build scripts) under GPL v3.
- Keep all copyright notices, `LICENSE.txt`, GPL/LGPL/CC-BY texts; state that AmeenCAD is a modified version of QCAD CE.
- Recipients may copy and resell it freely — **a closed, per-seat licensed AmeenCAD is not possible on this foundation.**

**Branding:** "QCAD" is RibbonSoft's product name. Use your own name and icons; a line such as *"Based on QCAD Community Edition by RibbonSoft GmbH"* is appropriate; do not imply endorsement. Do not claim "AutoCAD compatible".

### Options if a closed commercial product is the goal
1. Ask RibbonSoft about a commercial/OEM license for QCAD (and dxflib's commercial license). Cost unknown — needs a quote; **not purchased**.
2. Stay GPL and earn from services, templates, Woodland standards, support (fits the ₹5–10k/month budget).
3. Change foundation — every mature open 2D CAD engine checked so far (QCAD, LibreCAD) is copyleft, so this means far more engineering. Not recommended now.

**Recommendation:** proceed GPL v3 for Phase 1–9 (internal use costs nothing in license terms); decide on (1) vs (2) before Phase 10.

## 3. DWG

- QCAD **CE has no DWG support**: `src/io` contains only `dxf/` (dxflib). DWG in QCAD Professional comes from the proprietary ODA (Teigha) SDK.
- Options, none purchased:
  - **ODA Drawings SDK** — paid annual membership; pricing and redistribution rights must be confirmed at opendesign.com.
  - **LibreDWG** (GNU, GPL v3) — license-compatible, but read/write coverage of modern DWG is incomplete; would need validation on real Woodland drawings.
  - **Interim workflow:** keep exchanging DXF; convert DWG↔DXF with a separate converter tool. Check that tool's own terms before bundling it.

## 4. Files maintained

- `LICENSES.md` — AmeenCAD's license and what applies.
- `THIRD_PARTY_NOTICES.md` — every third-party component and where its text lives.
