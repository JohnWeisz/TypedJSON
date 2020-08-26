import { OptionsBase } from './options-base';
export interface IJsonSetMemberOptions extends OptionsBase {
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;
    /** When set, a default value is emitted for each uninitialized json member. */
    emitDefaultValue?: boolean;
    /** When set, the key on the JSON that should be used instead of the class property name */
    name?: string;
    /**
     * When set, this deserializer will be used to deserialize the member. The callee must assure
     * the correct type.
     */
    deserializer?: (json: any) => any;
    /** When set, this serializer will be used to serialize the member. */
    serializer?: (value: any) => any;
}
/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Set<T>.
 * @param elementConstructor Constructor of set elements (e.g. 'Number' for Set<number> or 'Date'
 * for Set<Date>).
 * @param options Additional options.
 */
export declare function jsonSetMember(elementConstructor: Function, options?: IJsonSetMemberOptions): (target: Object, propKey: string | symbol) => void;
