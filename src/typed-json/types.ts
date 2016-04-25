export enum TypeHint {
    None = 1,
    DataContract
}

export declare type Constructor<T> = { new (...args: any[]): T };
export declare type ParameterlessConstructor<T> = { new (): T };
export declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
export declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
export declare type StaticPropertyDecorator = (target: Constructor<any>, propertyKey: string | symbol) => void;
export declare type SerializerSettings = {
    typeHinting?: TypeHint,
    maxObjects?: number
};