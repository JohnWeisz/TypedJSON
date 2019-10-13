import { jsonObject, jsonMember, TypedJSON } from "../js/typedjson";

describe('beforeSerialization', function () {

    it('should call the static method', function () {
        @jsonObject({
            beforeSerialization: 'beforeSerial'
        })
        class Person {
            @jsonMember
            age: number;

            @jsonMember
            isOld: boolean;

            public static beforeSerial() {
                // to have been called
            }
        }

        spyOn(Person, 'beforeSerial');

        const youngPerson = TypedJSON.parse({ age: 10 }, Person);
        expect(youngPerson instanceof Person).toBeTruthy();
        expect(youngPerson.isOld).toBeUndefined();
        TypedJSON.stringify(youngPerson, Person);

        expect(Person.beforeSerial).toHaveBeenCalled();
    });

    it('should call the member method', function () {
        @jsonObject({
            beforeSerialization: 'beforeSerial'
        })
        class Person {
            @jsonMember
            age: number;

            @jsonMember
            isOld: boolean;

            public beforeSerial() {
                if (this.age < 20) {
                    this.isOld = false;
                } else {
                    this.isOld = true;
                }
            }
        }

        const youngPerson = TypedJSON.parse({ age: 10 }, Person);
        const oldPerson = TypedJSON.parse({ age: 50 }, Person);
        expect(youngPerson instanceof Person).toBeTruthy();
        expect(oldPerson instanceof Person).toBeTruthy();

        expect(oldPerson.isOld).toBeUndefined();
        expect(youngPerson.isOld).toBeUndefined();
        const youngPersionUntyped: object = JSON.parse(TypedJSON.stringify(youngPerson, Person));
        const oldPersonUntyped: object = JSON.parse(TypedJSON.stringify(oldPerson, Person));

        expect(youngPersionUntyped['isOld']).toBeFalsy();
        expect(oldPersonUntyped['isOld']).toBeTruthy();
    });

    it('should prefer the member method when there are both', function () {
        @jsonObject({
            beforeSerialization: 'beforeSerial'
        })
        class Person {
            @jsonMember
            age: number;

            @jsonMember
            isOld: boolean;

            constructor() {
                spyOn(this, 'beforeSerial');
            }

            public beforeSerial() {
                // should call
            }

            public static beforeSerial() {
                // should NOT call
            }
        }

        spyOn(Person, 'beforeSerial');

        const youngPerson = TypedJSON.parse({ age: 10 }, Person);
        expect(youngPerson instanceof Person).toBeTruthy();
        expect(youngPerson.isOld).toBeUndefined();

        const youngPersionUntyped: object = JSON.parse(TypedJSON.stringify(youngPerson, Person));

        expect(youngPerson.beforeSerial).toHaveBeenCalled();
        expect(youngPersionUntyped['isOld']).toBeFalsy();

        expect(youngPerson.beforeSerial).toHaveBeenCalled();
        expect(Person.beforeSerial).not.toHaveBeenCalled();
    });
});
