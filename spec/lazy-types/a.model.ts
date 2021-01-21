import {jsonMember, jsonObject} from '../../src';
import {B} from './b.model';

@jsonObject
export class A {

    @jsonMember(() => B)
    b: B;

    @jsonMember
    name: string;

    test(): true {
        return true;
    }
}
