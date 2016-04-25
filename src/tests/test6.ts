import {isEqual} from "./object-compare";
import {JsonObject, JsonMember, TypedJSON} from "../typed-json";

class Person {

}

@JsonObject()
class Employee extends Person {
    @JsonMember()
    public salary: number;

    @JsonMember()
    public joined: Date;

    constructor();
    constructor(salary: number, joined: Date);
    constructor(salary?: number, joined?: Date) {
        super();

        if (salary && joined) {
            this.salary = salary;
            this.joined = joined;
        }
    }
}

@JsonObject({ name: "part-time-employee" })
class PartTimeEmployee extends Employee {
    @JsonMember({ name: "work-hours" })
    public workHours: number;
}

@JsonObject()
class Investor extends Person {
    @JsonMember({ name: "invest-amount" })
    public investAmount: number;

    constructor();
    constructor(investAmount: number);
    constructor(investAmount?: number) {
        super();

        this.investAmount = investAmount || 0;
    }
}

@JsonObject({ name: "company", knownTypes: [PartTimeEmployee, Investor, Employee] })
class Company {
    @JsonMember()
    public name: string;

    @JsonMember({ elementType: Employee })
    public employees: Array<Employee>;

    @JsonMember()
    public owner: Person;

    constructor() {
        this.employees = [];
    }
}

// Create a Company.
var company = new Company();
company.name = "Json Types";

switch (Math.floor(Math.random() * 4)) {
    case 0:
        company.owner = new Employee(240000, new Date(1992, 5, 27));
        break;

    case 1:
        company.owner = new Investor(1700000);
        break;

    case 2:
        company.owner = new PartTimeEmployee(160000, new Date(1992, 5, 27));
        break;

    default:
        company.owner = new Person();
        break;
}

// Add employees.
for (var j = 0; j < 20; j++) {
    if (Math.random() < 0.2) {
        var newPartTimeEmployee = new PartTimeEmployee(
            Math.floor(Math.random() * 80000),
            new Date(Date.now() - Math.floor(Math.random() * 80000))
        );

        newPartTimeEmployee.workHours = Math.floor(Math.random() * 40);

        company.employees.push(newPartTimeEmployee);
    } else {
        company.employees.push(new Employee(
            Math.floor(Math.random() * 80000),
            new Date(Date.now() - Math.floor(Math.random() * 80000))
        ));
    }
}

var json = TypedJSON.stringify(company);
var reparsed = TypedJSON.parse(json, Company);

console.log("Test 6: @JsonObject extending non-@JsonObject with custom names.");
console.log(company);
console.log(TypedJSON.parse(json)); // Will parse using 'JSON.parse'.
console.log(reparsed);
console.log("Match: " + isEqual(company, reparsed));
