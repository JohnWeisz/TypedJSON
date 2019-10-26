import { jsonObject, jsonMember, TypedJSON, jsonArrayMember, jsonMapMember } from "../src/typedjson";

describe('preserveNull', function () {

    it('should work globally', function() {
        TypedJSON.setGlobalConfig({preserveNull: true});

        @jsonObject
        class Person {
            @jsonMember
            name: string|null;
        }

        const input = new Person;
        input.name = null;
        const json = TypedJSON.toPlainJson(input, Person);
        expect(json).toEqual({name: null});

        const obj = TypedJSON.parse({name: null}, Person);
        expect(obj).toEqual(input);

        // @ts-ignore
        delete TypedJSON._globalConfig;
    });

    it('should work in settings', function() {
        @jsonObject
        class Person {
            @jsonMember
            name: string|null;
        }

        const input = new Person;
        input.name = null;
        const json = TypedJSON.toPlainJson(input, Person, {preserveNull: true});
        expect(json).toEqual({name: null});

        const obj = TypedJSON.parse({name: null}, Person, {preserveNull: true});
        expect(obj).toEqual(input);
    });

    it('should work on class', function() {
        @jsonObject({preserveNull: true})
        class Person {
            @jsonMember
            name: string|null;
        }

        const input = new Person;
        input.name = null;
        const json = TypedJSON.toPlainJson(input, Person);
        expect(json).toEqual({name: null});

        const obj = TypedJSON.parse({name: null}, Person);
        expect(obj).toEqual(input);
    });

    it('should work on member', function() {
        @jsonObject
        class Person {
            @jsonMember({preserveNull: true})
            name: string|null;
        }

        const input = new Person;
        input.name = null;
        const json = TypedJSON.toPlainJson(input, Person);
        expect(json).toEqual({name: null});

        const obj = TypedJSON.parse({name: null}, Person);
        expect(obj).toEqual(input);
    });

    it('should override parser when more specific', function() {
        @jsonObject
        class Person {
            @jsonMember({preserveNull: false})
            name?: string|null;
        }

        const input = new Person;
        input.name = null;
        const json = TypedJSON.toPlainJson(input, Person, {preserveNull: true});
        expect(json).toEqual({});

        const obj = TypedJSON.parse({name: null}, Person, {preserveNull: true});
        expect(obj).toEqual(new Person);
    });

    it('should override class when more specific', function() {
        @jsonObject({preserveNull: true})
        class Person {
            @jsonMember({preserveNull: false})
            name?: string|null;
        }

        const input = new Person;
        input.name = null;
        const json = TypedJSON.toPlainJson(input, Person);
        expect(json).toEqual({});

        const obj = TypedJSON.parse({name: null}, Person);
        expect(obj).toEqual(new Person);
    });

    it('should not affect other properties', function() {
        @jsonObject
        class Person {
            @jsonMember({preserveNull: true})
            name: string|null;

            @jsonMember
            age: number|null;
        }

        const input = new Person;
        input.name = null;
        input.age = null;
        const json = TypedJSON.stringify(input, Person);
        expect(json).toEqual('{"name":null}');

        const obj = TypedJSON.parse({name: null, age: null}, Person);
        const expected = new Person;
        expected.name = null;
        expect(obj).toEqual(expected);
    });

    it('should not affect inner jsonObjects when set from parent jsonObject', function() {
        @jsonObject
        class Inner {
            @jsonMember
            prop: string|null;
        }

        @jsonObject({preserveNull: true})
        class Person {
            @jsonMember
            name: string|null;

            @jsonMember
            inn: Inner = new Inner;
        }

        const input = new Person;
        input.name = null;
        input.inn.prop = null;
        const json = TypedJSON.stringify(input, Person);
        expect(json).toEqual('{"name":null,"inn":{}}');

        const obj = TypedJSON.parse({name: null, inn: {prop: null}}, Person);
        const expected = new Person;
        expected.name = null;
        expect(obj).toEqual(expected);
    });

    it('should preserve nulls in array', function() {
        @jsonObject
        class Person {
            @jsonArrayMember(String, {preserveNull: true})
            names: (string|null)[];
        }

        const input = new Person();
        input.names = [null, 'one', null, null, 'two', null];
        const json = TypedJSON.stringify(input, Person);
        expect(json).toEqual('{"names":[null,"one",null,null,"two",null]}');
        const obj = TypedJSON.parse({names: [null,'one',null,null,'two',null]}, Person);
        expect(obj).toEqual(input);
    });

    it('should preserve nulls in maps', function() {
        @jsonObject
        class Person {
            @jsonMapMember(String, String, {preserveNull: true})
            map: Map<string, string|null>;
        }

        const input = new Person();
        input.map = new Map<string, string|null>([
            ['one', null],
            ['two', null],
            ['three', 'val'],
        ]);
        const json = TypedJSON.stringify(input, Person);
        expect(json).toEqual(
            '{"map":[{"key":"one","value":null},{"key":"two","value":null},{"key":"three","value":"val"}]}',
        );
        const obj = TypedJSON.parse(
            {'map':[{'key':'one','value':null},{'key':'two','value':null},{'key':'three','value':'val'}]},
            Person,
        );
        expect(obj).toEqual(input);
    });
});
