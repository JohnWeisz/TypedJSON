// [typedjson]  Version: 1.2.1 - 2018-12-09  
 (function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("typedjson", [], factory);
	else if(typeof exports === 'object')
		exports["typedjson"] = factory();
	else
		root["typedjson"] = factory();
})((typeof self !== 'undefined' ? self : this), function() {
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
var METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";
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
/**
 * Determines whether the specified type is a type that can be passed on "as-is" into `JSON.stringify`.
 * Values of these types don't need special conversion.
 * @param ctor The constructor of the type (wrapper constructor for primitive types, e.g. `Number` for `number`).
 */
function isDirectlySerializableNativeType(type) {
    return !!(~[Date, Number, String, Boolean].indexOf(type));
}
function isTypeTypedArray(type) {
    return !!(~[Float32Array, Float64Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array]
        .indexOf(type));
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
function shouldOmitParseString(jsonStr, expectedType) {
    var expectsTypesSerializedAsStrings = expectedType === String
        || expectedType === ArrayBuffer
        || expectedType === DataView;
    var hasQuotes = jsonStr.length >= 2 && jsonStr[0] === '"' && jsonStr[jsonStr.length - 1] === '"';
    var isInteger = /^\d+$/.test(jsonStr.trim());
    return (expectsTypesSerializedAsStrings && !hasQuotes) || ((!hasQuotes && !isInteger) && expectedType === Date);
}
function parseToJSObject(json, expectedType) {
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
function isSubtypeOf(A, B) {
    return A === B || A.prototype instanceof B;
}
function logError(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (typeof console === "object" && typeof console.error === "function") {
        console.error.apply(console, [message].concat(optionalParams));
    }
    else if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, ["ERROR: " + message].concat(optionalParams));
    }
}
function logMessage(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, [message].concat(optionalParams));
    }
}
function logWarning(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
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
var isReflectMetadataSupported = (typeof Reflect === "object" && typeof Reflect.getMetadata === "function");
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

var metadata_JsonObjectMetadata = /** @class */ (function () {
    //#endregion
    function JsonObjectMetadata(classType) {
        this.dataMembers = new Map();
        this.knownTypes = new Set();
        /**
         * Indicates whether this class was explicitly annotated with @jsonObject
         * or implicitly by @jsonMember
         */
        this.isExplicitlyMarked = false;
        /**
         * Indicates whether this type is handled without annotation. This is usually
         * used for the builtin types (except for Maps, Sets, and normal Arrays).
         */
        this.isHandledWithoutAnnotation = false;
        this.classType = classType;
    }
    //#region Static
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param ctor The constructor of a class (with or without jsonObject).
     */
    JsonObjectMetadata.getJsonObjectName = function (ctor) {
        var metadata = JsonObjectMetadata.getFromConstructor(ctor);
        return metadata ? nameof(metadata.classType) : nameof(ctor);
    };
    /**
     * Gets jsonObject metadata information from a class.
     * @param ctor The constructor class.
     */
    JsonObjectMetadata.getFromConstructor = function (ctor) {
        var prototype = ctor.prototype;
        if (!prototype) {
            return;
        }
        var metadata;
        if (prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            // The class prototype contains own jsonObject metadata
            metadata = prototype[METADATA_FIELD_KEY];
        }
        // Ignore implicitly added jsonObject (through jsonMember)
        if (metadata && metadata.isExplicitlyMarked) {
            return metadata;
        }
        // In the end maybe it is something which we can handle directly
        if (JsonObjectMetadata.doesHandleWithoutAnnotation(ctor)) {
            var primitiveMeta = new JsonObjectMetadata(ctor);
            primitiveMeta.isExplicitlyMarked = true;
            // we do not store the metadata here to not modify builtin prototype
            return primitiveMeta;
        }
    };
    /**
     * Gets the known type name of a jsonObject class for type hint.
     * @param constructor The constructor class.
     */
    JsonObjectMetadata.getKnownTypeNameFromType = function (constructor) {
        var metadata = JsonObjectMetadata.getFromConstructor(constructor);
        return metadata ? nameof(metadata.classType) : nameof(constructor);
    };
    JsonObjectMetadata.doesHandleWithoutAnnotation = function (ctor) {
        return isDirectlySerializableNativeType(ctor) || isTypeTypedArray(ctor)
            || ctor === DataView || ctor === ArrayBuffer;
    };
    return JsonObjectMetadata;
}());

function injectMetadataInformation(constructor, propKey, metadata) {
    var decoratorName = "@jsonMember on " + nameof(constructor.constructor) + "." + String(propKey); // For error messages.
    var objectMetadata;
    // When a property decorator is applied to a static member, 'constructor' is a constructor function.
    // See: https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
    // ... and static members are not supported here, so abort.
    if (typeof constructor === "function") {
        logError(decoratorName + ": cannot use a static property.");
        return;
    }
    // Methods cannot be serialized.
    // @ts-ignore symbol indexing is not supported by ts
    if (typeof constructor[propKey] === "function") {
        logError(decoratorName + ": cannot use a method property.");
        return;
    }
    if (!metadata || (!metadata.ctor && !metadata.deserializer)) {
        logError(decoratorName + ": JsonMemberMetadata has unknown ctor.");
        return;
    }
    // Add jsonObject metadata to 'constructor' if not yet exists ('constructor' is the prototype).
    // NOTE: this will not fire up custom serialization, as 'constructor' must be explicitly marked with '@jsonObject' as well.
    if (!constructor.hasOwnProperty(METADATA_FIELD_KEY)) {
        // No *own* metadata, create new.
        objectMetadata = new metadata_JsonObjectMetadata(constructor.constructor);
        // Inherit @JsonMembers from parent @jsonObject (if any).
        var parentMetadata = constructor[METADATA_FIELD_KEY];
        if (parentMetadata) // && !constructor.hasOwnProperty(Helpers.METADATA_FIELD_KEY)
         {
            parentMetadata.dataMembers.forEach(function (_metadata, _propKey) { return objectMetadata.dataMembers.set(_propKey, _metadata); });
        }
        // ('constructor' is the prototype of the involved class, metadata information is added to this class prototype).
        Object.defineProperty(constructor, METADATA_FIELD_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata
        });
    }
    else {
        // JsonObjectMetadata already exists on 'constructor'.
        objectMetadata = constructor[METADATA_FIELD_KEY];
    }
    if (!metadata.deserializer) {
        // @ts-ignore above is a check (!deser && !ctor)
        objectMetadata.knownTypes.add(metadata.ctor);
    }
    if (metadata.keyType)
        objectMetadata.knownTypes.add(metadata.keyType);
    if (metadata.elementType)
        metadata.elementType.forEach(function (elemCtor) { return objectMetadata.knownTypes.add(elemCtor); });
    objectMetadata.dataMembers.set(metadata.name, metadata);
}

