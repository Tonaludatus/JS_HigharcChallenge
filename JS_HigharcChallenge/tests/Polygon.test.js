const vector = require("../Vector")
const graph = require("../Graph")
let Vector = vector.Vector;
let Point = vector.Point;

class PolygonTest {
	constructor() {
		this.g = new graph.GeomGraph();
		this.n1 = this.g.addGeomNode(new Point(-38.2, 0)).second;
		this.n2 = this.g.addGeomNode(new Point(29.87, 45.12)).second;
		this.n3 = this.g.addGeomNode(new Point(60, 15.8)).second;
		this.n4 = this.g.addGeomNode(new Point(11.3, -23.09)).second;
		this.n5 = this.g.addGeomNode(new Point(0, 5)).second;
		this.n6 = this.g.addGeomNode(new Point(-12, -49.784)).second;
		this.n7 = this.g.addGeomNode(new Point(27, -35.55)).second;
	}

	two_polys_test_from_node(/*size_t*/ expected_num_poly_edges, 
				   /*GeomNode&*/ start_node) {
		let geomedges = this.g.getEdges();
		geomedges.sort((a, b) => {
			return a.edge.key - b.edge.key;
        });
		let pb = new graph.PolygonBuilder(this.g);
		let pg = pb.buildPolygonsFromNode(start_node);
		expect(pg.polygons.length).toEqual(2);
		expect(pg.poly_edges.length).toEqual(expected_num_poly_edges);
		for (let i = 0; i < pg.polygons.length; ++i) {
			let p = pg.polygons[i]
			let p_edges = [];
			let p_nodes = [];
			let edgelist = p.node.edges;
			for (let it = edgelist.begin(); it.not_equals(edgelist.end()); it.increment()) {
				let e = it.deref();
				let poly_edge_this = pg.getPolyEdge(e.key);
				let geom_edge_this = poly_edge_this.geom_edge;
				p_edges.push(geom_edge_this);
				// Check node continuity
				let prev = it.clone().circularAdvancedBy(-1);
				let poly_edge_prev = pg.getPolyEdge(prev.deref().key);
				let geom_edge_prev = poly_edge_prev.geom_edge;
				let common_node_this_fw = (poly_edge_this.edge.start.equals(p.node))
					? geom_edge_this.edge.start
					: geom_edge_this.edge.end;
				let common_node_prev_fw = (poly_edge_prev.edge.start.equals(p.node))
					? geom_edge_prev.edge.end
					: geom_edge_prev.edge.start;
				let common_node_this_bk = (poly_edge_this.edge.start.equals(p.node))
					? geom_edge_this.edge.end
					: geom_edge_this.edge.start;
				let common_node_prev_bk = (poly_edge_prev.edge.start.equals(p.node))
					? geom_edge_prev.edge.start
					: geom_edge_prev.edge.end;
				expect(common_node_this_fw.equals(common_node_prev_fw) ||
					common_node_this_bk.equals(common_node_prev_bk)).toBe(true);
				if (common_node_this_fw.equals(common_node_prev_fw)) {
					p_nodes.push(common_node_this_fw.key);
				} else {
					p_nodes.push(common_node_this_bk.key);
                }
			}
			p_edges.sort((a, b) => {
				return a.edge.key - b.edge.key;
			});
			expect(geomedges).toEqual(p_edges);
			expect(p_nodes.every((val, index, arr) => {
				return arr.indexOf(val) === index;
			})).toBe(true);
		}
		let ordered_poly_ptrs = [ pg.polygons[0], pg.polygons[1] ];
		ordered_poly_ptrs.sort((a, b) => { return a.node.key - b.node.key; });
		for (let i = 0; i < pg.poly_edges.length; ++i) {
			let pe = pg.poly_edges[i];
			let pe_polys = [pg.getPolygon(pe.edge.start.key),
							pg.getPolygon(pe.edge.end.key)];
			pe_polys.sort((a, b) => { return a.node.key - b.node.key; });
			expect(ordered_poly_ptrs).toEqual(pe_polys);
		}
	}

	two_polys_test(expected_num_poly_edges) {
		this.two_polys_test_from_node(expected_num_poly_edges, this.n1);
	}

