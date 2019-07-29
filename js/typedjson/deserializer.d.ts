import { IndexedObject } from "./types";
import { OptionsBase } from "./options-base";
export interface IScopeTypeInfo {
    selfConstructor: Function;
    elementConstructor?: Function[];
    keyConstructor?: Function;
    knownTypes: Map<string, Function>;
}
/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
export declare class Deserializer<T> {
    options?: OptionsBase;
    private _typeResolver;
    private _nameResolver?;
    private _errorHandler;
    constructor();
    setNameResolver(nameResolverCallback: (ctor: Function) => string): void;
    setTypeResolver(typeResolverCallback: (sourceObject: Object, knownTypes: Map<string, Function>) => Function): void;
    setErrorHandler(errorHandlerCallback: (error: Error) => void): void;
    convertAsObject(sourceObject: IndexedObject, sourceObjectTypeInfo: IScopeTypeInfo, objectName?: string, memberOptions?: OptionsBase): {} | undefined;
    convertSingleValue(sourceObject: any, typeInfo: IScopeTypeInfo, memberName?: string, memberOptions?: OptionsBase): any;
    convertAsArray(sourceObject: any, typeInfo: IScopeTypeInfo, memberName?: string, memberOptions?: OptionsBase): any[];
    convertAsSet(sourceObject: any, typeInfo: IScopeTypeInfo, memberName?: string, memberOptions?: OptionsBase): Set<any>;
    convertAsMap(sourceObject: any, typeInfo: IScopeTypeInfo, memberName?: string, memberOptions?: OptionsBase): Map<any, any>;
    private _throwTypeMismatchError;
    private _makeTypeErrorMessage;
    private _instantiateType;
    private _mergeKnownTypes;
    private _createKnownTypesMap;
    private _isDirectlyDeserializableNativeType;
    convertNativeObject(sourceObject: any): any;
    private _stringToArrayBuffer;
    private _stringToDataView;
    private retrievePreserveNull;
}
