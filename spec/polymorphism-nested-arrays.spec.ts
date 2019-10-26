import {isEqual} from "./utils/object-compare";
import {jsonObject, jsonMember, jsonArrayMember, TypedJSON} from "../src/typedjson";

abstract class Node {
    @jsonMember
    name: string;
}

@jsonObject
class SmallNode extends Node {
    @jsonMember
    inputType: string;

    @jsonMember
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

@jsonObject({ knownTypes: [BigNode, SmallNode] })
class Graph {
    @jsonArrayMember(Node, {dimensions: 2})
    items: Array<Array<Node>>;

    @jsonArrayMember(SmallNode, {dimensions: 2})
    smallItems: Array<Array<SmallNode>>;

    constructor() {
        this.items = [];
        this.smallItems = [];
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
        graph.smallItems.push([]);

        for (var j = 0; j < 8; j++) {
            let node = new SmallNode();

            node.name = `smallnode_${i}_${j}`;
            node.inputType = randPortType();
            node.outputType = randPortType();

            graph.smallItems[i].push(node);
        }
    }

    for (var i = 0; i < 20; i++) {
        graph.items.push([]);

        for (var j = 0; j < 8; j++) {
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

            node.name = `node_${i}_${j}`;

            graph.items[i].push(node);
        }
    }

    var json = TypedJSON.stringify(graph, Graph);

    if (log) {
        console.log("Test: polymorphism with nested arrays...");
        console.log(graph);
        console.log(JSON.parse(json));
    }

    var clone = TypedJSON.parse(json, Graph);

    if (log) {
        console.log(clone);
        console.log("Test finished.");
    }

    return isEqual(graph, clone);
}

describe('polymorphism in nested arrays', function() {
    it('should work', function () {
        expect(test(false)).toBeTruthy();
    });
});
