const vector = require("../Vector")
const trig = require("../Trig")
let eps = vector.eps;
let Vector = vector.Vector;
let eqNormalized = vector.eqNormalized

const sin_pi4 = 1.0 / Math.sqrt(2);
const cos_pi4 = 1.0 / Math.sqrt(2);

test('TrigTest, sin_between', () => {
	const east = new Vector(1.0, 0.0);
	const north = new Vector(0.0, 1.0);
	const northeast = new Vector(1.0, 1.0).normalized();
	const northwest = new Vector(-1.0, 1.0).normalized();
	expect(Math.abs(trig.sinOfAngleBetweenNormalizedVectors(east, north) - 1.0)).toBeLessThan(eps);
	expect(Math.abs(trig.sinOfAngleBetweenNormalizedVectors(northeast, northwest) - 1.0)).toBeLessThan(eps);
	expect(Math.abs(trig.sinOfAngleBetweenNormalizedVectors(north, east) + 1.0)).toBeLessThan(eps);
	expect(Math.abs(trig.sinOfAngleBetweenNormalizedVectors(northwest, northeast) + 1.0)).toBeLessThan(eps);
});

test('TrigTest, cos_between', () => {
	const east = new Vector(1.0, 0.0);
	const north = new Vector(0.0, 1.0);
	const northeast = new Vector(1.0, 1.0).normalized();
	const northwest = new Vector(-1.0, 1.0).normalized();
	expect(Math.abs(trig.cosOfAngleBetweenNormalizedVectors(east, north))).toBeLessThan(eps);
	expect(Math.abs(trig.cosOfAngleBetweenNormalizedVectors(northeast, northwest))).toBeLessThan(eps);
	expect(Math.abs(trig.cosOfAngleBetweenNormalizedVectors(north, east))).toBeLessThan(eps);
	expect(Math.abs(trig.cosOfAngleBetweenNormalizedVectors(northwest, northeast))).toBeLessThan(eps);
});

test('TrigTest, trig.rotateNormalizedVectorBy ', () => {
	const east = new Vector(1.0, 0.0);
	const north = new Vector(0.0, 1.0);
	const northeast = new Vector(1.0, 1.0).normalized();
	const northwest = new Vector(-1.0, 1.0).normalized();
	const south = new Vector(0.0, -1.0);
	const rotated_east = trig.rotateNormalizedVectorBy (east, 1.0, 0);
	const rotated_northeast = trig.rotateNormalizedVectorBy (northeast, 1.0, 0);
	const rotated_northeast_to_north = trig.rotateNormalizedVectorBy (northeast, sin_pi4, cos_pi4);
	const rotated_east_to_south = trig.rotateNormalizedVectorBy (east, -1.0, 0);
	expect(eqNormalized(rotated_east, north)).toBe(true);
	expect(eqNormalized(rotated_northeast, northwest)).toBe(true);
	expect(eqNormalized(rotated_northeast_to_north, north)).toBe(true);
	expect(eqNormalized(rotated_east_to_south, south)).toBe(true);
});

test('TrigTest, trig.rotationBetweenNormalizedVectors', () => {
	const east = new Vector(1.0, 0.0);
	const north = new Vector(0.0, 1.0);
	const northeast = new Vector(1.0, 1.0).normalized();
	const northwest = new Vector(-1.0, 1.0).normalized();
	const south = new Vector(0.0, -1.0);
	let north_rot = trig.rotationOfNormalizedVector(north);
	let south_rot = trig.rotationOfNormalizedVector(south);
	let east_to_north = trig.rotationBetweenNormalizedVectors(east, north);
	let north_to_east = trig.rotationBetweenNormalizedVectors(north, east);
	expect(east_to_north).toEqual(north_rot);
	expect(north_to_east).toEqual(south_rot);
});

test('TrigTest, trig.complementerOfNormalized', () => {
	const east = new Vector(1.0, 0.0);
	const north = new Vector(0.0, 1.0);
	const northeast = new Vector(1.0, 1.0).normalized();
	const northwest = new Vector(-1.0, 1.0).normalized();
	const south = new Vector(0.0, -1.0);
	let north_rot = trig.rotationOfNormalizedVector(north);
	let south_rot = trig.rotationOfNormalizedVector(south);
	let north_comp_rot = trig.complementerOfNormalized(north);
	let south_comp_rot = trig.complementerOfNormalized(south);
	expect(north_comp_rot).toEqual(south_rot);
	expect(south_comp_rot).toEqual(north_rot);
});
