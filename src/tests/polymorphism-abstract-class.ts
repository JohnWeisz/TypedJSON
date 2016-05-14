import {isEqual} from "./object-compare";
import {TypedJSON, JsonObject, JsonMember} from "../typed-json";

abstract class Node {
    @JsonMember
    name: string;
}

@JsonObject
class SmallNode extends Node {
    @JsonMember
    inputType: string;

    @JsonMember
    outputType: string;
}

@JsonObject
class BigNode extends Node {
    @JsonMember({ elements: String })
    inputs: string[];

    @JsonMember({ elements: String })
    outputs: string[];

    constructor() {
        super();
        this.inputs = [];
        this.outputs = [];
    }
}

@JsonObject({
    knownTypes: [BigNode, SmallNode]
})
class Graph {
    @JsonMember({ elements: Node, refersAbstractType: true })
    nodes: Node[];

    @JsonMember({ refersAbstractType: true })
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

    TypedJSON.config({
        enableTypeHints: true
    });

    var json = TypedJSON.stringify(graph);
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
