const eps = 1e-5;

class Point {
    constructor(/*double*/ _x, /*double*/ _y) {
        this.x = _x;
        this.y = _y;
    }
};


class Vector {
    constructor(/*double*/ _x, /*double*/ _y) {
        this.x = _x;
        this.y = _y;
    }

    /* returns double*/
    len(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /* returns Vector */
    normalized() {
        let l = this.len();
        return new Vector(this.x / l, this.y / l);
    }

    /* returns Vector */
    flipped() {
        return new Vector(-this.x, -this.y);
    }

    /* returns Point */
    asPoint() {
        return new Point(this.x, this.y);
    }

    /* returns Point */
    translate(/*Point*/ p) {
        return new Point(p.x + this.x, p.y + this.y);
    }
};

/*returns Vector*/
function diff(/*Point*/ from, /*Point*/ to) {
    return new Vector(to.x - from.x, to.y - from.y);
}


// op== between normalized vectors with eps precision
/* returns bool */
function eqNormalized(/*Vector or Point*/ v1, /*Vector or Point*/ v2) {
    let dx = (v1.x - v2.x);
    let dy = (v1.y - v2.y);
    return dx > -eps && dx < eps && dy > -eps && dy < eps;
}

// op< between normalized vectors comparing by counterclockwise rotation from (1, 0)
/* returns bool */
function ccwLessNormalized(/*Vector*/ v1, /*Vector*/ v2) {
    if (eqNormalized(v1, v2)) return false; // to keep eps-precision
    if (v1.y >= 0 && v2.y < 0) return true;
    if (v1.y < 0 && v2.y >= 0) return false;
    // They are on the same half of the full circle
    return (v1.y >= 0 && v2.y >= 0) != (v1.x < v2.x);
}

/* returns nonzero if ray cast from p in the direction Vector(1.0, 0)
 * intersects the section s1, s2. The return value is positive if
 * the directed section s1->s2 intersects the ray upwards, otherwise
 * it is negative.
 */
function rayCastIntersectsSection(/*Point*/ p, /*Point*/ s1, /*Point*/ s2) {
    // Section end points are special and they would cancel
    // out on two consecutive edges of a polygon if 'p' happens
    // to be a vertex of a polygon. This would result in
    // vertices never be recognized as inside the polygon.
    // Matter of interpretation if that's what we want or not.
    // If we want that then the check for p==vertex has to take
    // place outside of this function.
    if (eqNormalized(p, s1) || eqNormalized(p, s2)) return yflipped;


    let miny = s1.y;
    let maxy = s2.y;
    let yflipped = 1;
    if (miny > maxy) {
        miny = s2.y;
        maxy = s1.y;
        yflipped = -1;
    }

    if (p.y > maxy || p.y < miny) return 0;

    let minx = s1.x;
    let maxx = s2.x;
    if (minx > maxx) {
        minx = s2.x;
        maxx = s1.x;
    }

    if (p.x > maxx) return 0;
    if (p.x < minx) return yflipped;

    // Inside the bounding box
    // Check if point is on the left or right side of
    // the s1->s2 diagonal.
    // We could do without normalization but precision
    // must be homogeneous.
    // None of the vectors below are zero long, otherwise
    // we would have returned earlier.
    let diag = diff(s2, s1).normalized();
    let to_p = diff(p, s1).normalized();

    if (yflipped * (diag.x * to_p.y - diag.y * to_p.x) > -eps) {
        return yflipped;
    }
    return 0;
}

module.exports = {
    eps,
    Point,
    Vector,
    diff,
    eqNormalized,
    ccwLessNormalized,
    rayCastIntersectsSection
};
