import {
    isReflectMetadataSupported,
    isSubtypeOf,
    isValueDefined,
    logError,
    logWarning,
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
import {IndexedObject} from './types';

declare abstract class Reflect {
    static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonMemberOptions extends OptionsBase {
    /**
     * Sets the constructor of the property.
     * Optional with ReflectDecorators.
     */
    constructor?: Function | TypeDescriptor | null;

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
 * Specifies that a property is part of the object when serializing, with additional options.
 * Omitting the 'constructor' option requires ReflectDecorators and that the property type is always
 * explicitly declared.
 * @param options Additional options.
 */
export function jsonMember(options: IJsonMemberOptions): PropertyDecorator;

/**
 * Specifies that a property is part of the object when serializing.
 * This call signature requires ReflectDecorators and that the property type is always explicitly
 * declared.
 */
export function jsonMember<T extends Function>(
    prototype: IndexedObject,
    propertyKey: string | symbol,
): void;

export function jsonMember<T extends Function>(
    optionsOrPrototype?: IJsonMemberOptions | IndexedObject,
    propKey?: string | symbol,
): PropertyDecorator | void {
    // @todo, why do we check if propkey is string or symbol? the type only allows symbol/string
    //    The check is not required.
    if (propKey !== undefined
        && (typeof propKey === 'string' || typeof propKey as any === 'symbol')) {
        const prototype = optionsOrPrototype as IndexedObject;
        // For error messages.
        const decoratorName = `@jsonMember on ${nameof(prototype.constructor)}.${String(propKey)}`;

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
            Reflect.getMetadata('design:type', prototype, propKey);

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

        injectMetadataInformation(prototype, propKey, {
            type: typeDescriptor,
            key: propKey.toString(),
            name: propKey.toString(),
        });
    } else {
        // jsonMember used as a decorator factory.
        return (target: Object, _propKey: string | symbol) => {
            const options: IJsonMemberOptions = optionsOrPrototype as IJsonMemberOptions ?? {};
            let typeDescriptor: TypeDescriptor | undefined;
            const decoratorName =
                `@jsonMember on ${nameof(target.constructor)}.${String(_propKey)}`;

            if (options.hasOwnProperty('constructor')) {
                if (!isValueDefined(options.constructor)) {
                    logError(
                        `${decoratorName}: cannot resolve specified property constructor at`
                        + ' runtime.',
                    );
                    return;
                }

                // Property constructor has been specified. Use ReflectDecorators (if available) to
                // check whether that constructor is correct. Warn if not.
                typeDescriptor = ensureTypeDescriptor(options.constructor);
                if (isReflectMetadataSupported && !isSubtypeOf(
                    typeDescriptor.ctor,
                    Reflect.getMetadata('design:type', target, _propKey),
                )) {
                    logWarning(
                        `${decoratorName}: detected property type does not match`
                        + ` 'constructor' option.`,
                    );
                }
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
                logError(
                    `${decoratorName}: ReflectDecorators is required if no 'constructor' option`
                    + ` is specified.`,
                );
                return;
            }

            if (typeDescriptor !== undefined
                && isSpecialPropertyType(decoratorName, typeDescriptor)) {
                return;
            }
            injectMetadataInformation(target, _propKey, {
                type: typeDescriptor,
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
