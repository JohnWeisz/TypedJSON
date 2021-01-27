import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../src';
import {isEqual} from './utils/object-compare';

describe('polymorphic abstract classes', () => {
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
        inputs: Array<string>;

        @jsonArrayMember(String)
        outputs: Array<string>;

        constructor() {
            super();
            this.inputs = [];
            this.outputs = [];
        }
    }

    @jsonObject({
        knownTypes: [BigNode, SmallNode],
    })
    class Graph {
        @jsonArrayMember(Node)
        nodes: Array<Node>;

        @jsonMember
        root: Node;

        constructor() {
            this.nodes = [];
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
        const graph = new Graph();

        for (let i = 0; i < 20; i++) {
            let node: Node;

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

                node = bigNode;
            } else {
                const smallNode = new SmallNode();

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

        const json = TypedJSON.stringify(graph, Graph);
        const clone = TypedJSON.parse(json, Graph);

        if (log) {
            console.log('Test: polymorphism with abstract property types...');
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
