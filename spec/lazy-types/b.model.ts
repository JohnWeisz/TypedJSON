import {jsonMember, jsonObject} from '../../src';
import {A} from './a.model';

@jsonObject
export class B {

    @jsonMember(() => A)
    a: A;

    @jsonMember
    name: string;

    test(): true {
        return true;
    }
}
