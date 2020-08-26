import { JsonObjectMetadata, TypeHintEmitter } from './metadata';
import { OptionsBase } from './options-base';
import { TypeDescriptor } from './type-descriptor';
import { IndexedObject } from './types';
export declare function defaultTypeEmitter(targetObject: IndexedObject, sourceObject: IndexedObject, expectedSourceType: Function, sourceTypeMetadata?: JsonObjectMetadata): void;
/**
 * @param sourceObject The original object that should be serialized.
 * @param typeDescriptor Instance of TypeDescriptor containing information about expected serialization.
 * @param memberName Name of the object being serialized, used for debugging purposes.
 * @param serializer Serializer instance, aiding with recursive serialization.
 * @param memberOptions If converted as a member, the member options.
 */
export declare type SerializerFn<T, TD extends TypeDescriptor, Raw> = (sourceObject: T, typeDescriptor: TD, memberName: string, serializer: Serializer, memberOptions?: OptionsBase) => Raw;
/**
 * Utility class, converts a typed object tree (i.e. a tree of class instances, arrays of class
 * instances, and so on) to an untyped javascript object (also called "simple javascript object"),
 * and emits any necessary type hints in the process (for polymorphism).
 *
 * The converted object tree is what will be given to `JSON.stringify` to convert to string as the
 * last step, the serialization is basically like:
 *
 * (1) typed object-tree -> (2) simple JS object-tree -> (3) JSON-string
 */
export declare class Serializer {
    options?: OptionsBase;
    private typeHintEmitter;
    private errorHandler;
    private serializationStrategy;
    setTypeHintEmitter(typeEmitterCallback: TypeHintEmitter): void;
    getTypeHintEmitter(): TypeHintEmitter;
    setErrorHandler(errorHandlerCallback: (error: Error) => void): void;
    getErrorHandler(): (error: Error) => void;
    retrievePreserveNull(memberOptions?: OptionsBase): boolean;
    /**
     * Convert a value of any supported serializable type.
     * The value type will be detected, and the correct serialization method will be called.
     */
    convertSingleValue(sourceObject: any, typeDescriptor: TypeDescriptor, memberName?: string, memberOptions?: OptionsBase): any;
}
