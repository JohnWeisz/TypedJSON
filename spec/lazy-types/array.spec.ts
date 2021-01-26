import {AnyT, jsonArrayMember, jsonObject, TypedJSON} from '../../src';
import {Everything, IEverything} from '../utils/everything';

describe('lazy, multidimensional arrays', () => {
    interface IWithArrays {
        one: Array<IEverything>;
        two: Array<Array<IEverything>>;
        deep: Array<Array<Array<Array<Array<Array<IEverything>>>>>>;
        arrayWithArray?: Array<Array<IWithArrays>>;
    }

    @jsonObject
    class WithArrays implements IWithArrays {
        @jsonArrayMember(() => Everything)
        one: Array<Everything>;

        @jsonArrayMember(() => Everything, {dimensions: 2})
        two: Array<Array<Everything>>;

        @jsonArrayMember(() => Everything, {dimensions: 6})
        deep: Array<Array<Array<Array<Array<Array<Everything>>>>>>;

        @jsonArrayMember(() => WithArrays, {dimensions: 2})
        arrayWithArray?: Array<Array<WithArrays>>;

        constructor(init?: IWithArrays) {
            if (init !== undefined) {
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
                [expected ? Everything.expected() : Everything.create()],
                [expected ? Everything.expected() : Everything.create()],
                [],
                [],
            ],
            deep: [[[[
                [],
                [[expected ? Everything.expected() : Everything.create()]],
            ]]]],
            arrayWithArray: [
                [],
                [expected ? new WithArrays(nested) : nested],
            ],
        };

        return expected ? new WithArrays(result) : result;
    }

    function createTestArray(expected: boolean): Array<Array<IWithArrays>> {
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
        ];
    }

    it('deserializes', () => {
        const testArray = JSON.stringify(createTestArray(false));
        const result = TypedJSON.parseAsArray(testArray, WithArrays, undefined, 2);

        expect(result).toBeOfLength(4);
        expect(result[0]).toBeOfLength(0);
        expect(result[1]).toBeOfLength(2);
        expect(result[1][0]).toEqual(createTestObject(true));
        expect(result[1][1]).toEqual(createTestObject(true));
        expect(result[2]).toBeOfLength(0);
        expect(result[3]).toBeOfLength(1);
        expect(result[3][0]).toEqual(createTestObject(true));
    });

    it('serializes', () => {
        const result = TypedJSON.stringifyAsArray(createTestArray(true), WithArrays, 2);

        expect(result).toBe(JSON.stringify(createTestArray(false)));
    });
});

describe('lazy, array of raw objects', () => {
    @jsonObject
    class Translations {
        @jsonArrayMember(() => AnyT)
        localization: Array<any>;
    }

    function localization() {
        return [
            {
                language_tag: 'en_us',
                '/actions/main': 'My Game Actions',
                '/actions/driving': 'Driving',
            },
            {
                language_tag: 'fr',
                '/actions/main': 'Mes actions de jeux',
                '/actions/driving': 'Conduire',
            },
        ];
    }

    it('should deserialize as is', () => {
        const translations = TypedJSON.parse({localization: localization()}, Translations);
        expect(translations).toBeDefined();
        expect(translations instanceof Translations).toBeTruthy();
        expect(translations.localization).toEqual(localization());
    });

    it('should serialize as is', () => {
        const translations = new Translations();
        translations.localization = localization();
        const json = TypedJSON.toPlainJson(translations, Translations);
        expect(json).toEqual({localization: localization()});
    });
});
