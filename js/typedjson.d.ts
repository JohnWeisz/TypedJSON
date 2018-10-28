import { Constructor } from "./typedjson/types";
export interface ITypedJSONSettings {
    /**
     * Sets the handler callback to invoke on errors during serializing and deserializing.
     * Re-throwing errors in this function will halt serialization/deserialization.
     * The default behavior is to log errors to the console.
     */
    errorHandler?: (e: Error) => void;
    /**
     * Sets a callback that determines the constructor of the correct sub-type of polymorphic
     * objects while deserializing.
     * The default behavior is to read the type-name from the '__type' property of 'sourceObject',
     * and look it up in 'knownTypes'.
     * The constructor of the sub-type should be returned.
     */
    typeResolver?: (sourceObject: Object, knownTypes: Map<string, Function>) => Function;
    nameResolver?: (ctor: Function) => string;
    /**
     * Sets a callback that writes type-hints to serialized objects.
     * The default behavior is to write the type-name to the '__type' property, if a derived type
     * is present in place of a base type.
     */
    typeHintEmitter?: (targetObject: Object, sourceObject: Object, expectedSourceType: Function) => void;
    /**
     * Sets the amount of indentation to use in produced JSON strings.
     * Default value is 0, or no indentation.
     */
    indent?: number;
    replacer?: (key: string, value: any) => any;
    knownTypes?: Array<Constructor<any>>;
}
export declare class TypedJSON<T> {
    static parse<T>(object: any, rootType: Constructor<T>, settings?: ITypedJSONSettings): T | undefined;
    static parseAsArray<T>(object: any, elementType: Constructor<T>, settings?: ITypedJSONSettings, dimensions?: 1): T[];
    static parseAsArray<T>(object: any, elementType: Constructor<T>, settings: ITypedJSONSettings | undefined, dimensions: 2): T[][];
    static parseAsArray<T>(object: any, elementType: Constructor<T>, settings: ITypedJSONSettings | undefined, dimensions: 3): T[][][];
    static parseAsArray<T>(object: any, elementType: Constructor<T>, settings: ITypedJSONSettings | undefined, dimensions: 4): T[][][][];
    static parseAsArray<T>(object: any, elementType: Constructor<T>, settings: ITypedJSONSettings | undefined, dimensions: 5): T[][][][][];
    static parseAsSet<T>(object: any, elementType: Constructor<T>, settings?: ITypedJSONSettings): Set<T>;
    static parseAsMap<K, V>(object: any, keyType: Constructor<K>, valueType: Constructor<V>, settings?: ITypedJSONSettings): Map<K, V>;
    static toPlainJson<T>(object: T, rootType: Constructor<T>, settings?: ITypedJSONSettings): Object | undefined;
    static toPlainArray<T>(object: T[], elementType: Constructor<T>, dimensions?: 1, settings?: ITypedJSONSettings): Object[];
    static toPlainArray<T>(object: T[][], elementType: Constructor<T>, dimensions: 2, settings?: ITypedJSONSettings): Object[][];
    static toPlainArray<T>(object: T[][][], elementType: Constructor<T>, dimensions: 3, settings?: ITypedJSONSettings): Object[][][];
    static toPlainArray<T>(object: T[][][][], elementType: Constructor<T>, dimensions: 4, settings?: ITypedJSONSettings): Object[][][][];
    static toPlainArray<T>(object: T[][][][][], elementType: Constructor<T>, dimensions: 5, settings?: ITypedJSONSettings): Object[][][][][];
    static toPlainArray<T>(object: any[], elementType: Constructor<T>, dimensions: number, settings?: ITypedJSONSettings): any[];
    static toPlainSet<T>(object: Set<T>, elementType: Constructor<T>, settings?: ITypedJSONSettings): string;
    static toPlainMap<K, V>(object: Map<K, V>, keyCtor: Constructor<K>, valueCtor: Constructor<V>, settings?: ITypedJSONSettings): string;
    static stringify<T>(object: T, rootType: Constructor<T>, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[], elementType: Constructor<T>, dimensions?: 1, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[][], elementType: Constructor<T>, dimensions: 2, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[][][], elementType: Constructor<T>, dimensions: 3, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[][][][], elementType: Constructor<T>, dimensions: 4, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[][][][][], elementType: Constructor<T>, dimensions: 5, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: any[], elementType: Constructor<T>, dimensions: number, settings?: ITypedJSONSettings): string;
    static stringifyAsSet<T>(object: Set<T>, elementType: Constructor<T>, settings?: ITypedJSONSettings): string;
    static stringifyAsMap<K, V>(object: Map<K, V>, keyCtor: Constructor<K>, valueCtor: Constructor<V>, settings?: ITypedJSONSettings): string;
    private static _globalConfig;
    static setGlobalConfig(config: ITypedJSONSettings): void;
    private serializer;
    private deserializer;
    private globalKnownTypes;
    private indent;
    private rootConstructor;
    private errorHandler;
    private nameResolver;
    private replacer?;
    /**
     * Creates a new TypedJSON instance to serialize (stringify) and deserialize (parse) object
     *     instances of the specified root class type.
     * @param rootType The constructor of the root class type.
     * @param settings Additional configuration settings.
     */
    constructor(rootConstructor: Constructor<T>, settings?: ITypedJSONSettings);
    /**
     * Configures TypedJSON through a settings object.
     * @param settings The configuration settings object.
     */
    config(settings: ITypedJSONSettings): void;
    /**
     * Converts a JSON string to the root class type.
     * @param object The JSON to parse and convert.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     * @returns Deserialized T or undefined if there were errors.
     */
    parse(object: any): T | undefined;
    parseAsArray(object: any, dimensions?: 1): T[];
    parseAsArray(object: any, dimensions: 2): T[][];
    parseAsArray(object: any, dimensions: 3): T[][][];
    parseAsArray(object: any, dimensions: 4): T[][][][];
    parseAsArray(object: any, dimensions: 5): T[][][][][];
    parseAsArray(object: any, dimensions: number): any[];
    parseAsSet(object: any): Set<T>;
    parseAsMap<K>(object: any, keyConstructor: Constructor<K>): Map<K, T>;
    /**
     * Converts an instance of the specified class type to a plain JSON object.
     * @param object The instance to convert to a JSON string.
     * @returns Serialized object or undefined if an error has occured.
     */
    toPlainJson(object: T): Object | undefined;
    toPlainArray(object: T[], dimensions?: 1): Object[];
    toPlainArray(object: T[][], dimensions: 2): Object[][];
    toPlainArray(object: T[][][], dimensions: 3): Object[][][];
    toPlainArray(object: T[][][][], dimensions: 4): Object[][][][];
    toPlainArray(object: T[][][][][], dimensions: 5): Object[][][][][];
    toPlainSet(object: Set<T>): Object[] | undefined;
    toPlainMap<K>(object: Map<K, T>, keyConstructor: Constructor<K>): {
        key: any;
        value: any;
    }[] | undefined;
    /**
     * Converts an instance of the specified class type to a JSON string.
     * @param object The instance to convert to a JSON string.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     * @returns String with the serialized object or an empty string if an error has occured, but
     *     the errorHandler did not throw.
     */
    stringify(object: T): string;
    stringifyAsArray(object: T[], dimensions?: 1): string;
    stringifyAsArray(object: T[][], dimensions: 2): string;
    stringifyAsArray(object: T[][][], dimensions: 3): string;
    stringifyAsArray(object: T[][][][], dimensions: 4): string;
    stringifyAsArray(object: T[][][][][], dimensions: 5): string;
    stringifyAsSet(object: Set<T>): string;
    stringifyAsMap<K>(object: Map<K, T>, keyConstructor: Constructor<K>): string;
    private _mapKnownTypes(constructors);
}
export { jsonObject } from "./typedjson/json-object";
export { jsonMember } from "./typedjson/json-member";
export { jsonArrayMember } from "./typedjson/json-array-member";
export { jsonSetMember } from "./typedjson/json-set-member";
export { jsonMapMember } from "./typedjson/json-map-member";
