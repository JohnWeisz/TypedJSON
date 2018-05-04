// [typedjson]  Version: 1.1.0-rc1 - 2018-05-04  
 (function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("typedjson", [], factory);
	else if(typeof exports === 'object')
		exports["typedjson"] = factory();
	else
		root["typedjson"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/typedjson/helpers.ts
const METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";
function getDefaultValue(type) {
    switch (type) {
        case Number:
            return 0;
        case String:
            return "";
        case Boolean:
            return false;
        case Array:
            return [];
        default:
            return undefined;
    }
}
function isPrimitiveType(type) {
    return (type === String || type === Boolean || type === Number);
}
function isPrimitiveValue(obj) {
    switch (typeof obj) {
        case "string":
        case "number":
        case "boolean":
            return true;
        default:
            return (obj instanceof String || obj instanceof Number || obj instanceof Boolean);
    }
}
function isObject(value) {
    return typeof value === "object";
}
function parseToJSObject(json) {
    if (isObject(json)) {
        return json;
    }
    json = JSON.parse(json);
    if (!isObject(json)) {
        throw new TypeError("TypedJSON can only parse JSON strings or plain JS objects");
    }
    return json;
}
/**
 * Determines if 'A' is a sub-type of 'B' (or if 'A' equals 'B').
 * @param A The supposed derived type.
 * @param B The supposed base type.
 */
function isSubtypeOf(A, B) {
    return A === B || A.prototype instanceof B;
}
function logError(message, ...optionalParams) {
    if (typeof console === "object" && typeof console.error === "function") {
        console.error.apply(console, [message].concat(optionalParams));
    }
    else if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, ["ERROR: " + message].concat(optionalParams));
    }
}
function logMessage(message, ...optionalParams) {
    if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, [message].concat(optionalParams));
    }
}
function logWarning(message, ...optionalParams) {
    if (typeof console === "object" && typeof console.warn === "function") {
        console.warn.apply(console, [message].concat(optionalParams));
    }
    else if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, ["WARNING: " + message].concat(optionalParams));
    }
}
/**
 * Checks if the value is considered defined (not undefined and not null).
 * @param value
 */
function isValueDefined(value) {
    return !(typeof value === "undefined" || value === null);
}
function isInstanceOf(value, constructor) {
    if (typeof value === "number") {
        return (constructor === Number);
    }
    else if (typeof value === "string") {
        return (constructor === String);
    }
    else if (typeof value === "boolean") {
        return (constructor === Boolean);
    }
    else if (isObject(value)) {
        return (value instanceof constructor);
    }
    return false;
}
const isReflectMetadataSupported = (typeof Reflect === "object" && typeof Reflect.getMetadata === "function");
function multilineString(...values) {
    return values.join(" ");
}
/**
 * Gets the name of a function.
 * @param fn The function whose name to get.
 */
function nameof(fn) {
    if (typeof fn.name === "string") {
        return fn.name;
    }
    else {
        return "undefined";
    }
}

// CONCATENATED MODULE: ./src/typedjson/metadata.ts


