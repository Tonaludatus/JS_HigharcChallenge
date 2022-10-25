'use strict';
var express = require('express');
var bodyparser = require('body-parser')

var port = process.env.PORT || 1337;
const vector = require("./Vector")
const graph = require("./Graph")
let Point = vector.Point;

class HighArcPolygonTest {
	constructor() {
		this.gg = new graph.GeomGraph();
		this.n1 = this.gg.addGeomNode(new Point(-38.2, 0)).second;
		this.n2 = this.gg.addGeomNode(new Point(29.87, 45.12)).second;
		this.n3 = this.gg.addGeomNode(new Point(60, 15.8)).second;
		this.n4 = this.gg.addGeomNode(new Point(11.3, -23.09)).second;
		this.n5 = this.gg.addGeomNode(new Point(0, 5)).second;
		this.n6 = this.gg.addGeomNode(new Point(-12, -49.784)).second;
		this.n7 = this.gg.addGeomNode(new Point(27, -35.55)).second;
	}
};

const kite_json = '{	\
	"vertices": [		\
		[-38.2, 0],		\
		[29.87, 45.12], \
		[60, 15.8],		\
		[11.3, -23.09], \
		[0, 5],			\
		[-12, -49.784], \
		[27, -35.55]],  \
	"edges": [[0, 1], [1, 2], [2, 3], \
		      [3, 0], [4, 0], [4, 1], \
			  [4, 2], [4, 3]]         \
}';

function kite() {
	let pg = graph.importGeomGraphAndBuildPolyGraph(JSON.parse(kite_json));
	return JSON.stringify(graph.exportPolyGraph(pg));
}

function kite_with_ear(/*HighArcPolygonTest*/hapt) {
	hapt.gg.addGeomEdge(hapt.n1, hapt.n2);
	hapt.gg.addGeomEdge(hapt.n2, hapt.n3);
	hapt.gg.addGeomEdge(hapt.n3, hapt.n4);
	hapt.gg.addGeomEdge(hapt.n4, hapt.n1);
	hapt.gg.addGeomEdge(hapt.n5, hapt.n1);
	hapt.gg.addGeomEdge(hapt.n5, hapt.n2);
	hapt.gg.addGeomEdge(hapt.n5, hapt.n3);
	hapt.gg.addGeomEdge(hapt.n5, hapt.n4);
	hapt.gg.addGeomEdge(hapt.n4, hapt.n6);
	hapt.gg.addGeomEdge(hapt.n7, hapt.n4);
	hapt.gg.addGeomEdge(hapt.n7, hapt.n6);
	//let pb = new graph.PolygonBuilder(hapt.gg);
	//let pg = pb.buildPolygons();
	let pg = new graph.PolyGraph(hapt.gg, new graph.Graph(), [], []);
	return JSON.stringify(graph.exportPolyGraph(pg));
}

function square_lattice(nx, ny) {
	let gg = new graph.GeomGraph();
	for (let j = 0; j < ny; ++j) {
		for (let i = 0; i < nx; ++i) {
			let n = gg.addGeomNode(new Point(i, j));
			if (i > 0) {
				// Link to previous
				gg.addGeomEdge(n.second, gg.getGeomNode(n.first - 1));
			}
			if (j > 0) {
				// Link to one row above
				gg.addGeomEdge(n.second, gg.getGeomNode(n.first - nx));
            }
		}
	}
	//let pb = new graph.PolygonBuilder(gg);
	//let pg = pb.buildPolygons();
	let pg = new graph.PolyGraph(gg, new graph.Graph(), [], []);
	return JSON.stringify(graph.exportPolyGraph(pg));
}

function triangle_lattice(nx, ny) {
	let gg = new graph.GeomGraph();
	for (let j = 0; j < ny; ++j) {
		for (let i = 0; i < nx; ++i) {
			let n = gg.addGeomNode(new Point(i, j));
			if (i > 0) {
				// Link to previous
				gg.addGeomEdge(n.second, gg.getGeomNode(n.first - 1));
			}
			if (j > 0) {
				// Link to one row above
				gg.addGeomEdge(n.second, gg.getGeomNode(n.first - nx));
			}
			if (j > 0 && i > 0) {
				// Link diagonally to one row above
				gg.addGeomEdge(n.second, gg.getGeomNode(n.first - nx - 1));
			}
		}
	}
	//let pb = new graph.PolygonBuilder(gg);
	//let pg = pb.buildPolygons();
	let pg = new graph.PolyGraph(gg, new graph.Graph(), [], []);
	return JSON.stringify(graph.exportPolyGraph(pg));
}

