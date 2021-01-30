import {JsonObjectMetadata, TypeHintEmitter, TypeResolver} from './metadata';
import {extractOptionBase, OptionsBase} from './options-base';
import {Serializable} from './types';

export type InitializerCallback<T> = (sourceObject: T, rawSourceObject: T) => T;

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
export function jsonObject<T>(
    options?: IJsonObjectOptionsWithInitializer<T>,
): (target: Serializable<T>) => void;

/**
 * Marks that a class is serializable using TypedJSON, with additional settings.
 * @param options Configuration settings.
 */
// eslint-disable-next-line @typescript-eslint/unified-signatures
export function jsonObject<T>(options?: IJsonObjectOptions<T>): (target: Serializable<T>) => void;

/**
 * Marks that a class with a parameterless constructor is serializable using TypedJSON.
 */
export function jsonObject<T>(target: Serializable<T>): void;

export function jsonObject<T extends Object>(
    optionsOrTarget?: IJsonObjectOptions<T> | Serializable<T>,
): ((target: Serializable<T>) => void) | void {
    let options: IJsonObjectOptions<T>;

    if (typeof optionsOrTarget === 'function') {
        // jsonObject is being used as a decorator, directly.
        options = {};
    } else {
        // jsonObject is being used as a decorator factory.
        options = optionsOrTarget ?? {};
    }

    function decorator(
        target: Serializable<T>,
    ): void {
        // Create or obtain JsonObjectMetadata object.
        const objectMetadata = JsonObjectMetadata.ensurePresentInPrototype(target.prototype);

        // Fill JsonObjectMetadata.
        objectMetadata.isExplicitlyMarked = true;
        objectMetadata.onDeserializedMethodName = options.onDeserialized;
        objectMetadata.beforeSerializationMethodName = options.beforeSerialization;

        if (options.typeResolver != null) {
            objectMetadata.typeResolver = options.typeResolver;
        }
        if (options.typeHintEmitter != null) {
            objectMetadata.typeHintEmitter = options.typeHintEmitter;
        }

        // T extend Object so it is fine
        objectMetadata.initializerCallback = options.initializer as any;
        if (options.name != null) {
            objectMetadata.name = options.name;
        }
        const optionsBase = extractOptionBase(options);
        if (optionsBase !== undefined) {
            objectMetadata.options = optionsBase;
        }

        if (options.knownTypes != null) {
            options.knownTypes
                .filter(knownType => Boolean(knownType))
                .forEach(knownType => objectMetadata.knownTypes.add(knownType));
        }
    }

    if (typeof optionsOrTarget === 'function') {
        // jsonObject is being used as a decorator, directly.
        decorator(optionsOrTarget);
    } else {
        // jsonObject is being used as a decorator factory.
        return decorator;
    }
}
