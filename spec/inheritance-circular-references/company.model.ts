import {jsonMember, jsonObject} from '../../src';
import {Person} from './person.model';

@jsonObject
export class Company {

    @jsonMember
    owner: Person;
}
