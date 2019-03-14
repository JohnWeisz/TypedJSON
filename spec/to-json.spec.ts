import {jsonObject, jsonMember, toJson} from "../js/typedjson";

describe('toJson decorator', function () {
    it('should work with JSON.stringify', function () {
        @toJson
        @jsonObject
        class Person {
            firstName?: string;

            @jsonMember({name: 'surname'})
            lastName?: string;

            public getFullName() {
                return this.firstName + " " + this.lastName;
            }
        }

        const person = new Person;
        person.firstName = 'John';
        person.lastName = 'Doe';
        expect(JSON.stringify(person)).toBe('{"surname":"Doe"}');
    });

    it('should work on the abstract class', function () {
        @toJson
        abstract class Base {
            @jsonMember({name: 'renamed'})
            prop?: string;
        }

        @jsonObject
        class Sub extends Base {
            @jsonMember({name: 'numeric'})
            num?: number;
        }

        @jsonObject
        class OtherSub extends Base {
            @jsonMember
            decimal?: number;
            ignored?: string;
        }


        const sub = new Sub;
        sub.prop = 'value';
        sub.num = 20;
        expect(JSON.stringify(sub)).toBe('{"renamed":"value","numeric":20}');

        const otherSub = new OtherSub;
        otherSub.prop = 'value';
        otherSub.decimal = 123;
        otherSub.ignored = 'assigned';
        expect(JSON.stringify(otherSub)).toBe('{"renamed":"value","decimal":123}');
    });

    it("should throw an error when toJSON already exists", function () {
        try {
            @toJson
            @jsonObject
            class Some {
                @jsonMember
                prop?: string;

                toJSON() {
                    return {};
                }
            }

            const some = new Some;
            some.prop = 'value';
            expect(JSON.stringify(some)).toBe('{}');

            fail('Should not succeed');
        } catch (error) {
            // ok
        }
    });


    it("should overwrite toJSON when overwrite is true", function () {
        @toJson({overwrite: true})
        @jsonObject
        class Some {
            @jsonMember
            prop?: string;

            toJSON() {
                return {};
            }
        }

        const some = new Some;
        some.prop = 'value';
        expect(JSON.stringify(some)).toBe('{"prop":"value"}');
    });
});
