/**
 * Phase 3 smoke test on the UNMODIFIED QCAD engine: create a simple 2D
 * drawing (line, circle, arc on a custom layer), save as DXF, reopen in a
 * fresh document and compare geometry numerically.
 */
include("scripts/library.js");

var gLog = [], gPassed = 0, gFailed = 0;
function check(n, c, d) { if (c) { gPassed++; gLog.push("PASS  " + n); } else { gFailed++; gLog.push("FAIL  " + n + (isNull(d) ? "" : " -- " + d)); } }

function main() {
    var outDir = args[args.length - 1];
    if (isNull(outDir) || outDir.indexOf("-") === 0 || /\.js$/.test(outDir)) { outDir = RSettings.getLaunchPath(); }
    var file = outDir + "/smoke_roundtrip.dxf";

    var doc = new RDocument(new RMemoryStorage(), new RSpatialIndexSimple());
    doc.setUnit(RS.Millimeter);
    var di = new RDocumentInterface(doc);

    var layer = new RLayer(doc, "TEST-LAYER", false, false, new RColor(255, 0, 0), doc.getLinetypeId("CONTINUOUS"), RLineweight.Weight025);
    di.applyOperation(new RAddObjectOperation(layer, false));
    var lid = doc.getLayerId("TEST-LAYER");

    var op = new RAddObjectsOperation();
    var l = new RLineEntity(doc, new RLineData(new RVector(-1250.5, 300.25), new RVector(3999.75, 2750.125)));
    var c = new RCircleEntity(doc, new RCircleData(new RVector(1000, 1000), 457.2));
    var a = new RArcEntity(doc, new RArcData(new RVector(-500, -500), 250, 0, Math.PI / 2, false));
    [l, c, a].forEach(function(e) { e.setLayerId(lid); op.addObject(e, false); });
    di.applyOperation(op);

    check("created 3 entities", doc.queryAllEntities(false, false).length === 3);
    check("saved " + file, di.exportFile(file, "") === true);

    var doc2 = new RDocument(new RMemoryStorage(), new RSpatialIndexSimple());
    var di2 = new RDocumentInterface(doc2);
    check("reopened", di2.importFile(file) === RDocumentInterface.IoErrorNoError);
    var ids = doc2.queryAllEntities(false, false);
    check("3 entities after reopen", ids.length === 3, "found " + ids.length);
    check("layer TEST-LAYER preserved", doc2.hasLayer("TEST-LAYER"));
    var got = { line: 0, circle: 0, arc: 0 };
    for (var i = 0; i < ids.length; i++) {
        var e = doc2.queryEntity(ids[i]);
        if (e.getLayerName() !== "TEST-LAYER") { continue; }
        if (isLineEntity(e) && e.getStartPoint().equalsFuzzy(l.getStartPoint(), 1e-9) && e.getEndPoint().equalsFuzzy(l.getEndPoint(), 1e-9)) { got.line++; }
        if (isCircleEntity(e) && e.getCenter().equalsFuzzy(c.getCenter(), 1e-9) && Math.abs(e.getRadius() - 457.2) < 1e-9) { got.circle++; }
        if (isArcEntity(e) && e.getCenter().equalsFuzzy(a.getCenter(), 1e-9) && Math.abs(e.getRadius() - 250) < 1e-9 &&
            Math.abs(e.getStartAngle()) < 1e-9 && Math.abs(e.getEndAngle() - Math.PI / 2) < 1e-9) { got.arc++; }
    }
    check("line geometry identical", got.line === 1);
    check("circle geometry identical", got.circle === 1);
    check("arc geometry identical", got.arc === 1);

    gLog.push(""); gLog.push(gPassed + " passed, " + gFailed + " failed");
    var text = gLog.join("\n");
    print(text);
    var f = new QFile(outDir + "/smoke_results.txt");
    if (f.open(new QIODevice.OpenMode(QIODevice.WriteOnly | QIODevice.Text))) { new QTextStream(f).writeString(text + "\n"); f.close(); }
}
main();
