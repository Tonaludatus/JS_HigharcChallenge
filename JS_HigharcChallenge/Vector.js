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
function eqNormalized(/*Vector*/ v1, /*Vector*/ v2) {
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

module.exports = {
    eps,
    Point,
    Vector,
    diff,
    eqNormalized,
    ccwLessNormalized
};
