import {ArrayT, jsonMapMember} from '../src';
import {jsonMember} from '../src/json-member';
import {jsonObject} from '../src/json-object';
import {TypedJSON} from '../src/parser';
import {MapShape} from '../src/type-descriptor';

describe('map dictionary shape', () => {
    @jsonObject
    class Simple {
        @jsonMember
        strProp: string;

        @jsonMember
        numProp: number;

        constructor(init?: {strProp: string; numProp: number}) {
            if (init !== undefined) {
                this.strProp = init.strProp;
                this.numProp = init.numProp;
            }
        }

        foo() {
            return `${this.strProp}-${this.numProp}`;
        }
    }

    @jsonObject
    class DictMap {
        @jsonMapMember(() => String, () => Simple, {shape: MapShape.OBJECT})
        prop: Map<String, Simple>;

        getSetSize() {
            return this.prop.size;
        }
    }

    it('deserializes', () => {
        const result = TypedJSON.parse(
            JSON.stringify(
                {
                    prop: {
                        one: {strProp: 'delta', numProp: 4},
                        two: {strProp: 'gamma', numProp: 7},
                    },
                },
            ),
            DictMap,
        );

        expect(result).toBeInstanceOf(DictMap);
        expect(result.prop).toBeDefined();
        expect(result.prop).toBeInstanceOf(Map);
        expect(result.prop.size).toBe(2);
        expect(result.getSetSize()).toBe(2);
        expect(result.prop.get('one').strProp).toBe('delta');
        expect(result.prop.get('two').strProp).toBe('gamma');
    });

    it('serializes', () => {
        const object = new DictMap();
        object.prop = new Map<string, Simple>([
            ['one', new Simple({strProp: 'delta', numProp: 4})],
            ['two', new Simple({strProp: 'gamma', numProp: 7})],
        ]);
        const result = TypedJSON.stringify(object, DictMap);

        expect(result).toBe(JSON.stringify({
            prop: {
                one: {strProp: 'delta', numProp: 4},
                two: {strProp: 'gamma', numProp: 7},
            },
        }));
    });
});

describe('map of array dictionary shape', () => {
    @jsonObject
    class Simple {
        @jsonMember
        strProp: string;

        @jsonMember
        numProp: number;

        constructor(init?: {strProp: string; numProp: number}) {
            if (init !== undefined) {
                this.strProp = init.strProp;
                this.numProp = init.numProp;
            }
        }

        foo() {
            return `${this.strProp}-${this.numProp}`;
        }
    }

    @jsonObject
    class DictArrayMap {
        @jsonMapMember(() => String, () => ArrayT(Simple), {shape: MapShape.OBJECT})
        prop: Map<String, Array<Simple>>;

        getSetSize() {
            return this.prop.size;
        }
    }

    it('deserializes', () => {
        const result = TypedJSON.parse(
            JSON.stringify(
                {
                    prop: {
                        one: [{strProp: 'delta', numProp: 4}],
                        two: [{strProp: 'gamma', numProp: 7}, {strProp: 'alpha', numProp: 2}],
                    },
                },
            ),
            DictArrayMap,
        );

        expect(result).toBeInstanceOf(DictArrayMap);
        expect(result.prop).toBeDefined();
        expect(result.prop).toBeInstanceOf(Map);
        expect(result.prop.size).toBe(2);
        expect(result.getSetSize()).toBe(2);
        expect(result.prop.get('one').length).toBe(1);
        expect(result.prop.get('one')[0].foo()).toBe('delta-4');
        expect(result.prop.get('two').length).toBe(2);
        expect(result.prop.get('two')[0].foo()).toBe('gamma-7');
        expect(result.prop.get('two')[1].foo()).toBe('alpha-2');
    });

    it('serializes', () => {
        const object = new DictArrayMap();
        object.prop = new Map<string, Array<Simple>>([
            ['one', [new Simple({strProp: 'delta', numProp: 4})]],
            ['two', [
                new Simple({strProp: 'gamma', numProp: 7}),
                new Simple({strProp: 'alpha', numProp: 2}),
            ]],
        ]);
        const result = TypedJSON.stringify(object, DictArrayMap);

        expect(result).toBe(JSON.stringify({
            prop: {
                one: [{strProp: 'delta', numProp: 4}],
                two: [{strProp: 'gamma', numProp: 7}, {strProp: 'alpha', numProp: 2}],
            },
        }));
    });
});
