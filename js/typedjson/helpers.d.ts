import { Serializable } from './types';
export declare const MISSING_REFLECT_CONF_MSG: string;
/**
 * Determines whether the specified type is a type that can be passed on "as-is" into
 * `JSON.stringify`.
 * Values of these types don't need special conversion.
 * @param type The constructor of the type (wrapper constructor for primitive types, e.g. `Number`
 * for `number`).
 */
export declare function isDirectlySerializableNativeType(type: Function): boolean;
export declare function isDirectlyDeserializableNativeType(type: Function): boolean;
export declare function isTypeTypedArray(type: Function): boolean;
export declare function isObject(value: any): value is Object;
export declare function parseToJSObject<T>(json: any, expectedType: Serializable<T>): Object;
/**
 * Determines if 'A' is a sub-type of 'B' (or if 'A' equals 'B').
 * @param A The supposed derived type.
 * @param B The supposed base type.
 */
export declare function isSubtypeOf(A: Function, B: Function): boolean;
export declare function logError(message?: any, ...optionalParams: Array<any>): void;
export declare function logMessage(message?: any, ...optionalParams: Array<any>): void;
export declare function logWarning(message?: any, ...optionalParams: Array<any>): void;
/**
 * Checks if the value is considered defined (not undefined and not null).
 * @param value
 */
export declare function isValueDefined<T>(value: T): value is Exclude<T, undefined | null>;
export declare function isInstanceOf<T>(value: any, constructor: Function): boolean;
export declare const isReflectMetadataSupported: boolean;
/**
 * Gets the name of a function.
 * @param fn The function whose name to get.
 */
export declare function nameof(fn: Function & {
    name?: string;
}): string;
export declare function identity<T>(arg: T): T;
