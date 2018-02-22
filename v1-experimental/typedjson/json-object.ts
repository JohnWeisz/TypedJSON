import { nameof } from "./helpers";
import * as Helpers from "./helpers";
import { JsonObjectMetadata } from "./metadata";
import { Constructor, ParameterlessConstructor } from "./types";

export interface IJsonObjectOptionsWithInitializer<T>
{
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

export interface IJsonObjectOptions<T>
{
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
export function jsonObject<T>(options?: IJsonObjectOptionsWithInitializer<T>): (target: Constructor<T>) => void;

/**
 * Marks that a class is serializable using TypedJSON, with additional settings.
 * @param options Configuration settings.
 */
export function jsonObject<T>(options?: IJsonObjectOptions<T>): (target: ParameterlessConstructor<T>) => void;

/**
 * Marks that a class with a parameterless constructor is serializable using TypedJSON.
 */
export function jsonObject<T>(target: ParameterlessConstructor<T>): void;

export function jsonObject<T>(optionsOrTarget?: IJsonObjectOptions<T> | Constructor<T>): (target: Constructor<T>) => void | void
{
    let options: IJsonObjectOptions<T>;

    if (typeof optionsOrTarget === "function")
    {
        // jsonObject is being used as a decorator, directly.
        options = {};
    }
    else
    {
        // jsonObject is being used as a decorator factory.
        options = optionsOrTarget || {};
    }

    let decorator = function (target: Function): void
    {
        let objectMetadata: JsonObjectMetadata;
        let parentMetadata: JsonObjectMetadata;

        // Create or obtain JsonObjectMetadata object.
        if (!target.prototype.hasOwnProperty(Helpers.METADATA_FIELD_KEY))
        {
            // Target has no JsonObjectMetadata associated with it yet, create it now.
            objectMetadata = new JsonObjectMetadata();
            parentMetadata = target.prototype[Helpers.METADATA_FIELD_KEY];

            // Inherit json members and known types from parent @jsonObject (if any).
            if (parentMetadata)
            {
                parentMetadata.dataMembers.forEach((memberMetadata, propKey) => objectMetadata.dataMembers.set(propKey, memberMetadata));
                parentMetadata.knownTypes.forEach((knownType) => objectMetadata.knownTypes.add(knownType));
            }

            if (options.name)
            {
                objectMetadata.name = options.name;
            }
            else
            {
                objectMetadata.name = target.name;
            }

            Object.defineProperty(target.prototype, Helpers.METADATA_FIELD_KEY, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: objectMetadata
            });
        }
        else
        {
            // Target already has JsonObjectMetadata associated with it.
            objectMetadata = target.prototype[Helpers.METADATA_FIELD_KEY];

            if (options.name)
            {
                objectMetadata.name = options.name;
            }
        }

        // Fill JsonObjectMetadata.
        objectMetadata.classType = target;
        objectMetadata.isExplicitlyMarked = true;
        objectMetadata.isAbstract = false;
        objectMetadata.initializerCallback = options.initializer;

        // Obtain known-types.
        if (typeof options.knownTypes === "string")
        {
            objectMetadata.knownTypeMethodName = options.knownTypes;
        }
        else if (options.knownTypes instanceof Array)
        {
            options.knownTypes.filter(knownType => !!knownType).forEach(knownType => objectMetadata.knownTypes.add(knownType));
        }
    };

    if (typeof optionsOrTarget === "function")
    {
        // jsonObject is being used as a decorator, directly.
        decorator(optionsOrTarget);
    }
    else
    {
        // jsonObject is being used as a decorator factory.
        return decorator;
    }
}
