import {isEqual} from "./object-compare";
import {JsonObject, JsonMember, TypedJSON} from "../typed-json";

@JsonObject
class Person {
    @JsonMember
    firstName: string;

    @JsonMember
    lastName: string;

    public getFullname() {
        return this.firstName + " " + this.lastName;
    }
}

export function test(log: boolean) {
    var person = TypedJSON.parse('{ "firstName": "John", "lastName": "Doe" }', Person);

    person instanceof Person; // true
    person.getFullname(); // "John Doe"

    return person.getFullname() === "John Doe" && person instanceof Person;
}
