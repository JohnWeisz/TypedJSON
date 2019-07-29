import { Constructor, ParameterlessConstructor } from "./types";
import { METADATA_FIELD_KEY } from "./helpers";
import { JsonObjectMetadata } from "./metadata";
import { extractOptionBase, OptionsBase } from "./options-base";

export type InitializerCallback<T> = (sourceObject: T, rawSourceObject: T) => T;

export interface IJsonObjectOptionsBase extends OptionsBase
{
    /**
     * An array of known types to recognize when encountering type-hints,
     * or the name of a static method used for determining known types.
     */
    knownTypes?: Function[] | string;

    /**
     * The name of a static or instance method to call when deserialization
     * of the object is completed.
     */
    onDeserialized?: string;

    /**
     * The name used to differentiate between different polymorphic types.
     */
    name?: string;
}

export interface IJsonObjectOptionsWithInitializer<T> extends IJsonObjectOptionsBase
{
    /**
     * Function to call before deserializing and initializing the object, accepting two arguments:
     *   (1) sourceObject, an 'Object' instance with all properties already deserialized, and
     *   (2) rawSourceObject, a raw 'Object' instance representation of the current object in
     *       the serialized JSON (i.e. without deserialized properties).
     */
    initializer: InitializerCallback<T>;
}

export interface IJsonObjectOptions<T> extends IJsonObjectOptionsBase
{
    /**
     * Function to call before deserializing and initializing the object, accepting two arguments:
     *   (1) sourceObject, an 'Object' instance with all properties already deserialized, and
     *   (2) rawSourceObject, a raw 'Object' instance representation of the current object in
     *       the serialized JSON (i.e. without deserialized properties).
     */
    initializer?: InitializerCallback<T>;
}

/**
 * Marks that a class with a parameterized constructor is serializable using TypedJSON, with additional
 * settings. The 'initializer' setting must be specified.
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

export function jsonObject<T extends Object>(optionsOrTarget?: IJsonObjectOptions<T> | Constructor<T>
): ((target: Constructor<T>) => void) | void {
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

    function decorator(
        target: Function
    ): void {
        let objectMetadata: JsonObjectMetadata;

        // Create or obtain JsonObjectMetadata object.
        if (!target.prototype.hasOwnProperty(METADATA_FIELD_KEY))
        {
            // Target has no JsonObjectMetadata associated with it yet, create it now.
            objectMetadata = new JsonObjectMetadata(target);

            // Inherit json members and known types from parent @jsonObject (if any).
            const parentMetadata: JsonObjectMetadata = target.prototype[METADATA_FIELD_KEY];
            if (parentMetadata)
            {
                parentMetadata.dataMembers
                    .forEach((memberMetadata, propKey) =>
                        objectMetadata.dataMembers.set(propKey, memberMetadata));
                parentMetadata.knownTypes
                    .forEach((knownType) => objectMetadata.knownTypes.add(knownType));
            }

            Object.defineProperty(target.prototype, METADATA_FIELD_KEY, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: objectMetadata
            });
        }
        else
        {
            // Target already has JsonObjectMetadata associated with it.
            objectMetadata = target.prototype[METADATA_FIELD_KEY];
            objectMetadata.classType = target;
        }

        // Fill JsonObjectMetadata.
        objectMetadata.isExplicitlyMarked = true;
        objectMetadata.onDeserializedMethodName = options.onDeserialized;
        // T extend Object so it is fine
        objectMetadata.initializerCallback = options.initializer as any;
        if (options.name)
        {
            objectMetadata.name = options.name;
        }
        const optionsBase = extractOptionBase(options);
        if (optionsBase)
        {
            objectMetadata.options = optionsBase;
        }

        // Obtain known-types.
        if (typeof options.knownTypes === "string")
        {
            objectMetadata.knownTypeMethodName = options.knownTypes;
        }
        else if (options.knownTypes instanceof Array)
        {
            options.knownTypes
                .filter(knownType => !!knownType)
                .forEach(knownType => objectMetadata.knownTypes.add(knownType));
        }
    }

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
