import {
    discriminatorProperty,
    jsonInheritance,
    jsonMember,
    jsonObject,
    TypedJSON,
} from '../src';

describe('jsonInheritance', () => {
    describe('with custom resolvers', () => {
        @jsonInheritance({
            onSerializeType: (source, result) => {
                result['test'] = 'hey';
            },
            resolveType: data => {
                if ('badgeId' in data) {
                    return Employee;
                } else if ('capital' in data) {
                    return Investor;
                }

                return Person;
            },
        })
        @jsonObject
        class Person {
            name: string;
        }

        @jsonObject
        class Employee extends Person {
            badgeId: string;
        }

        @jsonObject
        class Investor extends Person {
            capital: number;
        }

        @jsonObject
        class Company {

            @jsonMember
            owner: Person;
        }

        const typedJson = new TypedJSON(Company);

        it('should use resolveType', () => {
            const result = typedJson.parse({owner: {name: 'Bob', badgeId: 'avx5'}});
            expect(result.owner).toBeInstanceOf(Employee);
        });

        it('should use onSerializeType', () => {
            const company = new Company();
            company.owner = new Employee();
            company.owner.name = 'Lewis';
            const result: any = typedJson.toPlainJson(company);
            expect(result.owner.test).toEqual('hey');
        });

        it('onSerializeType should not modify source object', () => {
            const company = new Company();
            company.owner = new Employee();
            typedJson.toPlainJson(company);
            expect((company.owner as any).test).toBeUndefined();
        });
    });

    describe('with discriminator', () => {
        describe('and one jsonInheritance decorator', () => {
            @jsonInheritance(discriminatorProperty({
                property: 'type',
                types: () => ({
                    Employee: Employee,
                    Investor: Investor,
                    PartTimeEmployee: PartTimeEmployee,
                }),
            }))
            @jsonObject
            class Person {
                name: string;
            }

            @jsonObject
            class Employee extends Person {
            }

            @jsonObject
            class PartTimeEmployee extends Employee {
            }

            @jsonObject
            class Investor extends Person {
            }

            @jsonObject
            class Company {

                @jsonMember
                owner: Person;
            }

            it('should deserialize into correct type', () => {
                const result = TypedJSON.parse({
                    owner: {
                        name: 'Jeff',
                        type: 'Investor',
                    },
                }, Company);

                expect(result.owner).toBeInstanceOf(Investor);
            });

            it('should have correct type property on serialization', () => {
                const company = new Company();
                company.owner = new Investor();

                const result: any = TypedJSON.toPlainJson(company, Company);
                expect(result.owner.type).toEqual('Investor');
            });

            describe('and nested inheritance', () => {
                it('should deserialize into correct type', () => {
                    const result = TypedJSON.parse({
                        owner: {
                            name: 'George',
                            type: 'PartTimeEmployee',
                        },
                    }, Company);

                    expect(result.owner).toBeInstanceOf(PartTimeEmployee);
                });

                it('should have correct type property on serialization', () => {
                    const company = new Company();
                    company.owner = new PartTimeEmployee();

                    const result: any = TypedJSON.toPlainJson(company, Company);
                    expect(result.owner.type).toEqual('PartTimeEmployee');
                });
            });
        });

        describe('and multiple jsonInheritance decorators', () => {
            @jsonInheritance(discriminatorProperty({
                property: 'type',
                types: () => ({
                    Employee: Employee,
                }),
            }))
            @jsonObject
            class Person {
                name: string;
            }

            @jsonInheritance(discriminatorProperty({
                property: 'type',
                types: () => ({
                    PartTimeEmployee: PartTimeEmployee,
                }),
            }))
            @jsonObject
            class Employee extends Person {
            }

            @jsonObject
            class PartTimeEmployee extends Employee {
            }

            @jsonObject
            class Company {

                @jsonMember
                owner: Person;
            }

            it('should deserialize into correct type', () => {
                const result = TypedJSON.parse({
                    owner: {
                        name: 'George',
                        type: 'PartTimeEmployee',
                    },
                }, Company);

                expect(result.owner).toBeInstanceOf(PartTimeEmployee);
            });

            it('should have correct type property on serialization', () => {
                const company = new Company();
                company.owner = new PartTimeEmployee();

                const result: any = TypedJSON.toPlainJson(company, Company);
                expect(result.owner.type).toEqual('PartTimeEmployee');
            });
        });
    });
});