var app = express()
//app.use(express.static(__dirname));
//express.static.mime.define({ 'application/javascript': ['js'] })
app.use(bodyparser.urlencoded({ extended: true }))

app.listen(port)

app.get('/kite_with_ear', function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	let hapt = new HighArcPolygonTest();
	res.end(kite_with_ear(hapt));
})

app.get('/kite', function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(kite());
})

app.get('/square_lattice', function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(square_lattice(6,6));
})

app.get('/triangle_lattice', function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(triangle_lattice(4, 4));
})

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/html/index.html');
})

app.get('/Task1.html', function (req, res) {
	res.sendFile(__dirname + '/html/Task1.html');
})

app.get('/Task2.html', function (req, res) {
	res.sendFile(__dirname + '/html/Task2.html');
})

app.get('/Task3.html', function (req, res) {
	res.sendFile(__dirname + '/html/Task3.html');
})

app.get('/Task4.html', function (req, res) {
	res.sendFile(__dirname + '/html/Task4.html');
})

app.post('/task1_data', function (req, res) {
	let ret = { error: "Something went wrong" };
	try {
		let json = JSON.parse(req.body.geom_graph);
		let pg = graph.importGeomGraphAndBuildPolyGraph(json);
		ret = graph.exportPolyGraph(pg);
	} catch (exc) {
		ret.error = exc.toString();
	}
	res.json(ret);
})

app.post('/task2_data', function (req, res) {
	let ret = { error: "Something went wrong" };
	try {
		let json = JSON.parse(req.body.poly_graph);
		let face = req.body.face;
		let pg = graph.importPolyGraph(json);
		ret = []
		for (let i = 0; i < pg.polygons.length; ++i) {
			let p = pg.polygons[i];
			if (p.name === face) {
				for (let it = p.node.edges.begin();
					it.not_equals(p.node.edges.end());
					it.increment()) {
					let e = it.deref();
					let poly = null;
					if (p.node.equals(e.start)) {
						poly = pg.getPolygon(e.end.key);
					} else {
						poly = pg.getPolygon(e.start.key);
					}
					if (graph.isInteriorPoly(poly)) {
						ret.push(poly.name);
					}
                }
            }
		}
		// Dedupe
		ret = ret.filter((val, index, arr) => {
			return arr.indexOf(val) == index;
		});
	} catch (exc) {
		ret.error = exc;
	}
	res.json(ret);
})

app.post('/task3_data', function (req, res) {
	let ret = { error: "Something went wrong" };
	try {
		let json = JSON.parse(req.body.poly_graph);
		let ptx = Number(req.body.x);
		let pty = Number(req.body.y);
		let pg = graph.importPolyGraph(json);
		let pt = new vector.Point(ptx, pty);
		let containing_polys = graph.containingPolygonsForPoint(pg, pt);
		ret = containing_polys.map((p) => { return p.name; });
	} catch (exc) {
		ret.error = exc;
	}
	res.json(ret);
})

app.post('/task4_data', function (req, res) {
	let ret = { error: "Something went wrong" };
	try {
		let json = JSON.parse(req.body.poly_graph);
		let face = req.body.face;
		let pg = graph.importPolyGraph(json);
		ret = []
		let queue_this = []
		let queue_next = []
		let visited_polys = Array(pg.polygons.length).fill(false)
		for (let i = 0; i < pg.polygons.length; ++i) {
			let p = pg.polygons[i];
			if (p.name === face && graph.isInteriorPoly(p)) {
				queue_this.push(p)
			}
		}
		while (queue_this.length > 0) {
			// Dedupe
			queue_this = queue_this.filter((val, index, arr) => {
				return arr.indexOf(val) == index;
			});
			ret.push(queue_this.map((p) => { return p.name; }));
			// Breadth first step
			while (queue_this.length > 0) {
				let p = queue_this.shift();
				visited_polys[p.node.key] = true;
				for (let it = p.node.edges.begin();
					it.not_equals(p.node.edges.end());
					it.increment()) {
					let e = it.deref();
					let poly = null;
					if (p.node.equals(e.start)) {
						poly = pg.getPolygon(e.end.key);
					} else {
						poly = pg.getPolygon(e.start.key);
					}
					if (!visited_polys[poly.node.key] &&
						graph.isInteriorPoly(poly)) {
						queue_next.push(poly);
					}
				}
			}
			queue_this = queue_next;
			queue_next = [];
		}
		
	} catch (exc) {
		ret.error = exc;
	}
	res.json(ret);
})
