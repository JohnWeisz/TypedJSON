import {jsonMember, jsonObject} from '../../src';
import {Person} from './barrel';

@jsonObject
export class Company {

    @jsonMember
    owner: Person;
}
