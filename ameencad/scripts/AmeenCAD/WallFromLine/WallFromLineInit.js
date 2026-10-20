function init(basePath) {
    var action = new RGuiAction(qsTranslate("AmeenWall", "Wall from &Line"), RMainWindowQt.getMainWindow());
    action.setRequiresDocument(true);
    action.setScriptFile(basePath + "/WallFromLine.js");
    action.setIcon(basePath + "/../Wall/Wall.svg");
    action.setStatusTip(qsTranslate("AmeenWall", "Pick an existing straight line and build a wall on it"));
    action.setDefaultShortcut(new QKeySequence("w,l"));
    action.setDefaultCommands(["wallline", "wl"]);
    action.setGroupSortOrder(100);
    action.setSortOrder(200);
    action.setWidgetNames(["AmeenCADMenu", "AmeenCADToolBar"]);
}
