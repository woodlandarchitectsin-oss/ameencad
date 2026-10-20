/**
 * AmeenCAD — applies wall geometry to a QCAD document.
 * Copyright (c) 2026 Woodland Architects. Licensed under GPL v3 (see LICENSES.md).
 *
 * Uses only QCAD's public document / operation API:
 * RLayer, RLineEntity, RAddObjectsOperation, RDeleteObjectOperation and
 * transaction groups, so that one UNDO reverts the whole wall
 * (layer creation + both boundaries [+ baseline removal]).
 */

include("scripts/AmeenCAD/lib/WallGeometry.js");

/** Default colour for a newly created A-WALL layer (white/black). */
AmeenWall.LAYER_COLOR = [255, 255, 255];

/**
 * Returns a new RLayer for A-WALL (not yet added to the document).
 */
AmeenWall.createLayer = function(doc) {
    var c = AmeenWall.LAYER_COLOR;
    return new RLayer(doc, AmeenWall.LAYER_NAME, false, false,
                      new RColor(c[0], c[1], c[2]),
                      doc.getLinetypeId("CONTINUOUS"),
                      RLineweight.Weight050);
};

/**
 * Builds a line entity on the given layer with ByLayer attributes.
 */
AmeenWall.createLineEntity = function(doc, layerId, a, b) {
    var e = new RLineEntity(doc, new RLineData(new RVector(a.x, a.y), new RVector(b.x, b.y)));
    e.setLayerId(layerId);
    e.setColor(new RColor(RColor.ByLayer));
    e.setLinetypeId(doc.getLinetypeByLayerId());
    e.setLineweight(RLineweight.WeightByLayer);
    return e;
};

/**
 * Adds a wall to the document behind document interface di.
 *
 * \param options.justification  "center" (default), "left", "right"
 * \param options.baselineEntity existing baseline entity (optional)
 * \param options.deleteBaseline true to remove baselineEntity (default false)
 * \param options.title          undo text
 *
 * \return {ok:true, ids:[leftId, rightId], layerCreated:Boolean, result}
 *         or {ok:false, error:String}. On failure the document is untouched.
 */
AmeenWall.addToDocument = function(di, p1, p2, thickness, options) {
    if (options === undefined || options === null) {
        options = {};
    }
    var title = options.title || "Wall";
    var res = AmeenWall.computeBoundaries(p1, p2, thickness, options.justification);
    if (!res.ok) {
        return res;
    }

    var doc = di.getDocument();

    // a locked or frozen existing A-WALL layer would silently swallow the
    // geometry, so refuse instead:
    if (doc.hasLayer(AmeenWall.LAYER_NAME)) {
        var existing = doc.queryLayer(AmeenWall.LAYER_NAME);
        if (!isNull(existing) && existing.isLocked()) {
            return { ok: false, error: "Layer " + AmeenWall.LAYER_NAME + " is locked." };
        }
    }

    doc.startTransactionGroup();
    var group = doc.getTransactionGroup();
    var layerCreated = false;
    var op;

    if (!doc.hasLayer(AmeenWall.LAYER_NAME)) {
        op = new RAddObjectsOperation();
        op.setTransactionGroup(group);
        op.setText(title);
        op.addObject(AmeenWall.createLayer(doc), false);
        di.applyOperation(op);
        layerCreated = true;
        if (!doc.hasLayer(AmeenWall.LAYER_NAME)) {
            return { ok: false, error: "Could not create layer " + AmeenWall.LAYER_NAME + "." };
        }
    }

    var layerId = doc.getLayerId(AmeenWall.LAYER_NAME);
    var eLeft  = AmeenWall.createLineEntity(doc, layerId, res.left.p1,  res.left.p2);
    var eRight = AmeenWall.createLineEntity(doc, layerId, res.right.p1, res.right.p2);

    op = new RAddObjectsOperation();
    op.setTransactionGroup(group);
    op.setText(title);
    op.addObject(eLeft, false);
    op.addObject(eRight, false);
    if (options.deleteBaseline === true && !isNull(options.baselineEntity)) {
        // re-query so the operation works on the document's current copy:
        var baseline = doc.queryEntity(options.baselineEntity.getId());
        if (!isNull(baseline)) {
            op.deleteObject(baseline);
        }
    }
    var trans = di.applyOperation(op);

    if (trans.isFailed()) {
        return { ok: false, error: "Transaction failed." };
    }

    return {
        ok: true,
        ids: [eLeft.getId(), eRight.getId()],
        layerCreated: layerCreated,
        result: res
    };
};
