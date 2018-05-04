export interface IJsonMemberOptions {
    /**
     * Sets the constructor of the property.
     * Optional with ReflectDecorators.
     */
    constructor?: Function;
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;
    /** When set, a default value is emitted if the property is uninitialized/undefined. */
    emitDefaultValue?: boolean;
    /** When set, the key on the JSON that should be used instead of the class property name */
    name?: string;
}
/**
 * Specifies that a property is part of the object when serializing, with additional options.
 * Omitting the 'constructor' option requires ReflectDecorators and that the property type is always explicitly declared.
 * @param options Additional options.
 */
export declare function jsonMember<TFunction extends Function>(options: IJsonMemberOptions): PropertyDecorator;
/**
 * Specifies that a property is part of the object when serializing.
 * This call signature requires ReflectDecorators and that the property type is always explicitly declared.
 */
export declare function jsonMember(target: Object, propertyKey: string | symbol): void;
