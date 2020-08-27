import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../src/typedjson';
import {isEqual} from './utils/object-compare';

describe('polymorphism in nested arrays', () => {
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

    @jsonObject({knownTypes: [BigNode, SmallNode]})
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
        const types = [
            'string',
            'integer',
            'float',
            'boolean',
            'void',
        ];

        return types[Math.floor(Math.random() * types.length)];
    }

    function test(log: boolean) {
        const graph = new Graph();

        for (let i = 0; i < 20; i++) {
            graph.smallItems.push([]);

            for (let j = 0; j < 8; j++) {
                const node = new SmallNode();

                node.name = `smallnode_${i}_${j}`;
                node.inputType = randPortType();
                node.outputType = randPortType();

                graph.smallItems[i].push(node);
            }
        }

        for (let i = 0; i < 20; i++) {
            graph.items.push([]);

            for (let j = 0; j < 8; j++) {
                let node: Node;

                if (Math.random() < 0.25) {
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

                node.name = `node_${i}_${j}`;

                graph.items[i].push(node);
            }
        }

        const json = TypedJSON.stringify(graph, Graph);

        if (log) {
            console.log('Test: polymorphism with nested arrays...');
            console.log(graph);
            console.log(JSON.parse(json));
        }

        const clone = TypedJSON.parse(json, Graph);

        if (log) {
            console.log(clone);
            console.log('Test finished.');
        }

        return isEqual(graph, clone);
    }

    it('should work', () => {
        expect(test(false)).toBeTruthy();
    });
});
