/**
 * AmeenCAD — top-level "AmeenCAD" menu and tool panel for Woodland
 * Architects' architectural tools.
 * Copyright (c) 2026 Woodland Architects. Licensed under GPL v3 (see LICENSES.md).
 */
include("scripts/EAction.js");

function AmeenCAD(guiAction) {
    EAction.call(this, guiAction);
}

AmeenCAD.prototype = new EAction();
AmeenCAD.includeBasePath = includeBasePath;

AmeenCAD.getMenu = function() {
    var menu = EAction.getMenu(AmeenCAD.getTitle(), "AmeenCADMenu");
    menu.setProperty("scriptFile", AmeenCAD.includeBasePath + "/AmeenCAD.js");
    return menu;
};

AmeenCAD.getToolBar = function() {
    var tb = EAction.getToolBar(AmeenCAD.getTitle(), "AmeenCADToolBar");
    tb.visible = true;
    return tb;
};

AmeenCAD.getTitle = function() {
    return qsTr("&Architecture");
};

AmeenCAD.prototype.getTitle = function() {
    return AmeenCAD.getTitle();
};

AmeenCAD.init = function() {
    AmeenCAD.getMenu();
    AmeenCAD.getToolBar();
};