class JsonMemberMetadata {
}
class metadata_JsonObjectMetadata {
    constructor() {
        //#endregion
        this.dataMembers = new Map();
        this.knownTypes = new Set();
    }
    //#region Static
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param ctor The constructor of a class (with or without jsonObject).
     */
    static getJsonObjectName(ctor) {
        var metadata = this.getFromConstructor(ctor);
        return metadata ? nameof(metadata.classType) : nameof(ctor);
    }
    /**
     * Gets jsonObject metadata information from a class or its prototype.
     * @param target The target class or prototype.
     * @param allowInherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     */
    static getFromConstructor(target) {
        var targetPrototype;
        var metadata;
        targetPrototype = (typeof target === "function") ? target.prototype : target;
        if (!targetPrototype) {
            return undefined;
        }
        if (targetPrototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            // The class prototype contains own jsonObject metadata.
            metadata = targetPrototype[METADATA_FIELD_KEY];
        }
        if (metadata && metadata.isExplicitlyMarked) // Ignore implicitly added jsonObject (through jsonMember).
         {
            return metadata;
        }
        else {
            return undefined;
        }
    }
    /**
     * Gets jsonObject metadata information from a class instance.
     * @param target The target instance.
     */
    static getFromInstance(target) {
        return this.getFromConstructor(Object.getPrototypeOf(target));
    }
    /**
     * Gets the known type name of a jsonObject class for type hint.
     * @param target The target class.
     */
    static getKnownTypeNameFromType(target) {
        var metadata = this.getFromConstructor(target);
        return metadata ? nameof(metadata.classType) : nameof(target);
    }
    /**
     * Gets the known type name of a jsonObject instance for type hint.
     * @param target The target instance.
     */
    static getKnownTypeNameFromInstance(target) {
        var metadata = this.getFromInstance(target);
        return metadata ? nameof(metadata.classType) : nameof(target.constructor);
    }
}
function injectMetadataInformation(target, propKey, metadata) {
    var decoratorName = `@jsonMember on ${nameof(target.constructor)}.${propKey}`; // For error messages.
    var objectMetadata;
    var parentMetadata;
    // When a property decorator is applied to a static member, 'target' is a constructor function.
    // See: https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
    // ... and static members are not supported here, so abort.
    if (typeof target === "function") {
        logError(`${decoratorName}: cannot use a static property.`);
        return;
    }
    // Methods cannot be serialized.
    if (typeof target[propKey] === "function") {
        logError(`${decoratorName}: cannot use a method property.`);
        return;
    }
    if (!metadata || !metadata.ctor) {
        logError(`${decoratorName}: JsonMemberMetadata has unknown ctor.`);
        return;
    }
    // Add jsonObject metadata to 'target' if not yet exists ('target' is the prototype).
    // NOTE: this will not fire up custom serialization, as 'target' must be explicitly marked with '@jsonObject' as well.
    if (!target.hasOwnProperty(METADATA_FIELD_KEY)) {
        // No *own* metadata, create new.
        objectMetadata = new metadata_JsonObjectMetadata();
        parentMetadata = target[METADATA_FIELD_KEY];
        objectMetadata.name = target.constructor.name; // Default.
        // Inherit @JsonMembers from parent @jsonObject (if any).
        if (parentMetadata) // && !target.hasOwnProperty(Helpers.METADATA_FIELD_KEY)
         {
            parentMetadata.dataMembers.forEach((_metadata, _propKey) => objectMetadata.dataMembers.set(_propKey, _metadata));
        }
        // ('target' is the prototype of the involved class, metadata information is added to this class prototype).
        Object.defineProperty(target, METADATA_FIELD_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata
        });
    }
    else {
        // JsonObjectMetadata already exists on 'target'.
        objectMetadata = target[METADATA_FIELD_KEY];
    }
    objectMetadata.knownTypes.add(metadata.ctor);
    if (metadata.keyType)
        objectMetadata.knownTypes.add(metadata.keyType);
    if (metadata.elementType)
        metadata.elementType.forEach(elemCtor => objectMetadata.knownTypes.add(elemCtor));
    objectMetadata.dataMembers.set(metadata.name, metadata);
}

// CONCATENATED MODULE: ./src/typedjson/deserializer.ts



