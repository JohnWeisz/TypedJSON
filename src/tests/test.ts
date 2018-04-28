import {isEqual} from "./object-compare";
import {JsonObject, JsonMember, TypedJSON} from "../typed-json";

@JsonObject
class Person {
    @JsonMember({type : String})
    firstName: string;

    @JsonMember({type : String})
    lastName: string;

    @JsonMember({type : Number, reviver : value=> value + 5, replacer : value=> value * 10 })
    level : number


    public getFullname() {
        return this.firstName + " " + this.lastName;
    }
}


var person = TypedJSON.parse('{ "firstName": "John", "lastName": "Doe", level : 20 }', Person);
var jsPerson = TypedJSON.stringify(person)

console.log("Pesron Level: ",person.level)
console.log("jsPerson", jsPerson)



