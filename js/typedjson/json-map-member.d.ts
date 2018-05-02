export interface IJsonMapMemberOptions {
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;
    /** When set, a default value is emitted for each uninitialized json member. */
    emitDefaultValue?: boolean;
}
/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Map<K, V>.
 * @param keyConstructor Constructor of map keys (e.g. 'Number' for 'Map<number, Date>').
 * @param valueConstructor Constructor of map values (e.g. 'Date' for 'Map<number, Date>').
 * @param options Additional options.
 */
export declare function jsonMapMember(keyConstructor: Function, valueConstructor: Function, options?: IJsonMapMemberOptions): (target: Object, propKey: string | symbol) => void;
