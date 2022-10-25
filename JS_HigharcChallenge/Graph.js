const clist = require("./CircularList")
const vector = require("./Vector")
const trig = require("./Trig")

class pair {
    constructor(f, s) {
        this.first = f;
        this.second = s;
    }
}

class Node {
    constructor(/*int*/ k) {
        this.key = k;
        // The edges impinging on the node are stored in a circular list.
        // This makes finding the counterclockwise-next edge from one edge
        // on a GeomGraph (see below), and also to iterate through the
        // edges of a Polygon (see below) in a continuous fashion if the
        // graph is a PolyGraph (see below).
        this.edges = new clist.CList();
    }

    /*returns bool*/
    equals(/*const Node&*/ other) {
        // ONLY WORKS WITHIN THE SAME GRAPH
        return other.key == this.key;
    }
}

class Edge {
    constructor(/*Node*/s, /*Node*/e, /*int*/ k) {
        this.key = k;
        this.start = s;
        this.end = e;
    }

    /*returns bool*/
    equals(/*const Edge&*/ other) {
        // ONLY WORKS WITHIN THE SAME GRAPH
        return other.key == this.key;
    }

    /* returns Node& */
    otherNode(/*const Node&*/ n) {
        if (n.equals(this.start)) return this.end;
        return this.start;
    }
}

/* A generic graph representation that doesn't store ANY
 * data that's beyond the graph connectivities.
 * Helps in code reuse as well as memory footprint: data
 * that is needed for a particular calculation can be stored
 * elsewhere and thrown away when the calculation is done.
 * 
 * The Graph ensures that indices of edges and nodes are
 * stable. That kind of forces that removing edges and nodes
 * are NOT SUPPORTED
 */
class Graph {
    constructor() {
        /* Array of Edge objects */ this.edges = [];
        /* Array of Node objects */ this.nodes = [];
        this.next_edge_key = 0;
        this.next_node_key = 0;
    }

    /* returns pair<int, Node &>*/
    addNode() {
        let key = this.next_node_key++;
        let node = new Node(key);
        this.nodes.push(node);
        return new pair(key, node);
    }

    /* returns pair<int, Edge &>*/
    addEdge(/*Node&*/ s, /*Node&*/ e) {
        let key = this.next_edge_key++;
        let edge = new Edge(s, e, key);
        this.edges.push(edge);
        return new pair(key, edge);
    }

    /* returns pair<int, Edge &>*/
    addUnboundEdge() {
        let key = this.next_edge_key++;
        let edge = new Edge(null, null, key);
        this.edges.push(edge);
        return new pair(key, edge);
    }

    /* returns Node& */
    getNode(/*int*/ key) {
        return this.nodes[key];
    }

    /* returns Edge& */
    getEdge(/*int*/ key) {
        return this.edges[key];
    }
}

// Node specialization for a geometric graph node
// Edges ordered by CCW rotation from (1, 0)
class GeomNode {
    constructor(/* Node& */ n, /* Point */ p) {
        this.node = n;
        this.pos = p;
    }
};

// Edge specialization fro geometric graph edges
class GeomEdge {
    constructor(/*GeomGraph&*/ g, /*Edge&*/ e, /*GeomNode&*/ start, /*GeomNode&*/ end) {
        this.edge = e;
        this.dir = vector.diff(start.pos, end.pos).normalized(); // normalized
        /*iterator*/ this.start_edges_item = g.insertEdge(start, this);
        /*iterator*/ this.end_edges_item = g.insertEdge(end, this);
    }
}

/* returns Vector or Vector&*/
function outwardDirFrom(/*GeomEdge&*/ e, /*GeomNode&*/ n) {
    if (n.node.equals(e.edge.start)) return e.dir;
    return e.dir.flipped();
}

/* Geometric Graph specialization. The graph nodes and
 * edges are represented on a 2D plane.
 */
class GeomGraph {
    constructor() {
        this.g = new Graph();
        /* Array of GeomEdge objects */ this.geom_edges = [];
        /* Array of GeomNode objects */ this.geom_nodes = [];
    }

    /* returns iterator */
    insertEdge(/*GeomNode&*/ n, /*GeomEdge&*/ e) {
        let edges_list = n.node.edges;
        let it = edges_list.begin();
        while (it.not_equals(edges_list.end()) && this.compare(n, this.getGeomEdge(it.deref().key), e)) {
            it.increment();
        }
        return edges_list.insert(it, e.edge);
    }

