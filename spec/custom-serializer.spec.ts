import {jsonObject, jsonMember, jsonArrayMember, TypedJSON} from "../js/typedjson";

describe('custom member serializer', function () {

    @jsonObject
    class Person {
        @jsonMember({ serializer: ((value: string) => value.split(' ')) })
        firstName: string;

        @jsonMember
        lastName: string;

        public getFullName() {
            return this.firstName + " " + this.lastName;
        }
    }

    beforeAll(function () {
        this.person = new Person();
        this.person.firstName = 'Mulit term name';
        this.person.lastName = 'Surname';
        this.json = JSON.parse(TypedJSON.stringify(this.person, Person));
    });

    it('should properly serialize', function () {
        expect(this.json).toEqual(
            {
                firstName:['Mulit', 'term', 'name'],
                lastName: 'Surname',
            });
    });

    it('should not affect deserialization', function () {
        expect(TypedJSON.parse('{"firstName":"name","lastName":"last"}', Person))
            .toEqual(Object.assign(new Person(), {firstName: 'name', lastName: 'last'}));
    });

});

describe('custom array member serializer', function () {

    @jsonObject
    class Obj {
        @jsonArrayMember(Number, { serializer: ((values: number[]) => values.join(',')) })
        nums: number[];

        @jsonMember
        str: string;

        public sum() {
            return this.nums.reduce((sum, cur) => sum + cur, 0);
        }
    }

    beforeAll(function () {
        this.obj = new Obj();
        this.obj.nums = [3,45,34];
        this.obj.str = 'Text';
        this.json = JSON.parse(TypedJSON.stringify(this.obj, Obj));
    });

    it('should properly serialize', function () {
        expect(this.json).toEqual(
            {
                nums: '3,45,34',
                str: 'Text',
            });
    });

    it('should not affect deserialization', function () {
        expect(TypedJSON.parse('{"nums":[4,5,6,7],"str":"string"}', Obj))
            .toEqual(Object.assign(new Obj(), {nums: [4,5,6,7], str: 'string'} as Obj));
    });

});
