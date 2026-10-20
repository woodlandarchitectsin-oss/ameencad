/**
 * AmeenCAD — wall tool integration tests, run inside the real QCAD engine
 * (real RDocument, operations, undo stack, DXF export/import).
 *
 * Run (from the deployed application directory):
 *   ./qcad -no-gui -allow-multiple-instances -platform offscreen \
 *          -autostart scripts/AmeenCAD/Tests/WallIntegrationTest.js <outdir>
 */
include("scripts/library.js");
include("scripts/AmeenCAD/lib/WallDocument.js");

var TOL = 1.0e-6;   // mm; DXF stores 16 significant digits
var gPassed = 0, gFailed = 0, gLog = [];

function check(name, cond, detail) {
    print((cond ? "PASS  " : "FAIL  ") + name);
    if (cond) { gPassed++; gLog.push("PASS  " + name); }
    else { gFailed++; gLog.push("FAIL  " + name + (isNull(detail) ? "" : "  -- " + detail)); }
}

function near(a, b, tol) { return Math.abs(a - b) <= (isNull(tol) ? TOL : tol); }

function newDoc() {
    var doc = new RDocument(new RMemoryStorage(), new RSpatialIndexSimple());
    doc.setUnit(RS.Millimeter);
    var di = new RDocumentInterface(doc);
    return di;
}

function entityIds(doc) {
    var ids = doc.queryAllEntities(false, false);
    // QtScript returns an Array for QSet<Id>
    return ids;
}

function wallLines(doc) {
    var out = [];
    if (!doc.hasLayer(AmeenWall.LAYER_NAME)) {
        return out;
    }
    var ids = doc.queryLayerEntities(doc.getLayerId(AmeenWall.LAYER_NAME));
    for (var i = 0; i < ids.length; i++) {
        var e = doc.queryEntity(ids[i]);
        if (isLineEntity(e)) {
            out.push(e);
        }
    }
    return out;
}

/** True if the entity exists and is not in the undone state. */
function isLive(doc, id) {
    var e = doc.queryEntity(id);
    return !isNull(e) && !e.isUndone();
}

function addBaseline(di, x1, y1, x2, y2) {
    var doc = di.getDocument();
    var e = new RLineEntity(doc, new RLineData(new RVector(x1, y1), new RVector(x2, y2)));
    di.applyOperation(new RAddObjectOperation(e, false));
    return e;
}

/** Perpendicular distance between two generated boundaries, using QCAD's own RLine math. */
function boundaryDistance(eA, eB) {
    var lineB = eB.castToShape();
    var d1 = lineB.getDistanceTo(eA.getStartPoint(), false);
    var d2 = lineB.getDistanceTo(eA.getEndPoint(), false);
    return [d1, d2];
}

function verifyCase(name, x1, y1, x2, y2, t) {
    var di = newDoc();
    var doc = di.getDocument();
    var base = addBaseline(di, x1, y1, x2, y2);
    var r = AmeenWall.addToDocument(di, {x: x1, y: y1}, {x: x2, y: y2}, t);
    check(name + ": created", r.ok === true, r.error);
    check(name + ": layer A-WALL created", doc.hasLayer("A-WALL") && r.layerCreated === true);
    var lines = wallLines(doc);
    check(name + ": 2 boundaries on A-WALL", lines.length === 2, "found " + lines.length);
    if (lines.length === 2) {
        var d = boundaryDistance(lines[0], lines[1]);
        check(name + ": perpendicular distance " + d[0].toFixed(9) + " / " + d[1].toFixed(9) + " mm",
              near(d[0], t) && near(d[1], t), "expected " + t);
        var angBase = new RLine(new RVector(x1, y1), new RVector(x2, y2)).getAngle();
        check(name + ": parallel to baseline",
              near(RMath.getAngleDifference180(lines[0].castToShape().getAngle(), angBase), 0, 1e-12) &&
              near(RMath.getAngleDifference180(lines[1].castToShape().getAngle(), angBase), 0, 1e-12));
        check(name + ": colour/linetype ByLayer",
              lines[0].getColor().isByLayer() && lines[0].getLinetypeId() === doc.getLinetypeByLayerId());
    }
    var b = doc.queryEntity(base.getId());
    check(name + ": baseline preserved", !isNull(b) &&
          near(b.getStartPoint().x, x1) && near(b.getStartPoint().y, y1) &&
          near(b.getEndPoint().x, x2) && near(b.getEndPoint().y, y2));
    check(name + ": baseline still on layer 0", !isNull(b) && b.getLayerName() === "0");
    return di;
}

function rejectCase(name, x1, y1, x2, y2, t) {
    var di = newDoc();
    var doc = di.getDocument();
    addBaseline(di, x1, y1, x2, y2);
    var before = entityIds(doc).length;
    var r = AmeenWall.addToDocument(di, {x: x1, y: y1}, {x: x2, y: y2}, t);
    check(name + ": rejected (" + r.error + ")", r.ok === false && isString(r.error));
    check(name + ": document unchanged", entityIds(doc).length === before && !doc.hasLayer("A-WALL"));
}

