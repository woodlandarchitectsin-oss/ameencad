// AmeenCAD — unit tests for the pure wall geometry core (Node.js, no QCAD).
// Run: node ameencad/tests/unit/wall_geometry.test.js
"use strict";
var W = require("../../scripts/AmeenCAD/lib/WallGeometry.js");

var TOL = 1e-9;
var passed = 0, failed = 0, results = [];

function check(name, cond, detail) {
    if (cond) { passed++; results.push("PASS  " + name); }
    else { failed++; results.push("FAIL  " + name + (detail ? "  -- " + detail : "")); }
}
function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? TOL : tol); }

function verifyWall(name, p1, p2, t, just) {
    var r = W.computeBoundaries(p1, p2, t, just);
    check(name + ": ok", r.ok, r.error);
    if (!r.ok) return r;
    // perpendicular distance between boundaries, measured both ends:
    var d1 = W.pointLineDistance(r.left.p1, r.right.p1, r.right.p2);
    var d2 = W.pointLineDistance(r.left.p2, r.right.p1, r.right.p2);
    check(name + ": thickness at start = " + d1.toFixed(12), near(d1, t), "expected " + t);
    check(name + ": thickness at end   = " + d2.toFixed(12), near(d2, t), "expected " + t);
    // parallel and same length as baseline:
    function len(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
    var L = len(p1, p2);
    check(name + ": left length", near(len(r.left.p1, r.left.p2), L, 1e-9));
    check(name + ": right length", near(len(r.right.p1, r.right.p2), L, 1e-9));
    // ends perpendicular to baseline (wall end is square):
    var bx = p2.x - p1.x, by = p2.y - p1.y;
    var ex = r.left.p1.x - r.right.p1.x, ey = r.left.p1.y - r.right.p1.y;
    check(name + ": square end", near((bx * ex + by * ey) / (L * t), 0, 1e-12));
    // centre justification: baseline midway
    if (just === undefined || just === "center") {
        var dl = W.pointLineDistance(r.left.p1, p1, p2);
        var dr = W.pointLineDistance(r.right.p1, p1, p2);
        check(name + ": centred (" + dl + " / " + dr + ")", near(dl, t / 2) && near(dr, t / 2));
    }
    // inputs not mutated
    return r;
}

// --- reference case: 4000 mm baseline, 9 in wall ---
var t9 = W.parseLength("9in");
check("parse 9in = 228.6 mm", t9.ok && near(t9.value, 228.6, 1e-12), JSON.stringify(t9));
check("parse 9\" = 228.6 mm", near(W.parseLength('9"').value, 228.6, 1e-12));
check("parse 0.75ft = 228.6 mm", near(W.parseLength("0.75ft").value, 228.6, 1e-12));
check("parse 1'6\" = 457.2 mm", near(W.parseLength("1'6\"").value, 457.2, 1e-12));
check("parse 230 = 230 mm", near(W.parseLength("230").value, 230));
check("parse 23cm = 230 mm", near(W.parseLength("23cm").value, 230));

verifyWall("REF horizontal 4000 x 228.6", {x: 0, y: 0}, {x: 4000, y: 0}, t9.value);
verifyWall("vertical", {x: 0, y: 0}, {x: 0, y: 4000}, 228.6);
var c = Math.cos(Math.PI / 6) * 4000, s = Math.sin(Math.PI / 6) * 4000;
verifyWall("diagonal 30deg", {x: 100, y: 200}, {x: 100 + c, y: 200 + s}, 228.6);
verifyWall("diagonal 45deg", {x: 0, y: 0}, {x: 2828.4271247461903, y: 2828.4271247461903}, 228.6);
verifyWall("negative coords", {x: -5000, y: -3000}, {x: -1000, y: -3000}, 228.6);
verifyWall("negative diagonal", {x: -1234.5, y: -987.6}, {x: -4000.25, y: 1500.75}, 115);
verifyWall("left justified", {x: 0, y: 0}, {x: 4000, y: 0}, 228.6, "left");
verifyWall("right justified", {x: 0, y: 0}, {x: 4000, y: 0}, 228.6, "right");

var L = W.computeBoundaries({x: 0, y: 0}, {x: 4000, y: 0}, 228.6, "left");
check("left justification: right face on baseline", near(L.right.p1.y, 0) && near(L.left.p1.y, 228.6));
var C = W.computeBoundaries({x: 0, y: 0}, {x: 4000, y: 0}, 228.6);
check("centre REF: faces at y=+114.3 / -114.3", near(C.left.p1.y, 114.3) && near(C.right.p1.y, -114.3));

// --- invalid input ---
function rejects(name, r) { check(name + " rejected (" + (r.error || "") + ")", r.ok === false && typeof r.error === "string"); }
rejects("zero-length baseline", W.computeBoundaries({x: 5, y: 5}, {x: 5, y: 5}, 228.6));
rejects("zero thickness", W.computeBoundaries({x: 0, y: 0}, {x: 4000, y: 0}, 0));
rejects("negative thickness", W.computeBoundaries({x: 0, y: 0}, {x: 4000, y: 0}, -228.6));
rejects("NaN thickness", W.computeBoundaries({x: 0, y: 0}, {x: 4000, y: 0}, NaN));
rejects("Infinity thickness", W.computeBoundaries({x: 0, y: 0}, {x: 4000, y: 0}, Infinity));
rejects("missing point", W.computeBoundaries(null, {x: 4000, y: 0}, 228.6));
rejects("NaN coordinate", W.computeBoundaries({x: NaN, y: 0}, {x: 4000, y: 0}, 228.6));
rejects("bad justification", W.computeBoundaries({x: 0, y: 0}, {x: 4000, y: 0}, 228.6, "middle"));
rejects("parse empty", W.parseLength(""));
rejects("parse garbage", W.parseLength("abc"));
rejects("parse missing", W.parseLength(undefined));
check("parse -9in gives negative (then rejected by validate)", W.parseLength("-9in").value < 0 &&
      W.computeBoundaries({x: 0, y: 0}, {x: 1, y: 0}, W.parseLength("-9in").value).ok === false);

// inputs not mutated
var a = {x: 1, y: 2}, b = {x: 3, y: 4};
W.computeBoundaries(a, b, 10);
check("inputs unchanged", a.x === 1 && a.y === 2 && b.x === 3 && b.y === 4);

console.log(results.join("\n"));
console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
