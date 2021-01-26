import {TypeDescriptor} from './type-descriptor';

export type IndexedObject = Object & {[key: string]: any};

export type TypeThunk = () => Serializable<any> | TypeDescriptor;
export type MaybeTypeThunk = Serializable<any> | TypeDescriptor | TypeThunk;

export interface AbstractType<T> extends Function {
    prototype: T;
}

export type Constructor<T> = new (...args: Array<any>) => T;
export type Serializable<T> = Constructor<T> | AbstractType<T>;