function main() {
    var outDir = args[args.length - 1];
    if (isNull(outDir) || outDir.indexOf("-") === 0 || /\.js$/.test(outDir)) {
        outDir = RSettings.getLaunchPath();
    }

    var t9in = AmeenWall.parseLength("9in");
    check("9 in parses to 228.6 mm", t9in.ok && near(t9in.value, 228.6, 1e-12), t9in.value);
    var T = t9in.value;

    // --- geometry cases ---
    var diRef = verifyCase("REF horizontal 4000mm x 9in", 0, 0, 4000, 0, T);
    verifyCase("vertical", 0, 0, 0, 4000, T);
    verifyCase("diagonal 30deg", 100, 200, 100 + 4000 * Math.cos(Math.PI / 6), 200 + 4000 * Math.sin(Math.PI / 6), T);
    verifyCase("negative coordinates", -5000, -3000, -1000, -3000, T);
    verifyCase("negative diagonal", -1234.5, -987.6, -4000.25, 1500.75, 115);

    // --- invalid input ---
    rejectCase("zero-length baseline", 10, 10, 10, 10, T);
    rejectCase("zero thickness", 0, 0, 4000, 0, 0);
    rejectCase("negative thickness", 0, 0, 4000, 0, -228.6);
    rejectCase("NaN thickness", 0, 0, 4000, 0, NaN);
    check("invalid text 'abc' rejected", AmeenWall.parseLength("abc").ok === false);

    // --- undo / redo (fresh document: one undo must remove walls AND the new layer) ---
    (function() {
        var di = newDoc();
        var doc = di.getDocument();
        var base = addBaseline(di, 0, 0, 4000, 0);
        var r = AmeenWall.addToDocument(di, {x: 0, y: 0}, {x: 4000, y: 0}, T);
        check("undo: wall created", r.ok && wallLines(doc).length === 2);
        di.undo();
        check("undo: boundaries removed", !isLive(doc, r.ids[0]) && !isLive(doc, r.ids[1]));
        check("undo: A-WALL layer removed in same step", !doc.hasLayer("A-WALL"));
        check("undo: baseline untouched", isLive(doc, base.getId()));
        di.redo();
        check("redo: layer back", doc.hasLayer("A-WALL"));
        var lines = wallLines(doc);
        check("redo: boundaries back", lines.length === 2);
        if (lines.length === 2) {
            var d = boundaryDistance(lines[0], lines[1]);
            check("redo: thickness still 228.6", near(d[0], T) && near(d[1], T));
        }
        // second wall reuses the existing layer:
        var r2 = AmeenWall.addToDocument(di, {x: 4000, y: 0}, {x: 4000, y: 3000}, T);
        check("second wall reuses layer", r2.ok && r2.layerCreated === false && wallLines(doc).length === 4);
        di.undo();
        check("undo second wall only", wallLines(doc).length === 2 && doc.hasLayer("A-WALL"));
    })();

    // --- delete-baseline option + undo restores baseline ---
    (function() {
        var di = newDoc();
        var doc = di.getDocument();
        var base = addBaseline(di, 0, 0, 4000, 0);
        var r = AmeenWall.addToDocument(di, {x: 0, y: 0}, {x: 4000, y: 0}, T,
                                        {baselineEntity: doc.queryEntity(base.getId()), deleteBaseline: true});
        check("delete baseline: removed", r.ok && !isLive(doc, base.getId()) && wallLines(doc).length === 2);
        di.undo();
        check("delete baseline: undo restores baseline", isLive(doc, base.getId()) && wallLines(doc).length === 0);
    })();

    // --- locked layer is refused, nothing changes ---
    (function() {
        var di = newDoc();
        var doc = di.getDocument();
        var layer = AmeenWall.createLayer(doc);
        layer.setLocked(true);
        di.applyOperation(new RAddObjectOperation(layer, false));
        var before = entityIds(doc).length;
        var r = AmeenWall.addToDocument(di, {x: 0, y: 0}, {x: 4000, y: 0}, T);
        check("locked A-WALL refused (" + r.error + ")", r.ok === false && entityIds(doc).length === before);
    })();

    // --- save / reopen (DXF round trip through QCAD's exporter/importer) ---
    (function() {
        var file = outDir + "/wall_roundtrip.dxf";
        var docRef = diRef.getDocument();
        var ok = diRef.exportFile(file, "");
        check("save DXF: " + file, ok === true);

        var di2 = newDoc();
        var res = di2.importFile(file);
        check("reopen DXF", res === RDocumentInterface.IoErrorNoError, "code " + res);
        var doc2 = di2.getDocument();
        check("reopen: A-WALL layer present", doc2.hasLayer("A-WALL"));
        var lines = wallLines(doc2);
        check("reopen: 2 boundaries on A-WALL", lines.length === 2, "found " + lines.length);
        if (lines.length === 2) {
            var d = boundaryDistance(lines[0], lines[1]);
            check("reopen: perpendicular distance " + d[0].toFixed(9) + " mm", near(d[0], T) && near(d[1], T));
            // compare coordinates to the original, entity by entity:
            var orig = wallLines(docRef);
            var matched = 0;
            for (var i = 0; i < lines.length; i++) {
                for (var k = 0; k < orig.length; k++) {
                    if (lines[i].getStartPoint().equalsFuzzy(orig[k].getStartPoint(), TOL) &&
                        lines[i].getEndPoint().equalsFuzzy(orig[k].getEndPoint(), TOL)) {
                        matched++;
                        break;
                    }
                }
            }
            check("reopen: coordinates identical to saved geometry", matched === 2);
        }
        var all = doc2.queryAllEntities(false, false);
        check("reopen: baseline + 2 walls = 3 entities", all.length === 3, "found " + all.length);
        check("reopen: drawing unit mm", doc2.getUnit() === RS.Millimeter);
    })();

    var summary = gPassed + " passed, " + gFailed + " failed";
    gLog.push("");
    gLog.push(summary);
    var text = gLog.join("\n");
    print(summary);

    var f = new QFile(outDir + "/wall_integration_results.txt");
    if (f.open(new QIODevice.OpenMode(QIODevice.WriteOnly | QIODevice.Text))) {
        var ts = new QTextStream(f);
        ts.writeString(text + "\n");
        f.close();
    }
}

try { main(); } catch (e) { print("EXCEPTION: " + e + " line " + e.lineNumber); print(gLog.join("\n")); }
