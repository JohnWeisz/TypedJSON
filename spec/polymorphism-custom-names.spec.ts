import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../src/typedjson';
import {isEqual} from './utils/object-compare';

describe('polymorphic custom names', () => {
    @jsonObject
    class Person {
        @jsonMember({name: 'first-name'})
        firstName: string;

        @jsonMember({name: 'last-name'})
        lastName: string;

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

    @jsonObject({name: 'part-time-employee'})
    class PartTimeEmployee extends Employee {
        @jsonMember({name: 'work-hours'})
        workHours: number;
    }

    @jsonObject()
    class Investor extends Person {
        @jsonMember({name: 'invest-amount'})
        investAmount: number;

        constructor();
        constructor(firstName: string, lastName: string, investAmount?: number);
        constructor(firstName?: string, lastName?: string, investAmount?: number) {
            super(firstName, lastName);

            this.investAmount = investAmount ?? 0;
        }
    }

    @jsonObject({name: 'company', knownTypes: [PartTimeEmployee, Investor]})
    class Company {
        @jsonMember
        name: string;

        @jsonArrayMember(Employee, {name: 'company-employees'})
        employees: Array<Employee>;

        @jsonMember
        owner: Person;

        constructor() {
            this.employees = [];
        }
    }

    function test(log: boolean) {
        // Create a Company.
        const company = new Company();
        company.name = 'Json Types';

        switch (Math.floor(Math.random() * 4)) {
            case 0:
                company.owner = new Employee('John', 'White', 240000, new Date(1992, 5, 27));
                break;

            case 1:
                company.owner = new Investor('John', 'White', 1700000);
                break;

            case 2:
                company.owner = new PartTimeEmployee(
                    'John',
                    'White',
                    160000,
                    new Date(1992, 5, 27),
                );
                (company.owner as PartTimeEmployee).workHours = Math.floor(Math.random() * 40);
                break;

            default:
                company.owner = new Person('John', 'White');
                break;
        }

        // Add employees.
        for (let j = 0; j < 20; j++) {
            if (Math.random() < 0.2) {
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

        if (log) {
            console.log('Test: polymorphism with custom names...');
            console.log(company);
            console.log(JSON.parse(json));
            console.log(reparsed);
            console.log('Test finished.');
        }

        return isEqual(company, reparsed);
    }

    it('should work', () => {
        expect(test(false)).toBeTruthy();
    });
});
