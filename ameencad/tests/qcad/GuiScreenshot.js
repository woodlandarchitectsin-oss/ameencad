// Draws a small sample plan with the wall tool in the running GUI and saves a screenshot.
include("scripts/AmeenCAD/lib/WallDocument.js");
var outDir = args[args.length - 1]; if (outDir === "-quit") { outDir = args[args.length - 2]; }
var nf = RGuiAction.getByScriptFile("scripts/File/NewFile/NewFile.js");
nf.slotTrigger();
var di = EAction.getDocumentInterface();
var T = AmeenWall.parseLength("9in").value;
var pts = [[0,0],[4000,0],[4000,3000],[0,3000],[0,0]];
for (var i = 0; i < pts.length - 1; i++) {
    var a = {x: pts[i][0], y: pts[i][1]}, b = {x: pts[i+1][0], y: pts[i+1][1]};
    di.applyOperation(new RAddObjectOperation(new RLineEntity(di.getDocument(), new RLineData(new RVector(a.x,a.y), new RVector(b.x,b.y))), false));
    AmeenWall.addToDocument(di, a, b, T);
}
var appWin = RMainWindowQt.getMainWindow();
appWin.resize(1400, 860);
appWin.show();
di.autoZoom();
var m = appWin.findChild("AmeenCADMenu");
QCoreApplication.processEvents();
var pix = appWin.grab();
var img = pix.toImage(); print("size " + img.width() + "x" + img.height()); var okSave = img.save(outDir + "/ameencad_wall_screenshot.png", "PNG"); print("save " + okSave);
print("saved screenshot");