    /* returns bool */
    compare(/*GeomNode&*/ n, /*GeomEdge&*/ one, /*GeomEdge&*/ other) {
        return vector.ccwLessNormalized(outwardDirFrom(one, n), outwardDirFrom(other, n));
    }

    /* returns pair<int, GeomNode&> */
    addGeomNode(/*Point&*/ p) {
        let n = this.g.addNode();
        let gn = new GeomNode(n.second, p);
        this.geom_nodes.push(gn);
        return new pair(n.first, gn);
    }

    /* returns pair <int, GeomEdge&> */
    addGeomEdge(/*GeomNode&*/ s, /*GeomNode&*/ e) {
        let edge = this.g.addEdge(s.node, e.node);
        let ge = new GeomEdge(this, edge.second, s, e);
        this.geom_edges.push(ge);
        return new pair(edge.first, ge);
    }

    /* returns GeomNode& */
    getGeomNode(/*int*/ key) {
        return this.geom_nodes[key];
    }

    /* returns GeomEdge& */
    getGeomEdge(/*int*/ key) {
        return this.geom_edges[key];
    }

    /* returns new array of Edge objects */
    getEdges() {
        let ret = [];
        for (let i = 0; i < this.geom_edges.length; ++i) {
            let ge = this.geom_edges[i];
            ret.push(ge);
        }
        return ret;
    }

    /* returns size_t */
    numEdges() {
        return this.geom_edges.length;
    }

    /* returns size_t */
    numNodes() {
        return this.geom_nodes.length;
    }

    /* returns iterator */
    otherEdgesItem(/*Node&*/ n, /*Edge&*/ e) {
        if (n.equals(e.start)) return this.getGeomEdge(e.key).end_edges_item;
        return this.getGeomEdge(e.key).start_edges_item;
    }
};

/* Edge specialization for a polygon edge that associates a
 * GeomEdge with at most two Polygons -- the left and right
 * polygons to the edge.
 * In this challenge the expectation is that every PolyEdge
 * eventually associates two polygons -- i.e. every GeomEdge
 * has Polygons on both its sides.
 */
class PolyEdge {
    // The left and right polygons with respect to geom_edge's direction
    // are the PolyEdge's edge's start and end nodes respectively.
    constructor(/*Edge&*/ e, /*GeomEdge&*/ ge) {
        this.edge = e;
        this.geom_edge = ge; // the geom edge it is the dual edge of
    }
};

/* A node of the dual graph of a GeomGraph */
class Polygon {
    constructor(/*Node&*/ n, /*string*/ nm) {
        this.node = n;
        this.name = nm;
        this.revolution = new trig.Rotation(0.0, 1.0, 0);
    }
};

/* classes used in exporting to/from JSON */
class PolygonExport {
    constructor(/*string*/ nm, /*bool*/ is_interior, /*array of edge keys*/ edge_keys) {
        this.name = nm;
        this.is_interior_poly = is_interior;
        this.edges = edge_keys;
    }
};

class PolyGraphExport {
    constructor() {
        /* array of point coordinates as pairs*/ this.vertices = [];
        /* array of pairs of indices into geom_nodes */
        this.edges = [];
        // Signed indexes into geom_edges. Positive sign means the
        // polygon is on the left geometric side of the edge.
        // Negative sign means it's on the right geometric side.
        // For indexing into geom_edges take the absolut value of
        // the index and subtract one.
        // The order of the edges follows counterclockwise revolution
        // around the polygon.
        // The items in the array are of type PolygonExport
        this.faces= [];
    }
};

/* The dual graph of a GeomGraph
 * Its nodes are Polygons and its edges PolyEdges.
 */
class PolyGraph {
    constructor(/*GeomGraph&*/ geom_graph, /*Graph&*/ graph, polys, poly_edges) {
        this.geom_graph = geom_graph;
        this.g = graph;
        /* Array of Polygon objects */ this.polygons = polys;
        /* Array of PolyEdge objects */  this.poly_edges = poly_edges;
    }

    /* returns Polygon&*/
    getPolygon(/*int*/ key) {
        return this.polygons[key];
    }

    /* returns PolyEdge& */
    getPolyEdge(/*int*/ key) {
        return this.poly_edges[key];
    }
}

class PolygonBuildStep {
    constructor(/*Node&*/ n, /*iterator*/ e) {
        this.node = n;
        this.edge_to_process = e;
    }
};

