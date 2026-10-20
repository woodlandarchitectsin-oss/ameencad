function init(basePath) {
    var action = new RGuiAction(qsTranslate("AmeenWall", "&Wall (2 Points)"), RMainWindowQt.getMainWindow());
    action.setRequiresDocument(true);
    action.setScriptFile(basePath + "/Wall.js");
    action.setIcon(basePath + "/Wall.svg");
    action.setStatusTip(qsTranslate("AmeenWall", "Draw a wall: two parallel boundaries on layer A-WALL"));
    action.setDefaultShortcut(new QKeySequence("w,a"));
    action.setDefaultCommands(["wall", "wa"]);
    action.setGroupSortOrder(100);
    action.setSortOrder(100);
    action.setWidgetNames(["AmeenCADMenu", "AmeenCADToolBar"]);
}
