import { defaultTypeResolver } from './typedjson/deserializer';
import { TypeHintEmitter, TypeResolver } from './typedjson/metadata';
import { OptionsBase } from './typedjson/options-base';
import { defaultTypeEmitter } from './typedjson/serializer';
import { Constructor, IndexedObject, Serializable } from './typedjson/types';
export declare type JsonTypes = Object | boolean | string | number | null | undefined;
export { defaultTypeResolver, defaultTypeEmitter };
export interface ITypedJSONSettings extends OptionsBase {
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
    typeResolver?: TypeResolver;
    nameResolver?: (ctor: Function) => string;
    /**
     * Sets a callback that writes type-hints to serialized objects.
     * The default behavior is to write the type-name to the '__type' property, if a derived type
     * is present in place of a base type.
     */
    typeHintEmitter?: TypeHintEmitter;
    /**
     * Sets the amount of indentation to use in produced JSON strings.
     * Default value is 0, or no indentation.
     */
    indent?: number;
    replacer?: (key: string, value: any) => any;
    knownTypes?: Array<Constructor<any>>;
}
export declare class TypedJSON<T> {
    static parse<T>(object: any, rootType: Serializable<T>, settings?: ITypedJSONSettings): T | undefined;
    static parseAsArray<T>(object: any, elementType: Serializable<T>, settings?: ITypedJSONSettings, dimensions?: 1): Array<T>;
    static parseAsArray<T>(object: any, elementType: Serializable<T>, settings: ITypedJSONSettings | undefined, dimensions: 2): Array<Array<T>>;
    static parseAsArray<T>(object: any, elementType: Serializable<T>, settings: ITypedJSONSettings | undefined, dimensions: 3): Array<Array<Array<T>>>;
    static parseAsArray<T>(object: any, elementType: Serializable<T>, settings: ITypedJSONSettings | undefined, dimensions: 4): Array<Array<Array<Array<T>>>>;
    static parseAsArray<T>(object: any, elementType: Serializable<T>, settings: ITypedJSONSettings | undefined, dimensions: 5): Array<Array<Array<Array<Array<T>>>>>;
    static parseAsSet<T>(object: any, elementType: Serializable<T>, settings?: ITypedJSONSettings): Set<T>;
    static parseAsMap<K, V>(object: any, keyType: Serializable<K>, valueType: Serializable<V>, settings?: ITypedJSONSettings): Map<K, V>;
    static toPlainJson<T>(object: T, rootType: Serializable<T>, settings?: ITypedJSONSettings): JsonTypes;
    static toPlainArray<T>(object: Array<T>, elementType: Serializable<T>, dimensions?: 1, settings?: ITypedJSONSettings): Array<Object>;
    static toPlainArray<T>(object: Array<Array<T>>, elementType: Serializable<T>, dimensions: 2, settings?: ITypedJSONSettings): Array<Array<Object>>;
    static toPlainArray<T>(object: Array<Array<Array<T>>>, elementType: Serializable<T>, dimensions: 3, settings?: ITypedJSONSettings): Array<Array<Array<Object>>>;
    static toPlainArray<T>(object: Array<Array<Array<Array<T>>>>, elementType: Serializable<T>, dimensions: 4, settings?: ITypedJSONSettings): Array<Array<Array<Array<Object>>>>;
    static toPlainArray<T>(object: Array<Array<Array<Array<Array<T>>>>>, elementType: Serializable<T>, dimensions: 5, settings?: ITypedJSONSettings): Array<Array<Array<Array<Array<Object>>>>>;
    static toPlainArray<T>(object: Array<any>, elementType: Serializable<T>, dimensions: number, settings?: ITypedJSONSettings): Array<any>;
    static toPlainSet<T>(object: Set<T>, elementType: Serializable<T>, settings?: ITypedJSONSettings): Array<Object> | undefined;
    static toPlainMap<K, V>(object: Map<K, V>, keyCtor: Serializable<K>, valueCtor: Serializable<V>, settings?: ITypedJSONSettings): IndexedObject | Array<{
        key: any;
        value: any;
    }> | undefined;
    static stringify<T>(object: T, rootType: Serializable<T>, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: Array<T>, elementType: Serializable<T>, dimensions?: 1, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: Array<Array<T>>, elementType: Serializable<T>, dimensions: 2, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: Array<Array<Array<T>>>, elementType: Serializable<T>, dimensions: 3, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: Array<Array<Array<Array<T>>>>, elementType: Serializable<T>, dimensions: 4, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: Array<Array<Array<Array<Array<T>>>>>, elementType: Serializable<T>, dimensions: 5, settings?: ITypedJSONSettings): string;
    static stringifyAsArray<T>(object: Array<any>, elementType: Serializable<T>, dimensions: number, settings?: ITypedJSONSettings): string;
    static stringifyAsSet<T>(object: Set<T>, elementType: Serializable<T>, settings?: ITypedJSONSettings): string;
    static stringifyAsMap<K, V>(object: Map<K, V>, keyCtor: Serializable<K>, valueCtor: Serializable<V>, settings?: ITypedJSONSettings): string;
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
     * @param rootConstructor The constructor of the root class type.
     * @param settings Additional configuration settings.
     */
    constructor(rootConstructor: Serializable<T>, settings?: ITypedJSONSettings);
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
    parseAsArray(object: any, dimensions?: 1): Array<T>;
    parseAsArray(object: any, dimensions: 2): Array<Array<T>>;
    parseAsArray(object: any, dimensions: 3): Array<Array<Array<T>>>;
    parseAsArray(object: any, dimensions: 4): Array<Array<Array<Array<T>>>>;
    parseAsArray(object: any, dimensions: 5): Array<Array<Array<Array<Array<T>>>>>;
    parseAsArray(object: any, dimensions: number): Array<any>;
    parseAsSet(object: any): Set<T>;
    parseAsMap<K>(object: any, keyConstructor: Serializable<K>): Map<K, T>;
    /**
     * Converts an instance of the specified class type to a plain JSON object.
     * @param object The instance to convert to a JSON string.
     * @returns Serialized object or undefined if an error has occured.
     */
    toPlainJson(object: T): JsonTypes;
    toPlainArray(object: Array<T>, dimensions?: 1): Array<Object>;
    toPlainArray(object: Array<Array<T>>, dimensions: 2): Array<Array<Object>>;
    toPlainArray(object: Array<Array<Array<T>>>, dimensions: 3): Array<Array<Array<Object>>>;
    toPlainArray(object: Array<Array<Array<Array<T>>>>, dimensions: 4): Array<Array<Array<Array<Object>>>>;
    toPlainArray(object: Array<Array<Array<Array<Array<T>>>>>, dimensions: 5): Array<Array<Array<Array<Array<Object>>>>>;
    toPlainSet(object: Set<T>): Array<Object> | undefined;
    toPlainMap<K>(object: Map<K, T>, keyConstructor: Serializable<K>): IndexedObject | Array<{
        key: any;
        value: any;
    }> | undefined;
    /**
     * Converts an instance of the specified class type to a JSON string.
     * @param object The instance to convert to a JSON string.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     * @returns String with the serialized object or an empty string if an error has occured, but
     *     the errorHandler did not throw.
     */
    stringify(object: T): string;
    stringifyAsArray(object: Array<T>, dimensions?: 1): string;
    stringifyAsArray(object: Array<Array<T>>, dimensions: 2): string;
    stringifyAsArray(object: Array<Array<Array<T>>>, dimensions: 3): string;
    stringifyAsArray(object: Array<Array<Array<Array<T>>>>, dimensions: 4): string;
    stringifyAsArray(object: Array<Array<Array<Array<Array<T>>>>>, dimensions: 5): string;
    stringifyAsSet(object: Set<T>): string;
    stringifyAsMap<K>(object: Map<K, T>, keyConstructor: Serializable<K>): string;
    private _mapKnownTypes;
}
