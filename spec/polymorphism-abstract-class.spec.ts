import {isEqual} from "./object-compare";
import {TypedJSON, jsonObject, jsonMember, jsonArrayMember} from "../src/typedjson";

abstract class Node {
    @jsonMember({constructor: String})
    name: string;
}

@jsonObject
class SmallNode extends Node {
    @jsonMember({constructor: String})
    inputType: string;

    @jsonMember({constructor: String})
    outputType: string;
}

@jsonObject
class BigNode extends Node {
    @jsonArrayMember(String)
    inputs: string[];

    @jsonArrayMember(String)
    outputs: string[];

    constructor() {
        super();
        this.inputs = [];
        this.outputs = [];
    }
}

@jsonObject({
    knownTypes: [BigNode, SmallNode]
})
class Graph {
    @jsonArrayMember(Node)
    nodes: Node[];

    @jsonMember({ constructor: Node })
    root: Node;

    constructor() {
        this.nodes = [];
    }
}

function randPortType() {
    var types = [
        "string",
        "integer",
        "float",
        "boolean",
        "void"
    ];

    return types[Math.floor(Math.random() * types.length)];
}

export function test(log: boolean) {
    var graph = new Graph();
    
    for (var i = 0; i < 20; i++) {
        let node: Node;

        if (Math.random() < 0.25) {
            let bigNode = new BigNode();
            
            bigNode.inputs = [
                randPortType(),
                randPortType(),
                randPortType()
            ];
            bigNode.outputs = [
                randPortType(),
                randPortType()
            ];

            node = bigNode;
        } else {
            let smallNode = new SmallNode();

            smallNode.inputType = randPortType();
            smallNode.outputType = randPortType();

            node = smallNode;
        }

        node.name = `node_${i}`;

        if (i === 0) {
            graph.root = node;
        } else {
            graph.nodes.push(node);
        }
    }

    var json = TypedJSON.stringify(graph, Graph);
    var clone = TypedJSON.parse(json, Graph);

    if (log) {
        console.log("Test: polymorphism with abstract property types...");
        console.log(graph);
        console.log(JSON.parse(json));
        console.log(clone);
        console.log("Test finished.");
    }

    return isEqual(graph, clone);
}

describe('polymorphic abstract classes', function() {
    it('should work', function () {
        expect(test(false)).toBeTruthy();
    });
});
