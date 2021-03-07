import {isReflectMetadataSupported, logError, MISSING_REFLECT_CONF_MSG, nameof} from './helpers';
import {
    CustomDeserializerParams,
    CustomSerializerParams,
    injectMetadataInformation,
} from './metadata';
import {extractOptionBase, OptionsBase} from './options-base';
import {ensureTypeThunk, MaybeTypeThunk, SetT} from './type-descriptor';

declare abstract class Reflect {
    static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonSetMemberOptions extends OptionsBase {
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean | null;

    /** When set, a default value is emitted for each uninitialized json member. */
    emitDefaultValue?: boolean | null;

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
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Set<T>.
 * @param maybeTypeThunk Constructor of set elements (e.g. 'Number' for Set<number> or 'Date'
 * for Set<Date>).
 * @param options Additional options.
 */
export function jsonSetMember(maybeTypeThunk: MaybeTypeThunk, options: IJsonSetMemberOptions = {}) {
    return (target: Object, propKey: string | symbol) => {
        // For error messages
        const decoratorName = `@jsonSetMember on ${nameof(target.constructor)}.${String(propKey)}`;
        const typeThunk = ensureTypeThunk(maybeTypeThunk, decoratorName);

        // If ReflectDecorators is available, use it to check whether 'jsonSetMember' has been used
        // on a set. Warn if not.
        const reflectedType = isReflectMetadataSupported
            ? Reflect.getMetadata('design:type', target, propKey)
            : null;

        if (reflectedType != null && reflectedType !== Set && reflectedType !== Object) {
            logError(`${decoratorName}: property is not a Set. ${MISSING_REFLECT_CONF_MSG}`);
            return;
        }

        injectMetadataInformation(target, propKey, {
            type: () => SetT(typeThunk()),
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
