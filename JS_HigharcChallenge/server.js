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
	let pb = new graph.PolygonBuilder(hapt.gg);
	let pg = pb.buildPolygons();
	return JSON.stringify(graph.exportPolyGraph(pg));
}


var app = express()
//app.use(express.static(__dirname));
//express.static.mime.define({ 'application/javascript': ['js'] })
app.use(bodyparser.urlencoded({ extended: true }))

app.listen(port)

app.get('/', function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	let hapt = new HighArcPolygonTest();
	res.end(kite_with_ear(hapt));
})

app.get('/Task1.html', function (req, res) {
	res.sendFile(__dirname + '/html/Task1.html');
})

app.post('/task1_data', function (req, res) {
	let ret = { error: "Something went wrong" };
	try {
		let json = JSON.parse(req.body.geom_graph);
		let pg = graph.importGeomGraphAndBuildPolyGraph(json);
		ret = graph.exportPolyGraph(pg);
	} catch (exc) {
		ret.error = exc;
	}
	res.json(ret);
})
