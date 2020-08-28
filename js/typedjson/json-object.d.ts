import { TypeHintEmitter, TypeResolver } from './metadata';
import { OptionsBase } from './options-base';
import { Serializable } from './types';
export declare type InitializerCallback<T> = (sourceObject: T, rawSourceObject: T) => T;
export interface IJsonObjectOptionsBase extends OptionsBase {
    /**
     * An array of known types to recognize when encountering type-hints.
     */
    knownTypes?: Array<Function> | null;
    /**
     * A function that will emit a type hint on the resulting JSON. It will override the global
     * typeEmitter.
     */
    typeHintEmitter?: TypeHintEmitter | null;
    /**
     * A function that given a source object will resolve the type that should be instantiated.
     * It will override the global type resolver.
     */
    typeResolver?: TypeResolver | null;
    /**
     * The name of a static or instance method to call when deserialization
     * of the object is completed.
     */
    onDeserialized?: string | null;
    /**
     * The name of a static or instance method to call before the serialization
     * of the typed object is started.
     */
    beforeSerialization?: string | null;
    /**
     * The name used to differentiate between different polymorphic types.
     */
    name?: string | null;
}
export interface IJsonObjectOptionsWithInitializer<T> extends IJsonObjectOptionsBase {
    /**
     * Function to call before deserializing and initializing the object, accepting two arguments:
     *   (1) sourceObject, an 'Object' instance with all properties already deserialized, and
     *   (2) rawSourceObject, a raw 'Object' instance representation of the current object in
     *       the serialized JSON (i.e. without deserialized properties).
     */
    initializer: InitializerCallback<T>;
}
export interface IJsonObjectOptions<T> extends IJsonObjectOptionsBase {
    /**
     * Function to call before deserializing and initializing the object, accepting two arguments:
     *   (1) sourceObject, an 'Object' instance with all properties already deserialized, and
     *   (2) rawSourceObject, a raw 'Object' instance representation of the current object in
     *       the serialized JSON (i.e. without deserialized properties).
     */
    initializer?: InitializerCallback<T> | null;
}
/**
 * Marks that a class with a parameterized constructor is serializable using TypedJSON, with
 * additional settings. The 'initializer' setting must be specified.
 * @param options Configuration settings.
 */
export declare function jsonObject<T>(options?: IJsonObjectOptionsWithInitializer<T>): (target: Serializable<T>) => void;
/**
 * Marks that a class is serializable using TypedJSON, with additional settings.
 * @param options Configuration settings.
 */
export declare function jsonObject<T>(options?: IJsonObjectOptions<T>): (target: Serializable<T>) => void;
/**
 * Marks that a class with a parameterless constructor is serializable using TypedJSON.
 */
export declare function jsonObject<T>(target: Serializable<T>): void;