/* returns string */
function generateName(/*int*/ counter) {
    let ret = '';
    do {
        ret += String.fromCharCode(65 + (counter % 26));
        counter = Math.floor(counter / 26);
    } while (counter > 0);
    return ret;
}

function addPolyEdgeToBackOfPolygon(/*Polygon&*/ poly, /*PolyEdge&*/ e) {
    poly.node.edges.push_back(e.edge);
}

function addPolyEdgeToFrontOfPolygon(/*Polygon&*/ poly, /*PolyEdge&*/ e) {
    poly.node.edges.push_front(e.edge);
}

function addGeometricLeftPolyToPolyEdge(/*Polygon&*/ p, /*PolyEdge&*/ pe) {
    pe.edge.start = p.node;
}

function addGeometricRightPolyToPolyEdge(/*Polygon&*/ p, /*PolyEdge&*/ pe) {
    pe.edge.end = p.node;
}

/* returns pair<Point, Point> */
function getLeftRevolutionDirectedSectionOfPolyEdge(
    /*GeomGraph*/ gg, /*Polygon&*/ p, /*PolyEdge&*/ pe) {
    let ge_start_gn = gg.getGeomNode(pe.geom_edge.edge.start.key);
    let ge_end_gn = gg.getGeomNode(pe.geom_edge.edge.end.key);
    if (pe.edge.start.equals(p.node)) {
        return new pair(ge_start_gn.pos, ge_end_gn.pos); 
    }
    return new pair(ge_end_gn.pos, ge_start_gn.pos);
}

/* The algorithm to build the PolyGraph from a GeomGraph.
 * Has a bunch of helper functions too.
 * At the end the data that was needed only for the building
 * of the PolyGraph can be thrown away together with
 * the PolygonBuilder object.
 */
class PolygonBuilder {
    constructor(/*GeomGraph&*/ geom_graph) {
        this.geom_graph = geom_graph;
        this.g = new Graph();
        /* Array of Polygon objects */ this.polygons = [];
        /* Array of PolyEdge objects */  this.poly_edges =
            new Array(geom_graph.numEdges()).fill(null);
        this.name_counter = 0;
        /*queue<PolygonBuildStep>*/ this.steps = [];

        for (let i = 0; i < geom_graph.numEdges(); ++i) {
            this.g.addUnboundEdge();
        }
    }

    /* returns Polygon& */
    geometricLeftPolygon(/*GeomEdge&*/ ge) {
        if (this.poly_edges[ge.edge.key] == null) return null;
        let poly_node = this.poly_edges[ge.edge.key].edge.start;
        if (poly_node == null) return null;
        return this.polygons[poly_node.key];
    }

    /* returns Polygon& */
    geometricRightPolygon(/*GeomEdge&*/ ge) {
        if (this.poly_edges[ge.edge.key] == null) return null;
        let poly_node = this.poly_edges[ge.edge.key].edge.end;
        if (poly_node == null) return null;
        return this.polygons[poly_node.key];
    }

    /* returns Polygon& */
    outwardLeftPolygon(/*Node&*/ n, /*GeomEdge&*/ ge) {
        if (this.poly_edges[ge.edge.key] == null) return null;
        if (n.equals(ge.edge.start)) return this.geometricLeftPolygon(ge);
        return this.geometricRightPolygon(ge);
    }

    /* returns Polygon& */
    outwardRightPolygon(/*Node&*/ n, /*GeomEdge&*/ ge) {
        if (this.poly_edges[ge.edge.key] == null) return null;
        if (n.equals(ge.edge.start)) return this.geometricRightPolygon(ge);
        return this.geometricLeftPolygon(ge);
    }


    /* returns pair <int, Polygon&>*/
    addPolygon(/*string*/ name) {
        let n = this.g.addNode();
        let gn = new Polygon(n.second, name)
        this.polygons.push(gn);
        return new pair(n.first, gn);
    }

    addPolyEdge(/*GeomEdge&*/ ge) {
        let e = this.g.getEdge(ge.edge.key);
        this.poly_edges[ge.edge.key] = new PolyEdge(e, ge);
    }


