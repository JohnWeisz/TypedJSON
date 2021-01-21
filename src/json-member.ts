import {
    isReflectMetadataSupported,
    logError,
    MISSING_REFLECT_CONF_MSG,
    nameof,
} from './helpers';
import {injectMetadataInformation} from './metadata';
import {extractOptionBase, OptionsBase} from './options-base';
import {
    ArrayTypeDescriptor,
    ensureTypeDescriptor,
    MapTypeDescriptor,
    SetTypeDescriptor,
    TypeDescriptor,
} from './type-descriptor';
import {IndexedObject, TypeThunk} from './types';

declare abstract class Reflect {
    static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonMemberOptions extends OptionsBase {
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean | null;

    /** When set, a default value is emitted if the property is uninitialized/undefined. */
    emitDefaultValue?: boolean | null;

    /** When set, the key on the JSON that should be used instead of the class property name. */
    name?: string | null;

    /**
     * When set, this deserializer will be used to deserialize the member. The callee must assure
     * the correct type.
     */
    deserializer?: ((json: any) => any) | null;

    /** When set, this serializer will be used to serialize the member. */
    serializer?: ((value: any) => any) | null;
}

/**
 * Specifies that a property is part of the object when serializing.
 * Requires ReflectDecorators.
 */
export function jsonMember<T extends Function>(
    prototype: IndexedObject,
    propertyKey: string | symbol,
): void;

/**
 * Specifies that a property is part of the object when serializing, with additional options.
 * Requires ReflectDecorators.
 */
export function jsonMember(options: IJsonMemberOptions): PropertyDecorator;

/**
 * Specifies that a property is part of the object when serializing, with a defined type and extra
 * options.
 */
export function jsonMember(
    type: TypeThunk,
    options?: IJsonMemberOptions,
): PropertyDecorator;

export function jsonMember<T extends Function>(
    optionsOrPrototype?: IndexedObject | IJsonMemberOptions | TypeThunk,
    propertyKeyOrOptions?: string | symbol | IJsonMemberOptions,
): PropertyDecorator | void {
    if (propertyKeyOrOptions !== undefined
        && (typeof propertyKeyOrOptions === 'string' || typeof propertyKeyOrOptions === 'symbol')) {
        const property = propertyKeyOrOptions as string;
        const prototype = optionsOrPrototype as IndexedObject;
        // For error messages.
        const decoratorName = `@jsonMember on ${nameof(prototype.constructor)}.${String(property)}`;

        // jsonMember used directly, no additional information directly available besides target and
        // propKey.
        // Obtain property constructor through ReflectDecorators.
        if (!isReflectMetadataSupported) {
            logError(
                `${decoratorName}: ReflectDecorators is required if no 'constructor' option is`
                + ` specified.`,
            );
            return;
        }

        const reflectPropCtor: Function | null | undefined =
            Reflect.getMetadata('design:type', prototype, property);

        if (reflectPropCtor == null) {
            logError(
                `${decoratorName}: could not resolve detected property constructor at runtime.${
                    MISSING_REFLECT_CONF_MSG}`,
            );
            return;
        }

        const typeDescriptor = ensureTypeDescriptor(reflectPropCtor);
        if (isSpecialPropertyType(decoratorName, typeDescriptor)) {
            return;
        }

        injectMetadataInformation(prototype, property, {
            type: () => typeDescriptor,
            key: propertyKeyOrOptions.toString(),
            name: propertyKeyOrOptions.toString(),
        });
        return;
    }

    // jsonMember used as a decorator factory.
    return (target: Object, _propKey: string | symbol) => {
        const hasTypeThunk = typeof optionsOrPrototype === 'function';
        const typeThunk = hasTypeThunk ? optionsOrPrototype as TypeThunk : undefined;
        const options = (hasTypeThunk
            ? propertyKeyOrOptions
            : optionsOrPrototype) as IJsonMemberOptions ?? {};
        let typeDescriptor: TypeDescriptor | TypeThunk | undefined;
        const decoratorName =
            `@jsonMember on ${nameof(target.constructor)}.${String(_propKey)}`;

        if (hasTypeThunk) {
            typeDescriptor = typeThunk;
        } else if (isReflectMetadataSupported) {
            const reflectCtor = Reflect.getMetadata(
                'design:type',
                target,
                _propKey,
            ) as Function | null | undefined;

            if (reflectCtor == null) {
                logError(
                    `${decoratorName}: cannot resolve detected property constructor at`
                    + ` runtime.`,
                );
                return;
            }
            typeDescriptor = ensureTypeDescriptor(reflectCtor);
        } else if (options.deserializer === undefined) {
            logError(`${decoratorName}: Cannot determine type`);
            return;
        }

        const typeToTest = typeDescriptor instanceof TypeDescriptor
            ? typeDescriptor
            : typeDescriptor?.();

        if (typeToTest !== undefined
            && typeToTest instanceof TypeDescriptor
            && isSpecialPropertyType(decoratorName, typeToTest)) {
            return;
        }

        injectMetadataInformation(target, _propKey, {
            type: typeDescriptor === undefined
                ? undefined
                : () => typeDescriptor instanceof TypeDescriptor
                    ? typeDescriptor
                    : ensureTypeDescriptor(typeDescriptor!()),
            emitDefaultValue: options.emitDefaultValue,
            isRequired: options.isRequired,
            options: extractOptionBase(options),
            key: _propKey.toString(),
            name: options.name ?? _propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}

function isSpecialPropertyType(decoratorName: string, typeDescriptor: TypeDescriptor) {
    if (!(typeDescriptor instanceof ArrayTypeDescriptor) && typeDescriptor.ctor === Array) {
        logError(`${decoratorName}: property is an Array. Use the jsonArrayMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    if (!(typeDescriptor instanceof SetTypeDescriptor) && typeDescriptor.ctor === Set) {
        logError(`${decoratorName}: property is a Set. Use the jsonSetMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    if (!(typeDescriptor instanceof MapTypeDescriptor) && typeDescriptor.ctor === Map) {
        logError(`${decoratorName}: property is a Map. Use the jsonMapMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    return false;
}
