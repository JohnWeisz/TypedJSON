export interface IJsonArrayMemberOptions {
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;
    /** When set, an empty array is emitted if the property is undefined/uninitialized. */
    emitDefaultValue?: boolean;
    /** Sets array dimensions (e.g. 1 for 'number[]' or 2 for 'number[][]'). Defaults to 1. */
    dimensions?: number;
}
/**
 * Specifies that a property, of type array, is part of an object when serializing.
 * @param elementConstructor Constructor of array elements (e.g. 'Number' for 'number[]', or 'Date' for 'Date[]').
 * @param options Additional options.
 */
export declare function jsonArrayMember(elementConstructor: Function, options?: IJsonArrayMemberOptions): (target: Object, propKey: string | symbol) => void;
