import {
    nameof, logError, isReflectMetadataSupported, isValueDefined, logWarning, isSubtypeOf, MISSING_REFLECT_CONF_MSG,
} from "./helpers";
import { injectMetadataInformation } from "./metadata";
import { extractOptionBase, OptionsBase } from "./options-base";
import {
    ArrayTypeDescriptor,
    ConcreteTypeDescriptor,
    ensureTypeDescriptor, MapTypeDescriptor, SetTypeDescriptor,
    TypeDescriptor,
} from "./type-descriptor";

declare abstract class Reflect
{
    public static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export interface IJsonMemberOptions extends OptionsBase
{
    /**
     * Sets the constructor of the property.
     * Optional with ReflectDecorators.
     */
    constructor?: Function|TypeDescriptor;

    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;

    /** When set, a default value is emitted if the property is uninitialized/undefined. */
    emitDefaultValue?: boolean;

    /** When set, the key on the JSON that should be used instead of the class property name. */
    name?: string;

    /** When set, this deserializer will be used to deserialize the member. The callee must assure the correct type. */
    deserializer?: (json: any) => any;

    /** When set, this serializer will be used to serialize the member. */
    serializer?: (value: any) => any;
}

/**
 * Specifies that a property is part of the object when serializing, with additional options.
 * Omitting the 'constructor' option requires ReflectDecorators and that the property type is always explicitly declared.
 * @param options Additional options.
 */
export function jsonMember<TFunction extends Function>(options: IJsonMemberOptions): PropertyDecorator;

/**
 * Specifies that a property is part of the object when serializing.
 * This call signature requires ReflectDecorators and that the property type is always explicitly declared.
 */
export function jsonMember(target: Object, propertyKey: string | symbol): void;

export function jsonMember<TFunction extends Function>(optionsOrTarget?: IJsonMemberOptions | Object, propKey?: string | symbol): PropertyDecorator | void
{
    if (optionsOrTarget instanceof Object && (typeof propKey === "string" || typeof propKey === "symbol"))
    {
        const target = optionsOrTarget as Object;
        // For error messages.
        const decoratorName = `@jsonMember on ${nameof(target.constructor)}.${String(propKey)}`;

        // jsonMember used directly, no additional information directly available besides target and propKey.
        // Obtain property constructor through ReflectDecorators.
        if (isReflectMetadataSupported)
        {
            const reflectPropCtor = Reflect.getMetadata("design:type", target, propKey) as Function;

            if (!reflectPropCtor)
            {
                logError(`${decoratorName}: could not resolve detected property constructor at runtime. ${MISSING_REFLECT_CONF_MSG}`);
                return;
            }

            const typeDescriptor = ensureTypeDescriptor(reflectPropCtor);
            if (isSpecialPropertyType(decoratorName, typeDescriptor))
            {
                return;
            }

            injectMetadataInformation(target, propKey, {
                type: typeDescriptor,
                key: propKey.toString(),
                name: propKey.toString(),
            });
        }
        else
        {
            logError(`${decoratorName}: ReflectDecorators is required if no 'constructor' option is specified.`);
            return;
        }
    }
    else
    {
        // jsonMember used as a decorator factory.
        return (target: Object, _propKey: string | symbol) =>
        {
            let options: IJsonMemberOptions = optionsOrTarget || {};
            let typeDescriptor: TypeDescriptor|undefined;
            let decoratorName = `@jsonMember on ${nameof(target.constructor)}.${String(_propKey)}`; // For error messages.

            if (options.hasOwnProperty("constructor"))
            {
                if (!isValueDefined(options.constructor))
                {
                    logError(`${decoratorName}: cannot resolve specified property constructor at runtime.`);
                    return;
                }

                // Property constructor has been specified. Use ReflectDecorators (if available) to check whether that constructor is correct. Warn if not.
                typeDescriptor = ensureTypeDescriptor(options.constructor);
                if (isReflectMetadataSupported && !isSubtypeOf(typeDescriptor.ctor, Reflect.getMetadata("design:type", target, _propKey)))
                {
                    logWarning(`${decoratorName}: detected property type does not match 'constructor' option.`);
                }
            }
            else
            {
                // Use ReflectDecorators to obtain property constructor.
                if (isReflectMetadataSupported)
                {
                    const reflectCtor = Reflect.getMetadata("design:type", target, _propKey) as Function;

                    if (!reflectCtor)
                    {
                        logError(`${decoratorName}: cannot resolve detected property constructor at runtime.`);
                        return;
                    }
                    typeDescriptor = ensureTypeDescriptor(reflectCtor);
                }
                else if (!options.deserializer)
                {
                    logError(`${decoratorName}: ReflectDecorators is required if no 'constructor' option is specified.`);
                    return;
                }
            }


            if (typeDescriptor && isSpecialPropertyType(decoratorName, typeDescriptor))
            {
                return;
            }
            injectMetadataInformation(target, _propKey, {
                type: typeDescriptor,
                emitDefaultValue: options.emitDefaultValue,
                isRequired: options.isRequired,
                options: extractOptionBase(options),
                key: _propKey.toString(),
                name: options.name || _propKey.toString(),
                deserializer: options.deserializer,
                serializer: options.serializer,
            });
        };
    }
}

function isSpecialPropertyType(decoratorName: string, typeDescriptor: TypeDescriptor)
{
    if (!(typeDescriptor instanceof ArrayTypeDescriptor) && typeDescriptor.ctor === Array)
    {
        logError(`${decoratorName}: property is an Array. Use the jsonArrayMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    if (!(typeDescriptor instanceof SetTypeDescriptor) && typeDescriptor.ctor === Set)
    {
        logError(`${decoratorName}: property is a Set. Use the jsonSetMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    if (!(typeDescriptor instanceof MapTypeDescriptor) && typeDescriptor.ctor === Map)
    {
        logError(`${decoratorName}: property is a Map. Use the jsonMapMember decorator to`
            + ` serialize this property.`);
        return true;
    }

    return false;
}
