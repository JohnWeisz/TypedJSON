import { JsonObjectMetadata } from "./metadata";
import { METADATA_FIELD_KEY } from "./helpers";

export interface IJsonAbstractObjectOptions<T>
{
    /** An array of known types to recognize when encountering type-hints, or the name of a static method used for determining known types. */
    knownTypes?: Function[] | string;

    /** The name of a static or instance method to call when deserialization of the object is completed. */
    onDeserialized?: string;
}

/**
 * Marks that the class is serializable using TypedJSON.
 * @param options Configuration settings.
 */
export function JsonAbstractObject<T>(options?: IJsonAbstractObjectOptions<T>): (target: Function) => void;

/**
 * Marks that the class is serializable using TypedJSON.
 */
export function JsonAbstractObject<T>(target: Function): void;

export function JsonAbstractObject<T>(optionsOrTarget?: IJsonAbstractObjectOptions<T> | Function): (target: Function) => void | void
{
    var options: IJsonAbstractObjectOptions<T>;

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

    function decorator(target: Function): void
    {
        let objectMetadata: JsonObjectMetadata;

        // Create or obtain JsonObjectMetadata object.
        if (!target.prototype.hasOwnProperty(METADATA_FIELD_KEY))
        {
            // Target has no JsonObjectMetadata associated with it yet, create it now.
            objectMetadata = new JsonObjectMetadata(target.name, target);

            // Inherit json members and known types from parent @jsonObject (if any).
            const parentMetadata = target.prototype[METADATA_FIELD_KEY];
            if (parentMetadata)
            {
                parentMetadata.dataMembers.forEach((memberMetadata, propKey) => objectMetadata.dataMembers.set(propKey, memberMetadata));
                parentMetadata.knownTypes.forEach((knownType, name) => objectMetadata.knownTypes.add(knownType));
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
        objectMetadata.isAbstract = true;
        objectMetadata.onDeserializedMethodName = options.onDeserialized;

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
