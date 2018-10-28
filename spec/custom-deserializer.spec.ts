import { jsonObject, jsonMember, TypedJSON } from "../js/typedjson";
import { jsonArrayMember } from '../src/typedjson/json-array-member';

describe('custom member deserializer', function () {

    @jsonObject
    class Person {
        @jsonMember({ deserializer: ((json: any) => json[0]) })
        firstName: string;

        @jsonMember
        lastName: string;

        public getFullName() {
            return this.firstName + " " + this.lastName;
        }
    }

    beforeAll(function () {
        this.person = TypedJSON.parse('{ "firstName": ["John"], "lastName": "Doe" }', Person);
    });

    it('should properly deserialize', function () {
        expect(this.person.firstName).toBe('John');
        expect(this.person.lastName).toBe('Doe');
    });

    it('should return object of proper type', function () {
        expect(this.person instanceof Person).toBeTruthy();
    });

    it('should return object with callable functions', function () {
        expect(this.person.getFullName).toBeDefined();
        expect(this.person.getFullName()).toBe('John Doe');
    });

    it('should not affect serialization', function () {
        expect(TypedJSON.stringify(this.person, Person)).toBe('{"firstName":"John","lastName":"Doe"}');
    });

});

describe('custom array member deserializer', function () {

    @jsonObject
    class Obj {
        @jsonArrayMember(Number, { deserializer: ((json: any) => json.split(',').map((v) => parseInt(v, 10))) })
        nums: number[];

        @jsonMember
        str: string;

        public sum() {
            return this.nums.reduce((sum, cur) => sum + cur, 0);
        }
    }

    beforeAll(function () {
        this.obj = TypedJSON.parse('{ "nums": "1,2,3,4,5", "str": "Some string" }', Obj);
    });

    it('should properly deserialize', function () {
        expect(this.obj.nums).toEqual([1,2,3,4,5]);
        expect(this.obj.str).toBe('Some string');
    });

    it('should obj object of proper type', function () {
        expect(this.obj instanceof Obj).toBeTruthy();
    });

    it('should return object with callable functions', function () {
        expect(this.obj.sum).toBeDefined();
        expect(this.obj.sum()).toBe(15);
    });

    it('should not affect serialization', function () {
        expect(TypedJSON.stringify(this.obj, Obj)).toBe('{"nums":[1,2,3,4,5],"str":"Some string"}');
    });

});