    /* returns PolyEdge& */
    saveOutwardRightPolyWithRespectToGeomEdge(/*Node&*/ n, /*GeomEdge&*/ ge,
        /*Polygon&*/ outward_right_poly) {
        if (this.poly_edges[ge.edge.key] == null) {
            this.addPolyEdge(ge);
        }
        let pe = this.poly_edges[ge.edge.key];
        if (n.equals(ge.edge.start)) {
            addGeometricRightPolyToPolyEdge(outward_right_poly, pe);
            return pe;
        }
        addGeometricLeftPolyToPolyEdge(outward_right_poly, pe);
        return pe;
    }

    enqueue(/*Node&*/ node, /*iterator*/ edge_to_process) {
        this.steps.push(new PolygonBuildStep(node, edge_to_process));
    }

    // Moves along the left spans starting from one edge.
    // Builds the right hand side polygon
    buildFromOnePolygonEdge() {
        let start_step = this.steps.shift();
        let step = new PolygonBuildStep(start_step.node, start_step.edge_to_process);
        let outward_right_poly =
            this.outwardRightPolygon(step.node,
                this.geom_graph.getGeomEdge(step.edge_to_process.deref().key));

        if (outward_right_poly == null) {
            outward_right_poly = this.addPolygon(generateName(this.name_counter++)).second;
        }
        else {
            return; // this edge's right side was already processed starting from elsewhere
        }
        do {
            let current_node = step.node;
            let current_edge = step.edge_to_process;
            let other_node = current_edge.deref().otherNode(current_node);
            let other_end_edges_it = this.geom_graph.otherEdgesItem(current_node, current_edge.deref());

            let ge = this.geom_graph.getGeomEdge(current_edge.deref().key);

            let pe = this.saveOutwardRightPolyWithRespectToGeomEdge(current_node, ge, outward_right_poly);
            addPolyEdgeToFrontOfPolygon(outward_right_poly, pe);

            let geom_left_poly_node = pe.edge.start;
            let geom_right_poly_node = pe.edge.end;
            if (geom_left_poly_node == null || geom_right_poly_node == null) {
                // If the one poly is missing then enqueue the 
                // backwards direction which will make the other
                // side poly of it.
                this.enqueue(other_node, other_end_edges_it);
            }

            // Advance along the left span of the other node
            step = new PolygonBuildStep(
                other_node,
                other_end_edges_it.clone().circularAdvancedBy(1)
            );

            // Update revolution
            let other_geom_node = this.geom_graph.getGeomNode(other_node.key);
            let other_ge = this.geom_graph.getGeomEdge(step.edge_to_process.deref().key);
            let out_dir_current = outwardDirFrom(ge, other_geom_node);
            let out_dir_other = outwardDirFrom(other_ge, other_geom_node);
            trig.incrementBy(outward_right_poly.revolution,
                trig.rotationBetweenNormalizedVectors(out_dir_current, out_dir_other));
        } while (!step.node.equals(start_step.node) || !step.edge_to_process.equals(start_step.edge_to_process));

        // If we could not schedule anything that means we have found all the
        // polygons.
    }

    /* returns PolyGraph */
    buildPolygonsFromNode(/*GeomNode&*/ start_node) {
        let it = start_node.node.edges.begin();
        this.enqueue(start_node.node, it);
        while (this.steps.length > 0) {
            this.buildFromOnePolygonEdge();
        }
        return new PolyGraph(this.geom_graph, this.g, this.polygons, this.poly_edges);
    }

    /* returns PolyGraph */
    buildPolygons() {
        return this.buildPolygonsFromNode(this.geom_graph.getGeomNode(0));
    }
}

/* returns PolyGraph */
function importGeomGraphAndBuildPolyGraph(/*GeomGraphExport&*/ ggx) {
    let gg = new GeomGraph();
    for (let i = 0; i < ggx.vertices.length; ++i) {
        let p = ggx.vertices[i];
        gg.addGeomNode(new vector.Point(p[0], p[1]));
    }
    for (let i = 0; i < ggx.edges.length; ++i) {
        let e = ggx.edges[i];
        gg.addGeomEdge(gg.getGeomNode(e[0]),
            gg.getGeomNode(e[1]));
    }
    let pb = new PolygonBuilder(gg);
    let pg = pb.buildPolygons();
    return pg;
}


