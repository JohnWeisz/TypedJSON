import { nameof } from "./helpers";
import { IJsonMemberOptions } from "./json-member";
import { JsonMemberMetadata, JsonObjectMetadata, injectMetadataInformation } from "./metadata";
import * as Helpers from "./helpers";

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
        let decoratorName = `@jsonArrayMember on ${nameof(target.constructor)}.${propKey}`; // For error messages.

        if (typeof elementConstructor !== "function")
        {
            Helpers.logError(`${decoratorName}: could not resolve constructor of array elements at runtime.`);
            return;
        }

        if (!isNaN(options.dimensions) && options.dimensions < 1)
        {
            Helpers.logError(`${decoratorName}: 'dimensions' option must be at least 1.`);
            return;
        }

        // If ReflectDecorators is available, use it to check whether 'jsonArrayMember' has been used on an array.
        if (Helpers.isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Array)
        {
            Helpers.logError(`${decoratorName}: property is not an Array.`);
            return;
        }

        let metadata = new JsonMemberMetadata();

        metadata.ctor = Array;

        if (options.dimensions && options.dimensions >= 1)
        {
            metadata.elementType = [];

            for (let i = 1; i < options.dimensions; i++)
            {
                metadata.elementType.push(Array);
            }

            metadata.elementType.push(elementConstructor);
        }
        else
        {
            metadata.elementType = [elementConstructor];
        }

        metadata.emitDefaultValue = options.emitDefaultValue || false;
        metadata.isRequired = options.isRequired || false;
        metadata.key = propKey.toString();
        metadata.name = options.name || propKey.toString();

        injectMetadataInformation(target, propKey, metadata);
    };
}
