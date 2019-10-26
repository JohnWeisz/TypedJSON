import { isEqual } from "./utils/object-compare";
import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from "../src/typedjson";

@jsonObject
class Person {
    @jsonMember({ name: "first-name" })
    public firstName: string;

    @jsonMember({ name: "last-name" })
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

@jsonObject
class Employee extends Person {
    @jsonMember
    public salary: number;

    @jsonMember
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

@jsonObject({ name: "part-time-employee" })
class PartTimeEmployee extends Employee {
    @jsonMember({ name: "work-hours" })
    public workHours: number;
}

@jsonObject()
class Investor extends Person {
    @jsonMember({ name: "invest-amount" })
    public investAmount: number;

    constructor();
    constructor(firstName: string, lastName: string);
    constructor(firstName: string, lastName: string, investAmount: number);
    constructor(firstName?: string, lastName?: string, investAmount?: number) {
        super(firstName, lastName);

        this.investAmount = investAmount || 0;
    }
}

@jsonObject({ name: "company", knownTypes: [PartTimeEmployee, Investor] })
class Company {
    @jsonMember
    public name: string;

    @jsonArrayMember(Employee, { name: 'company-employees' })
    public employees: Array<Employee>;

    @jsonMember
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

    var json = TypedJSON.stringify(company, Company);
    var reparsed = TypedJSON.parse(json, Company);

    if (log) {
        console.log("Test: polymorphism with custom names...");
        console.log(company);
        console.log(JSON.parse(json));
        console.log(reparsed);
        console.log("Test finished.");
    }

    return isEqual(company, reparsed);
}

describe('polymorphic custom names', function() {
    it('should work', function () {
        expect(test(false)).toBeTruthy();
    });
});
