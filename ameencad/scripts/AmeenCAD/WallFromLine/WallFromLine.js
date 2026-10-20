/**
 * AmeenCAD — WALLLINE command: pick an existing straight line as the
 * baseline. The line is kept unless "Delete baseline" is checked.
 * Copyright (c) 2026 Woodland Architects. Licensed under GPL v3 (see LICENSES.md).
 */
include("scripts/EAction.js");
include("scripts/AmeenCAD/Wall/Wall.js");

function WallFromLine(guiAction) {
    Wall.call(this, guiAction);
    this.deleteBaseline = false;
    this.entity = undefined;
    this.setUiOptions([WallFromLine.includeBasePath + "/../Wall/Wall.ui",
                       WallFromLine.includeBasePath + "/WallFromLine.ui"]);
}

WallFromLine.prototype = new Wall();
WallFromLine.includeBasePath = includeBasePath;

WallFromLine.prototype.beginEvent = function() {
    EAction.prototype.beginEvent.call(this);
    this.setState(0);
};

WallFromLine.prototype.setState = function(state) {
    EAction.prototype.setState.call(this, state);
    this.getDocumentInterface().setClickMode(RAction.PickEntity);
    this.setCrosshairCursor();
    var tr = qsTr("Pick baseline (straight line)");
    this.setCommandPrompt(tr);
    this.setLeftMouseTip(tr);
    this.setRightMouseTip(EAction.trCancel);
};

WallFromLine.prototype.escapeEvent = function() {
    EAction.prototype.escapeEvent.call(this);
};

WallFromLine.prototype.pickEntity = function(event, preview) {
    var doc = this.getDocument();
    var entity = doc.queryEntity(this.getEntityId(event, preview));
    this.entity = undefined;
    this.point1 = undefined;
    this.point2 = undefined;
    if (isNull(entity)) {
        if (preview) { this.updatePreview(); }
        return;
    }
    if (!isLineEntity(entity)) {
        if (!preview) {
            EAction.handleUserWarning(qsTr("Please pick a straight line."));
        }
        return;
    }
    this.entity = entity;
    this.point1 = entity.getStartPoint();
    this.point2 = entity.getEndPoint();

    if (preview) {
        this.updatePreview();
        return;
    }
    if (!isNull(this.thicknessError)) {
        EAction.handleUserWarning(this.thicknessError);
        return;
    }
    var r = AmeenWall.addToDocument(this.getDocumentInterface(),
                                    this.toXY(this.point1), this.toXY(this.point2),
                                    this.thickness,
                                    { justification: this.justification,
                                      baselineEntity: entity,
                                      deleteBaseline: this.deleteBaseline,
                                      title: qsTr("Wall from line") });
    if (!r.ok) {
        EAction.handleUserWarning(qsTr("Wall not created: ") + r.error);
    }
};

WallFromLine.prototype.slotDeleteBaselineChanged = function(checked) {
    this.deleteBaseline = checked;
};
