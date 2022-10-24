'use strict';
var http = require('http');
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

function kite(/*HighArcPolygonTest*/hapt) {
	hapt.gg.addGeomEdge(hapt.n1, hapt.n2);
	hapt.gg.addGeomEdge(hapt.n2, hapt.n3);
	hapt.gg.addGeomEdge(hapt.n3, hapt.n4);
	hapt.gg.addGeomEdge(hapt.n4, hapt.n1);
	hapt.gg.addGeomEdge(hapt.n5, hapt.n1);
	hapt.gg.addGeomEdge(hapt.n5, hapt.n2);
	hapt.gg.addGeomEdge(hapt.n5, hapt.n3);
	hapt.gg.addGeomEdge(hapt.n5, hapt.n4);
	let pb = new graph.PolygonBuilder(hapt.gg);
	let pg = pb.buildPolygons();
	return JSON.stringify(graph.exportPolyGraph(pg));
}


http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	let hapt = new HighArcPolygonTest();
    res.end(kite(hapt));
}).listen(port);
