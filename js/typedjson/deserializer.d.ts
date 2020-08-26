import { TypeResolver } from './metadata';
import { OptionsBase } from './options-base';
import { TypeDescriptor } from './type-descriptor';
import { IndexedObject } from './types';
export declare function defaultTypeResolver(sourceObject: IndexedObject, knownTypes: Map<string, Function>): Function | undefined;
export declare type DeserializerFn<T, TD extends TypeDescriptor, Raw> = (sourceObject: Raw, typeDescriptor: TypeDescriptor, knownTypes: Map<string, Function>, memberName: string, deserializer: Deserializer<T>, memberOptions?: OptionsBase) => T;
/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
export declare class Deserializer<T> {
    options?: OptionsBase;
    private typeResolver;
    private nameResolver?;
    private errorHandler;
    private deserializationStrategy;
    setNameResolver(nameResolverCallback: (ctor: Function) => string): void;
    setTypeResolver(typeResolverCallback: TypeResolver): void;
    getTypeResolver(): TypeResolver;
    setErrorHandler(errorHandlerCallback: (error: Error) => void): void;
    getErrorHandler(): (error: Error) => void;
    convertSingleValue(sourceObject: any, typeDescriptor: TypeDescriptor, knownTypes: Map<string, Function>, memberName?: string, memberOptions?: OptionsBase): any;
    instantiateType(ctor: any): any;
    mergeKnownTypes(...knownTypeMaps: Array<Map<string, Function>>): Map<string, Function>;
    createKnownTypesMap(knowTypes: Set<Function>): Map<string, Function>;
    private isExpectedMapShape;
    retrievePreserveNull(memberOptions?: OptionsBase): boolean;
}
