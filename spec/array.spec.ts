import {jsonObject, jsonMember, jsonArrayMember, TypedJSON} from "../js/typedjson";
import { Everything, IEverything } from "./utils/everything";
import { clone } from "./utils/poorsman-clone";

describe('array of objects', function () {
    @jsonObject
    class Simple {
        @jsonMember
        strProp: string;

        @jsonMember
        numProp: number;

        constructor(init: {strProp: string, numProp: number})
        constructor()
        constructor(init?: {strProp: string, numProp: number}) {
            if (init) {
                this.strProp = init.strProp;
                this.numProp = init.numProp;
            }
        }

        public foo() {
            return `${this.strProp}-${this.numProp}`;
        }
    }

    it('deserializes empty array', function () {
        const result = TypedJSON.parseAsArray('[]', Simple);
        expect(result).toBeDefined();
        expect(result.length).toBe(0);
    });

    it('serialized empty array', function () {
        const result = TypedJSON.stringifyAsArray([], Simple);
        expect(result).toBe('[]');
    });

    it('deserialized should be of proper type', function () {
        const expectation = [
            { strProp: 'delta', numProp: 4 },
            { strProp: 'bravo', numProp: 2 },
            { strProp: 'gamma', numProp: 0 },
        ];

        const result = TypedJSON.parseAsArray(JSON.stringify(expectation), Simple);

        expect(result.length).toBe(3, 'Deserialized array is of wrong length');
        result.forEach((obj, index) => {
            expect(obj instanceof Simple).toBeTruthy(`${index} was not of type Simple`);
            expect(obj).toHaveProperties(expectation[index], '${index} was deserialized incorrectly');
        });
    });

    it('serialized should contain all elements', function () {
        const expectation = [
            { strProp: 'delta', numProp: 4 },
            { strProp: 'bravo', numProp: 2 },
            { strProp: 'gamma', numProp: 0 },
        ];

        const result = TypedJSON.stringifyAsArray(expectation.map(obj => new Simple(obj)), Simple);

        expect(result).toBe(JSON.stringify(expectation));
    });
});

describe('multidimensional arrays', function () {
    interface IWithArrays {
        one: IEverything[];
        two: IEverything[][];
        deep: IEverything[][][][][][];
        arrayWithArray?: IWithArrays[][];
    }

    @jsonObject
    class WithArrays implements IWithArrays {
        @jsonArrayMember(Everything)
        one: Everything[];

        @jsonArrayMember(Everything, {dimensions: 2})
        two: Everything[][];

        @jsonArrayMember(Everything, {dimensions: 6})
        deep: Everything[][][][][][];

        @jsonArrayMember(WithArrays, {dimensions: 2})
        arrayWithArray?: WithArrays[][];

        constructor(init: IWithArrays)
        constructor()
        constructor(init?: IWithArrays) {
            if (init) {
                Object.assign(this, init);
            }
        }
    }

    function createTestObject(expected: true): WithArrays;
    function createTestObject(expected: false): IWithArrays;
    function createTestObject(expected: boolean): IWithArrays;
    function createTestObject(expected: boolean): IWithArrays {
        const nested = {
            one: [
                expected ? Everything.expected() : Everything.create(),
                expected ? Everything.expected() : Everything.create(),
            ],
            two: [
                [],
                [],
            ],
            deep: [[[[]]]],
        };

        const result = {
            one: [
                expected ? Everything.expected() : Everything.create(),
                expected ? Everything.expected() : Everything.create(),
            ],
            two: [
                [ expected ? Everything.expected() : Everything.create() ],
                [ expected ? Everything.expected() : Everything.create() ],
                [],
                [],
            ],
            deep: [[[[
                [],
                [[ expected ? Everything.expected() : Everything.create() ]],
            ]]]],
            arrayWithArray: [
                [],
                [expected ? new WithArrays(nested) : nested],
            ],
        };

        return expected ? new WithArrays(result) : result;
    }

    function createTestArray(expected: boolean): IWithArrays[][] {
        return [
            [],
            [
                createTestObject(expected),
                createTestObject(expected),
            ],
            [],
            [
                createTestObject(expected),
            ],
        ]
    }

    it('deserializes', function () {
        const result = TypedJSON.parseAsArray(JSON.stringify(createTestArray(false)), WithArrays, undefined, 2);

        expect(result).toBeOfLength(4);
        expect(result[0]).toBeOfLength(0);
        expect(result[1]).toBeOfLength(2);
        expect(result[1][0]).toEqual(createTestObject(true));
        expect(result[1][1]).toEqual(createTestObject(true));
        expect(result[2]).toBeOfLength(0);
        expect(result[3]).toBeOfLength(1);
        expect(result[3][0]).toEqual(createTestObject(true));
    });

    it('serializes', function () {
        const result = TypedJSON.stringifyAsArray(createTestArray(true), WithArrays, 2);

        expect(result).toBe(JSON.stringify(createTestArray(false)));
    });
});
