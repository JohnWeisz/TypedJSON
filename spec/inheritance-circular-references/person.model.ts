import {discriminatorProperty, jsonInheritance, jsonMember, jsonObject} from '../../src';
import {Employee} from './employee.model';

@jsonInheritance(discriminatorProperty({
    property: 'type',
    types: () => ({
        Employee: Employee,
    }),
}))
@jsonObject
export class Person {

    @jsonMember
    name: string;
}
