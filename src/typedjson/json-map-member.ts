import { nameof } from "./helpers";
import { IJsonMemberOptions } from "./json-member";
import { JsonMemberMetadata, JsonObjectMetadata, injectMetadataInformation } from "./metadata";
import * as Helpers from "./helpers";

declare abstract class Reflect
{
    public static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonMapMemberOptions
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
 * Use this decorator on properties of type Map<K, V>.
 * @param keyConstructor Constructor of map keys (e.g. 'Number' for 'Map<number, Date>').
 * @param valueConstructor Constructor of map values (e.g. 'Date' for 'Map<number, Date>').
 * @param options Additional options.
 */
export function jsonMapMember(keyConstructor: Function, valueConstructor: Function, options: IJsonMapMemberOptions = {})
{
    return (target: Object, propKey: string | symbol) =>
    {
        let decoratorName = `@jsonMapMember on ${nameof(target.constructor)}.${propKey}`; // For error messages.

        if (typeof keyConstructor !== "function")
        {
            Helpers.logError(`${decoratorName}: could not resolve constructor of map keys at runtime.`);
            return;
        }

        if (typeof valueConstructor !== "function")
        {
            Helpers.logError(`${decoratorName}: could not resolve constructor of map values at runtime.`);
            return;
        }

        // If ReflectDecorators is available, use it to check whether 'jsonMapMember' has been used on a map. Warn if not.
        if (Helpers.isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Map)
        {
            Helpers.logError(`${decoratorName}: property is not a Map.`);
            return;
        }

        let metadata = new JsonMemberMetadata();

        metadata.ctor = Map;
        metadata.elementType = [valueConstructor];
        metadata.keyType = keyConstructor;
        metadata.emitDefaultValue = options.emitDefaultValue || false;
        metadata.isRequired = options.isRequired || false;
        metadata.key = propKey.toString();
        metadata.name = options.name || propKey.toString();
        metadata.deserializer = options.deserializer;
        metadata.serializer = options.serializer;

        injectMetadataInformation(target, propKey, metadata);
    };
}
