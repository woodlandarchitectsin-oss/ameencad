/**
 * GUI smoke test: run with the full GUI (offscreen platform) and -exec.
 * Verifies the AmeenCAD add-on registered its menu, commands and shortcuts,
 * then starts the WALL tool on a new drawing and cancels it.
 */
var outDir = args[args.length - 1]; if (outDir === "-quit") { outDir = args[args.length - 2]; }
var log = [], ok = 0, bad = 0;
function check(n, c) { print((c ? "PASS  " : "FAIL  ") + n); log.push((c ? "PASS  " : "FAIL  ") + n); if (c) ok++; else bad++; }

var wall = RGuiAction.getByScriptFile("scripts/AmeenCAD/Wall/Wall.js");
var wallLine = RGuiAction.getByScriptFile("scripts/AmeenCAD/WallFromLine/WallFromLine.js");
check("WALL action registered", !isNull(wall));
check("WALLLINE action registered", !isNull(wallLine));
check("command 'wall' resolves", !isNull(RGuiAction.getByCommand("wall")));
check("command 'wallline' resolves", !isNull(RGuiAction.getByCommand("wallline")));
var appWin = RMainWindowQt.getMainWindow();
check("Architecture menu present", !isNull(appWin.findChild("AmeenCADMenu")));
check("main window title: " + appWin.windowTitle, true);

// start a drawing, run the tool, cancel it:
var nf = RGuiAction.getByScriptFile("scripts/File/NewFile/NewFile.js");
if (!isNull(nf)) { nf.slotTrigger(); }
var di = EAction.getDocumentInterface();
check("new drawing open", !isNull(di));
if (!isNull(di) && !isNull(wall)) {
    var before = di.getDocument().queryAllEntities(false, false).length;
    wall.slotTrigger();
    check("WALL tool started", !isNull(di.getCurrentAction()));
    di.killAllActions();
    check("cancel left drawing unchanged", di.getDocument().queryAllEntities(false, false).length === before &&
          !di.getDocument().hasLayer("A-WALL"));
}
log.push(""); log.push(ok + " passed, " + bad + " failed");
var f = new QFile(outDir + "/gui_smoke_results.txt");
if (f.open(new QIODevice.OpenMode(QIODevice.WriteOnly | QIODevice.Text))) { new QTextStream(f).writeString(log.join("\n") + "\n"); f.close(); }
print(ok + " passed, " + bad + " failed");
