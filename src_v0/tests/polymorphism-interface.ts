import {isEqual} from "./object-compare";
import {JsonObject, JsonMember, TypedJSON} from "../typed-json";

interface Point {
    x: number;
    y: number;
}

@JsonObject
class SmallNode implements Point {
    @JsonMember
    x: number;

    @JsonMember
    y: number;

    @JsonMember
    inputType: string;

    @JsonMember
    outputType: string;
}

@JsonObject
class BigNode implements Point {
    @JsonMember
    x: number;

    @JsonMember
    y: number;

    @JsonMember({ elements: String })
    inputs: string[];

    @JsonMember({ elements: String })
    outputs: string[];

    constructor() {
        this.inputs = [];
        this.outputs = [];
    }
}

@JsonObject({
    knownTypes: [BigNode, SmallNode]
})
class GraphGrid {
    @JsonMember({ elements: Object, refersAbstractType: true })
    points: Point[];

    @JsonMember({ refersAbstractType: true })
    root: Point;

    constructor() {
        this.points = [];
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
    var graph = new GraphGrid();

    for (var i = 0; i < 20; i++) {
        let point: Point;

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

            point = bigNode;
        } else {
            let smallNode = new SmallNode();

            smallNode.inputType = randPortType();
            smallNode.outputType = randPortType();

            point = smallNode;
        }

        point.x = Math.random();
        point.y = Math.random();

        if (i === 0) {
            graph.root = point;
        } else {
            graph.points.push(point);
        }
    }

    TypedJSON.config({
        enableTypeHints: true
    });

    var json = TypedJSON.stringify(graph);
    var clone = TypedJSON.parse(json, GraphGrid);

    if (log) {
        console.log("Test: polymorphism with interface property types...");
        console.log(graph);
        console.log(JSON.parse(json));
        console.log(clone);
        console.log("Test finished.");
    }

    return isEqual(graph, clone);
}
