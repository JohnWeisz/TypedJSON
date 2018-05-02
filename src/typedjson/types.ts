export type IndexedObject = Object & { [key: string]: any };
export type Constructor<T> = new (...args: any[]) => T;
export type ParameterlessConstructor<T> = new () => T;
