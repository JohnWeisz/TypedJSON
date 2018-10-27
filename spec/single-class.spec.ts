import {jsonObject, jsonMember, TypedJSON} from "../js/typedjson";

describe('single class', function () {
    @jsonObject
    class Person {
        @jsonMember
        firstName: string;

        @jsonMember
        lastName: string;

        public getFullName() {
            return this.firstName + " " + this.lastName;
        }
    }

    describe('deserialized', function () {
        beforeAll(function () {
            this.person = TypedJSON.parse('{ "firstName": "John", "lastName": "Doe" }', Person);
        });

        it('should be of proper type', function () {
            expect(this.person instanceof Person).toBeTruthy();
        });

        it('should have functions', function () {
            expect(this.person.getFullName).toBeDefined();
            expect(this.person.getFullName()).toBe('John Doe');
        })
    })

    describe('serialized', function () {
        it('should contain all data', function () {
            const person = new Person;
            person.firstName = 'John';
            person.lastName = 'Doe';
            expect(TypedJSON.stringify(person, Person))
                .toBe('{"firstName":"John","lastName":"Doe"}');
        })
    })
});
