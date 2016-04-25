import { Constructor, TypeHint } from "./types";
/**
 * Polyfill for Object.assign, used to copy the values of all enumerable own properties from one or more source objects to a target object.
 * It will return the target object.
 * @param target The target object.
 * @param sources The source object(s).
 */
export declare function assign<T>(target: T, ...sources: Array<any>): T;
/**
 * Returns a boolean indicating whether a given property exists on a class (constructor function), or inherited classes.
 * @param constructor The class to check.
 * @param propertyKey The property key to search for.
 * @param searchBaseClasses Whether to search on base classes as well.
 */
export declare function constructorHasProperty(constructor: Constructor<any>, propertyKey: string | symbol, searchBaseClasses?: boolean): boolean;
export declare function error(message?: any, ...optionalParams: Array<any>): void;
/**
 * Gets the string representation of a class.
 * @param target The class (constructor function) reference.
 */
export declare function getClassName(target: Constructor<any>): any;
/**
 * Gets a string representation of a class from its prototype.
 * @param target The class prototype.
 */
export declare function getClassName(target: Object): any;
export declare function getDefaultValue<T>(type: {
    new (...args: any[]): T;
}): T;
export declare function getPropertyCount(object: any): number;
export declare function getPropertyDisplayName(target: Constructor<any> | Object, propertyKey: string | symbol): string;
export declare function getTypeHintPropertyKey(typeHint: TypeHint): string;
export declare function isArray(object: any): boolean;
export declare function isPrimitiveType(obj: any): boolean;
export declare function isReservedMemberName(name: string): boolean;
export declare function isSubtypeOf(A: Constructor<any>, B: Constructor<any>): boolean;
export declare function log(message?: any, ...optionalParams: Array<any>): void;
export declare function warn(message?: any, ...optionalParams: Array<any>): void;
