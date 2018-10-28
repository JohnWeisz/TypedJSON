export declare const METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";
export declare function getDefaultValue<T>(type: {
    new (): T;
}): T | undefined;
export declare function isPrimitiveType(type: any): type is (typeof Number | typeof String | typeof Boolean);
export declare function isPrimitiveValue(obj: any): boolean;
export declare function isObject(value: any): value is Object;
export declare function parseToJSObject(json: any): Object;
/**
 * Determines if 'A' is a sub-type of 'B' (or if 'A' equals 'B').
 * @param A The supposed derived type.
 * @param B The supposed base type.
 */
export declare function isSubtypeOf(A: Function, B: Function): boolean;
export declare function logError(message?: any, ...optionalParams: any[]): void;
export declare function logMessage(message?: any, ...optionalParams: any[]): void;
export declare function logWarning(message?: any, ...optionalParams: any[]): void;
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
