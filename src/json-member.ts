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
    isTypelike,
    isTypeThunk,
    MapTypeDescriptor,
    MaybeTypeThunk,
    SetTypeDescriptor,
    TypeDescriptor,
    Typelike,
    TypeThunk,
} from './type-descriptor';
import {Constructor, IndexedObject} from './types';

declare abstract class Reflect {
    static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonMemberOptions extends OptionsBase {
    /**
     * Sets the constructor of the property.
     * Optional with ReflectDecorators.
     */
    constructor?: Typelike | null;

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
    deserializer?: ((json: any, params: CustomDeserializerParams) => any) | null;

    /** When set, this serializer will be used to serialize the member. */
    serializer?: ((value: any, params: CustomSerializerParams) => any) | null;
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
    if (typeof propertyKeyOrOptions === 'string' || typeof propertyKeyOrOptions === 'symbol') {
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
    return jsonMemberDecoratorFactory(optionsOrPrototype, propertyKeyOrOptions);
}

function jsonMemberDecoratorFactory(
    optionsOrType: IJsonMemberOptions | MaybeTypeThunk | undefined,
    options: IJsonMemberOptions | undefined,
): PropertyDecorator {
    return (target, property) => {
        const decoratorName = `@jsonMember on ${nameof(target.constructor)}.${String(property)}`;
        let typeThunk: TypeThunk | undefined;

        if (isTypelike(optionsOrType) || isTypeThunk(optionsOrType)) {
            typeThunk = ensureTypeThunk(optionsOrType, decoratorName);
        } else {
            options = optionsOrType;
        }

        options = options ?? {};

        if (Object.prototype.hasOwnProperty.call(options, 'constructor')) {
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
            typeThunk = () => newTypeDescriptor;
            if (isReflectMetadataSupported && !isSubtypeOf(
                newTypeDescriptor.ctor,
                Reflect.getMetadata('design:type', target, property),
            )) {
                logWarning(
                    `${decoratorName}: detected property type does not match`
                    + ` 'constructor' option.`,
                );
            }
        } else if (typeThunk !== undefined) {
            // Do nothing
        } else if (isReflectMetadataSupported) {
            const reflectCtor = Reflect.getMetadata(
                'design:type',
                target,
                property,
            ) as Function | null | undefined;

            if (reflectCtor == null) {
                logError(`${decoratorName}: cannot resolve detected property constructor at \
runtime. ${LAZY_TYPE_EXPLANATION}`);
                return;
            }
            typeThunk = () => ensureTypeDescriptor(reflectCtor);
        } else if (options.deserializer === undefined) {
            logError(`${decoratorName}: Cannot determine type`);
            return;
        }

        const typeToTest = typeThunk?.();

        if (typeToTest !== undefined && isSpecialPropertyType(decoratorName, typeToTest)) {
            return;
        }

        injectMetadataInformation(target, property, {
            type: typeThunk === undefined
                ? undefined
                : () => ensureTypeDescriptor(typeThunk!()),
            emitDefaultValue: options.emitDefaultValue,
            isRequired: options.isRequired,
            options: extractOptionBase(options),
            key: property.toString(),
            name: options.name ?? property.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}

function isConstructorEqual(type: Typelike, constructor: Constructor<any>) {
    return type instanceof TypeDescriptor ? type.ctor === constructor : type === constructor;
}

function isSpecialPropertyType(decoratorName: string, typeDescriptor: Typelike) {
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