	multi_polys_test(expected_num_polys,
					 expected_num_poly_edges,
				     /*GeomNode&*/ start_node) {
		let geomedges = this.g.getEdges();
		geomedges.sort((a, b) => {
			return a.edge.key - b.edge.key;
		});
		let pb = new graph.PolygonBuilder(this.g);
		let pg = pb.buildPolygonsFromNode(start_node);
		expect(pg.polygons.length).toEqual(expected_num_polys);
		expect(pg.poly_edges.length).toEqual(expected_num_poly_edges);
		for (let i = 0; i < pg.polygons.length; ++i) {
			let p = pg.polygons[i]
			let p_edges = [];
			let edgelist = p.node.edges;
			for (let it = edgelist.begin(); it.not_equals(edgelist.end()); it.increment()) {
				let e = it.deref();
				let poly_edge_this = pg.getPolyEdge(e.key);
				let geom_edge_this = poly_edge_this.geom_edge;
				p_edges.push(geom_edge_this);
				// Check node continuity
				let prev = it.clone().circularAdvancedBy(-1);
				let poly_edge_prev = pg.getPolyEdge(prev.deref().key);
				let geom_edge_prev = poly_edge_prev.geom_edge;
				let common_node_this_fw = (poly_edge_this.edge.start.equals(p.node))
					? geom_edge_this.edge.start
					: geom_edge_this.edge.end;
				let common_node_prev_fw = (poly_edge_prev.edge.start.equals(p.node))
					? geom_edge_prev.edge.end
					: geom_edge_prev.edge.start;
				let common_node_this_bk = (poly_edge_this.edge.start.equals(p.node))
					? geom_edge_this.edge.end
					: geom_edge_this.edge.start;
				let common_node_prev_bk = (poly_edge_prev.edge.start.equals(p.node))
					? geom_edge_prev.edge.start
					: geom_edge_prev.edge.end;
				expect(common_node_this_fw.equals(common_node_prev_fw) ||
					common_node_this_bk.equals(common_node_prev_bk)).toBe(true);
			}
			expect(p_edges.every((val, index, arr) => {
				return arr.indexOf(val) === index;
			})).toBe(true);
		}
		for (let i = 0; i < pg.poly_edges.length; ++i) {
			let pe = pg.poly_edges[i];
			expect(pg.getPolygon(pe.edge.start.key)).not.toEqual(
				   pg.getPolygon(pe.edge.end.key));
		}
	}

};

test('PolygonTest, triangle1', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n1);
	pt.two_polys_test(3);
});

test('PolygonTest, triangle1flip1', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n2, pt.n1);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n1);
	pt.two_polys_test(3);
});

test('PolygonTest, triangle1flip2', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n3, pt.n2);
	pt.g.addGeomEdge(pt.n3, pt.n1);
	pt.two_polys_test(3);
});

test('PolygonTest, triangle1flip3', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n1, pt.n3);
	pt.two_polys_test(3);
});

test('PolygonTest, quadrilateral1', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n4);
	pt.g.addGeomEdge(pt.n4, pt.n1);
	pt.two_polys_test(4);
});

test('PolygonTest, quadrilateral1flip1', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n2, pt.n1);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n4);
	pt.g.addGeomEdge(pt.n4, pt.n1);
	pt.two_polys_test(4);
});

test('PolygonTest, quadrilateral1flip2', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n3, pt.n2);
	pt.g.addGeomEdge(pt.n3, pt.n4);
	pt.g.addGeomEdge(pt.n4, pt.n1);
	pt.two_polys_test(4);
});

test('PolygonTest, quadrilateral1flip3', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n4, pt.n3);
	pt.g.addGeomEdge(pt.n4, pt.n1);
	pt.two_polys_test(4);
});

test('PolygonTest, quadrilateral1flip4', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n4);
	pt.g.addGeomEdge(pt.n1, pt.n4);
	pt.two_polys_test(4);
});

test('PolygonTest, quadrilateral_different_starts', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n4);
	pt.g.addGeomEdge(pt.n4, pt.n1);
	pt.two_polys_test_from_node(4, pt.n2);
	pt.two_polys_test_from_node(4, pt.n3);
	pt.two_polys_test_from_node(4, pt.n4);
});

test('PolygonTest, kite', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n4);
	pt.g.addGeomEdge(pt.n4, pt.n1);
	pt.g.addGeomEdge(pt.n5, pt.n1);
	pt.g.addGeomEdge(pt.n5, pt.n2);
	pt.g.addGeomEdge(pt.n5, pt.n3);
	pt.g.addGeomEdge(pt.n5, pt.n4);
	pt.multi_polys_test(5, 8, pt.n1);
	pt.multi_polys_test(5, 8, pt.n5);
});


test('PolygonTest, envelope', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n4);
	pt.g.addGeomEdge(pt.n4, pt.n1);
	pt.g.addGeomEdge(pt.n5, pt.n1);
	pt.g.addGeomEdge(pt.n5, pt.n2);
	pt.multi_polys_test(3, 6, pt.n1);
	pt.multi_polys_test(3, 6, pt.n5);
	pt.multi_polys_test(3, 6, pt.n3);
});

test('PolygonTest, kite_with_ear', () => {
	let pt = new PolygonTest();
	pt.g.addGeomEdge(pt.n1, pt.n2);
	pt.g.addGeomEdge(pt.n2, pt.n3);
	pt.g.addGeomEdge(pt.n3, pt.n4);
	pt.g.addGeomEdge(pt.n4, pt.n1);
	pt.g.addGeomEdge(pt.n5, pt.n1);
	pt.g.addGeomEdge(pt.n5, pt.n2);
	pt.g.addGeomEdge(pt.n5, pt.n3);
	pt.g.addGeomEdge(pt.n5, pt.n4);
	pt.g.addGeomEdge(pt.n4, pt.n6);
	pt.g.addGeomEdge(pt.n7, pt.n4);
	pt.g.addGeomEdge(pt.n7, pt.n6);
	pt.multi_polys_test(6, 11, pt.n1);
	pt.multi_polys_test(6, 11, pt.n5);
	pt.multi_polys_test(6, 11, pt.n7);
	pt.multi_polys_test(6, 11, pt.n6);
	pt.multi_polys_test(6, 11, pt.n4);
});
