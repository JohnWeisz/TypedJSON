import {isEqual} from "./object-compare";
import {JsonObject, JsonMember, TypedJSON} from "../typed-json";

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

@JsonObject({ knownTypes: [BigNode, SmallNode] })
class Graph {
    @JsonMember({ elements: { elements: Node } })
    items: Array<Array<Node>>;

    @JsonMember({ elements: { elements: SmallNode } })
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

    TypedJSON.config({
        enableTypeHints: true
    });
    
    var json = TypedJSON.stringify(graph);

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