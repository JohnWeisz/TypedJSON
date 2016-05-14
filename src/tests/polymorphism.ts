import {isEqual} from "./object-compare";
import {JsonObject, JsonMember, TypedJSON} from "../typed-json";

@JsonObject
class Person {
    @JsonMember
    public firstName: string;

    @JsonMember
    public lastName: string;

    constructor();
    constructor(firstName: string, lastName: string);
    constructor(firstName?: string, lastName?: string) {
        if (firstName && lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }
    }
}

@JsonObject
class Employee extends Person {
    @JsonMember
    public salary: number;

    @JsonMember
    public joined: Date;

    constructor();
    constructor(firstName: string, lastName: string);
    constructor(firstName: string, lastName: string, salary: number, joined: Date);
    constructor(firstName?: string, lastName?: string, salary?: number, joined?: Date) {
        super(firstName, lastName);

        if (salary && joined) {
            this.salary = salary;
            this.joined = joined;
        }
    }
}

@JsonObject
class PartTimeEmployee extends Employee {
    @JsonMember
    public workHours: number;
}

@JsonObject
class Investor extends Person {
    @JsonMember
    public investAmount: number;

    constructor();
    constructor(firstName: string, lastName: string);
    constructor(firstName: string, lastName: string, investAmount: number);
    constructor(firstName?: string, lastName?: string, investAmount?: number) {
        super(firstName, lastName);

        this.investAmount = investAmount || 0;
    }
}

@JsonObject({ name: "company", knownTypes: [PartTimeEmployee, Investor] })
class Company {
    @JsonMember
    public name: string;

    @JsonMember({ elements: Employee })
    public employees: Array<Employee>;

    @JsonMember
    public owner: Person;

    constructor() {
        this.employees = [];
    }
}

export function test(log: boolean) {
    // Create a Company.
    var company = new Company();
    company.name = "Json Types";

    switch (Math.floor(Math.random() * 4)) {
        case 0:
            company.owner = new Employee("John", "White", 240000, new Date(1992, 5, 27));
            break;

        case 1:
            company.owner = new Investor("John", "White", 1700000);
            break;

        case 2:
            company.owner = new PartTimeEmployee("John", "White", 160000, new Date(1992, 5, 27));
            (company.owner as PartTimeEmployee).workHours = Math.floor(Math.random() * 40);
            break;

        default:
            company.owner = new Person("John", "White");
            break;
    }

    // Add employees.
    for (var j = 0; j < 20; j++) {
        if (Math.random() < 0.2) {
            var newPartTimeEmployee = new PartTimeEmployee(
                `firstname_${j}`,
                `lastname_${j}`,
                Math.floor(Math.random() * 80000),
                new Date(Date.now() - Math.floor(Math.random() * 80000))
            );

            newPartTimeEmployee.workHours = Math.floor(Math.random() * 40);

            company.employees.push(newPartTimeEmployee);
        } else {
            company.employees.push(new Employee(
                `firstname_${j}`,
                `lastname_${j}`,
                Math.floor(Math.random() * 80000),
                new Date(Date.now() - Math.floor(Math.random() * 80000))
            ));
        }
    }

    TypedJSON.config({
        enableTypeHints: true
    });

    var json = TypedJSON.stringify(company);
    var reparsed = TypedJSON.parse(json, Company);

    if (log) {
        console.log("Test: polymorphism...");
        console.log(company);
        console.log(JSON.parse(json));
        console.log(reparsed);
        console.log("Test finished.");
    }

    return isEqual(company, reparsed);
}