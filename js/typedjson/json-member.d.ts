import { OptionsBase } from "./options-base";
import { TypeDescriptor } from "./type-descriptor";
import { IndexedObject } from './types';
export interface IJsonMemberOptions extends OptionsBase {
    /**
     * Sets the constructor of the property.
     * Optional with ReflectDecorators.
     */
    constructor?: Function | TypeDescriptor;
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
 * Omitting the 'constructor' option requires ReflectDecorators and that the property type is always explicitly
 * declared.
 * @param options Additional options.
 */
export declare function jsonMember(options: IJsonMemberOptions): PropertyDecorator;
/**
 * Specifies that a property is part of the object when serializing.
 * This call signature requires ReflectDecorators and that the property type is always explicitly declared.
 */
export declare function jsonMember<T extends Function>(prototype: IndexedObject, propertyKey: string | symbol): void;
