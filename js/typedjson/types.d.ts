export declare type IndexedObject = Object & {
    [key: string]: any;
};
export interface AbstractType<T> extends Function {
    prototype: T;
}
export declare type Constructor<T> = new (...args: Array<any>) => T;
export declare type Serializable<T> = Constructor<T> | AbstractType<T>;