// CONCATENATED MODULE: ./src/typedjson/deserializer.ts


/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
var deserializer_Deserializer = /** @class */ (function () {
    function Deserializer() {
        this._typeResolver = function (sourceObject, knownTypes) {
            if (sourceObject.__type)
                return knownTypes.get(sourceObject.__type);
        };
        this._errorHandler = function (error) { return logError(error); };
    }
    Deserializer.prototype.setNameResolver = function (nameResolverCallback) {
        this._nameResolver = nameResolverCallback;
    };
    Deserializer.prototype.setTypeResolver = function (typeResolverCallback) {
        if (typeof typeResolverCallback !== "function")
            throw new TypeError("'typeResolverCallback' is not a function.");
        this._typeResolver = typeResolverCallback;
    };
    Deserializer.prototype.setErrorHandler = function (errorHandlerCallback) {
        if (typeof errorHandlerCallback !== "function") {
            throw new TypeError("'errorHandlerCallback' is not a function.");
        }
        this._errorHandler = errorHandlerCallback;
    };
    Deserializer.prototype.convertAsObject = function (sourceObject, sourceObjectTypeInfo, objectName) {
        var _this = this;
        if (objectName === void 0) { objectName = "object"; }
        if (typeof sourceObject !== "object" || sourceObject === null) {
            this._errorHandler(new TypeError("Cannot deserialize " + objectName + ": 'sourceObject' must be a defined object."));
            return undefined;
        }
        var expectedSelfType = sourceObjectTypeInfo.selfConstructor;
        var sourceObjectMetadata = metadata_JsonObjectMetadata.getFromConstructor(expectedSelfType);
        var knownTypeConstructors = sourceObjectTypeInfo.knownTypes;
        if (sourceObjectMetadata) {
            // Merge known types received from "above" with known types defined on the current type.
            knownTypeConstructors = this._mergeKnownTypes(knownTypeConstructors, this._createKnownTypesMap(sourceObjectMetadata.knownTypes));
        }
        // Check if a type-hint is available from the source object.
        var typeFromTypeHint = this._typeResolver(sourceObject, knownTypeConstructors);
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
            var sourceMetadata_1 = sourceObjectMetadata;
            // Strong-typed deserialization available, get to it.
            // First deserialize properties into a temporary object.
            var sourceObjectWithDeserializedProperties_1 = {};
            // Deserialize by expected properties.
            sourceMetadata_1.dataMembers.forEach(function (memberMetadata, propKey) {
                var memberValue = sourceObject[propKey];
                var memberNameForDebug = nameof(sourceMetadata_1.classType) + "." + propKey;
                var revivedValue;
                if (memberMetadata.deserializer) {
                    revivedValue = memberMetadata.deserializer(memberValue);
                }
                else if (memberMetadata.ctor) {
                    revivedValue = _this.convertSingleValue(memberValue, {
                        selfConstructor: memberMetadata.ctor,
                        elementConstructor: memberMetadata.elementType,
                        keyConstructor: memberMetadata.keyType,
                        knownTypes: knownTypeConstructors
                    }, memberNameForDebug);
                }
                else {
                    throw new TypeError("Cannot deserialize " + memberNameForDebug + " thers is"
                        + " no constructor nor deserlization function to use.");
                }
                if (isValueDefined(revivedValue)) {
                    sourceObjectWithDeserializedProperties_1[memberMetadata.key] = revivedValue;
                }
                else if (memberMetadata.isRequired) {
                    _this._errorHandler(new TypeError("Missing required member '" + memberNameForDebug + "'."));
                }
            });
            // Next, instantiate target object.
            var targetObject = void 0;
            if (typeof sourceObjectMetadata.initializerCallback === "function") {
                try {
                    targetObject = sourceObjectMetadata.initializerCallback(sourceObjectWithDeserializedProperties_1, sourceObject);
                    // Check the validity of user-defined initializer callback.
                    if (!targetObject) {
                        throw new TypeError("Cannot deserialize " + objectName + ":"
                            + " 'initializer' function returned undefined/null"
                            + (", but '" + nameof(sourceObjectMetadata.classType) + "' was expected."));
                    }
                    else if (!(targetObject instanceof sourceObjectMetadata.classType)) {
                        throw new TypeError("Cannot deserialize " + objectName + ":"
                            + ("'initializer' returned '" + nameof(targetObject.constructor) + "'")
                            + (", but '" + nameof(sourceObjectMetadata.classType) + "' was expected,")
                            + ("and '" + nameof(targetObject.constructor) + "' is not a subtype of")
                            + (" '" + nameof(sourceObjectMetadata.classType) + "'"));
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
            Object.assign(targetObject, sourceObjectWithDeserializedProperties_1);
            // Call onDeserialized method (if any).
            if (sourceObjectMetadata.onDeserializedMethodName) {
                if (typeof targetObject.constructor[sourceObjectMetadata.onDeserializedMethodName] === "function") {
                    targetObject.constructor[sourceObjectMetadata.onDeserializedMethodName]();
                }
                else {
                    this._errorHandler(new TypeError("onDeserialized callback '" + nameof(sourceObjectMetadata.classType) + "." + sourceObjectMetadata.onDeserializedMethodName + "' is not a method."));
                }
            }
            return targetObject;
        }
        else {
            // Untyped deserialization into Object instance.
            var targetObject_1 = {};
            Object.keys(sourceObject).forEach(function (sourceKey) {
                targetObject_1[sourceKey] = _this.convertSingleValue(sourceObject[sourceKey], {
                    selfConstructor: sourceObject[sourceKey].constructor,
                    knownTypes: sourceObjectTypeInfo.knownTypes,
                    elementConstructor: sourceObjectTypeInfo.elementConstructor,
                    keyConstructor: sourceObjectTypeInfo.keyConstructor
                }, sourceKey);
            });
            return targetObject_1;
        }
    };
    Deserializer.prototype.convertSingleValue = function (sourceObject, typeInfo, memberName) {
        if (memberName === void 0) { memberName = "object"; }
        var expectedSelfType = typeInfo.selfConstructor;
        var srcTypeNameForDebug = sourceObject ? nameof(sourceObject.constructor) : "undefined";
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
            if (sourceObject instanceof Array && sourceObject.every(function (elem) { return !isNaN(elem); }))
                return new Float32Array(sourceObject);
            else
                this._throwTypeMismatchError("Float32Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Float64Array) {
            // Deserialize Float64Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(function (elem) { return !isNaN(elem); }))
                return new Float64Array(sourceObject);
            else
                this._throwTypeMismatchError("Float64Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Uint8Array) {
            // Deserialize Uint8Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(function (elem) { return !isNaN(elem); }))
                return new Uint8Array(sourceObject.map(function (value) { return ~~value; }));
            else
                this._throwTypeMismatchError("Uint8Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Uint8ClampedArray) {
            // Deserialize Uint8Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(function (elem) { return !isNaN(elem); }))
                return new Uint8ClampedArray(sourceObject.map(function (value) { return ~~value; }));
            else
                this._throwTypeMismatchError("Uint8ClampedArray", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Uint16Array) {
            // Deserialize Uint16Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(function (elem) { return !isNaN(elem); }))
                return new Uint16Array(sourceObject.map(function (value) { return ~~value; }));
            else
                this._throwTypeMismatchError("Uint16Array", "a numeric source array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Uint32Array) {
            // Deserialize Uint32Array from number[].
            if (sourceObject instanceof Array && sourceObject.every(function (elem) { return !isNaN(elem); }))
                return new Uint32Array(sourceObject.map(function (value) { return ~~value; }));
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
    };
    Deserializer.prototype.convertAsArray = function (sourceObject, typeInfo, memberName) {
        var _this = this;
        if (memberName === void 0) { memberName = "object"; }
        if (!(sourceObject instanceof Array)) {
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
            return [];
        }
        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length) {
            this._errorHandler(new TypeError("Could not deserialize " + memberName + " as Array: missing constructor reference of Array elements."));
            return [];
        }
        var elementTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };
        return sourceObject.map(function (element) {
            // If an array element fails to deserialize, substitute with undefined. This is so that the original ordering is not interrupted by faulty
            // entries, as an Array is ordered.
            try {
                return _this.convertSingleValue(element, elementTypeInfo);
            }
            catch (e) {
                _this._errorHandler(e);
                // Keep filling the array here with undefined to keep original ordering.
                // Note: this is just aesthetics, not returning anything produces the same result.
                return undefined;
            }
        });
    };
    Deserializer.prototype.convertAsSet = function (sourceObject, typeInfo, memberName) {
        var _this = this;
        if (memberName === void 0) { memberName = "object"; }
        if (!(sourceObject instanceof Array)) {
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
            return new Set();
        }
        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length) {
            this._errorHandler(new TypeError("Could not deserialize " + memberName + " as Set: missing constructor reference of Set elements."));
            return new Set();
        }
        var elementTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };
        var resultSet = new Set();
        sourceObject.forEach(function (element, i) {
            try {
                resultSet.add(_this.convertSingleValue(element, elementTypeInfo, memberName + ("[" + i + "]")));
            }
            catch (e) {
                // Faulty entries are skipped, because a Set is not ordered, and skipping an entry does not affect others.
                _this._errorHandler(e);
            }
        });
        return resultSet;
    };
    Deserializer.prototype.convertAsMap = function (sourceObject, typeInfo, memberName) {
        var _this = this;
        if (memberName === void 0) { memberName = "object"; }
        if (!(sourceObject instanceof Array))
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
        if (!typeInfo.keyConstructor) {
            this._errorHandler(new TypeError("Could not deserialize " + memberName + " as Map: missing key constructor."));
            return new Map();
        }
        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length) {
            this._errorHandler(new TypeError("Could not deserialize " + memberName + " as Map: missing value constructor."));
            return new Map();
        }
        var keyTypeInfo = {
            selfConstructor: typeInfo.keyConstructor,
            knownTypes: typeInfo.knownTypes
        };
        var valueTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };
        var resultMap = new Map();
        sourceObject.forEach(function (element) {
            try {
                var key = _this.convertSingleValue(element.key, keyTypeInfo);
                // Undefined/null keys not supported, skip if so.
                if (isValueDefined(key)) {
                    resultMap.set(key, _this.convertSingleValue(element.value, valueTypeInfo, memberName + "[" + key + "]"));
                }
            }
            catch (e) {
                // Faulty entries are skipped, because a Map is not ordered,
                // and skipping an entry does not affect others.
                _this._errorHandler(e);
            }
        });
        return resultMap;
    };
    Deserializer.prototype._throwTypeMismatchError = function (targetType, expectedSourceType, actualSourceType, memberName) {
        if (memberName === void 0) { memberName = "object"; }
        throw new TypeError("Could not deserialize " + memberName + " as " + targetType + ":"
            + (" expected " + expectedSourceType + ", got " + actualSourceType + "."));
    };
    Deserializer.prototype._makeTypeErrorMessage = function (expectedType, actualType, memberName) {
        if (memberName === void 0) { memberName = "object"; }
        var expectedTypeName = (typeof expectedType === "function") ? nameof(expectedType) : expectedType;
        var actualTypeName = (typeof actualType === "function") ? nameof(actualType) : actualType;
        return "Could not deserialize " + memberName + ": expected '" + expectedTypeName + "', got '" + actualTypeName + "'.";
    };
    Deserializer.prototype._instantiateType = function (ctor) {
        return new ctor();
    };
    Deserializer.prototype._mergeKnownTypes = function () {
        var _this = this;
        var knownTypeMaps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            knownTypeMaps[_i] = arguments[_i];
        }
        var result = new Map();
        knownTypeMaps.forEach(function (knownTypes) {
            knownTypes.forEach(function (ctor, name) {
                if (_this._nameResolver) {
                    result.set(_this._nameResolver(ctor), ctor);
                }
                else {
                    result.set(name, ctor);
                }
            });
        });
        return result;
    };
    Deserializer.prototype._createKnownTypesMap = function (knowTypes) {
        var _this = this;
        var map = new Map();
        knowTypes.forEach(function (ctor) {
            if (_this._nameResolver) {
                map.set(_this._nameResolver(ctor), ctor);
            }
            else {
                var knownTypeMeta = metadata_JsonObjectMetadata.getFromConstructor(ctor);
                var name_1 = knownTypeMeta && knownTypeMeta.isExplicitlyMarked && knownTypeMeta.name
                    ? knownTypeMeta.name
                    : ctor.name;
                map.set(name_1, ctor);
            }
        });
        return map;
    };
    Deserializer.prototype._isDirectlyDeserializableNativeType = function (ctor) {
        return ~([Number, String, Boolean].indexOf(ctor));
    };
    Deserializer.prototype.convertNativeObject = function (sourceObject) {
        return sourceObject;
    };
    Deserializer.prototype._stringToArrayBuffer = function (str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    };
    Deserializer.prototype._stringToDataView = function (str) {
        return new DataView(this._stringToArrayBuffer(str));
    };
    return Deserializer;
}());


