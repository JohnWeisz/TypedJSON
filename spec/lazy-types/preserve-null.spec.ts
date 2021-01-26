import {jsonArrayMember, jsonMapMember, jsonObject, TypedJSON} from '../../src';

describe('lazy, preserveNull', () => {
    it('should preserve nulls in array', () => {
        @jsonObject
        class Person {
            @jsonArrayMember(() => String, {preserveNull: true})
            names: Array<string | null>;
        }

        const input = new Person();
        input.names = [null, 'one', null, null, 'two', null];
        const json = TypedJSON.stringify(input, Person);
        expect(json).toEqual('{"names":[null,"one",null,null,"two",null]}');
        const obj = TypedJSON.parse({names: [null, 'one', null, null, 'two', null]}, Person);
        expect(obj).toEqual(input);
    });

    it('should preserve nulls in maps', () => {
        @jsonObject
        class Person {
            @jsonMapMember(() => String, () => String, {preserveNull: true})
            map: Map<string, string | null>;
        }

        const input = new Person();
        input.map = new Map<string, string | null>([
            ['one', null],
            ['two', null],
            ['three', 'val'],
        ]);
        const json = TypedJSON.stringify(input, Person);
        expect(json).toEqual(
            '{"map":[{"key":"one","value":null},{"key":"two","value":null},'
            + '{"key":"three","value":"val"}]}',
        );
        const obj = TypedJSON.parse(
            {
                map: [
                    {key: 'one', value: null},
                    {key: 'two', value: null},
                    {key: 'three', value: 'val'},
                ],
            },
            Person,
        );
        expect(obj).toEqual(input);
    });
});
