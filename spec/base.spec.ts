import { jsonObject, jsonMember, TypedJSON } from "../js/typedjson";
import { Everything } from "./utils/everything";

describe('basic serialization', function () {
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
            });
        });

        describe('serialized', function () {
            it('should contain all data', function () {
                const person = new Person;
                person.firstName = 'John';
                person.lastName = 'Doe';
                expect(TypedJSON.stringify(person, Person))
                    .toBe('{"firstName":"John","lastName":"Doe"}');
            });
        });
    });

    describe('all types', function () {
        it('should deserialized', function () {
            const everything = Everything.create();

            const deserialized = TypedJSON.parse(JSON.stringify(everything), Everything);

            expect(deserialized).toEqual(Everything.expected());
        });

        it('should serialize', function () {
            const everything = Everything.create();

            const serialized = TypedJSON.stringify(new Everything(everything), Everything);

            expect(serialized).toBe(JSON.stringify(everything));
        });
    });

    describe('nullable', function () {

        @jsonObject
        class WithNullable {
            // nullable must be optional
            @jsonMember
            nullable?: string|null;
        }

        it('should serialize to nothing', function () {
            const nullClass = new WithNullable;
            nullClass.nullable = null;

            const serialized = TypedJSON.stringify(nullClass, WithNullable);

            expect(serialized).toBe('{}');
        });

        it('should deserialize to nothing when null', function () {
            const deserialized = TypedJSON.parse('{"nullable":null}', WithNullable);

            expect(deserialized).toEqual(new WithNullable);
        });

        it('should deserialize to nothing when nothing', function () {
            const deserialized = TypedJSON.parse('{}', WithNullable);

            expect(deserialized).toEqual(new WithNullable);
        });
    });
});
