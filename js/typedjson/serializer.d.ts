import { IndexedObject } from "./types";
import { JsonObjectMetadata } from "./metadata";
import { OptionsBase } from "./options-base";
import { ArrayTypeDescriptor, ConcreteTypeDescriptor, MapTypeDescriptor, SetTypeDescriptor, TypeDescriptor } from "./type-descriptor";
export declare type TypeHintEmitter = (targetObject: IndexedObject, sourceObject: IndexedObject, expectedSourceType: Function, sourceTypeMetadata?: JsonObjectMetadata) => void;
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
    private _typeHintEmitter;
    private _errorHandler;
    setTypeHintEmitter(typeEmitterCallback: TypeHintEmitter): void;
    setErrorHandler(errorHandlerCallback: (error: Error) => void): void;
    /**
     * Convert a value of any supported serializable type.
     * The value type will be detected, and the correct serialization method will be called.
     */
    convertSingleValue(sourceObject: any, typeDescriptor: TypeDescriptor, memberName?: string, memberOptions?: OptionsBase): any;
    /**
     * Performs the conversion of a typed object (usually a class instance) to a simple
     * javascript object for serialization.
     */
    convertAsObject(sourceObject: IndexedObject, typeDescriptor: ConcreteTypeDescriptor, memberName?: string, memberOptions?: OptionsBase): IndexedObject;
    /**
     * Performs the conversion of an array of typed objects (or primitive values) to an array of simple javascript objects (or primitive values) for
     * serialization.
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     */
    convertAsArray(sourceObject: any[], typeDescriptor: ArrayTypeDescriptor, memberName?: string, memberOptions?: OptionsBase): any[];
    /**
     * Performs the conversion of a set of typed objects (or primitive values) into an array
     * of simple javascript objects.
     *
     * @param sourceObject
     * @param expectedElementType The constructor of the expected Set elements
     *        (e.g. `Number` for `Set<number>`, or `MyClass` for `Set<MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     * @returns
     */
    convertAsSet(sourceObject: Set<any>, typeDescriptor: SetTypeDescriptor, memberName?: string, memberOptions?: OptionsBase): any[];
    /**
     * Performs the conversion of a map of typed objects (or primitive values) into an array
     * of simple javascript objects with `key` and `value` properties.
     *
     * @param sourceObject
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     */
    convertAsMap(sourceObject: Map<any, any>, typeDescriptor: MapTypeDescriptor, memberName?: string, memberOptions?: OptionsBase): IndexedObject | Array<{
        key: any;
        value: any;
    }>;
    /**
     * Performs the conversion of a typed javascript array to a simple untyped javascript array.
     * This is needed because typed arrays are otherwise serialized as objects, so we'll end up
     * with something like "{ 0: 0, 1: 1, ... }".
     *
     * @param sourceObject
     * @returns
     */
    convertAsTypedArray(sourceObject: ArrayBufferView): unknown[];
    /**
     * Performs the conversion of a raw ArrayBuffer to a string.
     */
    convertAsArrayBuffer(buffer: ArrayBuffer): string;
    /**
     * Performs the conversion of DataView, converting its internal ArrayBuffer to a string and
     * returning that string.
     */
    convertAsDataView(dataView: DataView): string;
    private retrievePreserveNull;
}
