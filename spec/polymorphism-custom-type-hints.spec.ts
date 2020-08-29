import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../src';
import {IndexedObject} from '../src/types';

describe('polymorphism custom type hints', () => {
    describe('should work for a base class', () => {
        @jsonObject({
            typeHintEmitter: (targetObject, sourceObject) => {
                targetObject.personType = `${sourceObject.constructor.name}Type`;
            },
            typeResolver: sourceObject => TYPE_MAP[sourceObject.personType],
        })
        abstract class Person {
            @jsonMember
            firstName: string;

            @jsonMember
            lastName: string;

            constructor(firstName?: string, lastName?: string);
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

            constructor();
            constructor(firstName: string, lastName: string, salary?: number);
            constructor(firstName?: string, lastName?: string, salary?: number) {
                super(firstName, lastName);

                if (salary !== undefined) {
                    this.salary = salary;
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

        const TYPE_MAP: IndexedObject = {
            EmployeeType: Employee,
            PartTimeEmployeeType: PartTimeEmployee,
            InvestorType: Investor,
        };

        @jsonObject
        class Company {
            @jsonMember
            name: string;

            @jsonArrayMember(Employee)
            employees: Array<Employee> = [];

            @jsonMember
            owner: Person;
        }

        it('should emit custom hint', () => {
            const company = new Company();
            company.name = 'Json Types';
            company.owner = new Investor('John', 'White', 1700000);

            const partTime = new PartTimeEmployee('Abe', 'White', 160000);
            partTime.workHours = 20;
            company.employees = [
                new Employee('Donn', 'Worker', 240000),
                partTime,
                new Employee('Smith', 'Elly', 35500),
            ];

            const json = TypedJSON.toPlainJson(company, Company);
            expect(json).toEqual({
                name: 'Json Types',
                owner: {
                    personType: 'InvestorType',
                    firstName: 'John',
                    lastName: 'White',
                    investAmount: 1700000,
                },
                employees: [
                    {
                        personType: 'EmployeeType',
                        firstName: 'Donn',
                        lastName: 'Worker',
                        salary: 240000,
                    },
                    {
                        personType: 'PartTimeEmployeeType',
                        firstName: 'Abe',
                        lastName: 'White',
                        salary: 160000,
                        workHours: 20,
                    },
                    {
                        personType: 'EmployeeType',
                        firstName: 'Smith',
                        lastName: 'Elly',
                        salary: 35500,
                    },
                ],
            });
        });

        it('should resolve custom hints', () => {
            const json = {
                name: 'Json Types',
                owner: {
                    personType: 'InvestorType',
                    firstName: 'John',
                    lastName: 'White',
                    investAmount: 1700000,
                },
                employees: [
                    {
                        personType: 'EmployeeType',
                        firstName: 'Donn',
                        lastName: 'Worker',
                        salary: 240000,
                    },
                    {
                        personType: 'PartTimeEmployeeType',
                        firstName: 'Abe',
                        lastName: 'White',
                        salary: 160000,
                        workHours: 20,
                    },
                    {
                        personType: 'EmployeeType',
                        firstName: 'Smith',
                        lastName: 'Elly',
                        salary: 35500,
                    },
                ],
            };

            const deserialized = TypedJSON.parse(JSON.stringify(json), Company);

            const company = new Company();
            company.name = 'Json Types';
            company.owner = new Investor('John', 'White', 1700000);

            const partTime = new PartTimeEmployee('Abe', 'White', 160000);
            partTime.workHours = 20;
            company.employees = [
                new Employee('Donn', 'Worker', 240000),
                partTime,
                new Employee('Smith', 'Elly', 35500),
            ];
            expect(deserialized).toEqual(company);
        });
    });

    describe('should override parents', () => {
        abstract class StructuralBase {
            @jsonMember
            value: string;
        }

        @jsonObject({
            typeHintEmitter: (targetObject, sourceObject) => {
                targetObject.type = (sourceObject.constructor as any).type;
            },
            typeResolver: sourceObject => {
                return sourceObject.type === 'sub-one' ? ConcreteOne : AnotherConcreteOne;
            },
        })
        abstract class SemanticBaseOne extends StructuralBase {
            @jsonMember
            prop1: number;
        }

        @jsonObject
        class ConcreteOne extends SemanticBaseOne {
            static type = 'sub-one';
            @jsonMember
            propSub: string;
        }

        @jsonObject
        class AnotherConcreteOne extends SemanticBaseOne {
            static type = 'sub-two';
            @jsonMember
            propSub: number;
        }

        @jsonObject({
            typeHintEmitter: (targetObject, sourceObject) => {
                targetObject.hint = sourceObject instanceof ConcreteTwo ? 'first' : 'another';
            },
            typeResolver: sourceObject => {
                return sourceObject.hint === 'first' ? ConcreteTwo : AnotherConcreteTwo;
            },
        })
        abstract class SemanticBaseTwo extends StructuralBase {
            @jsonMember
            prop2: number;
        }

        @jsonObject
        class ConcreteTwo extends SemanticBaseTwo {
            @jsonMember
            propSub: string;
        }

        @jsonObject
        class AnotherConcreteTwo extends SemanticBaseTwo {
            @jsonMember
            propSub: number;
        }

        it('should work for SemanticBaseOne', () => {
            const inputAndResult: Array<[() => SemanticBaseOne, () => IndexedObject]> = [
                [
                    () => {
                        const expected = new ConcreteOne();
                        expected.value = 'base';
                        expected.prop1 = 10;
                        expected.propSub = 'something';
                        return expected;
                    },
                    () => ({
                        type: 'sub-one',
                        value: 'base',
                        prop1: 10,
                        propSub: 'something',
                    }),
                ],
                [
                    () => {
                        const expected = new AnotherConcreteOne();
                        expected.value = 'base value';
                        expected.prop1 = 245;
                        expected.propSub = 234;
                        return expected;
                    },
                    () => ({
                        type: 'sub-two',
                        value: 'base value',
                        prop1: 245,
                        propSub: 234,
                    }),
                ],
            ];

            inputAndResult.forEach(([inputFn, serializedFn]) => {
                expect(TypedJSON.toPlainJson(inputFn(), SemanticBaseOne)).toEqual(serializedFn());
                expect(TypedJSON.parse(serializedFn(), SemanticBaseOne)).toEqual(inputFn());
            });
        });

        it('should work for SemanticBaseTwo', () => {
            const inputAndResult: Array<[() => SemanticBaseTwo, () => IndexedObject]> = [
                [
                    () => {
                        const expected = new ConcreteTwo();
                        expected.value = 'base';
                        expected.prop2 = 546;
                        expected.propSub = 'something';
                        return expected;
                    },
                    () => ({
                        hint: 'first',
                        value: 'base',
                        prop2: 546,
                        propSub: 'something',
                    }),
                ],
                [
                    () => {
                        const expected = new AnotherConcreteTwo();
                        expected.value = 'base value';
                        expected.prop2 = 74;
                        expected.propSub = 234;
                        return expected;
                    },
                    () => ({
                        hint: 'another',
                        value: 'base value',
                        prop2: 74,
                        propSub: 234,
                    }),
                ],
            ];

            inputAndResult.forEach(([inputFn, serializedFn]) => {
                expect(TypedJSON.toPlainJson(inputFn(), SemanticBaseTwo)).toEqual(serializedFn());
                expect(TypedJSON.parse(serializedFn(), SemanticBaseTwo)).toEqual(inputFn());
            });
        });
    });
});
