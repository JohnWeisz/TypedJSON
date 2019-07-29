import { nameof, logError, isReflectMetadataSupported } from "./helpers";
import { injectMetadataInformation } from "./metadata";
import { extractOptionBase, getDefaultOptionOf, OptionsBase } from "./options-base";

declare abstract class Reflect
{
    public static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonMapMemberOptions extends OptionsBase
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
        let decoratorName = `@jsonMapMember on ${nameof(target.constructor)}.${String(propKey)}`; // For error messages.

        if (typeof keyConstructor !== "function")
        {
            logError(`${decoratorName}: could not resolve constructor of map keys at runtime.`);
            return;
        }

        if (typeof valueConstructor !== "function")
        {
            logError(`${decoratorName}: could not resolve constructor of map values at runtime.`);
            return;
        }

        // If ReflectDecorators is available, use it to check whether 'jsonMapMember' has been used on a map. Warn if not.
        if (isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Map)
        {
            logError(`${decoratorName}: property is not a Map.`);
            return;
        }

        injectMetadataInformation(target, propKey, {
            ctor: Map,
            elementType: [valueConstructor],
            keyType: keyConstructor,
            emitDefaultValue: options.emitDefaultValue,
            isRequired: options.isRequired,
            options: extractOptionBase(options),
            key: propKey.toString(),
            name: options.name || propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}
