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

    beforeAll(function () {
        this.person = TypedJSON.parse('{ "firstName": "John", "lastName": "Doe" }', Person);
    });

    it('deserialized should be of proper type', function () {
        expect(this.person instanceof Person).toBeTruthy();
    });

    it('deserialize should have functions', function () {
        expect(this.person.getFullName).toBeDefined();
        expect(this.person.getFullName()).toBe('John Doe');
    })

});
