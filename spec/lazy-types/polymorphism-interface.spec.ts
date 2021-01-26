import {AnyT, jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../../src';
import {isEqual} from '../utils/object-compare';

describe('lazy, polymorphic interfaces', () => {
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

        @jsonArrayMember(() => String)
        inputs: Array<string>;

        @jsonArrayMember(() => String)
        outputs: Array<string>;

        constructor() {
            this.inputs = [];
            this.outputs = [];
        }
    }

    @jsonObject({
        knownTypes: [BigNode, SmallNode],
    })
    class GraphGrid {
        @jsonArrayMember(() => AnyT)
        points: Array<Point>;

        @jsonMember
        root: Point;

        constructor() {
            this.points = [];
        }
    }

    let portTypeIndex = 0;

    function randPortType() {
        const types = [
            'string',
            'integer',
            'float',
            'boolean',
            'void',
        ];

        return types[portTypeIndex++ % types.length];
    }

    function test(log: boolean) {
        const graph = new GraphGrid();

        for (let i = 0; i < 20; i++) {
            let point: Point;

            if (i % 2 === 0) {
                const bigNode = new BigNode();

                bigNode.inputs = [
                    randPortType(),
                    randPortType(),
                    randPortType(),
                ];
                bigNode.outputs = [
                    randPortType(),
                    randPortType(),
                ];

                point = bigNode;
            } else {
                const smallNode = new SmallNode();

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

        const json = TypedJSON.stringify(graph, GraphGrid);
        const clone = TypedJSON.parse(json, GraphGrid);

        if (log) {
            console.log('Test: polymorphism with interface property types...');
            console.log(graph);
            console.log(JSON.parse(json));
            console.log(clone);
            console.log('Test finished.');
        }

        return isEqual(graph, clone);
    }

    it('should work', () => {
        expect(test(false)).toBeTruthy();
    });
});
