import { jsonObject, jsonMember, TypedJSON } from "../js/typedjson";
import { Everything } from "./utils/everything";

describe('basic serialization', function () {
    describe('builtins', function () {
        it('should deserialize', function () {
            expect(TypedJSON.parse('"str"', String)).toEqual('str');
            expect(TypedJSON.parse('45834', Number)).toEqual(45834);
            expect(TypedJSON.parse('true', Boolean)).toEqual(true);
            expect(TypedJSON.parse('1543915254', Date)).toEqual(new Date(1543915254));
            expect(TypedJSON.parse('"1970-01-18T20:51:55.254Z"', Date)).toEqual(new Date(1543915254));

            const dataBuffer = Uint8Array.from([100,117,112,97]) as any;
            expect(TypedJSON.parse('"畤慰"', ArrayBuffer)).toEqual(dataBuffer);
            expect(TypedJSON.parse('"畤慰"', DataView)).toEqual(dataBuffer);
            expect(TypedJSON.parse('[100,117,112,97]', Uint8Array)).toEqual(dataBuffer);
        });

        it('should serialize', function () {
            expect(TypedJSON.stringify('str', String)).toEqual('"str"');
            expect(TypedJSON.stringify(45834, Number)).toEqual('45834');
            expect(TypedJSON.stringify(true, Boolean)).toEqual('true');
            expect(TypedJSON.stringify(new Date(1543915254), Date)).toEqual(`"${new Date(1543915254).toISOString()}"`);
            expect(TypedJSON.stringify(new Date('2018-12-04T09:20:54'), Date)).toEqual(`"${new Date('2018-12-04T09:20:54').toISOString()}"`);

            const buffer = new ArrayBuffer(4);
            const view = new DataView(buffer);
            view.setInt8(0, 100);
            view.setInt8(1, 117);
            view.setInt8(2, 112);
            view.setInt8(3, 97);
            expect(TypedJSON.stringify(buffer, ArrayBuffer)).toEqual('"畤慰"');
            expect(TypedJSON.stringify(view, DataView)).toEqual('"畤慰"');
            expect(TypedJSON.stringify(new Uint8Array(buffer), Uint8Array)).toEqual('[100,117,112,97]');
        });
    });

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
