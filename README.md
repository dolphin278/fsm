fsm
===

Finite State Machine library
Uses [node-graph](https://github.com/dolphin278/graph) to work with state graph.

Meanwhile, you can look at `test/test.js` to see usage example.

## Installation

```npm install node-fsm```

## Usage

###new FSM(machineSpec, routerFunc)

`machineSpec` should contain state graph (`nodes` and `edges` like in `node-graph`). Additional properties are `currentState` that contains name of current machine state. `data` contains your arbitrary data tied with fsm.

`routerFunc(edge, callback)` is async function that checks, whether we made our transition successfully, or not. First argument is an `edge` object represents state graph edge we attempt to follow (hint: here you can process any arbitrary data you put on edge object in state graph). At the `routerFunc` completion you should call `callback`, passing `err` object, if you encountered any errors, and boolean variable that indicates whether we made transition or not.
`routerFunc` is bound to fsm instance, so you can use `this` variable to access machine object.

```
var machineSpec = {
    nodes: [
        {
            name: 'A'
        },
        {
            name: 'B',
            youCanPutArbitraryDataOnYourNodes: { ... }
        }
    ],
    edges: [
        {
            name: 'A->B',
            from: 'A',
            to: 'B',
            youCanPutArbitraryDataOnYourEdgesToo: { ... }
        }
    ],
    currentState: 'A',
    data: { … }
}

var routerFunc = function (edge, callback) {
    // Make any external calls to determine,
    // whether our transition is succesfull or not
    // …
    callback(null, true);
}

var fsm = new FSM(machineSpec, routerFunc);
```

###availableEdges()

Returns array of edges, that can be followed from current machine state.

```
    var edges = fsm.availableEdges();
    
    // Returns:
    [
        {
            name: 'A->B',
            from: 'A',
            to: 'B',
            youCanPutArbitraryDataOnYourEdgesToo: { ... }
        }
    ]
```

###follow(edgeName, callback)

Attempt to change machine state following edge specified by `edgeName`.
Callback should take two arguments `(err, status)`, where `err` will contain any errors encountered during attempt to change state, and `status` will contain boolean value indication whether attempt was successful, or not.

###getGraph()

Returns instance of `node-graph` Graph object that you could use to navigate across fsm state graph. See docs for node-graph for methods reference.

## Events

## emit('state', edge)

When we successfully made a transition to a new state, fsm instance emits 'state' event, passing edge we followed as argument.
While edge object contains both `from` and `to` fields, you can figure out, what was previous state.

## emit('terminal', edge)

When we successfully made a transition to a new state, and this state is terminal (there is no edges outbound for current state) fsm instance emits 'terminal' event, passing edge we followed as argument.
