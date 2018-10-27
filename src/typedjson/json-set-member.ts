import { nameof } from "./helpers";
import { IJsonMemberOptions } from "./json-member";
import { JsonMemberMetadata, JsonObjectMetadata, injectMetadataInformation } from "./metadata";
import * as Helpers from "./helpers";

declare abstract class Reflect
{
    public static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonSetMemberOptions
{
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;

    /** When set, a default value is emitted for each uninitialized json member. */
    emitDefaultValue?: boolean;

    /** When set, the key on the JSON that should be used instead of the class property name */
    name?: string;

    /** When set, this deserializer will be used to deserialize the member. The callee must assure the correct type. */
    deserializer?: (json: any) => any;

    /** When set, this serializer will be used to serialize the member. */
    serializer?: (value: any) => any;
}

/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Set<T>.
 * @param elementConstructor Constructor of set elements (e.g. 'Number' for Set<number> or 'Date' for Set<Date>).
 * @param options Additional options.
 */
export function jsonSetMember(elementConstructor: Function, options: IJsonSetMemberOptions = {})
{
    return (target: Object, propKey: string | symbol) =>
    {
        var decoratorName = `@jsonSetMember on ${nameof(target.constructor)}.${String(propKey)}`; // For error messages.

        if (typeof elementConstructor !== "function")
        {
            Helpers.logError(`${decoratorName}: could not resolve constructor of set elements at runtime.`);
            return;
        }

        // If ReflectDecorators is available, use it to check whether 'jsonSetMember' has been used on a set. Warn if not.
        if (Helpers.isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Set)
        {
            Helpers.logError(`${decoratorName}: property is not a Set.`);
            return;
        }

        injectMetadataInformation(target, propKey, {
            ctor: Set,
            elementType: [elementConstructor],
            emitDefaultValue: options.emitDefaultValue || false,
            isRequired: options.isRequired || false,
            key: propKey.toString(),
            name: options.name || propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}
