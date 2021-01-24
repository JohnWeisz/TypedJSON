import {discriminatorProperty, jsonInheritance, jsonObject} from '../../src';
import {Person} from './barrel';

@jsonObject
export class Employee extends Person {
}
