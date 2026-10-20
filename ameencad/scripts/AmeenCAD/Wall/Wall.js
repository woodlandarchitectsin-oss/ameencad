/**
 * AmeenCAD — WALL command: pick (or type) baseline start and end points;
 * two parallel boundaries are added on layer A-WALL.
 * Copyright (c) 2026 Woodland Architects. Licensed under GPL v3 (see LICENSES.md).
 */
include("scripts/EAction.js");
include("scripts/AmeenCAD/lib/WallDocument.js");

function Wall(guiAction) {
    EAction.call(this, guiAction);
    this.point1 = undefined;
    this.point2 = undefined;
    this.thickness = 230.0;
    this.thicknessError = undefined;
    this.justification = AmeenWall.Justification.Center;
    this.setUiOptions(Wall.includeBasePath + "/Wall.ui");
}

Wall.prototype = new EAction();
Wall.includeBasePath = includeBasePath;

Wall.JustificationByIndex = [
    AmeenWall.Justification.Center,
    AmeenWall.Justification.Left,
    AmeenWall.Justification.Right
];

Wall.State = {
    SettingFirstPoint : 0,
    SettingSecondPoint : 1
};

Wall.prototype.beginEvent = function() {
    EAction.prototype.beginEvent.call(this);
    this.setState(Wall.State.SettingFirstPoint);
};

Wall.prototype.setState = function(state) {
    EAction.prototype.setState.call(this, state);
    this.getDocumentInterface().setClickMode(RAction.PickCoordinate);
    this.setCrosshairCursor();

    var tr;
    switch (this.state) {
    case Wall.State.SettingFirstPoint:
        tr = qsTr("Wall start point");
        this.setRightMouseTip(EAction.trCancel);
        this.point1 = undefined;
        this.point2 = undefined;
        break;
    case Wall.State.SettingSecondPoint:
        tr = qsTr("Wall end point");
        this.setRightMouseTip(EAction.trBack);
        break;
    }
    this.setCommandPrompt(tr);
    this.setLeftMouseTip(tr);
    EAction.showSnapTools();
};

/** Esc / right click: step back, then cancel. Nothing is ever left half-built. */
Wall.prototype.escapeEvent = function() {
    switch (this.state) {
    case Wall.State.SettingFirstPoint:
        EAction.prototype.escapeEvent.call(this);
        break;
    case Wall.State.SettingSecondPoint:
        this.getDocumentInterface().clearPreview();
        this.getDocumentInterface().repaintViews();
        this.setState(Wall.State.SettingFirstPoint);
        break;
    }
};

Wall.prototype.pickCoordinate = function(event, preview) {
    var di = this.getDocumentInterface();
    var pos = event.getModelPosition();

    switch (this.state) {
    case Wall.State.SettingFirstPoint:
        if (!preview) {
            this.point1 = pos;
            di.setRelativeZero(pos);
            this.setState(Wall.State.SettingSecondPoint);
        }
        break;

    case Wall.State.SettingSecondPoint:
        this.point2 = pos;
        if (preview) {
            this.updatePreview();
        }
        else {
            if (this.applyWall()) {
                di.setRelativeZero(this.point2);
                // continue: the next wall starts at this end point
                this.point1 = this.point2;
                this.point2 = undefined;
            }
        }
        break;
    }
};

Wall.prototype.toXY = function(v) {
    return { x: v.x, y: v.y };
};

/** Preview: plain lines, not added to the document. */
Wall.prototype.getOperation = function(preview) {
    if (!isVector(this.point1) || !isVector(this.point2) || !isNull(this.thicknessError)) {
        return undefined;
    }
    var res = AmeenWall.computeBoundaries(this.toXY(this.point1), this.toXY(this.point2),
                                          this.thickness, this.justification);
    if (!res.ok) {
        return undefined;
    }
    var doc = this.getDocument();
    var op = new RAddObjectsOperation();
    op.addObject(new RLineEntity(doc, new RLineData(new RVector(res.left.p1.x, res.left.p1.y), new RVector(res.left.p2.x, res.left.p2.y))));
    op.addObject(new RLineEntity(doc, new RLineData(new RVector(res.right.p1.x, res.right.p1.y), new RVector(res.right.p2.x, res.right.p2.y))));
    return op;
};

Wall.prototype.applyWall = function() {
    if (!isNull(this.thicknessError)) {
        EAction.handleUserWarning(this.thicknessError);
        return false;
    }
    var r = AmeenWall.addToDocument(this.getDocumentInterface(),
                                    this.toXY(this.point1), this.toXY(this.point2),
                                    this.thickness,
                                    { justification: this.justification, title: qsTr("Wall") });
    if (!r.ok) {
        EAction.handleUserWarning(qsTr("Wall not created: ") + r.error);
        return false;
    }
    EAction.handleUserMessage(qsTr("Wall %1 mm long, %2 mm thick on layer %3")
        .arg(r.result.length.toFixed(2)).arg(r.result.thickness.toFixed(2)).arg(AmeenWall.LAYER_NAME));
    return true;
};

Wall.prototype.slotThicknessChanged = function(text) {
    var r = AmeenWall.parseLength(text);
    if (!r.ok) {
        this.thicknessError = r.error;
    }
    else if (r.value <= AmeenWall.EPSILON) {
        this.thicknessError = qsTr("Thickness must be greater than zero.");
    }
    else {
        this.thicknessError = undefined;
        this.thickness = r.value;
    }
    this.updatePreview(true);
};

Wall.prototype.slotJustificationChanged = function(index) {
    var j = Wall.JustificationByIndex[index];
    if (!isNull(j)) {
        this.justification = j;
    }
    this.updatePreview(true);
};
