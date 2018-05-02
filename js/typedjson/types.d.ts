export declare type IndexedObject = Object & {
    [key: string]: any;
};
export declare type Constructor<T> = new (...args: any[]) => T;
export declare type ParameterlessConstructor<T> = new () => T;