/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
class deserializer_Deserializer {
    constructor() {
        this._typeResolver = (sourceObject, knownTypes) => {
            if (sourceObject.__type)
                return knownTypes.get(sourceObject.__type);
        };
        this._errorHandler = (error) => logError(error);
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
        let sourceObjectMetadata = metadata_JsonObjectMetadata.getFromConstructor(expectedSelfType);
        let knownTypeConstructors = sourceObjectTypeInfo.knownTypes;
        if (sourceObjectMetadata) {
            // Merge known types received from "above" with known types defined on the current type.
            knownTypeConstructors = this._mergeKnownTypes(knownTypeConstructors, this._createKnownTypesMap(sourceObjectMetadata.knownTypes));
        }
        // Check if a type-hint is available from the source object.
        let typeFromTypeHint = this._typeResolver(sourceObject, knownTypeConstructors);
        if (typeFromTypeHint) {
            // Check if type hint is a valid subtype of the expected source type.
            if (isSubtypeOf(typeFromTypeHint, expectedSelfType)) {
                // Hell yes.
                expectedSelfType = typeFromTypeHint;
                sourceObjectMetadata = metadata_JsonObjectMetadata.getFromConstructor(typeFromTypeHint);
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
                if (isValueDefined(revivedValue)) {
                    sourceObjectWithDeserializedProperties[memberMetadata.key] = revivedValue;
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
                        throw new TypeError(multilineString(`Cannot deserialize ${objectName}:`, `'initializer' function returned undefined/null, but '${nameof(sourceObjectMetadata.classType)}' was expected.`));
                    }
                    else if (!(targetObject instanceof sourceObjectMetadata.classType)) {
                        throw new TypeError(multilineString(`Cannot deserialize ${objectName}:`, `'initializer' returned '${nameof(targetObject.constructor)}', but '${nameof(sourceObjectMetadata.classType)}' was expected,`, `and '${nameof(targetObject.constructor)}' is not a subtype of '${nameof(sourceObjectMetadata.classType)}'`));
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
        if (!isValueDefined(sourceObject)) {
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
                if (isValueDefined(key)) {
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

// CONCATENATED MODULE: ./src/typedjson/serializer.ts



/**
 * Utility class, converts a typed object tree (i.e. a tree of class instances, arrays of class instances, and so on) to an untyped javascript object (also
 * called "simple javascript object"), and emits any necessary type hints in the process (for polymorphism).
 *
 * The converted object tree is what will be given to `JSON.stringify` to convert to string as the last step, the serialization is basically like:
 *
 * (1) typed object-tree -> (2) simple JS object-tree -> (3) JSON-string
 */
class serializer_Serializer {
    constructor() {
        this._typeHintEmitter = (targetObject, sourceObject, expectedSourceType) => {
            // By default, we put a "__type" property on the output object if the actual object is not the same as the expected one, so that deserialization
            // will know what to deserialize into (given the required known-types are defined, and the object is a valid subtype of the expected type).
            if (sourceObject.constructor !== expectedSourceType) {
                // TODO: Perhaps this can work correctly without string-literal access?
                // tslint:disable-next-line:no-string-literal
                targetObject["__type"] = nameof(sourceObject.constructor);
            }
        };
        this._errorHandler = (error) => logError(error);
    }
    setTypeHintEmitter(typeEmitterCallback) {
        if (typeof typeEmitterCallback !== "function") {
            throw new TypeError("'typeEmitterCallback' is not a function.");
        }
        this._typeHintEmitter = typeEmitterCallback;
    }
    setErrorHandler(errorHandlerCallback) {
        if (typeof errorHandlerCallback !== "function") {
            throw new TypeError("'errorHandlerCallback' is not a function.");
        }
        this._errorHandler = errorHandlerCallback;
    }
    /**
     * Convert a value of any supported serializable type.
     * The value type will be detected, and the correct serialization method will be called.
     */
    convertSingleValue(sourceObject, typeInfo, memberName = "object") {
        if (!isValueDefined(sourceObject))
            return;
        if (!isInstanceOf(sourceObject, typeInfo.selfType)) {
            let expectedName = nameof(typeInfo.selfType);
            let actualName = nameof(sourceObject.constructor);
            this._errorHandler(new TypeError(`Could not serialize '${memberName}': expected '${expectedName}', got '${actualName}'.`));
            return;
        }
        if (this._isDirectlySerializableNativeType(typeInfo.selfType)) {
            return sourceObject;
        }
        else if (typeInfo.selfType === ArrayBuffer) {
            return this.convertAsArrayBuffer(sourceObject);
        }
        else if (typeInfo.selfType === DataView) {
            return this.convertAsDataView(sourceObject);
        }
        else if (typeInfo.selfType === Array) {
            return this.convertAsArray(sourceObject, typeInfo.elementTypes, memberName);
        }
        else if (typeInfo.selfType === Set) {
            return this.convertAsSet(sourceObject, typeInfo.elementTypes[0], memberName);
        }
        else if (typeInfo.selfType === Map) {
            return this.convertAsMap(sourceObject, typeInfo.keyType, typeInfo.elementTypes[0], memberName);
        }
        else if (this._isTypeTypedArray(typeInfo.selfType)) {
            return this.convertAsTypedArray(sourceObject);
        }
        else if (typeof sourceObject === "object") {
            return this.convertAsObject(sourceObject, typeInfo, memberName);
        }
    }
    /**
     * Performs the conversion of a typed object (usually a class instance) to a simple javascript object for serialization.
     */
    convertAsObject(sourceObject, typeInfo, memberName) {
        let sourceTypeMetadata;
        let targetObject;
        if (sourceObject.constructor !== typeInfo.selfType && sourceObject instanceof typeInfo.selfType) {
            // The source object is not of the expected type, but it is a valid subtype.
            // This is OK, and we'll proceed to gather object metadata from the subtype instead.
            sourceTypeMetadata = metadata_JsonObjectMetadata.getFromConstructor(sourceObject.constructor);
        }
        else {
            sourceTypeMetadata = metadata_JsonObjectMetadata.getFromConstructor(typeInfo.selfType);
        }
        if (sourceTypeMetadata) {
            // Strong-typed serialization available.
            // We'll serialize by members that have been marked with @jsonMember (including array/set/map members), and perform recursive conversion on
            // each of them. The converted objects are put on the 'targetObject', which is what will be put into 'JSON.stringify' finally.
            targetObject = {};
            sourceTypeMetadata.dataMembers.forEach((memberMetadata, propKey) => {
                targetObject[memberMetadata.name] = this.convertSingleValue(sourceObject[memberMetadata.key], {
                    selfType: memberMetadata.ctor,
                    elementTypes: memberMetadata.elementType,
                    keyType: memberMetadata.keyType
                }, `${nameof(sourceTypeMetadata.classType)}.${memberMetadata.key}`);
            });
        }
        else {
            // Untyped serialization, "as-is", we'll just pass the object on.
            // We'll clone the source object, because type hints are added to the object itself, and we don't want to modify to the original object.
            targetObject = Object.assign({}, sourceObject);
        }
        // Add type-hint.
        this._typeHintEmitter(targetObject, sourceObject, typeInfo.selfType);
        return targetObject;
    }
    /**
     * Performs the conversion of an array of typed objects (or primitive values) to an array of simple javascript objects (or primitive values) for
     * serialization.
     * @param expectedElementType The expected type of elements. If the array is supposed to be multi-dimensional, subsequent elements define lower dimensions.
     * @param memberName Name of the object being serialized, used for debugging purposes.
     */
    convertAsArray(sourceObject, expectedElementType, memberName = "object") {
        if (expectedElementType.length === 0 || !expectedElementType[0]) {
            this._errorHandler(new TypeError(`Could not serialize ${memberName} as Array: missing element type definition.`));
            return;
        }
        // Check the type of each element, individually.
        // If at least one array element type is incorrect, we return undefined, which results in no value emitted during serialization.
        // This is so that invalid element types don't unexpectedly alter the ordering of other, valid elements, and that no unexpected undefined values are in
        // the emitted array.
        try {
            sourceObject.forEach((element, i) => {
                if (!isInstanceOf(element, expectedElementType[0])) {
                    let expectedTypeName = nameof(expectedElementType[0]);
                    let actualTypeName = nameof(element.constructor);
                    throw new TypeError(`Could not serialize ${memberName}[${i}]: expected '${expectedTypeName}', got '${actualTypeName}'.`);
                }
            });
        }
        catch (e) {
            this._errorHandler(e);
            return;
        }
        let typeInfoForElements = {
            selfType: expectedElementType[0],
            elementTypes: expectedElementType.length > 1 ? expectedElementType.slice(1) : [] // For multidimensional arrays.
        };
        if (memberName) {
            // Just for debugging purposes.
            memberName += "[]";
        }
        return sourceObject.map(element => this.convertSingleValue(element, typeInfoForElements, memberName));
    }
    /**
     * Performs the conversion of a set of typed objects (or primitive values) into an array of simple javascript objects.
     *
     * @param sourceObject
     * @param expectedElementType The constructor of the expected Set elements (e.g. `Number` for `Set<number>`, or `MyClass` for `Set<MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @returns
     */
    convertAsSet(sourceObject, expectedElementType, memberName = "object") {
        if (!expectedElementType) {
            this._errorHandler(new TypeError(`Could not serialize ${memberName} as Set: missing element type definition.`));
            return;
        }
        let elementTypeInfo = {
            selfType: expectedElementType
        };
        // For debugging and error tracking.
        if (memberName)
            memberName += "[]";
        let resultArray = [];
        // Convert each element of the set, and put it into an output array.
        // The output array is the one serialized, as JSON.stringify does not support Set serialization. (TODO: clarification needed)
        sourceObject.forEach(element => {
            let resultElement = this.convertSingleValue(element, elementTypeInfo, memberName);
            // Add to output if the source element was undefined, OR the converted element is defined. This will add intentionally undefined values to output,
            // but not values that became undefined DURING serializing (usually because of a type-error).
            if (!isValueDefined(element) || isValueDefined(resultElement)) {
                resultArray.push(resultElement);
            }
        });
        return resultArray;
    }
    /**
     * Performs the conversion of a map of typed objects (or primitive values) into an array of simple javascript objects with `key` and `value` properties.
     *
     * @param sourceObject
     * @param expectedKeyType The constructor of the expected Map keys (e.g. `Number` for `Map<number, any>`, or `MyClass` for `Map<MyClass, any>`).
     * @param expectedElementType The constructor of the expected Map values (e.g. `Number` for `Map<any, number>`, or `MyClass` for `Map<any, MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     */
    convertAsMap(sourceObject, expectedKeyType, expectedElementType, memberName = "object") {
        if (!expectedElementType)
            throw new TypeError(`Could not serialize ${memberName} as Map: missing value type definition.`);
        if (!expectedKeyType)
            throw new TypeError(`Could not serialize ${memberName} as Map: missing key type definition.`);
        let elementTypeInfo = {
            selfType: expectedElementType,
            elementTypes: [expectedElementType]
        };
        let keyTypeInfo = {
            selfType: expectedKeyType
        };
        if (memberName)
            memberName += "[]";
        let resultArray = [];
        // Convert each *entry* in the map to a simple javascript object with key and value properties.
        sourceObject.forEach((value, key) => {
            let resultKeyValuePairObj = {
                key: this.convertSingleValue(key, keyTypeInfo, memberName),
                value: this.convertSingleValue(value, elementTypeInfo, memberName)
            };
            // We are not going to emit entries with undefined keys OR undefined values.
            if (isValueDefined(resultKeyValuePairObj.key) && isValueDefined(resultKeyValuePairObj.value)) {
                resultArray.push(resultKeyValuePairObj);
            }
        });
        return resultArray;
    }
    /**
     * Performs the conversion of a typed javascript array to a simple untyped javascript array.
     * This is needed because typed arrays are otherwise serialized as objects, so we'll end up with something like "{ 0: 0, 1: 1, ... }".
     *
     * @param sourceObject
     * @returns
     */
    convertAsTypedArray(sourceObject) {
        return Array.from(sourceObject);
    }
    /**
     * Performs the conversion of a raw ArrayBuffer to a string.
     */
    convertAsArrayBuffer(buffer) {
        // ArrayBuffer -> 16-bit character codes -> character array -> joined string.
        return Array.from(new Uint16Array(buffer)).map(charCode => String.fromCharCode(charCode)).join("");
    }
    /**
     * Performs the conversion of DataView, converting its internal ArrayBuffer to a string and returning that string.
     */
    convertAsDataView(dataView) {
        return this.convertAsArrayBuffer(dataView.buffer);
    }
    /**
     * Determines whether the specified type is a type that can be passed on "as-is" into `JSON.stringify`.
     * Values of these types don't need special conversion.
     * @param ctor The constructor of the type (wrapper constructor for primitive types, e.g. `Number` for `number`).
     */
    _isDirectlySerializableNativeType(ctor) {
        return ~[Date, Number, String, Boolean].indexOf(ctor);
    }
    _isTypeTypedArray(ctor) {
        return ~[Float32Array, Float64Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array].indexOf(ctor);
    }
}

// CONCATENATED MODULE: ./src/typedjson/json-object.ts


function jsonObject(optionsOrTarget) {
    let options;
    if (typeof optionsOrTarget === "function") {
        // jsonObject is being used as a decorator, directly.
        options = {};
    }
    else {
        // jsonObject is being used as a decorator factory.
        options = optionsOrTarget || {};
    }
    let decorator = function (target) {
        let objectMetadata;
        let parentMetadata;
        // Create or obtain JsonObjectMetadata object.
        if (!target.prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            // Target has no JsonObjectMetadata associated with it yet, create it now.
            objectMetadata = new metadata_JsonObjectMetadata();
            parentMetadata = target.prototype[METADATA_FIELD_KEY];
            // Inherit json members and known types from parent @jsonObject (if any).
            if (parentMetadata) {
                parentMetadata.dataMembers.forEach((memberMetadata, propKey) => objectMetadata.dataMembers.set(propKey, memberMetadata));
                parentMetadata.knownTypes.forEach((knownType) => objectMetadata.knownTypes.add(knownType));
            }
            if (options.name) {
                objectMetadata.name = options.name;
            }
            else {
                objectMetadata.name = target.name;
            }
            Object.defineProperty(target.prototype, METADATA_FIELD_KEY, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: objectMetadata
            });
        }
        else {
            // Target already has JsonObjectMetadata associated with it.
            objectMetadata = target.prototype[METADATA_FIELD_KEY];
            if (options.name) {
                objectMetadata.name = options.name;
            }
        }
        // Fill JsonObjectMetadata.
        objectMetadata.classType = target;
        objectMetadata.isExplicitlyMarked = true;
        objectMetadata.isAbstract = false;
        objectMetadata.initializerCallback = options.initializer;
        // Obtain known-types.
        if (typeof options.knownTypes === "string") {
            objectMetadata.knownTypeMethodName = options.knownTypes;
        }
        else if (options.knownTypes instanceof Array) {
            options.knownTypes.filter(knownType => !!knownType).forEach(knownType => objectMetadata.knownTypes.add(knownType));
        }
    };
    if (typeof optionsOrTarget === "function") {
        // jsonObject is being used as a decorator, directly.
        decorator(optionsOrTarget);
    }
    else {
        // jsonObject is being used as a decorator factory.
        return decorator;
    }
}

// CONCATENATED MODULE: ./src/typedjson/json-member.ts



function jsonMember(optionsOrTarget, propKey) {
    if (optionsOrTarget instanceof Object && (typeof propKey === "string" || typeof propKey === "symbol")) {
        let target = optionsOrTarget;
        let decoratorName = `@jsonMember on ${nameof(target.constructor)}.${propKey}`; // For error messages.
        // jsonMember used directly, no additional information directly available besides target and propKey.
        // Obtain property constructor through ReflectDecorators.
        if (isReflectMetadataSupported) {
            let reflectPropCtor = Reflect.getMetadata("design:type", target, propKey);
            let memberMetadata = new JsonMemberMetadata();
            if (!reflectPropCtor) {
                logError(`${decoratorName}: could not resolve detected property constructor at runtime.`);
                return;
            }
            if (isSpecialPropertyType(reflectPropCtor, decoratorName)) {
                return;
            }
            memberMetadata.ctor = reflectPropCtor;
            memberMetadata.key = propKey.toString();
            memberMetadata.name = propKey.toString();
            injectMetadataInformation(target, propKey, memberMetadata);
        }
        else {
            logError(`${decoratorName}: ReflectDecorators is required if no 'constructor' option is specified.`);
            return;
        }
    }
    else {
        // jsonMember used as a decorator factory.
        return (target, _propKey) => {
            let options = optionsOrTarget || {};
            let propCtor;
            let decoratorName = `@jsonMember on ${nameof(target.constructor)}.${_propKey}`; // For error messages.
            if (options.hasOwnProperty("constructor")) {
                if (!isValueDefined(options.constructor)) {
                    logError(`${decoratorName}: cannot resolve specified property constructor at runtime.`);
                    return;
                }
                // Property constructor has been specified. Use ReflectDecorators (if available) to check whether that constructor is correct. Warn if not.
                if (isReflectMetadataSupported && !isSubtypeOf(options.constructor, Reflect.getMetadata("design:type", target, _propKey))) {
                    logWarning(`${decoratorName}: detected property type does not match 'constructor' option.`);
                }
                propCtor = options.constructor;
            }
            else {
                // Use ReflectDecorators to obtain property constructor.
                if (isReflectMetadataSupported) {
                    propCtor = Reflect.getMetadata("design:type", target, _propKey);
                    if (!propCtor) {
                        logError(`${decoratorName}: cannot resolve detected property constructor at runtime.`);
                        return;
                    }
                }
                else {
                    logError(`${decoratorName}: ReflectDecorators is required if no 'constructor' option is specified.`);
                    return;
                }
            }
            if (isSpecialPropertyType(propCtor, decoratorName)) {
                return;
            }
            let memberMetadata = new JsonMemberMetadata();
            memberMetadata.ctor = propCtor;
            memberMetadata.emitDefaultValue = options.emitDefaultValue || false;
            memberMetadata.isRequired = options.isRequired || false;
            memberMetadata.key = _propKey.toString();
            memberMetadata.name = options.name || _propKey.toString();
            injectMetadataInformation(target, _propKey, memberMetadata);
        };
    }
}
function isSpecialPropertyType(propCtor, decoratorName) {
    if (propCtor === Array) {
        logError(`${decoratorName}: property is an Array. Use the jsonArrayMember decorator to serialize this property.`);
        return true;
    }
    if (propCtor === Set) {
        logError(`${decoratorName}: property is a Set. Use the jsonSetMember decorator to serialize this property.`);
        return true;
    }
    if (propCtor === Map) {
        logError(`${decoratorName}: property is a Map. Use the jsonMapMember decorator to serialize this property.`);
        return true;
    }
    return false;
}

// CONCATENATED MODULE: ./src/typedjson/json-array-member.ts



/**
 * Specifies that a property, of type array, is part of an object when serializing.
 * @param elementConstructor Constructor of array elements (e.g. 'Number' for 'number[]', or 'Date' for 'Date[]').
 * @param options Additional options.
 */
function jsonArrayMember(elementConstructor, options = {}) {
    return (target, propKey) => {
        let decoratorName = `@jsonArrayMember on ${nameof(target.constructor)}.${propKey}`; // For error messages.
        if (typeof elementConstructor !== "function") {
            logError(`${decoratorName}: could not resolve constructor of array elements at runtime.`);
            return;
        }
        if (!isNaN(options.dimensions) && options.dimensions < 1) {
            logError(`${decoratorName}: 'dimensions' option must be at least 1.`);
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonArrayMember' has been used on an array.
        if (isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Array) {
            logError(`${decoratorName}: property is not an Array.`);
            return;
        }
        let metadata = new JsonMemberMetadata();
        metadata.ctor = Array;
        if (options.dimensions && options.dimensions >= 1) {
            metadata.elementType = [];
            for (let i = 1; i < options.dimensions; i++) {
                metadata.elementType.push(Array);
            }
            metadata.elementType.push(elementConstructor);
        }
        else {
            metadata.elementType = [elementConstructor];
        }
        metadata.emitDefaultValue = options.emitDefaultValue || false;
        metadata.isRequired = options.isRequired || false;
        metadata.key = propKey.toString();
        metadata.name = options.name || propKey.toString();
        injectMetadataInformation(target, propKey, metadata);
    };
}

// CONCATENATED MODULE: ./src/typedjson/json-set-member.ts



/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Set<T>.
 * @param elementConstructor Constructor of set elements (e.g. 'Number' for Set<number> or 'Date' for Set<Date>).
 * @param options Additional options.
 */
function jsonSetMember(elementConstructor, options = {}) {
    return (target, propKey) => {
        var decoratorName = `@jsonSetMember on ${nameof(target.constructor)}.${propKey}`; // For error messages.
        if (typeof elementConstructor !== "function") {
            logError(`${decoratorName}: could not resolve constructor of set elements at runtime.`);
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonSetMember' has been used on a set. Warn if not.
        if (isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Set) {
            logError(`${decoratorName}: property is not a Set.`);
            return;
        }
        var metadata = new JsonMemberMetadata();
        metadata.ctor = Set;
        metadata.elementType = [elementConstructor];
        metadata.emitDefaultValue = options.emitDefaultValue || false;
        metadata.isRequired = options.isRequired || false;
        metadata.key = propKey.toString();
        metadata.name = options.name || propKey.toString();
        injectMetadataInformation(target, propKey, metadata);
    };
}

// CONCATENATED MODULE: ./src/typedjson/json-map-member.ts



/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Map<K, V>.
 * @param keyConstructor Constructor of map keys (e.g. 'Number' for 'Map<number, Date>').
 * @param valueConstructor Constructor of map values (e.g. 'Date' for 'Map<number, Date>').
 * @param options Additional options.
 */
function jsonMapMember(keyConstructor, valueConstructor, options = {}) {
    return (target, propKey) => {
        let decoratorName = `@jsonMapMember on ${nameof(target.constructor)}.${propKey}`; // For error messages.
        if (typeof keyConstructor !== "function") {
            logError(`${decoratorName}: could not resolve constructor of map keys at runtime.`);
            return;
        }
        if (typeof valueConstructor !== "function") {
            logError(`${decoratorName}: could not resolve constructor of map values at runtime.`);
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonMapMember' has been used on a map. Warn if not.
        if (isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Map) {
            logError(`${decoratorName}: property is not a Map.`);
            return;
        }
        let metadata = new JsonMemberMetadata();
        metadata.ctor = Map;
        metadata.elementType = [valueConstructor];
        metadata.keyType = keyConstructor;
        metadata.emitDefaultValue = options.emitDefaultValue || false;
        metadata.isRequired = options.isRequired || false;
        metadata.key = propKey.toString();
        metadata.name = options.name || propKey.toString();
        injectMetadataInformation(target, propKey, metadata);
    };
}

// CONCATENATED MODULE: ./src/typedjson.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TypedJSON", function() { return typedjson_TypedJSON; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonObject", function() { return jsonObject; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonMember", function() { return jsonMember; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonArrayMember", function() { return jsonArrayMember; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonSetMember", function() { return jsonSetMember; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonMapMember", function() { return jsonMapMember; });





class typedjson_TypedJSON {
    /**
     * Creates a new TypedJSON instance to serialize (stringify) and deserialize (parse) object instances of the specified root class type.
     * @param rootType The constructor of the root class type.
     * @param settings Additional configuration settings.
     */
    constructor(rootConstructor, settings) {
        //#endregion
        this.serializer = new serializer_Serializer();
        this.deserializer = new deserializer_Deserializer();
        this.globalKnownTypes = [];
        this.indent = 0;
        let rootMetadata = metadata_JsonObjectMetadata.getFromConstructor(rootConstructor);
        if (!rootMetadata || !rootMetadata.isExplicitlyMarked) {
            throw new TypeError("The TypedJSON root data type must have the @jsonObject decorator used.");
        }
        this.nameResolver = (ctor) => nameof(ctor);
        this.rootConstructor = rootConstructor;
        this.errorHandler = (error) => logError(error);
        if (settings) {
            this.config(settings);
        }
        else if (typedjson_TypedJSON._globalConfig) {
            this.config({});
        }
    }
    //#region Static
    static parse(json, rootType, settings) {
        const object = parseToJSObject(json);
        return new typedjson_TypedJSON(rootType, settings).parse(object);
    }
    static parseAsArray(json, elementType, settings) {
        const object = parseToJSObject(json);
        return new typedjson_TypedJSON(elementType, settings).parseAsArray(object);
    }
    static parseAsSet(json, elementType, settings) {
        const object = parseToJSObject(json);
        return new typedjson_TypedJSON(elementType, settings).parseAsSet(object);
    }
    static parseAsMap(json, keyType, valueType, settings) {
        const object = parseToJSObject(json);
        return new typedjson_TypedJSON(valueType, settings).parseAsMap(object, keyType);
    }
    static stringify(object, rootType, settings) {
        return new typedjson_TypedJSON(rootType, settings).stringify(object);
    }
    static stringifyAsArray(object, elementType, dimensions = 1, settings) {
        return new typedjson_TypedJSON(elementType, settings).stringifyAsArray(object, dimensions);
    }
    static stringifyAsSet(object, elementType, settings) {
        return new typedjson_TypedJSON(elementType, settings).stringifyAsSet(object);
    }
    static stringifyAsMap(object, keyCtor, valueCtor, settings) {
        return new typedjson_TypedJSON(valueCtor, settings).stringifyAsMap(object, keyCtor);
    }
    static setGlobalConfig(config) {
        if (this._globalConfig) {
            Object.assign(this._globalConfig, config);
        }
        else {
            this._globalConfig = config;
        }
    }
    /**
     * Configures TypedJSON through a settings object.
     * @param settings The configuration settings object.
     */
    config(settings) {
        if (typedjson_TypedJSON._globalConfig) {
            settings = Object.assign({}, typedjson_TypedJSON._globalConfig, settings);
            if (settings.knownTypes && typedjson_TypedJSON._globalConfig.knownTypes) {
                // Merge known-types (also de-duplicate them, so Array -> Set -> Array).
                settings.knownTypes = Array.from(new Set(settings.knownTypes.concat(typedjson_TypedJSON._globalConfig.knownTypes)));
            }
        }
        if (settings.errorHandler) {
            this.errorHandler = settings.errorHandler;
            this.deserializer.setErrorHandler(settings.errorHandler);
            this.serializer.setErrorHandler(settings.errorHandler);
        }
        if (settings.replacer)
            this.replacer = settings.replacer;
        if (settings.typeResolver)
            this.deserializer.setTypeResolver(settings.typeResolver);
        if (settings.typeHintEmitter)
            this.serializer.setTypeHintEmitter(settings.typeHintEmitter);
        if (settings.indent)
            this.indent = settings.indent;
        if (settings.nameResolver) {
            this.nameResolver = settings.nameResolver;
            this.deserializer.setNameResolver(settings.nameResolver);
            // this.serializer.set
        }
        if (settings.knownTypes) {
            // Type-check knownTypes elements to recognize errors in advance.
            settings.knownTypes.forEach((knownType, i) => {
                // tslint:disable-next-line:no-null-keyword
                if (typeof knownType === "undefined" || knownType === null) {
                    logWarning(`TypedJSON.config: 'knownTypes' contains an undefined/null value (element ${i}).`);
                }
            });
            this.globalKnownTypes = settings.knownTypes;
        }
    }
    /**
     * Converts a JSON string to the root class type.
     * @param object The JSON to parse and convert.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     */
    parse(object) {
        let rootMetadata = metadata_JsonObjectMetadata.getFromConstructor(this.rootConstructor);
        let result;
        let knownTypes = new Map();
        this.globalKnownTypes.filter(ktc => ktc).forEach(knownTypeCtor => {
            knownTypes.set(this.nameResolver(knownTypeCtor), knownTypeCtor);
        });
        if (rootMetadata) {
            rootMetadata.knownTypes.forEach(knownTypeCtor => {
                knownTypes.set(this.nameResolver(knownTypeCtor), knownTypeCtor);
            });
        }
        try {
            result = this.deserializer.convertSingleValue(object, {
                selfConstructor: this.rootConstructor,
                knownTypes: knownTypes
            });
        }
        catch (e) {
            this.errorHandler(e);
        }
        return result;
    }
    parseAsArray(object, dimensions = 1) {
        if (object instanceof Array) {
            return this.deserializer.convertAsArray(object, {
                selfConstructor: Array,
                elementConstructor: new Array((dimensions - 1) || 0).fill(Array).concat(this.rootConstructor),
                knownTypes: this._mapKnownTypes(this.globalKnownTypes)
            });
        }
        else {
            this.errorHandler(new TypeError(`Expected 'json' to define an Array, but got ${typeof object}.`));
        }
        return [];
    }
    parseAsSet(object) {
        // A Set<T> is serialized as T[].
        if (object instanceof Array) {
            return this.deserializer.convertAsSet(object, {
                selfConstructor: Array,
                elementConstructor: [this.rootConstructor],
                knownTypes: this._mapKnownTypes(this.globalKnownTypes)
            });
        }
        else {
            this.errorHandler(new TypeError(`Expected 'json' to define a Set (using an Array), but got ${typeof object}.`));
        }
        return new Set();
    }
    parseAsMap(object, keyConstructor) {
        // A Set<T> is serialized as T[].
        if (object instanceof Array) {
            return this.deserializer.convertAsMap(object, {
                selfConstructor: Array,
                elementConstructor: [this.rootConstructor],
                knownTypes: this._mapKnownTypes(this.globalKnownTypes),
                keyConstructor: keyConstructor
            });
        }
        else {
            this.errorHandler(new TypeError(`Expected 'json' to define a Set (using an Array), but got ${typeof object}.`));
        }
        return new Map();
    }
    /**
     * Converts an instance of the specified class type to a JSON string.
     * @param object The instance to convert to a JSON string.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     */
    stringify(object) {
        let serializedObject;
        if (!(object instanceof this.rootConstructor)) {
            this.errorHandler(TypeError(`Expected object type to be '${nameof(this.rootConstructor)}', got '${nameof(object.constructor)}'.`));
            return undefined;
        }
        try {
            serializedObject = this.serializer.convertSingleValue(object, {
                selfType: this.rootConstructor
            });
            return JSON.stringify(serializedObject, this.replacer, this.indent);
        }
        catch (e) {
            this.errorHandler(e);
        }
        return "";
    }
    stringifyAsArray(object, dimensions = 1) {
        let elementConstructorArray = new Array((dimensions - 1) || 0).fill(Array).concat(this.rootConstructor);
        return JSON.stringify(this.serializer.convertAsArray(object, elementConstructorArray), this.replacer, this.indent);
    }
    stringifyAsSet(object) {
        return JSON.stringify(this.serializer.convertAsSet(object, this.rootConstructor), this.replacer, this.indent);
    }
    stringifyAsMap(object, keyConstructor) {
        return JSON.stringify(this.serializer.convertAsMap(object, keyConstructor, this.rootConstructor), this.replacer, this.indent);
    }
    _mapKnownTypes(constructors) {
        let map = new Map();
        constructors.filter(ctor => ctor).forEach(ctor => map.set(this.nameResolver(ctor), ctor));
        return map;
    }
}







/***/ })
/******/ ]);
});
//# sourceMappingURL=typedjson.js.map 