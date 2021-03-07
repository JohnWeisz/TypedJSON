import {isReflectMetadataSupported, logError, MISSING_REFLECT_CONF_MSG, nameof} from './helpers';
import {
    CustomDeserializerParams,
    CustomSerializerParams,
    injectMetadataInformation,
} from './metadata';
import {extractOptionBase, OptionsBase} from './options-base';
import {
    ArrayTypeDescriptor,
    ensureTypeDescriptor,
    ensureTypeThunk,
    MaybeTypeThunk,
    TypeDescriptor,
    TypeThunk,
} from './type-descriptor';

declare abstract class Reflect {
    static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonArrayMemberOptions extends OptionsBase {
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean | null;

    /** When set, an empty array is emitted if the property is undefined/uninitialized. */
    emitDefaultValue?: boolean | null;

    /** Sets array dimensions (e.g. 1 for 'number[]' or 2 for 'number[][]'). Defaults to 1. */
    dimensions?: number | null;

    /** When set, the key on the JSON that should be used instead of the class property name */
    name?: string | null;

    /**
     * When set, this deserializer will be used to deserialize the member. The callee must assure
     * the correct type.
     */
    deserializer?: ((json: any, params: CustomDeserializerParams) => any) | null;

    /** When set, this serializer will be used to serialize the member. */
    serializer?: ((value: any, params: CustomSerializerParams) => any) | null;
}

/**
 * Specifies that a property, of type array, is part of an object when serializing.
 * @param maybeTypeThunk Constructor of array elements (e.g. 'Number' for 'number[]', or 'Date'
 * for 'Date[]').
 * @param options Additional options.
 */
export function jsonArrayMember(
    maybeTypeThunk: MaybeTypeThunk,
    options: IJsonArrayMemberOptions = {},
) {
    return (target: Object, propKey: string | symbol) => {
        const decoratorName =
            `@jsonArrayMember on ${nameof(target.constructor)}.${String(propKey)}`;
        const typeThunk: TypeThunk = ensureTypeThunk(maybeTypeThunk, decoratorName);

        const dimensions = options.dimensions == null ? 1 : options.dimensions;
        if (!isNaN(dimensions) && dimensions < 1) {
            logError(`${decoratorName}: 'dimensions' option must be at least 1.`);
            return;
        }

        // If ReflectDecorators is available, use it to check whether 'jsonArrayMember' has been
        // used on an array.
        const reflectedType = isReflectMetadataSupported
            ? Reflect.getMetadata('design:type', target, propKey)
            : null;

        if (reflectedType != null && reflectedType !== Array && reflectedType !== Object) {
            logError(`${decoratorName}: property is not an Array. ${MISSING_REFLECT_CONF_MSG}`);
            return;
        }

        injectMetadataInformation(target, propKey, {
            type: () => createArrayType(ensureTypeDescriptor(typeThunk()), dimensions),
            emitDefaultValue: options.emitDefaultValue,
            isRequired: options.isRequired,
            options: extractOptionBase(options),
            key: propKey.toString(),
            name: options.name ?? propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}

export function createArrayType(
    elementType: TypeDescriptor,
    dimensions: number,
): ArrayTypeDescriptor {
    let type = new ArrayTypeDescriptor(elementType);
    for (let i = 1; i < dimensions; ++i) {
        type = new ArrayTypeDescriptor(type);
    }
    return type;
}
