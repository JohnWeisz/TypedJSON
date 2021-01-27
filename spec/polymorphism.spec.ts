import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../src';
import {isEqual} from './utils/object-compare';

describe('polymorphism', () => {
    @jsonObject
    class Person {
        @jsonMember
        firstName: string;

        @jsonMember
        lastName: string;

        constructor();
        constructor(firstName: string, lastName: string);
        constructor(firstName?: string, lastName?: string) {
            if (firstName !== undefined && lastName !== undefined) {
                this.firstName = firstName;
                this.lastName = lastName;
            }
        }
    }

    @jsonObject
    class Employee extends Person {
        @jsonMember
        salary: number;

        @jsonMember
        joined: Date;

        constructor();
        constructor(firstName: string, lastName: string);
        constructor(firstName: string, lastName: string, salary: number, joined: Date);
        constructor(firstName?: string, lastName?: string, salary?: number, joined?: Date) {
            super(firstName, lastName);

            if (salary !== undefined && joined !== undefined) {
                this.salary = salary;
                this.joined = joined;
            }
        }
    }

    @jsonObject
    class PartTimeEmployee extends Employee {
        @jsonMember
        workHours: number;
    }

    @jsonObject
    class Investor extends Person {
        @jsonMember
        investAmount: number;

        constructor();
        constructor(firstName: string, lastName: string, investAmount?: number);
        constructor(firstName?: string, lastName?: string, investAmount?: number) {
            super(firstName, lastName);

            this.investAmount = investAmount ?? 0;
        }
    }

    @jsonObject({knownTypes: [PartTimeEmployee, Investor]})
    class Company {
        @jsonMember
        name: string;

        @jsonArrayMember(Employee)
        employees: Array<Employee>;

        @jsonMember
        owner: Person;

        constructor() {
            this.employees = [];
        }
    }

    function test(owner: Person) {
        // Create a Company.
        const company = new Company();
        company.name = 'Json Types';
        company.owner = owner;

        // Add employees.
        for (let j = 0; j < 20; j++) {
            if (j % 2 === 0) {
                const newPartTimeEmployee = new PartTimeEmployee(
                    `firstname_${j}`,
                    `lastname_${j}`,
                    Math.floor(Math.random() * 80000),
                    new Date(Date.now() - Math.floor(Math.random() * 80000)),
                );

                newPartTimeEmployee.workHours = Math.floor(Math.random() * 40);

                company.employees.push(newPartTimeEmployee);
            } else {
                company.employees.push(new Employee(
                    `firstname_${j}`,
                    `lastname_${j}`,
                    Math.floor(Math.random() * 80000),
                    new Date(Date.now() - Math.floor(Math.random() * 80000)),
                ));
            }
        }

        const json = TypedJSON.stringify(company, Company);
        const reparsed = TypedJSON.parse(json, Company);

        const success = isEqual(company, reparsed);

        if (!success) {
            console.log('Polymorphism test failed');
            console.log('company', company);
            console.log('json', JSON.parse(json));
            console.log('reparsed', reparsed);
        }

        return success;
    }

    it('should work', () => {
        expect(test(new Employee('John', 'White', 240000, new Date(1992, 5, 27)))).toBeTruthy();
        expect(test(new Investor('John', 'White', 1700000))).toBeTruthy();
        const partTimeEmployee = new PartTimeEmployee(
            'John',
            'White',
            160000,
            new Date(1992, 5, 27),
        );

        partTimeEmployee.workHours = 38;
        expect(test(partTimeEmployee)).toBeTruthy();
        expect(test(new Person('John', 'White'))).toBeTruthy();
    });
});
