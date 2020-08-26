import {jsonMember, jsonObject, TypedJSON} from '../src/typedjson';

describe('onDeserialized', () => {
    it('should call the static method', () => {
        @jsonObject({
            onDeserialized: 'afterDeser',
        })
        class Person {
            @jsonMember
            name: string;

            @jsonMember
            age: number;

            static afterDeser() {
                // should call
            }

            getDescription() {
                return `${this.name} is ${this.age}y old`;
            }
        }
        spyOn(Person, 'afterDeser');

        const person = TypedJSON.parse({name: 'John', age: 20}, Person)!;
        expect(person instanceof Person).toBeTruthy();
        expect(person.getDescription()).toEqual('John is 20y old');
        expect(Person.afterDeser).toHaveBeenCalled();
    });

    it('should call the member method', () => {
        @jsonObject({
            onDeserialized: 'afterDeser',
        })
        class Person {
            @jsonMember
            name: string;

            @jsonMember
            age: number;

            constructor() {
                spyOn<Person, 'afterDeser'>(this, 'afterDeser');
            }

            afterDeser() {
                // should call
            }

            getDescription() {
                return `${this.name} is ${this.age}y old`;
            }
        }

        const person = TypedJSON.parse({name: 'John', age: 20}, Person)!;
        expect(person instanceof Person).toBeTruthy();
        expect(person.getDescription()).toEqual('John is 20y old');
        expect(person.afterDeser).toHaveBeenCalled();
    });

    it('should prefer the member method when there are both', () => {
        @jsonObject({
            onDeserialized: 'afterDeser',
        })
        class Person {
            @jsonMember
            name: string;

            @jsonMember
            age: number;

            static afterDeser() {
                // should NOT call
            }

            constructor() {
                spyOn<Person, 'afterDeser'>(this, 'afterDeser');
            }

            afterDeser() {
                // should call
            }

            getDescription() {
                return `${this.name} is ${this.age}y old`;
            }
        }
        spyOn(Person, 'afterDeser');

        const person = TypedJSON.parse({name: 'John', age: 20}, Person)!;
        expect(person instanceof Person).toBeTruthy();
        expect(person.getDescription()).toEqual('John is 20y old');
        expect(person.afterDeser).toHaveBeenCalled();
        expect(Person.afterDeser).not.toHaveBeenCalled();
    });
});
