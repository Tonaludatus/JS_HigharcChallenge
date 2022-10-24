const vector = require("../Vector")
let Vector = vector.Vector;
let eqNormalized = vector.eqNormalized;
let ccwLessNormalized = vector.ccwLessNormalized;

const east = new Vector(1, 0);
const northeast = new Vector(1, 1).normalized();
const north = new Vector(0, 1);
const northwest = new Vector(-1, 1).normalized();
const west = new Vector(-1, 0);
const southwest = new Vector(-1, -1).normalized();
const south = new Vector(0, -1);
const southeast = new Vector(1, -1).normalized();

const vectors = [
	east, northeast, north, northwest, west, southwest, south, southeast
];

test('VectorTest eqNormalized', () => {
	for (let i = 0; i < vectors.length; ++i) {
		for (let j = 0; j < vectors.length; ++j) {
			if (j == i) {
				expect(eqNormalized(vectors[i], vectors[j])).toBe(true);
			}
			else {
				expect(eqNormalized(vectors[i], vectors[j])).toBe(false);
			}
		}
	}
});

test('VectorTest, ccwLessNormalized', () => {
	for (let i = 0; i < vectors.length; ++i) {
		for (let j = 0; j < vectors.length; ++j) {
			if (i < j) {
				expect(ccwLessNormalized(vectors[i], vectors[j])).toBe(true);
			}
			else {
				expect(ccwLessNormalized(vectors[i], vectors[j])).toBe(false);
			}
		}
	}
});
