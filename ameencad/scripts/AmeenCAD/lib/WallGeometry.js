/**
 * AmeenCAD — Wall geometry core.
 * Copyright (c) 2026 Woodland Architects. Licensed under GPL v3 (see LICENSES.md).
 *
 * Pure ECMAScript (ES5) with no QCAD dependencies, so the same file is
 * loaded by the QCAD script engine (via include()) and by Node.js for
 * unit tests. All lengths are in drawing units (millimetres for
 * Woodland drawings). Points are plain {x, y} objects.
 */

var AmeenWall = AmeenWall || {};

/** Geometric tolerance for zero-length / zero-thickness checks (drawing units). */
AmeenWall.EPSILON = 1.0e-9;

/** Layer that generated wall boundaries are placed on. */
AmeenWall.LAYER_NAME = "A-WALL";

AmeenWall.Justification = {
    Center: "center",  // baseline is the wall centre line
    Left:   "left",    // wall lies to the left of p1 -> p2
    Right:  "right"    // wall lies to the right of p1 -> p2
};

/**
 * Exact conversion factors to millimetres.
 * 1 in = 25.4 mm exactly (international inch).
 */
AmeenWall.UNIT_TO_MM = {
    "mm": 1.0,
    "cm": 10.0,
    "m": 1000.0,
    "in": 25.4,
    "\"": 25.4,
    "ft": 304.8,
    "'": 304.8
};

/**
 * Parses a thickness string into millimetres.
 * Accepts: "228.6", "228.6mm", "9in", "9\"", "0.75ft", "0.75'", "23cm",
 * and feet-inches such as "1'6\"" or "1'-6\"".
 * A bare number is taken as millimetres.
 * \return {ok:true, value:Number} or {ok:false, error:String}
 */
AmeenWall.parseLength = function(text) {
    if (typeof text === "number") {
        return AmeenWall.validateFinite(text);
    }
    if (typeof text !== "string") {
        return { ok: false, error: "Thickness is missing." };
    }
    var s = text.replace(/\s+/g, "").toLowerCase();
    if (s.length === 0) {
        return { ok: false, error: "Thickness is empty." };
    }
    var num = "([-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?)";

    // feet-inches, e.g. 1'6" or 1'-6"
    var m = new RegExp("^" + num + "'-?" + num + "(?:\"|in)?$").exec(s);
    if (m !== null) {
        return AmeenWall.validateFinite(parseFloat(m[1]) * 304.8 + parseFloat(m[2]) * 25.4);
    }

    m = new RegExp("^" + num + "(mm|cm|m|in|\"|ft|')?$").exec(s);
    if (m === null) {
        return { ok: false, error: "Cannot read thickness '" + text + "'. Use e.g. 230, 230mm, 9in or 9\"." };
    }
    var unit = (m[2] === undefined || m[2] === "") ? "mm" : m[2];
    return AmeenWall.validateFinite(parseFloat(m[1]) * AmeenWall.UNIT_TO_MM[unit]);
};

AmeenWall.validateFinite = function(v) {
    if (typeof v !== "number" || !isFinite(v)) {
        return { ok: false, error: "Thickness is not a valid number." };
    }
    return { ok: true, value: v };
};

/**
 * Validates inputs. Returns an error string, or null if valid.
 */
AmeenWall.validate = function(p1, p2, thickness, justification) {
    function isPoint(p) {
        return p !== null && typeof p === "object" &&
               typeof p.x === "number" && typeof p.y === "number" &&
               isFinite(p.x) && isFinite(p.y);
    }
    if (!isPoint(p1) || !isPoint(p2)) {
        return "Baseline end points are invalid.";
    }
    if (typeof thickness !== "number" || !isFinite(thickness)) {
        return "Thickness is not a valid number.";
    }
    if (thickness <= AmeenWall.EPSILON) {
        return thickness < 0 ? "Thickness must be positive (got " + thickness + ")."
                             : "Thickness must be greater than zero.";
    }
    var len = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
    if (len <= AmeenWall.EPSILON) {
        return "Baseline has zero length.";
    }
    if (justification !== undefined &&
        justification !== AmeenWall.Justification.Center &&
        justification !== AmeenWall.Justification.Left &&
        justification !== AmeenWall.Justification.Right) {
        return "Unknown justification '" + justification + "'.";
    }
    return null;
};

/**
 * Computes the two wall boundary lines for baseline p1 -> p2.
 *
 * \return {ok:true, left:{p1,p2}, right:{p1,p2}, length, thickness}
 *         or {ok:false, error:String}. Never modifies the inputs.
 *
 * "left" is the boundary on the left side when walking from p1 to p2.
 */
AmeenWall.computeBoundaries = function(p1, p2, thickness, justification) {
    if (justification === undefined || justification === null) {
        justification = AmeenWall.Justification.Center;
    }
    var err = AmeenWall.validate(p1, p2, thickness, justification);
    if (err !== null) {
        return { ok: false, error: err };
    }

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    // unit left normal (perpendicular, rotated +90°):
    var nx = -dy / len;
    var ny = dx / len;

    var offLeft, offRight;   // signed distances along the left normal
    switch (justification) {
    case AmeenWall.Justification.Left:
        offLeft = thickness; offRight = 0.0; break;
    case AmeenWall.Justification.Right:
        offLeft = 0.0; offRight = -thickness; break;
    default:
        offLeft = thickness / 2.0; offRight = -thickness / 2.0; break;
    }

    function shift(p, d) {
        return { x: p.x + nx * d, y: p.y + ny * d };
    }

    return {
        ok: true,
        left:  { p1: shift(p1, offLeft),  p2: shift(p2, offLeft) },
        right: { p1: shift(p1, offRight), p2: shift(p2, offRight) },
        length: len,
        thickness: thickness,
        justification: justification
    };
};

/**
 * Perpendicular distance from point p to the infinite line through a, b.
 * Used by tests to verify generated geometry numerically.
 */
AmeenWall.pointLineDistance = function(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    return Math.abs(dx * (a.y - p.y) - dy * (a.x - p.x)) / len;
};

// Node.js export (ignored by the QCAD script engine):
if (typeof module !== "undefined" && module.exports) {
    module.exports = AmeenWall;
}
