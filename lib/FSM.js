var EventEmitter = require('events').EventEmitter;
var util = require('util');
var JSV = require('JSV').JSV;
var JSONvalidator = JSV.createEnvironment();

var Graph = require('node-graph');

var schema = require('../schema/machine.json');

function FSM(spec, routerFunc) {
    EventEmitter.call(this);

    var report = JSONvalidator.validate(spec, schema);
    if (report.errors.length > 0) {
        return report.errors;
    }

    var graph = new Graph({
        nodes: spec.nodes,
        edges: spec.edges
    });

    if (!(graph instanceof Graph)) {
        return graph;
    }
    this.nodes = spec.nodes;
    this.edges = spec.edges;

    if (!graph.getNode(spec.currentState)) {
        return new Error('currentState should be amongst of all fsm states');
    }
    this.currentState = spec.currentState;

    if (typeof routerFunc !== "function") {
        return new Error('second argument should be a function');
    }
    this.routerFunc = routerFunc.bind(this);

    this.data = spec.data;
}

util.inherits(FSM, EventEmitter);

// Returns array of edges objects that can be followed
// (means they lead out of current state)
FSM.prototype.availableEdges = function () {
    var graph = this.getGraph();
    return graph.outboundEdges(this.currentState);
};

// Attempt to follow edge, specified by edge name
FSM.prototype.follow = function (edgeName, requestData, callback) {
    var self = this;
    var edge = this.availableEdges().filter(function (edge) {
            return edgeName === edge.name;
        })[0],
        graph = this.getGraph(),
        _callback;


    if (typeof requestData === "function") {
        _callback = requestData;
        requestData = null;
    } else {
        _callback = callback;
    }

        //     _callback = (typeof requestData === "function") ? requestData : callback,
        // requestData = requestData || null;


    if (!edge) {
        _callback(new Error('edge you try to follow is not available')); 
    }

    function onRouterFinishes(err, status) {
        if (err) {
            return _callback(err);
        }
        if (status) {
            self.currentState = edge.to;
            self.emit('state', edge);
            if (graph.isTerminalNode(self.currentState)) {
                self.emit('terminal', edge);
            }
        }
        _callback(err, status);
    }
    self.routerFunc(edge, requestData, onRouterFinishes);
};

FSM.prototype.getGraph = function () {
    return new Graph({
        nodes: this.nodes,
        edges: this.edges
    });
}

module.exports = FSM;
