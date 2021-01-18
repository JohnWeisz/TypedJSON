import {jsonMember, jsonObject, jsonObjectInheritance, TypedJSON} from '../src';

describe('single class', () => {
    @jsonObjectInheritance({
        resolveType: data => {
            return Bob;
        },
    })
    @jsonObject
    abstract class Person {
        @jsonMember
        firstName?: string;

        @jsonMember
        lastName?: string;

        getFullName() {
            return `${this.firstName} ${this.lastName}`;
        }
    }

    @jsonObject
    class Bob extends Person {
        @jsonMember
        pounds?: number;

        getFullName() {
            return `${super.getFullName()} weighing ${this.pounds}`;
        }
    }

    describe('deserialized', () => {
        beforeAll(function () {
            this.person = TypedJSON.parse(
                '{ "firstName": "John", "lastName": "Doe", "pounds": 40 }',
                Person,
            );
        });

        it('should be of proper type', function () {
            expect(this.person instanceof Bob).toBeTruthy();
        });

        it('should have functions', function () {
            expect(this.person.getFullName).toBeDefined();
            expect(this.person.getFullName()).toBe('John Doe weighing 40');
        });
    });

    describe('serialized', () => {
        it('should contain all data', () => {
            const person = new Bob();
            person.firstName = 'John';
            person.lastName = 'Doe';
            person.pounds = 30;
            // todo fix types so they accept abstract
            expect(TypedJSON.stringify(person, Person))
                .toBe('{"firstName":"John","lastName":"Doe","pounds":30}');
        });
    });
});
