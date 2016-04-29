import {isEqual} from "./object-compare";
import {JsonObject, JsonMember, TypedJSON} from "../typed-json";

@JsonObject
class Person {
    @JsonMember
    firstName: string;

    @JsonMember
    lastName: string;

    constructor(firstName?: string, lastName?: string) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public getFullname() {
        return this.firstName + " " + this.lastName;
    }
}

export function test(log: boolean) {
    var person = new Person("John", "Doe");
    var json = TypedJSON.stringify(person);
    var clone = TypedJSON.parse(json, Person);
    
    if (log) {
        console.log("Test: single class...");
        console.log(person);
        console.log(JSON.parse(json));
        console.log(clone);
        console.log("Test finished.");
    }
    
    return isEqual(person, clone);
}
