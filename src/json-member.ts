import {
    isReflectMetadataSupported,
    isSubtypeOf,
    isValueDefined,
    LAZY_TYPE_EXPLANATION,
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
    ensureTypeThunk,
    isMaybeTypeThunk,
    MapTypeDescriptor,
    SetTypeDescriptor,
    TypeDescriptor,
} from './type-descriptor';
import {Constructor, IndexedObject, MaybeTypeThunk, TypeThunk} from './types';

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
    type: MaybeTypeThunk,
    options?: IJsonMemberOptions,
): PropertyDecorator;

export function jsonMember<T extends Function>(
    optionsOrPrototype?: IndexedObject | IJsonMemberOptions | MaybeTypeThunk,
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
            logError(`${decoratorName}: ReflectDecorators is required if the type is not \
explicitly provided with e.g. @jsonMember(Number)`);
            return;
        }

        const reflectPropCtor: Function | null | undefined =
            Reflect.getMetadata('design:type', prototype, property);

        if (reflectPropCtor == null) {
            logError(`${decoratorName}: could not resolve detected property constructor at \
runtime. Potential solutions:
 - ${LAZY_TYPE_EXPLANATION}
 - ${MISSING_REFLECT_CONF_MSG}`);
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
        const decoratorName =
            `@jsonMember on ${nameof(target.constructor)}.${String(_propKey)}`;
        const typeThunk = isMaybeTypeThunk(optionsOrPrototype)
            ? ensureTypeThunk(optionsOrPrototype, decoratorName)
            : undefined;
        const options: IJsonMemberOptions = (typeThunk === undefined
            ? optionsOrPrototype
            : propertyKeyOrOptions) as IJsonMemberOptions ?? {};
        let typeDescriptor: TypeThunk | undefined;

        if (options.hasOwnProperty('constructor')) {
            if (typeThunk !== undefined) {
                throw new Error(
                    'Cannot both define constructor option and type. Only one allowed.',
                );
            }

            if (!isValueDefined(options.constructor)) {
                logError(`${decoratorName}: cannot resolve specified property constructor at \
runtime. ${LAZY_TYPE_EXPLANATION}`);
                return;
            }

            // Property constructor has been specified. Use ReflectDecorators (if available) to
            // check whether that constructor is correct. Warn if not.
            const newTypeDescriptor = ensureTypeDescriptor(options.constructor);
            typeDescriptor = () => newTypeDescriptor;
            if (isReflectMetadataSupported && !isSubtypeOf(
                newTypeDescriptor.ctor,
                Reflect.getMetadata('design:type', target, _propKey),
            )) {
                logWarning(
                    `${decoratorName}: detected property type does not match`
                    + ` 'constructor' option.`,
                );
            }
        } else if (typeThunk !== undefined) {
            typeDescriptor = typeThunk;
        } else if (isReflectMetadataSupported) {
            const reflectCtor = Reflect.getMetadata(
                'design:type',
                target,
                _propKey,
            ) as Function | null | undefined;

            if (reflectCtor == null) {
                logError(`${decoratorName}: cannot resolve detected property constructor at\
runtime. ${LAZY_TYPE_EXPLANATION}`);
                return;
            }
            typeDescriptor = () => ensureTypeDescriptor(reflectCtor);
        } else if (options.deserializer === undefined) {
            logError(`${decoratorName}: Cannot determine type`);
            return;
        }

        const typeToTest = typeDescriptor?.();

        if (typeToTest !== undefined && isSpecialPropertyType(decoratorName, typeToTest)) {
            return;
        }

        injectMetadataInformation(target, _propKey, {
            type: typeDescriptor === undefined
                ? undefined
                : () => ensureTypeDescriptor(typeDescriptor!()),
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

function isConstructorEqual(type: TypeDescriptor | Function, constructor: Constructor<any>) {
    return type instanceof TypeDescriptor ? type.ctor === constructor : type === constructor;
}

function isSpecialPropertyType(decoratorName: string, typeDescriptor: TypeDescriptor | Function) {
    if (!(typeDescriptor instanceof ArrayTypeDescriptor)
        && isConstructorEqual(typeDescriptor, Array)) {
        logError(`${decoratorName}: property is an Array. Use the jsonArrayMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    if (!(typeDescriptor instanceof SetTypeDescriptor) && isConstructorEqual(typeDescriptor, Set)) {
        logError(`${decoratorName}: property is a Set. Use the jsonSetMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    if (!(typeDescriptor instanceof MapTypeDescriptor) && isConstructorEqual(typeDescriptor, Map)) {
        logError(`${decoratorName}: property is a Map. Use the jsonMapMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    return false;
}
