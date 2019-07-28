import { jsonObject, jsonMember, TypedJSON } from "../js/typedjson";

describe('initializer', function () {

    it('should be called', function() {
        const initializerSpy = jasmine.createSpy().and.callFake((src, raw) => {
            expect(src instanceof Person).toBeFalsy();
            expect(src.getDescription).toBeUndefined();
            expect(src.address instanceof Address).toBeTruthy();
            expect(src.address.getAddressLine()).toEqual('44th, New York');

            expect(raw instanceof Person).toBeFalsy();
            expect(raw.getDescription).toBeUndefined();
            expect(raw.address instanceof Address).toBeFalsy();
            expect(raw.address.getAddressLine).toBeUndefined();

            return new Person(src.name, src.address);
        });

        @jsonObject
        class Address {
            @jsonMember
            street: string;
            @jsonMember
            city: string;

            public getAddressLine() {
                return `${this.street}, ${this.city}`;
            }
        }

        @jsonObject({
            initializer: initializerSpy,
        })
        class Person {
            @jsonMember
            name: string;

            @jsonMember
            address: Address;

            constructor(name: string, address: Address) {
                this.name = name;
                this.address = address;
            }

            public getDescription() {
                return `${this.name} is living at ${this.address.getAddressLine()}`;
            }
        }

        const person = TypedJSON.parse(
            {name: 'John', address: {street: '44th', city: 'New York'}},
            Person
        )!;
        expect(person instanceof Person).toBeTruthy();
        expect(person.getDescription()).toEqual('John is living at 44th, New York');
        expect(initializerSpy).toHaveBeenCalled();
    });

    it('should fail if nothing is returned', function() {
        const initializerSpy = jasmine.createSpy().and.callFake(() => null);

        @jsonObject({
            initializer: initializerSpy,
        })
        class Person {
            @jsonMember
            name: string;

            public getDescription() {
                return `${this.name} is his name`;
            }
        }

        const errorHandlerSpy = jasmine.createSpy();
        const person = TypedJSON.parse(
            {name: 'John'},
            Person,
            {errorHandler: errorHandlerSpy},
        )!;
        expect(person).toBeUndefined();
        expect(initializerSpy).toHaveBeenCalled();
        expect(errorHandlerSpy).toHaveBeenCalled();
    });

    it('should fail if wrong type is returned', function() {
        const initializerSpy = jasmine.createSpy()
            .and.callFake((src) => new Person2(src.name));

        @jsonObject({
            initializer: initializerSpy,
        })
        class Person {
            @jsonMember
            name: string;

            public getDescription() {
                return `${this.name} is his name`;
            }
        }

        class Person2 {
            name: string;

            constructor(name: string) {
                this.name = name;
            }

            public getDescription() {
                return `${this.name} is his name`;
            }
        }

        const errorHandlerSpy = jasmine.createSpy();
        const person = TypedJSON.parse(
            {name: 'John'},
            Person,
            {errorHandler: errorHandlerSpy},
        )!;
        expect(person).toBeUndefined();
        expect(initializerSpy).toHaveBeenCalled();
        expect(errorHandlerSpy).toHaveBeenCalled();
    });

    it('should accept subtypes', function() {
        const initializerSpy = jasmine.createSpy()
            .and.callFake((src) => new Person2(src.name, 123));

        @jsonObject({
            initializer: initializerSpy,
        })
        class Person {
            @jsonMember
            name: string;

            constructor(name: string) {
                this.name = name;
            }

            public getDescription() {
                return `${this.name} is his name`;
            }
        }

        class Person2 extends Person{
            age: number;

            constructor(name: string, age: number) {
                super(name);
                this.age = age;
            }

            public getDescription() {
                return `${super.getDescription()} and is ${this.age}y old`;
            }
        }

        const person = TypedJSON.parse({name: 'John'}, Person)!;
        expect(person instanceof Person2).toBeTruthy();
        expect(person.getDescription()).toEqual('John is his name and is 123y old');
        expect(initializerSpy).toHaveBeenCalled();
    });
});
