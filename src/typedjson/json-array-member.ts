import { nameof, logError, isReflectMetadataSupported } from "./helpers";
import { injectMetadataInformation } from "./metadata";

declare abstract class Reflect
{
    public static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonArrayMemberOptions
{
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;

    /** When set, an empty array is emitted if the property is undefined/uninitialized. */
    emitDefaultValue?: boolean;

    /** Sets array dimensions (e.g. 1 for 'number[]' or 2 for 'number[][]'). Defaults to 1. */
    dimensions?: number;

    /** When set, the key on the JSON that should be used instead of the class property name */
    name?: string;

    /** When set, this deserializer will be used to deserialize the member. The callee must assure the correct type. */
    deserializer?: (json: any) => any;

    /** When set, this serializer will be used to serialize the member. */
    serializer?: (value: any) => any;
}

/**
 * Specifies that a property, of type array, is part of an object when serializing.
 * @param elementConstructor Constructor of array elements (e.g. 'Number' for 'number[]', or 'Date' for 'Date[]').
 * @param options Additional options.
 */
export function jsonArrayMember(elementConstructor: Function, options: IJsonArrayMemberOptions = {})
{
    return (target: Object, propKey: string | symbol) =>
    {
        let decoratorName = `@jsonArrayMember on ${nameof(target.constructor)}.${String(propKey)}`; // For error messages.

        if (typeof elementConstructor !== "function")
        {
            logError(`${decoratorName}: could not resolve constructor of array elements at runtime.`);
            return;
        }

        const dimensions = options.dimensions === undefined ? 1 : options.dimensions;
        if (!isNaN(dimensions) && dimensions < 1)
        {
            logError(`${decoratorName}: 'dimensions' option must be at least 1.`);
            return;
        }

        // If ReflectDecorators is available, use it to check whether 'jsonArrayMember' has been used on an array.
        if (isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Array)
        {
            logError(`${decoratorName}: property is not an Array.`);
            return;
        }

        injectMetadataInformation(target, propKey, {
            ctor: Array,
            elementType: createArrayElementType(elementConstructor, dimensions),
            emitDefaultValue: options.emitDefaultValue,
            isRequired: options.isRequired,
            key: propKey.toString(),
            name: options.name || propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}

function createArrayElementType(elementCtor: Function, dimensions: number) {
    const elementTypes = new Array(dimensions).fill(Array, 0, -1);
    elementTypes[dimensions-1] = elementCtor;
    return elementTypes;
}
