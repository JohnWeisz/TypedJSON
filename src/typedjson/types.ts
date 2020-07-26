export type IndexedObject = Object & { [key: string]: any };

export interface AbstractType<T> extends Function
{
    prototype: T;
}

export type Constructor<T> = new (...args: any[]) => T;
export type Serializable<T> = Constructor<T> | AbstractType<T>;