// CONCATENATED MODULE: ./src/typedjson/serializer.ts
var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};


function isArrayTypeInfo(typeInfo) {
    return typeInfo.selfType === Array;
}
function isSetTypeInfo(typeInfo) {
    return typeInfo.selfType === Set;
}
function isMapTypeInfo(typeInfo) {
    return typeInfo.selfType === Map;
}
/**
 * Utility class, converts a typed object tree (i.e. a tree of class instances, arrays of class instances, and so on) to an untyped javascript object (also
 * called "simple javascript object"), and emits any necessary type hints in the process (for polymorphism).
 *
 * The converted object tree is what will be given to `JSON.stringify` to convert to string as the last step, the serialization is basically like:
 *
 * (1) typed object-tree -> (2) simple JS object-tree -> (3) JSON-string
 */
var serializer_Serializer = /** @class */ (function () {
    function Serializer() {
        this._typeHintEmitter = function (targetObject, sourceObject, expectedSourceType, sourceTypeMetadata) {
            // By default, we put a "__type" property on the output object if the actual object is not the same as the expected one, so that deserialization
            // will know what to deserialize into (given the required known-types are defined, and the object is a valid subtype of the expected type).
            if (sourceObject.constructor !== expectedSourceType) {
                var name_1 = sourceTypeMetadata && sourceTypeMetadata.name
                    ? sourceTypeMetadata.name
                    : nameof(sourceObject.constructor);
                // TODO: Perhaps this can work correctly without string-literal access?
                // tslint:disable-next-line:no-string-literal
                targetObject["__type"] = name_1;
            }
        };
        this._errorHandler = function (error) { return logError(error); };
    }
    Serializer.prototype.setTypeHintEmitter = function (typeEmitterCallback) {
        if (typeof typeEmitterCallback !== "function") {
            throw new TypeError("'typeEmitterCallback' is not a function.");
        }
        this._typeHintEmitter = typeEmitterCallback;
    };
    Serializer.prototype.setErrorHandler = function (errorHandlerCallback) {
        if (typeof errorHandlerCallback !== "function") {
            throw new TypeError("'errorHandlerCallback' is not a function.");
        }
        this._errorHandler = errorHandlerCallback;
    };
    /**
     * Convert a value of any supported serializable type.
     * The value type will be detected, and the correct serialization method will be called.
     */
    Serializer.prototype.convertSingleValue = function (sourceObject, typeInfo, memberName) {
        if (memberName === void 0) { memberName = "object"; }
        if (!isValueDefined(sourceObject))
            return;
        if (!isInstanceOf(sourceObject, typeInfo.selfType)) {
            var expectedName = nameof(typeInfo.selfType);
            var actualName = nameof(sourceObject.constructor);
            this._errorHandler(new TypeError("Could not serialize '" + memberName + "': expected '" + expectedName + "', got '" + actualName + "'."));
            return;
        }
        if (isDirectlySerializableNativeType(typeInfo.selfType)) {
            return sourceObject;
        }
        else if (typeInfo.selfType === ArrayBuffer) {
            return this.convertAsArrayBuffer(sourceObject);
        }
        else if (typeInfo.selfType === DataView) {
            return this.convertAsDataView(sourceObject);
        }
        else if (isArrayTypeInfo(typeInfo)) {
            return this.convertAsArray(sourceObject, typeInfo.elementTypes, memberName);
        }
        else if (isSetTypeInfo(typeInfo)) {
            return this.convertAsSet(sourceObject, typeInfo.elementTypes[0], memberName);
        }
        else if (isMapTypeInfo(typeInfo)) {
            return this.convertAsMap(sourceObject, typeInfo.keyType, typeInfo.elementTypes[0], memberName);
        }
        else if (isTypeTypedArray(typeInfo.selfType)) {
            return this.convertAsTypedArray(sourceObject);
        }
        else if (typeof sourceObject === "object") {
            return this.convertAsObject(sourceObject, typeInfo, memberName);
        }
    };
    /**
     * Performs the conversion of a typed object (usually a class instance) to a simple javascript object for serialization.
     */
    Serializer.prototype.convertAsObject = function (sourceObject, typeInfo, memberName) {
        var _this = this;
        var sourceTypeMetadata;
        var targetObject;
        if (sourceObject.constructor !== typeInfo.selfType && sourceObject instanceof typeInfo.selfType) {
            // The source object is not of the expected type, but it is a valid subtype.
            // This is OK, and we'll proceed to gather object metadata from the subtype instead.
            sourceTypeMetadata = metadata_JsonObjectMetadata.getFromConstructor(sourceObject.constructor);
        }
        else {
            sourceTypeMetadata = metadata_JsonObjectMetadata.getFromConstructor(typeInfo.selfType);
        }
        if (sourceTypeMetadata) {
            var sourceMeta_1 = sourceTypeMetadata;
            // Strong-typed serialization available.
            // We'll serialize by members that have been marked with @jsonMember (including array/set/map members), and perform recursive conversion on
            // each of them. The converted objects are put on the 'targetObject', which is what will be put into 'JSON.stringify' finally.
            targetObject = {};
            sourceTypeMetadata.dataMembers.forEach(function (memberMetadata) {
                if (memberMetadata.serializer) {
                    targetObject[memberMetadata.name] =
                        memberMetadata.serializer(sourceObject[memberMetadata.key]);
                }
                else if (memberMetadata.ctor) {
                    targetObject[memberMetadata.name] = _this.convertSingleValue(sourceObject[memberMetadata.key], {
                        selfType: memberMetadata.ctor,
                        elementTypes: memberMetadata.elementType,
                        keyType: memberMetadata.keyType,
                    }, nameof(sourceMeta_1.classType) + "." + memberMetadata.key);
                }
                else {
                    throw new TypeError("Could not serialize " + memberMetadata.name + ", there is"
                        + " no constructor nor serialization function to use.");
                }
            });
        }
        else {
            // Untyped serialization, "as-is", we'll just pass the object on.
            // We'll clone the source object, because type hints are added to the object itself, and we don't want to modify to the original object.
            targetObject = __assign({}, sourceObject);
        }
        // Add type-hint.
        this._typeHintEmitter(targetObject, sourceObject, typeInfo.selfType, sourceTypeMetadata);
        return targetObject;
    };
    /**
     * Performs the conversion of an array of typed objects (or primitive values) to an array of simple javascript objects (or primitive values) for
     * serialization.
     * @param expectedElementType The expected type of elements. If the array is supposed to be multi-dimensional, subsequent elements define lower dimensions.
     * @param memberName Name of the object being serialized, used for debugging purposes.
     */
    Serializer.prototype.convertAsArray = function (sourceObject, expectedElementType, memberName) {
        var _this = this;
        if (memberName === void 0) { memberName = "object"; }
        if (expectedElementType.length === 0 || !expectedElementType[0])
            throw new TypeError("Could not serialize " + memberName + " as Array: missing element type definition.");
        // Check the type of each element, individually.
        // If at least one array element type is incorrect, we return undefined, which results in no value emitted during serialization.
        // This is so that invalid element types don't unexpectedly alter the ordering of other, valid elements, and that no unexpected undefined values are in
        // the emitted array.
        sourceObject.forEach(function (element, i) {
            if (!isInstanceOf(element, expectedElementType[0])) {
                var expectedTypeName = nameof(expectedElementType[0]);
                var actualTypeName = nameof(element.constructor);
                throw new TypeError("Could not serialize " + memberName + "[" + i + "]: expected '" + expectedTypeName + "', got '" + actualTypeName + "'.");
            }
        });
        var typeInfoForElements = {
            selfType: expectedElementType[0],
            elementTypes: expectedElementType.length > 1 ? expectedElementType.slice(1) : [],
        };
        if (memberName) {
            // Just for debugging purposes.
            memberName += "[]";
        }
        return sourceObject.map(function (element) { return _this.convertSingleValue(element, typeInfoForElements, memberName); });
    };
    /**
     * Performs the conversion of a set of typed objects (or primitive values) into an array of simple javascript objects.
     *
     * @param sourceObject
     * @param expectedElementType The constructor of the expected Set elements (e.g. `Number` for `Set<number>`, or `MyClass` for `Set<MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @returns
     */
    Serializer.prototype.convertAsSet = function (sourceObject, expectedElementType, memberName) {
        var _this = this;
        if (memberName === void 0) { memberName = "object"; }
        if (!expectedElementType)
            throw new TypeError("Could not serialize " + memberName + " as Set: missing element type definition.");
        var elementTypeInfo = {
            selfType: expectedElementType,
        };
        // For debugging and error tracking.
        if (memberName)
            memberName += "[]";
        var resultArray = [];
        // Convert each element of the set, and put it into an output array.
        // The output array is the one serialized, as JSON.stringify does not support Set serialization. (TODO: clarification needed)
        sourceObject.forEach(function (element) {
            var resultElement = _this.convertSingleValue(element, elementTypeInfo, memberName);
            // Add to output if the source element was undefined, OR the converted element is defined. This will add intentionally undefined values to output,
            // but not values that became undefined DURING serializing (usually because of a type-error).
            if (!isValueDefined(element) || isValueDefined(resultElement)) {
                resultArray.push(resultElement);
            }
        });
        return resultArray;
    };
    /**
     * Performs the conversion of a map of typed objects (or primitive values) into an array of simple javascript objects with `key` and `value` properties.
     *
     * @param sourceObject
     * @param expectedKeyType The constructor of the expected Map keys (e.g. `Number` for `Map<number, any>`, or `MyClass` for `Map<MyClass, any>`).
     * @param expectedElementType The constructor of the expected Map values (e.g. `Number` for `Map<any, number>`, or `MyClass` for `Map<any, MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     */
    Serializer.prototype.convertAsMap = function (sourceObject, expectedKeyType, expectedElementType, memberName) {
        var _this = this;
        if (memberName === void 0) { memberName = "object"; }
        if (!expectedElementType)
            throw new TypeError("Could not serialize " + memberName + " as Map: missing value type definition.");
        if (!expectedKeyType)
            throw new TypeError("Could not serialize " + memberName + " as Map: missing key type definition.");
        var elementTypeInfo = {
            selfType: expectedElementType,
            elementTypes: [expectedElementType]
        };
        var keyTypeInfo = {
            selfType: expectedKeyType
        };
        if (memberName)
            memberName += "[]";
        var resultArray = [];
        // Convert each *entry* in the map to a simple javascript object with key and value properties.
        sourceObject.forEach(function (value, key) {
            var resultKeyValuePairObj = {
                key: _this.convertSingleValue(key, keyTypeInfo, memberName),
                value: _this.convertSingleValue(value, elementTypeInfo, memberName)
            };
            // We are not going to emit entries with undefined keys OR undefined values.
            if (isValueDefined(resultKeyValuePairObj.key) && isValueDefined(resultKeyValuePairObj.value)) {
                resultArray.push(resultKeyValuePairObj);
            }
        });
        return resultArray;
    };
    /**
     * Performs the conversion of a typed javascript array to a simple untyped javascript array.
     * This is needed because typed arrays are otherwise serialized as objects, so we'll end up with something like "{ 0: 0, 1: 1, ... }".
     *
     * @param sourceObject
     * @returns
     */
    Serializer.prototype.convertAsTypedArray = function (sourceObject) {
        return Array.from(sourceObject);
    };
    /**
     * Performs the conversion of a raw ArrayBuffer to a string.
     */
    Serializer.prototype.convertAsArrayBuffer = function (buffer) {
        // ArrayBuffer -> 16-bit character codes -> character array -> joined string.
        return Array.from(new Uint16Array(buffer)).map(function (charCode) { return String.fromCharCode(charCode); }).join("");
    };
    /**
     * Performs the conversion of DataView, converting its internal ArrayBuffer to a string and returning that string.
     */
    Serializer.prototype.convertAsDataView = function (dataView) {
        return this.convertAsArrayBuffer(dataView.buffer);
    };
    return Serializer;
}());


