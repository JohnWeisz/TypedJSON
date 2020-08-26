import { OptionsBase } from './options-base';
import { ArrayTypeDescriptor, TypeDescriptor } from './type-descriptor';
export interface IJsonArrayMemberOptions extends OptionsBase {
    /** When set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;
    /** When set, an empty array is emitted if the property is undefined/uninitialized. */
    emitDefaultValue?: boolean;
    /** Sets array dimensions (e.g. 1 for 'number[]' or 2 for 'number[][]'). Defaults to 1. */
    dimensions?: number;
    /** When set, the key on the JSON that should be used instead of the class property name */
    name?: string;
    /** When set, this deserializer will be used to deserialize the member. The callee must assure the correct type. */
    deserializer?: (json: any) => any;
    /** When set, this serializer will be used to serialize the member. */
    serializer?: (value: any) => any;
}
/**
 * Specifies that a property, of type array, is part of an object when serializing.
 * @param elementConstructor Constructor of array elements (e.g. 'Number' for 'number[]', or 'Date' for 'Date[]').
 * @param options Additional options.
 */
export declare function jsonArrayMember(elementConstructor: Function | TypeDescriptor, options?: IJsonArrayMemberOptions): (target: Object, propKey: string | symbol) => void;
export declare function createArrayType(elementType: TypeDescriptor, dimensions: number): ArrayTypeDescriptor;
