import {AnyT} from './type-descriptor';
import {Serializable} from './types';

declare abstract class Reflect {
    static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

export const LAZY_TYPE_EXPLANATION = `If the type is not yet defined, for example due to circular \
references, add '() => ' before it. E.g. @jsonMember(() => Foo)`;

export const MISSING_REFLECT_CONF_MSG = 'Make sure that you have both "experimentalDecorators"'
    + ' and "emitDecoratorMetadata" enabled in your tsconfig.json';

/**
 * Determines whether the specified type is a type that can be passed on "as-is" into
 * `JSON.stringify`.
 * Values of these types don't need special conversion.
 * @param type The constructor of the type (wrapper constructor for primitive types, e.g. `Number`
 * for `number`).
 */
export function isDirectlySerializableNativeType(type: Function): boolean {
    return [Date, Number, String, Boolean].indexOf(type as any) !== -1;
}

export function isDirectlyDeserializableNativeType(type: Function): boolean {
    return [Number, String, Boolean].indexOf(type as any) !== -1;
}

export function isTypeTypedArray(type: Function): boolean {
    return [
        Float32Array,
        Float64Array,
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
    ].indexOf(type as any) !== -1;
}

export function isObject(value: any): value is Object {
    return typeof value === 'object';
}

export function shouldOmitParseString(jsonStr: string, expectedType: Function): boolean {
    const expectsTypesSerializedAsStrings = expectedType === String
        || expectedType === ArrayBuffer
        || expectedType === DataView;

    const hasQuotes = jsonStr.length >= 2
        && jsonStr[0] === '"'
        && jsonStr[jsonStr.length - 1] === '"';

    if (expectedType === Date) {
        // Date can both have strings and numbers as input
        const isNumber = !isNaN(Number(jsonStr.trim()));
        return !hasQuotes && !isNumber;
    }

    return expectsTypesSerializedAsStrings && !hasQuotes;
}

export function parseToJSObject<T>(json: any, expectedType: Serializable<T>): Object {
    if (typeof json !== 'string' || shouldOmitParseString(json, expectedType)) {
        return json;
    }
    return JSON.parse(json);
}

/**
 * Determines if 'A' is a sub-type of 'B' (or if 'A' equals 'B').
 * @param A The supposed derived type.
 * @param B The supposed base type.
 */
export function isSubtypeOf(A: Function, B: Function) {
    return A === B || A.prototype instanceof B;
}

export function logError(message?: any, ...optionalParams: Array<any>) {
    if (typeof console as any === 'object' && typeof console.error as any === 'function') {
        console.error(message, ...optionalParams);
    } else if (typeof console as any === 'object' && typeof console.log as any === 'function') {
        console.log(`ERROR: ${message}`, ...optionalParams);
    }
}

export function logMessage(message?: any, ...optionalParams: Array<any>) {
    if (typeof console as any === 'object' && typeof console.log as any === 'function') {
        console.log(message, ...optionalParams);
    }
}

export function logWarning(message?: any, ...optionalParams: Array<any>) {
    if (typeof console as any === 'object' && typeof console.warn as any === 'function') {
        console.warn(message, ...optionalParams);
    } else if (typeof console as any === 'object' && typeof console.log as any === 'function') {
        console.log(`WARNING: ${message}`, ...optionalParams);
    }
}

export type NotNull<T> = T extends null ? never : T;
export type RequiredNoNull<T> = {[P in keyof T]-?: NotNull<T[P]>};

/**
 * Checks if the value is considered defined (not undefined and not null).
 * @param value
 */
export function isValueDefined<T>(value: T): value is Exclude<T, undefined | null> {
    return !(typeof value === 'undefined' || value === null);
}

export function isInstanceOf<T>(value: any, constructor: Function): boolean {
    if (constructor === AnyT.ctor) {
        return true;
    } else if (typeof value === 'number') {
        return constructor === Number;
    } else if (typeof value === 'string') {
        return constructor === String;
    } else if (typeof value === 'boolean') {
        return constructor === Boolean;
    } else if (isObject(value)) {
        return value instanceof constructor;
    }

    return false;
}

export const isReflectMetadataSupported =
    typeof Reflect as any === 'object' && typeof Reflect.getMetadata as any === 'function';

/**
 * Gets the name of a function.
 * @param fn The function whose name to get.
 */
export function nameof(fn: Function & {name?: string}) {
    if (typeof fn.name as string | undefined === 'string') {
        return fn.name;
    }
    return 'undefined';
}

export function identity<T>(arg: T): T {
    return arg;
}
