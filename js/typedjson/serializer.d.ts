import { IndexedObject } from "./types";
import { OptionsBase } from "./options-base";
export interface IScopeTypeInfo {
    selfType: Function;
    elementTypes?: Function[];
    keyType?: Function;
}
export interface IScopeArrayTypeInfo extends IScopeTypeInfo {
    selfType: new () => Array<any>;
    elementTypes: Function[];
}
export interface IScopeSetTypeInfo extends IScopeTypeInfo {
    selfType: new () => Set<any>;
    elementTypes: [Function];
}
export interface IScopeMapTypeInfo extends IScopeTypeInfo {
    selfType: new () => Map<any, any>;
    elementTypes: [Function];
    keyType: Function;
}
/**
 * Utility class, converts a typed object tree (i.e. a tree of class instances, arrays of class instances, and so on) to an untyped javascript object (also
 * called "simple javascript object"), and emits any necessary type hints in the process (for polymorphism).
 *
 * The converted object tree is what will be given to `JSON.stringify` to convert to string as the last step, the serialization is basically like:
 *
 * (1) typed object-tree -> (2) simple JS object-tree -> (3) JSON-string
 */
export declare class Serializer {
    options?: OptionsBase;
    private _typeHintEmitter;
    private _errorHandler;
    constructor();
    setTypeHintEmitter(typeEmitterCallback: (targetObject: Object, sourceObject: Object, expectedSourceType: Function) => void): void;
    setErrorHandler(errorHandlerCallback: (error: Error) => void): void;
    /**
     * Convert a value of any supported serializable type.
     * The value type will be detected, and the correct serialization method will be called.
     */
    convertSingleValue(sourceObject: any, typeInfo: IScopeTypeInfo, memberName?: string, memberOptions?: OptionsBase): any;
    /**
     * Performs the conversion of a typed object (usually a class instance) to a simple
     * javascript object for serialization.
     */
    convertAsObject(sourceObject: IndexedObject, typeInfo: IScopeTypeInfo, memberName?: string, memberOptions?: OptionsBase): IndexedObject;
    /**
     * Performs the conversion of an array of typed objects (or primitive values) to an array of simple javascript objects (or primitive values) for
     * serialization.
     * @param expectedElementType The expected type of elements. If the array is supposed to be multi-dimensional, subsequent elements define lower dimensions.
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     */
    convertAsArray(sourceObject: any[], expectedElementType: Function[], memberName?: string, memberOptions?: OptionsBase): any[];
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
    convertAsSet(sourceObject: Set<any>, expectedElementType: Function, memberName?: string, memberOptions?: OptionsBase): any[];
    /**
     * Performs the conversion of a map of typed objects (or primitive values) into an array
     * of simple javascript objects with `key` and `value` properties.
     *
     * @param sourceObject
     * @param expectedKeyType The constructor of the expected Map keys
     *        (e.g. `Number` for `Map<number, any>`, or `MyClass` for `Map<MyClass, any>`).
     * @param expectedElementType The constructor of the expected Map values
     *        (e.g. `Number` for `Map<any, number>`, or `MyClass` for `Map<any, MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     */
    convertAsMap(sourceObject: Map<any, any>, expectedKeyType: Function, expectedElementType: Function, memberName?: string, memberOptions?: OptionsBase): Array<{
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
    convertAsTypedArray(sourceObject: ArrayBufferView): {}[];
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
