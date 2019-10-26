import { jsonObject, jsonMember, TypedJSON } from "../src/typedjson";

describe('onDeserialized', function () {

    it('should call the static method', function() {
        @jsonObject({
            onDeserialized: 'afterDeser'
        })
        class Person {
            @jsonMember
            name: string;

            @jsonMember
            age: number;

            public static afterDeser() {
                // should call
            }

            public getDescription() {
                return this.name + " is " + this.age + "y old";
            }
        }
        spyOn(Person, 'afterDeser');

        const person = TypedJSON.parse({'name': 'John', age: 20}, Person)!;
        expect(person instanceof Person).toBeTruthy();
        expect(person.getDescription()).toEqual('John is 20y old');
        expect(Person.afterDeser).toHaveBeenCalled();
    });

    it('should call the member method', function() {
        @jsonObject({
            onDeserialized: 'afterDeser'
        })
        class Person {
            @jsonMember
            name: string;

            @jsonMember
            age: number;

            constructor() {
                spyOn(this, 'afterDeser');
            }

            public afterDeser() {
                // should call
            }

            public getDescription() {
                return this.name + " is " + this.age + "y old";
            }
        }

        const person = TypedJSON.parse({'name': 'John', age: 20}, Person)!;
        expect(person instanceof Person).toBeTruthy();
        expect(person.getDescription()).toEqual('John is 20y old');
        expect(person.afterDeser).toHaveBeenCalled();
    });

    it('should prefer the member method when there are both', function() {
        @jsonObject({
            onDeserialized: 'afterDeser'
        })
        class Person {
            @jsonMember
            name: string;

            @jsonMember
            age: number;

            public static afterDeser() {
                // should NOT call
            }

            constructor() {
                spyOn(this, 'afterDeser');
            }

            public afterDeser() {
                // should call
            }

            public getDescription() {
                return this.name + " is " + this.age + "y old";
            }
        }
        spyOn(Person, 'afterDeser');

        const person = TypedJSON.parse({'name': 'John', age: 20}, Person)!;
        expect(person instanceof Person).toBeTruthy();
        expect(person.getDescription()).toEqual('John is 20y old');
        expect(person.afterDeser).toHaveBeenCalled();
        expect(Person.afterDeser).not.toHaveBeenCalled();
    });
});
