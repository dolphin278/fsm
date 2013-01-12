var assert = require('assert');
var FSM = require('../lib/FSM');
var machine = require('./machine.json');

var routerLog = {};

var routerFunc = function (edge, callback) {
    routerLog[edge.name] = (routerLog[edge.name] || 0) + 1;
    callback(null, true);
};

describe('FSM', function () {
    var fsm;
    before(function () {
        fsm = new FSM(machine, routerFunc);
    });
    it('should be created', function () {
        assert(fsm);
        assert(fsm instanceof FSM, JSON.stringify(fsm));
        assert(fsm.graph);
        assert(fsm.graph.edges);
        assert(fsm.graph.nodes);
        assert(fsm.currentState);
        assert.equal(fsm.currentState, machine.currentState);
        assert(fsm.data.someData === "someDataValue");
    });

    describe('when requesting available edges', function () {
        var edges;
        before(function () {
            edges = fsm.availableEdges();
        });
        it('should return two states - B and C', function () {
            assert(Array.isArray(edges));
            assert(edges.length === 2);
            assert(edges.some(function (item) {
                return item.to === "B";
            }));
            assert(edges.some(function (item) {
                return item.to === "C";
            }));
        });
        
        describe('when attempting to follow an edge', function () {
            before(function (done) {
                fsm.follow(edges[0].name, done);
            });

            it('should invoke router func', function () {
                assert(routerLog['AB'] > 0);
            });

            it('should change currentState', function () {
                assert(fsm.currentState === "B");
            });
        });
    });

});
