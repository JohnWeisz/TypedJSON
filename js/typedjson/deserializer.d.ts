import { IndexedObject } from "./types";
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
    private _typeResolver;
    private _nameResolver;
    private _errorHandler;
    constructor();
    setNameResolver(nameResolverCallback: (ctor: Function) => string): void;
    setTypeResolver(typeResolverCallback: (sourceObject: Object, knownTypes: Map<string, Function>) => Function): void;
    setErrorHandler(errorHandlerCallback: (error: Error) => void): void;
    convertAsObject(sourceObject: IndexedObject, sourceObjectTypeInfo: IScopeTypeInfo, objectName?: string): IndexedObject;
    convertSingleValue(sourceObject: Object, typeInfo: IScopeTypeInfo, memberName?: string): Object;
    convertAsArray(sourceObject: any, typeInfo: IScopeTypeInfo, memberName?: string): any[];
    convertAsSet(sourceObject: any, typeInfo: IScopeTypeInfo, memberName?: string): Set<any>;
    convertAsMap(sourceObject: any, typeInfo: IScopeTypeInfo, memberName?: string): Map<any, any>;
    private _throwTypeMismatchError(targetType, expectedSourceType, actualSourceType, memberName?);
    private _makeTypeErrorMessage(expectedType, actualType, memberName?);
    private _instantiateType(ctor);
    private _mergeKnownTypes(...knownTypeMaps);
    private _createKnownTypesMap(knowTypes);
    private _isDirectlyDeserializableNativeType(ctor);
    convertNativeObject(sourceObject: any): any;
    private _stringToArrayBuffer(str);
    private _stringToDataView(str);
}