/* returns PolyGraph */
function importPolyGraph(/*PolyGraphExport&*/ pgx) {
    let g = new Graph();
    let gg = new GeomGraph();
    let pg = new PolyGraph(gg, g, [], []);
    for (let i = 0; i < pgx.vertices.length; ++i) {
        let p = pgx.vertices[i];
        gg.addGeomNode(new vector.Point(p[0], p[1]));
    }
    for (let i = 0; i < pgx.edges.length; ++i) {
        let e = pgx.edges[i];
        let ge = gg.addGeomEdge(gg.getGeomNode(e[0]),
            gg.getGeomNode(e[1]));
        let ue = pg.g.addUnboundEdge();
        pg.poly_edges.push(new PolyEdge(ue.second, ge.second));
    }
    for (let i = 0; i < pgx.faces.length; ++i) {
        let p = pgx.faces[i];
        let n = pg.g.addNode();
        let node = n.second;
        let name = p.name;
        let poly = new Polygon(node, name);
        pg.polygons.push(poly);
        poly.revolution = p.is_interior_poly
            ? trig.innerRevolutionOfNGon(p.edges.length)
            : trig.outerRevolutionOfNGon(p.edges.length);
        for (let j = 0; j < p.edges.length; ++j) {
            let signed_edge_idx = p.edges[j];
            let edge_idx = Math.abs(signed_edge_idx) - 1;
            let e = pg.g.getEdge(edge_idx);
            node.edges.push_back(e);
            if (signed_edge_idx > 0) {
                e.start = node;
            }
            else {
                e.end = node;
            }
        }
    }
    return pg;
}

/* returns bool */
function isInteriorPoly(/*Polygon&*/p) {
    return trig.less_than(p.revolution,
        trig.plus(trig.innerRevolutionOfNGon(p.node.edges.size()),
            new trig.Rotation(0.0, - 1.0, 0) /* accounting for numeric errors */));
}

/* returns PolyGraphExport */
function exportPolyGraph(/*const PolyGraph&*/ poly_graph) {
    let pgx = new PolyGraphExport();
    for (let i = 0; i < poly_graph.geom_graph.numNodes(); ++i) {
        let geom_node = poly_graph.geom_graph.getGeomNode(i);
        pgx.vertices.push([geom_node.pos.x, geom_node.pos.y]);
    }
    for (let i = 0; i < poly_graph.geom_graph.numEdges(); ++i) {
        let geom_edge = poly_graph.geom_graph.getGeomEdge(i);
        pgx.edges.push([geom_edge.edge.start.key,
        geom_edge.edge.end.key]);
    }
    for (let i = 0; i < poly_graph.polygons.length; ++i) {
        let p = poly_graph.polygons[i];
        let edges = [];
        for (let it = p.node.edges.begin();
            it.not_equals(p.node.edges.end()); it.increment()) {
            let e = it.deref();
            let idx = e.key + 1;
            if (e.start.equals(p.node)) {
                edges.push(idx);
            }
            else {
                edges.push(-idx);
            }
        }
        pgx.faces.push(new PolygonExport(
            p.name,
            isInteriorPoly(p),
            edges
        ));
    }
    return pgx;
}

/* returns array of Polygons that contain the point */
function containingPolygonsForPoint(/*PolyGraph*/pg, /*Point*/ pt) {
    let ret = []
    for (let i = 0; i < pg.polygons.length; ++i) {
        let p = pg.polygons[i];
        if (!isInteriorPoly(p)) continue;
        let count_intersections_with_ray_cast = 0;
        for (let it = p.node.edges.begin();
            it.not_equals(p.node.edges.end());
            it.increment()) {
            let e = it.deref();
            let pe = pg.getPolyEdge(e.key);
            let lrds = getLeftRevolutionDirectedSectionOfPolyEdge(pg.geom_graph, p, pe);
            if (vector.eqNormalized(pt, lrds.first) ||
                vector.eqNormalized(pt, lrds.second)) {
                // Force adding the polygon.
                // See comment on vector.rayCastIntersectsSection
                count_intersections_with_ray_cast = 1;
                continue;
            }
            let ray_intersection = vector.rayCastIntersectsSection(pt, lrds.first, lrds.second);
            count_intersections_with_ray_cast += ray_intersection;
        }
        if (count_intersections_with_ray_cast != 0) ret.push(p);
    }
    return ret;
}

module.exports = {
    outwardDirFrom,
    Node,
    Edge,
    Graph,
    GeomNode,
    GeomEdge,
    GeomGraph,
    PolyEdge,
    Polygon,
    PolyGraph,
    PolygonBuilder,
    importGeomGraphAndBuildPolyGraph,
    importPolyGraph,
    isInteriorPoly,
    exportPolyGraph,
    containingPolygonsForPoint
};
