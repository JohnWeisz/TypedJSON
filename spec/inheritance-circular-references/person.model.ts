import {discriminatorProperty, jsonInheritance, jsonMember, jsonObject} from '../../src';
import {Employee, PartTimeEmployee} from './barrel';

@jsonInheritance(discriminatorProperty({
    property: 'type',
    types: () => ({
        Employee: Employee,
        PartTimeEmployee: PartTimeEmployee,
    }),
}))
@jsonObject
export class Person {

    @jsonMember
    name: string;
}
