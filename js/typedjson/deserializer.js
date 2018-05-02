import { nameof } from "./helpers";
import * as Helpers from "./helpers";
import { JsonObjectMetadata } from "./metadata";
/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
export class Deserializer {
    constructor() {
        this._typeResolver = (sourceObject, knownTypes) => {
            if (sourceObject.__type)
                return knownTypes.get(sourceObject.__type);
        };
        this._errorHandler = (error) => Helpers.logError(error);
    }
    setNameResolver(nameResolverCallback) {
        this._nameResolver = nameResolverCallback;
    }
    setTypeResolver(typeResolverCallback) {
        if (typeof typeResolverCallback !== "function")
            throw new TypeError("'typeResolverCallback' is not a function.");
        this._typeResolver = typeResolverCallback;
    }
    setErrorHandler(errorHandlerCallback) {
        if (typeof errorHandlerCallback !== "function")
            throw new TypeError("'errorHandlerCallback' is not a function.");
        this._errorHandler = errorHandlerCallback;
    }
    convertAsObject(sourceObject, sourceObjectTypeInfo, objectName = "object") {
        if (typeof sourceObject !== "object" || sourceObject === null) {
            this._errorHandler(new TypeError(`Cannot deserialize ${objectName}: 'sourceObject' must be a defined object.`));
            return undefined;
        }
        let expectedSelfType = sourceObjectTypeInfo.selfConstructor;
        let sourceObjectMetadata = JsonObjectMetadata.getFromConstructor(expectedSelfType);
        let knownTypeConstructors = sourceObjectTypeInfo.knownTypes;
        if (sourceObjectMetadata) {
            // Merge known types received from "above" with known types defined on the current type.
            knownTypeConstructors = this._mergeKnownTypes(knownTypeConstructors, this._createKnownTypesMap(sourceObjectMetadata.knownTypes));
        }
        // Check if a type-hint is available from the source object.
        let typeFromTypeHint = this._typeResolver(sourceObject, knownTypeConstructors);
        if (typeFromTypeHint) {
            // Check if type hint is a valid subtype of the expected source type.
            if (Helpers.isSubtypeOf(typeFromTypeHint, expectedSelfType)) {
                // Hell yes.
                expectedSelfType = typeFromTypeHint;
                sourceObjectMetadata = JsonObjectMetadata.getFromConstructor(typeFromTypeHint);
                if (sourceObjectMetadata) {
                    // Also merge new known types from subtype.
                    knownTypeConstructors = this._mergeKnownTypes(knownTypeConstructors, this._createKnownTypesMap(sourceObjectMetadata.knownTypes));
                }
            }
        }
        if (sourceObjectMetadata && sourceObjectMetadata.isExplicitlyMarked) {
            // Strong-typed deserialization available, get to it.
            // First deserialize properties into a temporary object.
            let sourceObjectWithDeserializedProperties = {};
            // Deserialize by expected properties.
            sourceObjectMetadata.dataMembers.forEach((memberMetadata, propKey) => {
                let memberValue = sourceObject[propKey];
                let memberNameForDebug = `${nameof(sourceObjectMetadata.classType)}.${propKey}`;
                let expectedMemberType = memberMetadata.ctor;
                let revivedValue = this.convertSingleValue(memberValue, {
                    selfConstructor: expectedMemberType,
                    elementConstructor: memberMetadata.elementType,
                    keyConstructor: memberMetadata.keyType,
                    knownTypes: knownTypeConstructors
                }, memberNameForDebug);
                if (Helpers.isValueDefined(revivedValue)) {
                    sourceObjectWithDeserializedProperties[propKey] = revivedValue;
                }
                else if (memberMetadata.isRequired) {
                    this._errorHandler(new TypeError(`Missing required member '${memberNameForDebug}'.`));
                }
            });
            // Next, instantiate target object.
            let targetObject;
            if (typeof sourceObjectMetadata.initializerCallback === "function") {
                try {
                    targetObject = sourceObjectMetadata.initializerCallback(sourceObjectWithDeserializedProperties, sourceObject);
                    // Check the validity of user-defined initializer callback.
                    if (!targetObject) {
                        throw new TypeError(Helpers.multilineString(`Cannot deserialize ${objectName}:`, `'initializer' function returned undefined/null, but '${nameof(sourceObjectMetadata.classType)}' was expected.`));
                    }
                    else if (!(targetObject instanceof sourceObjectMetadata.classType)) {
                        throw new TypeError(Helpers.multilineString(`Cannot deserialize ${objectName}:`, `'initializer' returned '${nameof(targetObject.constructor)}', but '${nameof(sourceObjectMetadata.classType)}' was expected,`, `and '${nameof(targetObject.constructor)}' is not a subtype of '${nameof(sourceObjectMetadata.classType)}'`));
                    }
                }
                catch (e) {
                    this._errorHandler(e);
                    return undefined;
                }
            }
            else {
                targetObject = this._instantiateType(expectedSelfType);
            }
            // Finally, assign deserialized properties to target object.
            Object.assign(targetObject, sourceObjectWithDeserializedProperties);
            // Call onDeserialized method (if any).
            if (sourceObjectMetadata.onDeserializedMethodName) {
                if (typeof targetObject.constructor[sourceObjectMetadata.onDeserializedMethodName] === "function") {
                    targetObject.constructor[sourceObjectMetadata.onDeserializedMethodName]();
                }
                else {
                    this._errorHandler(new TypeError(`onDeserialized callback '${nameof(sourceObjectMetadata.classType)}.${sourceObjectMetadata.onDeserializedMethodName}' is not a method.`));
                }
            }
            return targetObject;
        }
        else {
            // Untyped deserialization into Object instance.
            let targetObject = {};
            Object.keys(sourceObject).forEach(sourceKey => {
                targetObject[sourceKey] = this.convertSingleValue(sourceObject[sourceKey], {
                    selfConstructor: sourceObject[sourceKey].constructor,
                    knownTypes: sourceObjectTypeInfo.knownTypes,
                    elementConstructor: sourceObjectTypeInfo.elementConstructor,
                    keyConstructor: sourceObjectTypeInfo.keyConstructor
                }, sourceKey);
            });
            return targetObject;
        }
    }
    convertSingleValue(sourceObject, typeInfo, memberName = "object") {
        let expectedSelfType = typeInfo.selfConstructor;
        let srcTypeNameForDebug = sourceObject ? nameof(sourceObject.constructor) : "undefined";
        if (!Helpers.isValueDefined(sourceObject)) {
            return sourceObject;
        }
        else if (this._isDirectlyDeserializableNativeType(expectedSelfType)) {
            if (sourceObject.constructor === expectedSelfType) {
                return sourceObject;
            }
            else {
                throw new TypeError(this._makeTypeErrorMessage(nameof(expectedSelfType), sourceObject.constructor, memberName));
            }
        }
        else if (expectedSelfType === Date) {
            // Support for Date with ISO 8601 format, or with numeric timestamp (milliseconds elapsed since the Epoch).
            // ISO 8601 spec.: https://www.w3.org/TR/NOTE-datetime
            if (typeof sourceObject === "string" || (typeof sourceObject === "number" && sourceObject > 0))
                return new Date(sourceObject);
            else
                this._throwTypeMismatchError("Date", "an ISO-8601 string", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Float32Array) {
            // Deserialize Float32Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(elem => !isNaN(elem)))
                return new Float32Array(sourceObject);
            else
                this._throwTypeMismatchError("Float32Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Float64Array) {
            // Deserialize Float64Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(elem => !isNaN(elem)))
                return new Float64Array(sourceObject);
            else
                this._throwTypeMismatchError("Float64Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Uint8Array) {
            // Deserialize Uint8Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(elem => !isNaN(elem)))
                return new Uint8Array(sourceObject.map(value => ~~value));
            else
                this._throwTypeMismatchError("Uint8Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Uint8ClampedArray) {
            // Deserialize Uint8Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(elem => !isNaN(elem)))
                return new Uint8ClampedArray(sourceObject.map(value => ~~value));
            else
                this._throwTypeMismatchError("Uint8ClampedArray", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Uint16Array) {
            // Deserialize Uint16Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(elem => !isNaN(elem)))
                return new Uint16Array(sourceObject.map(value => ~~value));
            else
                this._throwTypeMismatchError("Uint16Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Uint32Array) {
            // Deserialize Uint32Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(elem => !isNaN(elem)))
                return new Uint32Array(sourceObject.map(value => ~~value));
            else
                this._throwTypeMismatchError("Uint32Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === ArrayBuffer) {
            if (typeof sourceObject === "string")
                return this._stringToArrayBuffer(sourceObject);
            else
                this._throwTypeMismatchError("ArrayBuffer", "a string source", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === DataView) {
            if (typeof sourceObject === "string")
                return this._stringToDataView(sourceObject);
            else
                this._throwTypeMismatchError("DataView", "a string source", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Array) {
            if (sourceObject instanceof Array)
                return this.convertAsArray(sourceObject, typeInfo, memberName);
            else
                throw new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName));
        }
        else if (expectedSelfType === Set) {
            if (sourceObject instanceof Array)
                return this.convertAsSet(sourceObject, typeInfo, memberName);
            else
                this._throwTypeMismatchError("Set", "Array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Map) {
            if (sourceObject instanceof Array)
                return this.convertAsMap(sourceObject, typeInfo, memberName);
            else
                this._throwTypeMismatchError("Map", "a source array of key-value-pair objects", srcTypeNameForDebug, memberName);
        }
        else if (sourceObject && typeof sourceObject === "object") {
            return this.convertAsObject(sourceObject, typeInfo, memberName);
        }
    }
    convertAsArray(sourceObject, typeInfo, memberName = "object") {
        if (!(sourceObject instanceof Array)) {
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
            return [];
        }
        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length) {
            this._errorHandler(new TypeError(`Could not deserialize ${memberName} as Array: missing constructor reference of Array elements.`));
            return [];
        }
        let elementTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };
        return sourceObject.map(element => {
            // If an array element fails to deserialize, substitute with undefined. This is so that the original ordering is not interrupted by faulty
            // entries, as an Array is ordered.
            try {
                return this.convertSingleValue(element, elementTypeInfo);
            }
            catch (e) {
                this._errorHandler(e);
                // Keep filling the array here with undefined to keep original ordering.
                // Note: this is just aesthetics, not returning anything produces the same result.
                return undefined;
            }
        });
    }
    convertAsSet(sourceObject, typeInfo, memberName = "object") {
        if (!(sourceObject instanceof Array)) {
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
            return new Set();
        }
        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length) {
            this._errorHandler(new TypeError(`Could not deserialize ${memberName} as Set: missing constructor reference of Set elements.`));
            return new Set();
        }
        let elementTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };
        let resultSet = new Set();
        sourceObject.forEach((element, i) => {
            try {
                resultSet.add(this.convertSingleValue(element, elementTypeInfo, memberName + `[${i}]`));
            }
            catch (e) {
                // Faulty entries are skipped, because a Set is not ordered, and skipping an entry does not affect others.
                this._errorHandler(e);
            }
        });
        return resultSet;
    }
    convertAsMap(sourceObject, typeInfo, memberName = "object") {
        if (!(sourceObject instanceof Array))
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
        if (!typeInfo.keyConstructor) {
            this._errorHandler(new TypeError(`Could not deserialize ${memberName} as Map: missing key constructor.`));
            return new Map();
        }
        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length) {
            this._errorHandler(new TypeError(`Could not deserialize ${memberName} as Map: missing value constructor.`));
            return new Map();
        }
        let keyTypeInfo = {
            selfConstructor: typeInfo.keyConstructor,
            knownTypes: typeInfo.knownTypes
        };
        let valueTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };
        let resultMap = new Map();
        sourceObject.forEach((element) => {
            try {
                let key = this.convertSingleValue(element.key, keyTypeInfo);
                // Undefined/null keys not supported, skip if so.
                if (Helpers.isValueDefined(key)) {
                    resultMap.set(key, this.convertSingleValue(element.value, valueTypeInfo, memberName + `[${key}]`));
                }
            }
            catch (e) {
                // Faulty entries are skipped, because a Map is not ordered, and skipping an entry does not affect others.
                this._errorHandler(e);
            }
        });
        return resultMap;
    }
    _throwTypeMismatchError(targetType, expectedSourceType, actualSourceType, memberName = "object") {
        throw new TypeError(`Could not deserialize ${memberName} as ${targetType}: expected ${expectedSourceType}, got ${actualSourceType}.`);
    }
    _makeTypeErrorMessage(expectedType, actualType, memberName = "object") {
        let expectedTypeName = (typeof expectedType === "function") ? nameof(expectedType) : expectedType;
        let actualTypeName = (typeof actualType === "function") ? nameof(actualType) : actualType;
        return `Could not deserialize ${memberName}: expected '${expectedTypeName}', got '${actualTypeName}'.`;
    }
    _instantiateType(ctor) {
        return new ctor();
    }
    _mergeKnownTypes(...knownTypeMaps) {
        let result = new Map();
        knownTypeMaps.forEach(knownTypes => {
            knownTypes.forEach((ctor, name) => {
                if (this._nameResolver) {
                    result.set(this._nameResolver(ctor), ctor);
                }
                else {
                    result.set(name, ctor);
                }
            });
        });
        return result;
    }
    _createKnownTypesMap(knowTypes) {
        let map = new Map();
        knowTypes.forEach(ctor => {
            if (this._nameResolver) {
                map.set(this._nameResolver(ctor), ctor);
            }
            else {
                map.set(ctor.name, ctor);
            }
        });
        return map;
    }
    _isDirectlyDeserializableNativeType(ctor) {
        return ~([Number, String, Boolean].indexOf(ctor));
    }
    convertNativeObject(sourceObject) {
        return sourceObject;
    }
    _stringToArrayBuffer(str) {
        let buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        let bufView = new Uint16Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
    _stringToDataView(str) {
        return new DataView(this._stringToArrayBuffer(str));
    }
}
//# sourceMappingURL=deserializer.js.map