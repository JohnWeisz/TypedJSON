import { jsonObject, jsonMember, TypedJSON } from "../src/typedjson";

describe('single class', function () {

    abstract class Person {
        @jsonMember
        firstName?: string;

        @jsonMember
        lastName?: string;

        public getFullName() {
            return this.firstName + " " + this.lastName;
        }
    }

    @jsonObject
    class Bob extends Person {
        @jsonMember
        pounds?: number;

        public getFullName() {
            return super.getFullName() + ` weighing ${this.pounds}`;
        }
    }

    // todo we need something better
    jsonObject({ knownTypes: [Bob]})(Person);

    describe('deserialized', function () {
        beforeAll(function () {
            this.person = TypedJSON.parse('{ "__type": "Bob", "firstName": "John", "lastName": "Doe", "pounds": 40 }', Person);
        });

        it('should be of proper type', function () {
            expect(this.person instanceof Bob).toBeTruthy();
        });

        it('should have functions', function () {
            expect(this.person.getFullName).toBeDefined();
            expect(this.person.getFullName()).toBe('John Doe weighing 40');
        });
    });

    describe('serialized', function () {
        it('should contain all data', function () {
            const person = new Bob;
            person.firstName = 'John';
            person.lastName = 'Doe';
            person.pounds = 30;
            // todo fix types so they accept abstract
            expect(TypedJSON.stringify(person, Person))
                .toBe('{"firstName":"John","lastName":"Doe","pounds":30,"__type":"Bob"}');
        });
    });
});
