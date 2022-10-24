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

// Edges ordered by rotation from (1, 0)
class GeomNode {
    constructor(/* Node& */ n, /* Point */ p) {
        this.node = n;
        this.pos = p;
    }
};

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

    /* returns reference to array of Edge objects */
    getEdges() {
        return this.geom_edges;
        //    let ret = [];
        //    for (let i = 0; i < this.geom_edges.length; ++i) {
        //        let ge = this.geom_edges[i];
        //        ret.push(ge);
        //    }
        //    return ret;
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

class PolyEdge {
    // The left and right polygons with respect to geom_edge's direction
    // are the PolyEdge's edge's start and end nodes respectively.
    constructor(/*Edge&*/ e, /*GeomEdge&*/ ge) {
        this.edge = e;
        this.geom_edge = ge; // the geom edge it is the dual edge of
    }
};


class Polygon {
    constructor(/*Node&*/ n, /*string*/ nm) {
        this.node = n;
        this.name = nm;
        this.revolution = new trig.Rotation(0.0, 1.0, 0);
    }
};

//struct PolyGraphExport {
//    struct PolygonExport {
//        std::string name;
//        bool is_interior_poly;
//        std:: vector < int > edges;
//    };
//    std:: vector < std:: pair < double, double >> geom_nodes;
//    // indexes into geom_nodes
//    std:: vector < std:: pair < size_t, size_t >> geom_edges;
//    // signed indexes into geom_edges. Positive sign means the
//    // polygon is on the left geometric side of the edge.
//    // Negative sign means it's on the right geometric side.
//    // For indexing into geom_edges take the absolut value of
//    // the index and subtract one.
//    // The order of the edges follows counterclockwise revolution
//    // around the polygon.
//    std:: vector < PolygonExport > polygons;
//};

//std:: ostream & operator << (std:: ostream & os, const PolyGraphExport& pge);

class PolyGraph {
    constructor(/*GeomGraph&*/ geom_graph) {
        this.geom_graph = geom_graph;
        this.g = new Graph();
        /* Array of Polygon objects */ this.polygons = [];
        /* Array of PolyEdge objects */  this.poly_edges = [];
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

//struct DualGraph {
//    GeomGraph geom_graph;
//    PolyGraph poly_graph{ geom_graph };
//};

//DualGraph importDualGraph(const PolyGraphExport& pgx);

//PolyGraphExport exportPolyGraph(const PolyGraph& poly_graph);

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
        counter /= 26;
    } while (counter > 0);
    return ret;
}

function addPolyEdgeToBackOfPolygon(/*Polygon&*/ poly, /*PolyEdge&*/ e) {
    poly.node.edges.push(e.edge);
}

function addPolyEdgeToFrontOfPolygon(/*Polygon&*/ poly, /*PolyEdge&*/ e) {
    poly.node.edges.unshift(e.edge);
}

function addGeometricLeftPolyToPolyEdge(/*Polygon&*/ p, /*PolyEdge&*/ pe) {
    pe.edge.start = p.node;
}

function addGeometricRightPolyToPolyEdge(/*Polygon&*/ p, /*PolyEdge&*/ pe) {
    pe.edge.end = p.node;
}

class PolygonBuilder {
    constructor(/*GeomGraph&*/ geom_graph) {
        this.geom_graph = geom_graph;
        this.g = new Graph();
        /* Array of Polygon objects */ polygons = [];
        /* Array of PolyEdge objects */  poly_edges = new Array(geom_graph.numEdges()).fill(null);
        this.name_counter = 0;
        /*queue<PolygonBuildStep>*/ steps = [];
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
        this.steps.push(node, edge_to_process);
    }

    // Moves along the left spans starting from one edge.
    // Builds the right hand side polygon
    buildFromOnePolygonEdge() {
        let start_step = steps.shift();
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
            let other_node = current_edge.otherNode(current_node);
            let other_end_edges_it = this.geom_graph.otherEdgesItem(current_node, current_edge);

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
            outward_right_poly.revolution.increaseBy(
                trig.rotationBetweenNormalizedVectors(out_dir_current, out_dir_other));
        } while (!step.node.equals(start_step.node) || !step.edge_to_process.equals(start_step.edge_to_process));

        // If we could not schedule anything that means we have found all the
        // polygons.
    }

    /* returns PolyGraph */
    buildPolygons(/*GeomNode&*/ start_node) {
        let it = start_node.node.edges.begin();
        this.enqueue(start_node.node, it);
        while (steps.length > 0) {
            this.buildFromOnePolygonEdge();
        }
        return new PolyGraph(geom_graph, g, polygons, poly_edges);
    }

    /* returns PolyGraph */
    buildPolygons() {
        return this.buildPolygons(this.geom_graph.getGeomNode(0));
    }
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
    PolygonBuilder
};
