const vector = require("../Vector")
const graph = require("../Graph")
let Vector = vector.Vector;
let Point = vector.Point;


class GraphTest {
	constructor() {
		this.g = new graph.GeomGraph();
		this.origo = this.g.addGeomNode(new Point(34.2, -87.52)).second;
		this.east = this.g.addGeomNode(new Vector(1, 0).translate(this.origo.pos)).second;
		this.northeast = this.g.addGeomNode(new Vector(1, 1).normalized().translate(this.origo.pos)).second;
		this.north = this.g.addGeomNode(new Vector(0, 1).translate(this.origo.pos)).second;
		this.northwest = this.g.addGeomNode(new Vector(-1, 1).normalized().translate(this.origo.pos)).second;
		this.west = this.g.addGeomNode(new Vector(-1, 0).translate(this.origo.pos)).second;
		this.southwest = this.g.addGeomNode(new Vector(-1, -1).normalized().translate(this.origo.pos)).second;
		this.south = this.g.addGeomNode(new Vector(0, -1).translate(this.origo.pos)).second;
		this.southeast = this.g.addGeomNode(new Vector(1, -1).normalized().translate(this.origo.pos)).second;
	}

	test_ccw_edges_of_node(/*GeomNode&*/ n) {
		let edges_list = n.node.edges;
		let prev = edges_list.begin();
		let it = edges_list.begin();
		it.increment();
		while (it.not_equals(edges_list.end())) {
			expect(vector.ccwLessNormalized(graph.outwardDirFrom(this.g.getGeomEdge(prev.deref().key), n),
				graph.outwardDirFrom(this.g.getGeomEdge(it.deref().key), n))).toBe(true);
			it.increment();
			prev.increment();
		}
	}
};

test('GraphTest circular_edge_list_item', () => {
	let gt = new GraphTest();
	let e1 = gt.g.addGeomEdge(gt.origo, gt.north).second;
	let e2 = gt.g.addGeomEdge(gt.origo, gt.northwest).second;
	let e3 = gt.g.addGeomEdge(gt.southwest, gt.origo).second;

	var iter = e2.start_edges_item.clone();

	iter.increment();
	expect(iter.deref()).toEqual(e3.edge);
	iter.increment();
	expect(iter.deref()).toEqual(e1.edge);
	iter.increment();
	expect(iter.deref()).toEqual(e2.edge);
});

test('GraphTest insertEdge1a', () => {
	let gt = new GraphTest();
	gt.g.addGeomEdge(gt.origo, gt.north);
	gt.g.addGeomEdge(gt.origo, gt.northwest);
	gt.g.addGeomEdge(gt.origo, gt.southwest);
	gt.test_ccw_edges_of_node(gt.origo);
});

test('GraphTest insertEdge1b', () => {
	let gt = new GraphTest();
	gt.g.addGeomEdge(gt.origo, gt.northwest);
	gt.g.addGeomEdge(gt.origo, gt.north);
	gt.g.addGeomEdge(gt.origo, gt.southwest);
	gt.test_ccw_edges_of_node(gt.origo);
});

test('GraphTest insertEdge1c', () => {
	let gt = new GraphTest();
	gt.g.addGeomEdge(gt.origo, gt.southwest);
	gt.g.addGeomEdge(gt.origo, gt.northwest);
	gt.g.addGeomEdge(gt.origo, gt.north);
	gt.test_ccw_edges_of_node(gt.origo);
});

test('GraphTest insertFlippedEdge1a', () => {
	let gt = new GraphTest();
	gt.g.addGeomEdge(gt.north, gt.origo);
	gt.g.addGeomEdge(gt.origo, gt.northwest);
	gt.g.addGeomEdge(gt.origo, gt.southwest);
	gt.test_ccw_edges_of_node(gt.origo);
});

test('GraphTest insertFlippedEdge1b', () => {
	let gt = new GraphTest();
	gt.g.addGeomEdge(gt.origo, gt.north);
	gt.g.addGeomEdge(gt.northwest, gt.origo);
	gt.g.addGeomEdge(gt.origo, gt.southwest);
	gt.test_ccw_edges_of_node(gt.origo);
});

test('GraphTest insertFlippedEdge1c', () => {
	let gt = new GraphTest();
	gt.g.addGeomEdge(gt.origo, gt.north);
	gt.g.addGeomEdge(gt.origo, gt.northwest);
	gt.g.addGeomEdge(gt.southwest, gt.origo);
	gt.test_ccw_edges_of_node(gt.origo);
});
