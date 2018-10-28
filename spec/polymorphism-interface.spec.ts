import {isEqual} from "./utils/object-compare";
import {jsonObject, jsonMember, jsonArrayMember, TypedJSON} from "../js/typedjson";

interface Point {
    x: number;
    y: number;
}

@jsonObject
class SmallNode implements Point {
    @jsonMember
    x: number;

    @jsonMember
    y: number;

    @jsonMember
    inputType: string;

    @jsonMember
    outputType: string;
}

@jsonObject
class BigNode implements Point {
    @jsonMember
    x: number;

    @jsonMember
    y: number;

    @jsonArrayMember(String)
    inputs: string[];

    @jsonArrayMember(String)
    outputs: string[];

    constructor() {
        this.inputs = [];
        this.outputs = [];
    }
}

@jsonObject({
    knownTypes: [BigNode, SmallNode]
})
class GraphGrid {
    @jsonArrayMember(Object)
    points: Point[];

    @jsonMember
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

    var json = TypedJSON.stringify(graph, GraphGrid);
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

describe('polymorphic interfaces', function() {
    it('should work', function () {
        expect(test(false)).toBeTruthy();
    });
});
