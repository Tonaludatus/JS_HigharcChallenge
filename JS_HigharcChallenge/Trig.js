const vector = require("./Vector")
let Vector = vector.Vector;
let ccwLessNormalized = vector.ccwLessNormalized;

class Rotation {
	constructor(/*double*/ s, /*double*/ c, /*unsigned int*/ r) {
		this.sin_alpha = s;
		this.cos_alpha = c;
		// how many times we passed the 0 angle.
		this.revolution_num = r;
	}
	assignFrom(/*Rotation*/ other) {
		this.sin_alpha = other.sin_alpha;
		this.cos_alpha = other.cos_alpha;
		this.revolution_num = other.revolution_num;
    }
};

/*returns double*/
function sinOfAngleBetweenNormalizedVectors(/*Vector*/ from, /*Vector*/ to) {
	// Cross product's Z dimension has length |from||to|sin(alpha) == sin(alpha)
	return from.x * to.y - from.y * to.x;
}

/*returns double*/
function cosOfAngleBetweenNormalizedVectors(/*Vector*/ from, /*Vector*/ to) {
	// Dot product is |from||to|cos(alpha) == cos(alpha)
	return from.x * to.x + from.y * to.y;
}


/*returns Vector*/
function rotateNormalizedVectorBy(/*Vector*/ v, /* double */ sin_beta, /* double */ cos_beta) {
	let cos_alpha = v.x;
	let sin_alpha = v.y;
	return new Vector(
		// x = cos(alpha+beta) == cos(alpha)cos(beta)-sin(alpha)sin(beta)
		cos_alpha * cos_beta - sin_alpha * sin_beta,
		// y = sin(alpha+beta) == sin(alpha)cos(beta)+cos(alpha)sin(beta)
		sin_alpha * cos_beta + cos_alpha * sin_beta
	).normalized();
}

/* returns Rotation */
function rotationOfNormalizedVector(/*Vector*/ v) {
	return new Rotation(v.y, v.x, 0);
}

/* returns Rotation */
function rotationBetweenNormalizedVectors(/*Vector*/ from, /*Vector*/ to) {
	return new Rotation(
		sinOfAngleBetweenNormalizedVectors(from, to),
		cosOfAngleBetweenNormalizedVectors(from, to),
		0);
}

// The rotation that complements v to 360 degrees
/* returns Rotation */
function complementerOfNormalized(/*Vector*/ v) {
	const east = new Vector(1.0, 0.0);
	return new Rotation(
		sinOfAngleBetweenNormalizedVectors(v, east),
		cosOfAngleBetweenNormalizedVectors(v, east),
		0
	);
}

/* returns bool */
function less_than (/* Rotation */ r1, /* Rotation */ r2) {
	return r1.revolution_num < r2.revolution_num ||
		(r1.revolution_num == r2.revolution_num &&
			ccwLessNormalized(new Vector(r1.cos_alpha, r1.sin_alpha),
				new Vector(r2.cos_alpha, r2.sin_alpha))
		);
}

/* returns Rotation */
function plus (/* Rotation */ r1, /* Rotation */ r2) {
	let v1 = new Vector(r1.cos_alpha, r2.sin_alpha);
	let rotated_vector = rotateNormalizedVectorBy(
							v1, r2.sin_alpha, r2.cos_alpha);
	let ret = new Rotation(
		rotated_vector.y, rotated_vector.x,
			r1.revolution_num + r2.revolution_num
	);
	if (!(less_than(r2,complementerOfNormalized(v1)))) {
		++(ret.revolution_num);
	}
	return ret;
}

/* returns Rotation& */
function incrementBy(/* Rotation */ r1, /* Rotation */ r2) {
	r1.assignFrom(plus(r1,r2));
	return r1;
}

/* returns bool */
function equals(/* Rotation */ one, /* Rotation */ other) {
	return (one.revolution_num == other.revolution_num &&
		Math.abs(one.sin_alpha - other.sin_alpha) < eps &&
		Math.abs(one.cos_alpha - other.cos_alpha) < eps) ||
		(
			(
				(one.revolution_num > other.revolution_num &&
					one.revolution_num - other.revolution_num == 1) ||
				(other.revolution_num > one.revolution_num &&
					other.revolution_num - one.revolution_num == 1)
			) &&
			Math.abs(one.sin_alpha) < eps &&
			Math.abs(other.sin_alpha) < eps &&
			Math.abs(one.cos_alpha - 1.0) < eps &&
			Math.abs(other.cos_alpha - 1.0) < eps
		);
}

/* returns Rotation */
function innerRevolutionOfNGon(/*unsigned int*/ n) {
	return new Rotation(
		0.0,
			n % 2 == 0 ? 1.0 : -1.0,
			(n - 2) / 2
	);
}

/* returns Rotation */
function outerRevolutionOfNGon(/*unsigned int*/ n) {
	return new Rotation(
		0.0,
			n % 2 == 0 ? 1.0 : -1.0,
			(n + 1) / 2
	);
}

module.exports = {
	Rotation,
	sinOfAngleBetweenNormalizedVectors,
	cosOfAngleBetweenNormalizedVectors,
	rotateNormalizedVectorBy,
	rotationOfNormalizedVector,
	rotationBetweenNormalizedVectors,
	complementerOfNormalized,
	less_than,
	plus,
	incrementBy,
	equals,
	innerRevolutionOfNGon,
	outerRevolutionOfNGon
};
