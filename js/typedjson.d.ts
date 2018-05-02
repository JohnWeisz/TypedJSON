import { Constructor } from "./typedjson/types";
export interface ITypedJSONSettings {
    /**
     * Sets the handler callback to invoke on errors during serializing and deserializing.
     * Re-throwing errors in this function will halt serialization/deserialization.
     * The default behavior is to log errors to the console.
     */
    errorHandler?: (e: Error) => void;
    /**
     * Sets a callback that determines the constructor of the correct sub-type of polymorphic objects while deserializing.
     * The default behavior is to read the type-name from the '__type' property of 'sourceObject', and look it up in 'knownTypes'.
     * The constructor of the sub-type should be returned.
     */
    typeResolver?: (sourceObject: Object, knownTypes: Map<string, Function>) => Function;
    nameResolver?: (ctor: Function) => string;
    /**
     * Sets a callback that writes type-hints to serialized objects.
     * The default behavior is to write the type-name to the '__type' property, if a derived type is present in place of a base type.
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
    static parse<T>(json: string, rootType: Constructor<T>, settings?: ITypedJSONSettings): T;
    static parseAsArray<T>(json: string, elementType: Constructor<T>, settings?: ITypedJSONSettings): T[];
    static parseAsSet<T>(json: string, elementType: Constructor<T>, settings?: ITypedJSONSettings): Set<T>;
    static parseAsMap<K, V>(json: string, keyType: Constructor<K>, valueType: Constructor<V>, settings?: ITypedJSONSettings): Map<K, V>;
    static stringify<T>(object: T, rootType: Constructor<T>, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[], elementType: Constructor<T>, dimensions?: 1, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[][], elementType: Constructor<T>, dimensions: 2, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[][][], elementType: Constructor<T>, dimensions: 3, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[][][][], elementType: Constructor<T>, dimensions: 4, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: T[][][][][], elementType: Constructor<T>, dimensions: 5, settings?: ITypedJSONSettings): string;
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
    private replacer;
    /**
     * Creates a new TypedJSON instance to serialize (stringify) and deserialize (parse) object instances of the specified root class type.
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
     * @param json The JSON string to parse and convert.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     */
    parse(json: string): T;
    parseAsArray(json: string, dimensions?: number): T[];
    parseAsSet(json: string): Set<T>;
    parseAsMap<K>(json: string, keyConstructor: Constructor<K>): Map<K, T>;
    /**
     * Converts an instance of the specified class type to a JSON string.
     * @param object The instance to convert to a JSON string.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
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
