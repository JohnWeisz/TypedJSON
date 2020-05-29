import { ArrayT, SetT, jsonObject, jsonMember, TypedJSON, jsonSetMember } from "../src/typedjson";
import { Everything } from "./utils/everything";

describe('set of objects', function () {
    @jsonObject
    class Simple {
        @jsonMember
        strProp: string;

        @jsonMember
        numProp: number;

        constructor(init: { strProp: string, numProp: number })
        constructor()
        constructor(init?: { strProp: string, numProp: number }) {
            if (init) {
                this.strProp = init.strProp;
                this.numProp = init.numProp;
            }
        }

        public foo() {
            return `${this.strProp}-${this.numProp}`;
        }
    }

    it('deserializes empty set', function () {
        const result = TypedJSON.parseAsSet('[]', Simple);
        expect(result).toBeDefined();
        expect(result.size).toBe(0);
    });

    it('serialized empty set', function () {
        const result = TypedJSON.stringifyAsSet(new Set<Simple>(), Simple);
        expect(result).toBe('[]');
    });

    it('deserialized should be of proper type', function () {
        const expectation = [
            {strProp: 'delta', numProp: 4},
            {strProp: 'bravo', numProp: 2},
            {strProp: 'gamma', numProp: 0},
        ];

        const result = TypedJSON.parseAsSet(JSON.stringify(expectation), Simple);

        expect(result.size).toBe(3, 'Deserialized set is of wrong size');
        result.forEach((obj) => {
            expect(obj).toBeInstanceOf(Simple);
            expect(obj).toHaveProperties(expectation.find((expected) => expected.strProp === obj.strProp));
        });
    });

    it('serialized should contain all elements', function () {
        const expectation = [
            {strProp: 'delta', numProp: 4},
            {strProp: 'bravo', numProp: 2},
            {strProp: 'gamma', numProp: 0},
        ];

        const result = TypedJSON.stringifyAsSet(new Set<Simple>(expectation.map(obj => new Simple(obj))), Simple);

        expect(result).toBe(JSON.stringify(expectation));
    });
});

describe('set member', function () {
    @jsonObject
    class WithSet {
        @jsonSetMember(Everything)
        prop: Set<Everything>;

        public getSetSize() {
            return this.prop.size;
        }
    }

    it('deserializes', function () {
        const result = TypedJSON.parse(JSON.stringify({prop: [Everything.create(), Everything.create()]}), WithSet);

        expect(result).toBeInstanceOf(WithSet);
        expect(result.prop).toBeDefined();
        expect(result.prop).toBeInstanceOf(Set);
        expect(result.prop.size).toBe(2);
        expect(result.getSetSize()).toBe(2);
        expect(Array.from(result.prop)).toEqual([Everything.expected(), Everything.expected()]);
    });

    it('serializes', function () {
        const object = new WithSet();
        object.prop = new Set<Everything>([Everything.expected(), Everything.expected()]);
        const result = TypedJSON.stringify(object, WithSet);

        expect(result).toBe(JSON.stringify({prop: [Everything.create(), Everything.create()]}));
    });
});

describe('set array member', function () {
    @jsonObject
    class Simple {
        @jsonMember
        strProp: string;

        @jsonMember
        numProp: number;

        constructor(init: { strProp: string, numProp: number })
        constructor()
        constructor(init?: { strProp: string, numProp: number }) {
            if (init) {
                this.strProp = init.strProp;
                this.numProp = init.numProp;
            }
        }

        public foo() {
            return `${this.strProp}-${this.numProp}`;
        }
    }

    @jsonObject
    class WithSet {
        @jsonMember({constructor: SetT(ArrayT(Simple))})
        prop: Set<Simple[]>;

        public getSetSize() {
            return this.prop.size;
        }
    }

    it('deserializes', function () {
        const result = TypedJSON.parse(JSON.stringify(
            {prop: [
                    [
                        {strProp: 'delta', numProp: 4},
                        {strProp: 'bravo', numProp: 2},
                        {strProp: 'gamma', numProp: 0},
                    ],
                    [
                        {strProp: 'alpha', numProp: 3245},
                        {strProp: 'zeta', numProp: 4358},
                    ]
                ]
            }),
            WithSet);

        expect(result).toBeInstanceOf(WithSet);
        expect(result.prop).toBeDefined();
        expect(result.prop).toBeInstanceOf(Set);
        expect(result.prop.size).toBe(2);
        expect(result.getSetSize()).toBe(2);
        expect(Array.from(result.prop)).toEqual([
            [
                new Simple({strProp: 'delta', numProp: 4}),
                new Simple({strProp: 'bravo', numProp: 2}),
                new Simple({strProp: 'gamma', numProp: 0}),
            ],
            [new Simple({strProp: 'alpha', numProp: 3245}), new Simple({strProp: 'zeta', numProp: 4358})],
        ])
    });

    it('serializes', function () {
        const object = new WithSet();
        object.prop = new Set<Simple[]>([
            [new Simple({strProp: 'delta', numProp: 4})],
            [new Simple({strProp: 'alpha', numProp: 3245}), new Simple({strProp: 'zeta', numProp: 4358})],
        ]);
        const result = TypedJSON.stringify(object, WithSet);

        expect(result).toBe(JSON.stringify({prop: [[{strProp: 'delta', numProp: 4}], [{strProp: 'alpha', numProp: 3245}, {strProp: 'zeta', numProp: 4358}]]}));
    });
});

describe('set of raw objects', function () {
    @jsonObject
    class WithRawSet {
        @jsonSetMember(Object)
        rawSet: Set<any>;
    }

    function rawObjects() {
        return [
            {
                "prop": "something",
            },
            {
                "another": "value",
            },
        ];
    }

    it('should deserialize as is', function () {
        const withRawSet = TypedJSON.parse({"rawSet": rawObjects()}, WithRawSet);
        expect(withRawSet).toBeDefined();
        expect(withRawSet instanceof WithRawSet).toBeTruthy();
        expect(withRawSet.rawSet).toEqual(new Set(rawObjects()));
    });

    it('should serialize as is', function () {
        const withRawSet = new WithRawSet();
        withRawSet.rawSet = new Set(rawObjects());
        const json = TypedJSON.toPlainJson(withRawSet, WithRawSet);
        expect(json).toEqual({rawSet: rawObjects()});
    });
});
