var assert = require('assert');
var FSM = require('../lib/FSM');
var machine = require('./machine.json');
var Graph = require('node-graph');

var routerLog = {},
    requestDataLog = {};

var routerFunc = function (edge, requestData, callback) {
    routerLog[edge.name] = (routerLog[edge.name] || 0) + 1;
    requestDataLog[edge.name] = requestData;
    callback(null, true);
};


describe('FSM', function () {
    var fsm;
    var eventsStateLog = {};
    var eventsTerminalLog = {};
    before(function () {
        fsm = new FSM(machine, routerFunc);
    });
    it('should be created', function () {
        assert(fsm);
        assert(fsm instanceof FSM, JSON.stringify(fsm));
        assert(fsm);
        assert(fsm.edges);
        assert(fsm.nodes);
        assert(fsm.currentState);
        assert.equal(fsm.currentState, machine.currentState);
        assert(fsm.data.someData === "someDataValue");

        fsm.on('state', function (edge) {
            eventsStateLog[edge.from + edge.to] = (eventsStateLog[edge.from + edge.to] || 0) + 1;
        });

        fsm.on('terminal', function (edge) {
            eventsTerminalLog[edge.from + edge.to] = (eventsTerminalLog[edge.from + edge.to] || 0) + 1;
        })

        var graph = fsm.getGraph();
        assert(graph instanceof Graph);
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
        
        describe('when attempting to follow an edge AB', function () {
            before(function (done) {
                fsm.follow(edges[0].name, done);
            });

            it('should invoke router func', function () {
                assert(routerLog['AB'] > 0);
            });

            it('should change currentState', function () {
                assert(fsm.currentState === "B");
            });

            it('should emit "state" event', function () {
                assert(eventsStateLog["AB"] >  0);
            });

            describe('when attempting to follow edge BD passing own data', function () {
                var rData = { someData:"1" };
                before(function (done) {
                    fsm.follow("BD", done);
                });

                it('should emit "terminal" event', function () {
                    assert(eventsTerminalLog["BD"] > 0);
                });

                // it('should pass request data', function () {
                //     assert.deepEqual(requestDataLog["BD"], rData);
                // });
            });
        });
    });

});
