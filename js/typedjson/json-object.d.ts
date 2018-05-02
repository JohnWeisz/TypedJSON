import { Constructor, ParameterlessConstructor } from "./types";
export interface IJsonObjectOptionsWithInitializer<T> {
    /** An array of known types to recognize when encountering type-hints, or the name of a static method used for determining known types. */
    knownTypes?: Function[] | string;
    /** The name of a static or instance method to call when deserialization of the object is completed. */
    onDeserialized?: string;
    /**
     * The name of a static method to call before deserializing and initializing the object, accepting two arguments: (1) sourceObject, an 'Object' instance
     * with all properties already deserialized, and (2) rawSourceObject, a raw 'Object' instance representation of the current object in the serialized JSON
     * (i.e. without deserialized properties).
     */
    initializer: (sourceObject: T, rawSourceObject: T) => T;
    name?: string;
}
export interface IJsonObjectOptions<T> {
    /** An array of known types to recognize when encountering type-hints, or the name of a static method used for determining known types. */
    knownTypes?: Function[] | string;
    /** The name of a static or instance method to call when deserialization of the object is completed. */
    onDeserialized?: string;
    /**
     * The name of a static method to call before deserializing and initializing the object, accepting two arguments: (1) sourceObject, an 'Object' instance
     * with all properties already deserialized, and (2) rawSourceObject, a raw 'Object' instance representation of the current object in the serialized JSON
     * (i.e. without deserialized properties).
     */
    initializer?: (sourceObject: T, rawSourceObject: T) => T;
    name?: string;
}
/**
 * Marks that a class with a parameterized constructor is serializable using TypedJSON, with additional settings. The 'initializer' setting must be specified.
 * @param options Configuration settings.
 */
export declare function jsonObject<T>(options?: IJsonObjectOptionsWithInitializer<T>): (target: Constructor<T>) => void;
/**
 * Marks that a class is serializable using TypedJSON, with additional settings.
 * @param options Configuration settings.
 */
export declare function jsonObject<T>(options?: IJsonObjectOptions<T>): (target: ParameterlessConstructor<T>) => void;
/**
 * Marks that a class with a parameterless constructor is serializable using TypedJSON.
 */
export declare function jsonObject<T>(target: ParameterlessConstructor<T>): void;
