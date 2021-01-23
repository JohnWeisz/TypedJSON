import {discriminatorProperty, jsonInheritance, jsonObject} from '../../src';
import {PartTimeEmployee} from './part-time-employee.model';
import {Person} from './person.model';

@jsonInheritance(discriminatorProperty({
    property: 'type',
    types: () => ({
        PartTimeEmployee: PartTimeEmployee,
    }),
}))
@jsonObject
export class Employee extends Person {
}