// CONCATENATED MODULE: ./src/typedjson/json-object.ts


function jsonObject(optionsOrTarget) {
    var options;
    if (typeof optionsOrTarget === "function") {
        // jsonObject is being used as a decorator, directly.
        options = {};
    }
    else {
        // jsonObject is being used as a decorator factory.
        options = optionsOrTarget || {};
    }
    function decorator(target) {
        var objectMetadata;
        // Create or obtain JsonObjectMetadata object.
        if (!target.prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            // Target has no JsonObjectMetadata associated with it yet, create it now.
            objectMetadata = new metadata_JsonObjectMetadata(target);
            // Inherit json members and known types from parent @jsonObject (if any).
            var parentMetadata = target.prototype[METADATA_FIELD_KEY];
            if (parentMetadata) {
                parentMetadata.dataMembers
                    .forEach(function (memberMetadata, propKey) {
                    return objectMetadata.dataMembers.set(propKey, memberMetadata);
                });
                parentMetadata.knownTypes
                    .forEach(function (knownType) { return objectMetadata.knownTypes.add(knownType); });
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
            objectMetadata.classType = target;
        }
        // Fill JsonObjectMetadata.
        objectMetadata.isExplicitlyMarked = true;
        objectMetadata.onDeserializedMethodName = options.onDeserialized;
        // T extend Object so it is fine
        objectMetadata.initializerCallback = options.initializer;
        if (options.name) {
            objectMetadata.name = options.name;
        }
        // Obtain known-types.
        if (typeof options.knownTypes === "string") {
            objectMetadata.knownTypeMethodName = options.knownTypes;
        }
        else if (options.knownTypes instanceof Array) {
            options.knownTypes
                .filter(function (knownType) { return !!knownType; })
                .forEach(function (knownType) { return objectMetadata.knownTypes.add(knownType); });
        }
    }
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
        var target = optionsOrTarget;
        // For error messages.
        var decoratorName = "@jsonMember on " + nameof(target.constructor) + "." + String(propKey);
        // jsonMember used directly, no additional information directly available besides target and propKey.
        // Obtain property constructor through ReflectDecorators.
        if (isReflectMetadataSupported) {
            var reflectPropCtor = Reflect.getMetadata("design:type", target, propKey);
            if (!reflectPropCtor) {
                logError(decoratorName + ": could not resolve detected property constructor at runtime.");
                return;
            }
            if (isSpecialPropertyType(decoratorName, reflectPropCtor)) {
                return;
            }
            injectMetadataInformation(target, propKey, {
                ctor: reflectPropCtor,
                key: propKey.toString(),
                name: propKey.toString(),
            });
        }
        else {
            logError(decoratorName + ": ReflectDecorators is required if no 'constructor' option is specified.");
            return;
        }
    }
    else {
        // jsonMember used as a decorator factory.
        return function (target, _propKey) {
            var options = optionsOrTarget || {};
            var propCtor;
            var decoratorName = "@jsonMember on " + nameof(target.constructor) + "." + String(_propKey); // For error messages.
            if (options.hasOwnProperty("constructor")) {
                if (!isValueDefined(options.constructor)) {
                    logError(decoratorName + ": cannot resolve specified property constructor at runtime.");
                    return;
                }
                // Property constructor has been specified. Use ReflectDecorators (if available) to check whether that constructor is correct. Warn if not.
                if (isReflectMetadataSupported && !isSubtypeOf(options.constructor, Reflect.getMetadata("design:type", target, _propKey))) {
                    logWarning(decoratorName + ": detected property type does not match 'constructor' option.");
                }
                propCtor = options.constructor;
            }
            else {
                // Use ReflectDecorators to obtain property constructor.
                if (isReflectMetadataSupported) {
                    propCtor = Reflect.getMetadata("design:type", target, _propKey);
                    if (!propCtor) {
                        logError(decoratorName + ": cannot resolve detected property constructor at runtime.");
                        return;
                    }
                }
                else if (!options.deserializer) {
                    logError(decoratorName + ": ReflectDecorators is required if no 'constructor' option is specified.");
                    return;
                }
            }
            if (isSpecialPropertyType(decoratorName, propCtor)) {
                return;
            }
            injectMetadataInformation(target, _propKey, {
                ctor: propCtor,
                emitDefaultValue: options.emitDefaultValue || false,
                isRequired: options.isRequired || false,
                key: _propKey.toString(),
                name: options.name || _propKey.toString(),
                deserializer: options.deserializer,
                serializer: options.serializer,
            });
        };
    }
}
function isSpecialPropertyType(decoratorName, propCtor) {
    if (propCtor === Array) {
        logError(decoratorName + ": property is an Array. Use the jsonArrayMember decorator to"
            + " serialize this property.");
        return true;
    }
    if (propCtor === Set) {
        logError(decoratorName + ": property is a Set. Use the jsonSetMember decorator to"
            + " serialize this property.");
        return true;
    }
    if (propCtor === Map) {
        logError(decoratorName + ": property is a Map. Use the jsonMapMember decorator to"
            + " serialize this property.");
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
function jsonArrayMember(elementConstructor, options) {
    if (options === void 0) { options = {}; }
    return function (target, propKey) {
        var decoratorName = "@jsonArrayMember on " + nameof(target.constructor) + "." + String(propKey); // For error messages.
        if (typeof elementConstructor !== "function") {
            logError(decoratorName + ": could not resolve constructor of array elements at runtime.");
            return;
        }
        var dimensions = options.dimensions === undefined ? 1 : options.dimensions;
        if (!isNaN(dimensions) && dimensions < 1) {
            logError(decoratorName + ": 'dimensions' option must be at least 1.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonArrayMember' has been used on an array.
        if (isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Array) {
            logError(decoratorName + ": property is not an Array.");
            return;
        }
        injectMetadataInformation(target, propKey, {
            ctor: Array,
            elementType: createArrayElementType(elementConstructor, dimensions),
            emitDefaultValue: options.emitDefaultValue || false,
            isRequired: options.isRequired || false,
            key: propKey.toString(),
            name: options.name || propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}
function createArrayElementType(elementCtor, dimensions) {
    var elementTypes = new Array(dimensions).fill(Array, 0, -1);
    elementTypes[dimensions - 1] = elementCtor;
    return elementTypes;
}

// CONCATENATED MODULE: ./src/typedjson/json-set-member.ts



/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Set<T>.
 * @param elementConstructor Constructor of set elements (e.g. 'Number' for Set<number> or 'Date' for Set<Date>).
 * @param options Additional options.
 */
function jsonSetMember(elementConstructor, options) {
    if (options === void 0) { options = {}; }
    return function (target, propKey) {
        var decoratorName = "@jsonSetMember on " + nameof(target.constructor) + "." + String(propKey); // For error messages.
        if (typeof elementConstructor !== "function") {
            logError(decoratorName + ": could not resolve constructor of set elements at runtime.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonSetMember' has been used on a set. Warn if not.
        if (isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Set) {
            logError(decoratorName + ": property is not a Set.");
            return;
        }
        injectMetadataInformation(target, propKey, {
            ctor: Set,
            elementType: [elementConstructor],
            emitDefaultValue: options.emitDefaultValue || false,
            isRequired: options.isRequired || false,
            key: propKey.toString(),
            name: options.name || propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
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
function jsonMapMember(keyConstructor, valueConstructor, options) {
    if (options === void 0) { options = {}; }
    return function (target, propKey) {
        var decoratorName = "@jsonMapMember on " + nameof(target.constructor) + "." + String(propKey); // For error messages.
        if (typeof keyConstructor !== "function") {
            logError(decoratorName + ": could not resolve constructor of map keys at runtime.");
            return;
        }
        if (typeof valueConstructor !== "function") {
            logError(decoratorName + ": could not resolve constructor of map values at runtime.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonMapMember' has been used on a map. Warn if not.
        if (isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Map) {
            logError(decoratorName + ": property is not a Map.");
            return;
        }
        injectMetadataInformation(target, propKey, {
            ctor: Map,
            elementType: [valueConstructor],
            keyType: keyConstructor,
            emitDefaultValue: options.emitDefaultValue || false,
            isRequired: options.isRequired || false,
            key: propKey.toString(),
            name: options.name || propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}

// CONCATENATED MODULE: ./src/typedjson.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TypedJSON", function() { return typedjson_TypedJSON; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonObject", function() { return jsonObject; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonMember", function() { return jsonMember; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonArrayMember", function() { return jsonArrayMember; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonSetMember", function() { return jsonSetMember; });
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "jsonMapMember", function() { return jsonMapMember; });
var typedjson_assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};




var typedjson_TypedJSON = /** @class */ (function () {
    /**
     * Creates a new TypedJSON instance to serialize (stringify) and deserialize (parse) object
     *     instances of the specified root class type.
     * @param rootType The constructor of the root class type.
     * @param settings Additional configuration settings.
     */
    function TypedJSON(rootConstructor, settings) {
        //#endregion
        this.serializer = new serializer_Serializer();
        this.deserializer = new deserializer_Deserializer();
        this.globalKnownTypes = [];
        this.indent = 0;
        var rootMetadata = metadata_JsonObjectMetadata.getFromConstructor(rootConstructor);
        if (!rootMetadata || (!rootMetadata.isExplicitlyMarked && !rootMetadata.isHandledWithoutAnnotation)) {
            throw new TypeError("The TypedJSON root data type must have the @jsonObject decorator used.");
        }
        this.nameResolver = function (ctor) { return nameof(ctor); };
        this.rootConstructor = rootConstructor;
        this.errorHandler = function (error) { return logError(error); };
        if (settings) {
            this.config(settings);
        }
        else if (TypedJSON._globalConfig) {
            this.config({});
        }
    }
    //#region Static
    TypedJSON.parse = function (object, rootType, settings) {
        return new TypedJSON(rootType, settings).parse(object);
    };
    TypedJSON.parseAsArray = function (object, elementType, settings, dimensions) {
        return new TypedJSON(elementType, settings).parseAsArray(object, dimensions);
    };
    TypedJSON.parseAsSet = function (object, elementType, settings) {
        return new TypedJSON(elementType, settings).parseAsSet(object);
    };
    TypedJSON.parseAsMap = function (object, keyType, valueType, settings) {
        return new TypedJSON(valueType, settings).parseAsMap(object, keyType);
    };
    TypedJSON.toPlainJson = function (object, rootType, settings) {
        return new TypedJSON(rootType, settings).toPlainJson(object);
    };
    TypedJSON.toPlainArray = function (object, elementType, dimensions, settings) {
        return new TypedJSON(elementType, settings).toPlainArray(object, dimensions);
    };
    TypedJSON.toPlainSet = function (object, elementType, settings) {
        return new TypedJSON(elementType, settings).stringifyAsSet(object);
    };
    TypedJSON.toPlainMap = function (object, keyCtor, valueCtor, settings) {
        return new TypedJSON(valueCtor, settings).stringifyAsMap(object, keyCtor);
    };
    TypedJSON.stringify = function (object, rootType, settings) {
        return new TypedJSON(rootType, settings).stringify(object);
    };
    TypedJSON.stringifyAsArray = function (object, elementType, dimensions, settings) {
        return new TypedJSON(elementType, settings).stringifyAsArray(object, dimensions);
    };
    TypedJSON.stringifyAsSet = function (object, elementType, settings) {
        return new TypedJSON(elementType, settings).stringifyAsSet(object);
    };
    TypedJSON.stringifyAsMap = function (object, keyCtor, valueCtor, settings) {
        return new TypedJSON(valueCtor, settings).stringifyAsMap(object, keyCtor);
    };
    TypedJSON.setGlobalConfig = function (config) {
        if (this._globalConfig) {
            Object.assign(this._globalConfig, config);
        }
        else {
            this._globalConfig = config;
        }
    };
    /**
     * Configures TypedJSON through a settings object.
     * @param settings The configuration settings object.
     */
    TypedJSON.prototype.config = function (settings) {
        if (TypedJSON._globalConfig) {
            settings = typedjson_assign({}, TypedJSON._globalConfig, settings);
            if (settings.knownTypes && TypedJSON._globalConfig.knownTypes) {
                // Merge known-types (also de-duplicate them, so Array -> Set -> Array).
                settings.knownTypes = Array.from(new Set(settings.knownTypes.concat(TypedJSON._globalConfig.knownTypes)));
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
            settings.knownTypes.forEach(function (knownType, i) {
                // tslint:disable-next-line:no-null-keyword
                if (typeof knownType === "undefined" || knownType === null) {
                    logWarning("TypedJSON.config: 'knownTypes' contains an undefined/null value (element " + i + ").");
                }
            });
            this.globalKnownTypes = settings.knownTypes;
        }
    };
    /**
     * Converts a JSON string to the root class type.
     * @param object The JSON to parse and convert.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     * @returns Deserialized T or undefined if there were errors.
     */
    TypedJSON.prototype.parse = function (object) {
        var _this = this;
        var json = parseToJSObject(object, this.rootConstructor);
        var rootMetadata = metadata_JsonObjectMetadata.getFromConstructor(this.rootConstructor);
        var result;
        var knownTypes = new Map();
        this.globalKnownTypes.filter(function (ktc) { return ktc; }).forEach(function (knownTypeCtor) {
            knownTypes.set(_this.nameResolver(knownTypeCtor), knownTypeCtor);
        });
        if (rootMetadata) {
            rootMetadata.knownTypes.forEach(function (knownTypeCtor) {
                knownTypes.set(_this.nameResolver(knownTypeCtor), knownTypeCtor);
            });
        }
        try {
            result = this.deserializer.convertSingleValue(json, {
                selfConstructor: this.rootConstructor,
                knownTypes: knownTypes,
            });
        }
        catch (e) {
            this.errorHandler(e);
        }
        return result;
    };
    TypedJSON.prototype.parseAsArray = function (object, dimensions) {
        if (dimensions === void 0) { dimensions = 1; }
        var json = parseToJSObject(object, Array);
        if (json instanceof Array) {
            return this.deserializer.convertAsArray(json, {
                selfConstructor: Array,
                elementConstructor: new Array(dimensions - 1)
                    .fill(Array)
                    .concat(this.rootConstructor),
                knownTypes: this._mapKnownTypes(this.globalKnownTypes),
            });
        }
        else {
            this.errorHandler(new TypeError("Expected 'json' to define an Array"
                + (", but got " + typeof json + ".")));
        }
        return [];
    };
    TypedJSON.prototype.parseAsSet = function (object) {
        var json = parseToJSObject(object, Set);
        // A Set<T> is serialized as T[].
        if (json instanceof Array) {
            return this.deserializer.convertAsSet(json, {
                selfConstructor: Array,
                elementConstructor: [this.rootConstructor],
                knownTypes: this._mapKnownTypes(this.globalKnownTypes)
            });
        }
        else {
            this.errorHandler(new TypeError("Expected 'json' to define a Set (using an Array)"
                + (", but got " + typeof json + ".")));
        }
        return new Set();
    };
    TypedJSON.prototype.parseAsMap = function (object, keyConstructor) {
        var json = parseToJSObject(object, Map);
        // A Set<T> is serialized as T[].
        if (json instanceof Array) {
            return this.deserializer.convertAsMap(json, {
                selfConstructor: Array,
                elementConstructor: [this.rootConstructor],
                knownTypes: this._mapKnownTypes(this.globalKnownTypes),
                keyConstructor: keyConstructor
            });
        }
        else {
            this.errorHandler(new TypeError("Expected 'json' to define a Set (using an Array)"
                + (", but got " + typeof json + ".")));
        }
        return new Map();
    };
    /**
     * Converts an instance of the specified class type to a plain JSON object.
     * @param object The instance to convert to a JSON string.
     * @returns Serialized object or undefined if an error has occured.
     */
    TypedJSON.prototype.toPlainJson = function (object) {
        try {
            return this.serializer.convertSingleValue(object, {
                selfType: this.rootConstructor
            });
        }
        catch (e) {
            this.errorHandler(e);
        }
    };
    TypedJSON.prototype.toPlainArray = function (object, dimensions) {
        if (dimensions === void 0) { dimensions = 1; }
        try {
            var elementConstructorArray = new Array(dimensions - 1).fill(Array).concat(this.rootConstructor);
            return this.serializer.convertAsArray(object, elementConstructorArray);
        }
        catch (e) {
            this.errorHandler(e);
        }
    };
    TypedJSON.prototype.toPlainSet = function (object) {
        try {
            return this.serializer.convertAsSet(object, this.rootConstructor);
        }
        catch (e) {
            this.errorHandler(e);
        }
    };
    TypedJSON.prototype.toPlainMap = function (object, keyConstructor) {
        try {
            return this.serializer.convertAsMap(object, keyConstructor, this.rootConstructor);
        }
        catch (e) {
            this.errorHandler(e);
        }
    };
    /**
     * Converts an instance of the specified class type to a JSON string.
     * @param object The instance to convert to a JSON string.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     * @returns String with the serialized object or an empty string if an error has occured, but
     *     the errorHandler did not throw.
     */
    TypedJSON.prototype.stringify = function (object) {
        var result = this.toPlainJson(object);
        if (result === undefined) {
            return '';
        }
        return JSON.stringify(result, this.replacer, this.indent);
    };
    TypedJSON.prototype.stringifyAsArray = function (object, dimensions) {
        return JSON.stringify(this.toPlainArray(object, dimensions), this.replacer, this.indent);
    };
    TypedJSON.prototype.stringifyAsSet = function (object) {
        return JSON.stringify(this.toPlainSet(object), this.replacer, this.indent);
    };
    TypedJSON.prototype.stringifyAsMap = function (object, keyConstructor) {
        return JSON.stringify(this.toPlainMap(object, keyConstructor), this.replacer, this.indent);
    };
    TypedJSON.prototype._mapKnownTypes = function (constructors) {
        var _this = this;
        var map = new Map();
        constructors.filter(function (ctor) { return ctor; }).forEach(function (ctor) { return map.set(_this.nameResolver(ctor), ctor); });
        return map;
    };
    return TypedJSON;
}());








/***/ })
/******/ ]);
});
//# sourceMappingURL=typedjson.js.map 