// [typedjson]  Version: 1.6.0-rc2 - 2020-08-27  
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var MISSING_REFLECT_CONF_MSG = 'Are you sure, that you have both "experimentalDecorators"'
    + ' and "emitDecoratorMetadata" in your tsconfig.json?';
/**
 * Determines whether the specified type is a type that can be passed on "as-is" into
 * `JSON.stringify`.
 * Values of these types don't need special conversion.
 * @param type The constructor of the type (wrapper constructor for primitive types, e.g. `Number`
 * for `number`).
 */
function isDirectlySerializableNativeType(type) {
    return Boolean(~[Date, Number, String, Boolean].indexOf(type));
}
function isDirectlyDeserializableNativeType(type) {
    return Boolean(~[Number, String, Boolean].indexOf(type));
}
function isTypeTypedArray(type) {
    return Boolean(~[
        Float32Array,
        Float64Array,
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
    ].indexOf(type));
}
function isObject(value) {
    return typeof value === 'object';
}
function shouldOmitParseString(jsonStr, expectedType) {
    var expectsTypesSerializedAsStrings = expectedType === String
        || expectedType === ArrayBuffer
        || expectedType === DataView;
    var hasQuotes = jsonStr.length >= 2
        && jsonStr[0] === '"'
        && jsonStr[jsonStr.length - 1] === '"';
    var isInteger = /^\d+$/.test(jsonStr.trim());
    return (expectsTypesSerializedAsStrings && !hasQuotes)
        || ((!hasQuotes && !isInteger) && expectedType === Date);
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
    if (typeof console === 'object' && typeof console.error === 'function') {
        console.error.apply(console, __spreadArrays([message], optionalParams));
    }
    else if (typeof console === 'object' && typeof console.log === 'function') {
        console.log.apply(console, __spreadArrays(["ERROR: " + message], optionalParams));
    }
}
function logMessage(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (typeof console === 'object' && typeof console.log === 'function') {
        console.log.apply(console, __spreadArrays([message], optionalParams));
    }
}
function logWarning(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (typeof console === 'object' && typeof console.warn === 'function') {
        console.warn.apply(console, __spreadArrays([message], optionalParams));
    }
    else if (typeof console === 'object' && typeof console.log === 'function') {
        console.log.apply(console, __spreadArrays(["WARNING: " + message], optionalParams));
    }
}
/**
 * Checks if the value is considered defined (not undefined and not null).
 * @param value
 */
function isValueDefined(value) {
    return !(typeof value === 'undefined' || value === null);
}
function isInstanceOf(value, constructor) {
    if (typeof value === 'number') {
        return constructor === Number;
    }
    else if (typeof value === 'string') {
        return constructor === String;
    }
    else if (typeof value === 'boolean') {
        return constructor === Boolean;
    }
    else if (isObject(value)) {
        return value instanceof constructor;
    }
    return false;
}
var isReflectMetadataSupported = typeof Reflect === 'object' && typeof Reflect.getMetadata === 'function';
/**
 * Gets the name of a function.
 * @param fn The function whose name to get.
 */
function nameof(fn) {
    if (typeof fn.name === 'string') {
        return fn.name;
    }
    return 'undefined';
}
function identity(arg) {
    return arg;
}

// CONCATENATED MODULE: ./src/typedjson/metadata.ts

var METADATA_FIELD_KEY = '__typedJsonJsonObjectMetadataInformation__';
var metadata_JsonObjectMetadata = /** @class */ (function () {
    function JsonObjectMetadata(classType) {
        this.dataMembers = new Map();
        /** Set of known types used for polymorphic deserialization */
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
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param ctor The constructor of a class (with or without jsonObject).
     */
    JsonObjectMetadata.getJsonObjectName = function (ctor) {
        var metadata = JsonObjectMetadata.getFromConstructor(ctor);
        return metadata === undefined ? nameof(ctor) : nameof(metadata.classType);
    };
    /**
     * Gets jsonObject metadata information from a class.
     * @param ctor The constructor class.
     */
    JsonObjectMetadata.getFromConstructor = function (ctor) {
        var prototype = ctor.prototype;
        if (prototype == null) {
            return;
        }
        var metadata;
        if (prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            // The class prototype contains own jsonObject metadata
            metadata = prototype[METADATA_FIELD_KEY];
        }
        // Ignore implicitly added jsonObject (through jsonMember)
        if ((metadata === null || metadata === void 0 ? void 0 : metadata.isExplicitlyMarked) === true) {
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
    JsonObjectMetadata.ensurePresentInPrototype = function (prototype) {
        if (prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            return prototype[METADATA_FIELD_KEY];
        }
        // Target has no JsonObjectMetadata associated with it yet, create it now.
        var objectMetadata = new JsonObjectMetadata(prototype.constructor);
        // Inherit json members and known types from parent @jsonObject (if any).
        var parentMetadata = prototype[METADATA_FIELD_KEY];
        if (parentMetadata !== undefined) {
            parentMetadata.dataMembers.forEach(function (memberMetadata, propKey) {
                objectMetadata.dataMembers.set(propKey, memberMetadata);
            });
            parentMetadata.knownTypes.forEach(function (knownType) {
                objectMetadata.knownTypes.add(knownType);
            });
            objectMetadata.typeResolver = parentMetadata.typeResolver;
            objectMetadata.typeHintEmitter = parentMetadata.typeHintEmitter;
        }
        Object.defineProperty(prototype, METADATA_FIELD_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata,
        });
        return objectMetadata;
    };
    /**
     * Gets the known type name of a jsonObject class for type hint.
     * @param constructor The constructor class.
     */
    JsonObjectMetadata.getKnownTypeNameFromType = function (constructor) {
        var metadata = JsonObjectMetadata.getFromConstructor(constructor);
        return metadata === undefined ? nameof(constructor) : nameof(metadata.classType);
    };
    JsonObjectMetadata.doesHandleWithoutAnnotation = function (ctor) {
        return isDirectlySerializableNativeType(ctor) || isTypeTypedArray(ctor)
            || ctor === DataView || ctor === ArrayBuffer;
    };
    return JsonObjectMetadata;
}());

function injectMetadataInformation(prototype, propKey, metadata) {
    // For error messages
    var decoratorName = "@jsonMember on " + nameof(prototype.constructor) + "." + String(propKey);
    // When a property decorator is applied to a static member, 'constructor' is a constructor
    // function.
    // See:
    // eslint-disable-next-line max-len
    // https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
    // ... and static members are not supported here, so abort.
    if (typeof prototype === 'function') {
        logError(decoratorName + ": cannot use a static property.");
        return;
    }
    // Methods cannot be serialized.
    // symbol indexing is not supported by ts
    if (typeof prototype[propKey] === 'function') {
        logError(decoratorName + ": cannot use a method property.");
        return;
    }
    // @todo check if metadata is ever undefined, if so, change parameter type
    if (metadata === undefined
        || (metadata.type === undefined && metadata.deserializer === undefined)) {
        logError(decoratorName + ": JsonMemberMetadata has unknown type.");
        return;
    }
    // Add jsonObject metadata to 'constructor' if not yet exists ('constructor' is the prototype).
    // NOTE: this will not fire up custom serialization, as 'constructor' must be explicitly marked
    // with '@jsonObject' as well.
    var objectMetadata = metadata_JsonObjectMetadata.ensurePresentInPrototype(prototype);
    if (metadata.deserializer === undefined) {
        // If deserializer is not present then type must be
        metadata.type.getTypes().forEach(function (ctor) { return objectMetadata.knownTypes.add(ctor); });
    }
    // clear metadata of undefined properties to save memory
    Object.keys(metadata)
        .forEach(function (key) { return (metadata[key] === undefined) && delete metadata[key]; });
    objectMetadata.dataMembers.set(metadata.name, metadata);
}

// CONCATENATED MODULE: ./src/typedjson/options-base.ts
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var kAllOptions = [
    'preserveNull',
];
function extractOptionBase(from) {
    var options = Object.keys(from)
        .filter(function (key) { return kAllOptions.indexOf(key) > -1; })
        .reduce(function (obj, key) {
        obj[key] = from[key];
        return obj;
    }, {});
    return Object.keys(options).length > 0 ? options : undefined;
}
function getDefaultOptionOf(key) {
    switch (key) {
        case 'preserveNull':
            return false;
    }
    // never reached
    return null;
}
function getOptionValue(key, options) {
    if ((options === null || options === void 0 ? void 0 : options[key]) !== undefined) {
        return options[key];
    }
    return getDefaultOptionOf(key);
}
function mergeOptions(existing, moreSpecific) {
    return moreSpecific === undefined
        ? existing
        : __assign(__assign({}, existing), moreSpecific);
}

// CONCATENATED MODULE: ./src/typedjson/type-descriptor.ts
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TypeDescriptor = /** @class */ (function () {
    function TypeDescriptor(ctor) {
        this.ctor = ctor;
    }
    TypeDescriptor.prototype.getTypes = function () {
        return [this.ctor];
    };
    return TypeDescriptor;
}());

var ConcreteTypeDescriptor = /** @class */ (function (_super) {
    __extends(ConcreteTypeDescriptor, _super);
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    function ConcreteTypeDescriptor(ctor) {
        return _super.call(this, ctor) || this;
    }
    return ConcreteTypeDescriptor;
}(TypeDescriptor));

var GenericTypeDescriptor = /** @class */ (function (_super) {
    __extends(GenericTypeDescriptor, _super);
    function GenericTypeDescriptor(ctor) {
        return _super.call(this, ctor) || this;
    }
    return GenericTypeDescriptor;
}(TypeDescriptor));

var ArrayTypeDescriptor = /** @class */ (function (_super) {
    __extends(ArrayTypeDescriptor, _super);
    function ArrayTypeDescriptor(elementType) {
        var _this = _super.call(this, Array) || this;
        _this.elementType = elementType;
        return _this;
    }
    ArrayTypeDescriptor.prototype.getTypes = function () {
        return _super.prototype.getTypes.call(this).concat(this.elementType.getTypes());
    };
    return ArrayTypeDescriptor;
}(GenericTypeDescriptor));

function ArrayT(elementType) {
    return new ArrayTypeDescriptor(ensureTypeDescriptor(elementType));
}
var SetTypeDescriptor = /** @class */ (function (_super) {
    __extends(SetTypeDescriptor, _super);
    function SetTypeDescriptor(elementType) {
        var _this = _super.call(this, Set) || this;
        _this.elementType = elementType;
        return _this;
    }
    SetTypeDescriptor.prototype.getTypes = function () {
        return _super.prototype.getTypes.call(this).concat(this.elementType.getTypes());
    };
    return SetTypeDescriptor;
}(GenericTypeDescriptor));

function SetT(elementType) {
    return new SetTypeDescriptor(ensureTypeDescriptor(elementType));
}
var MapTypeDescriptor = /** @class */ (function (_super) {
    __extends(MapTypeDescriptor, _super);
    function MapTypeDescriptor(keyType, valueType, options) {
        var _this = _super.call(this, Map) || this;
        _this.keyType = keyType;
        _this.valueType = valueType;
        _this.options = options;
        return _this;
    }
    MapTypeDescriptor.prototype.getTypes = function () {
        return _super.prototype.getTypes.call(this).concat(this.keyType.getTypes(), this.valueType.getTypes());
    };
    MapTypeDescriptor.prototype.getCompleteOptions = function () {
        var _a, _b;
        return {
            shape: (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.shape) !== null && _b !== void 0 ? _b : 0 /* ARRAY */,
        };
    };
    return MapTypeDescriptor;
}(GenericTypeDescriptor));

function MapT(keyType, valueType, options) {
    return new MapTypeDescriptor(ensureTypeDescriptor(keyType), ensureTypeDescriptor(valueType), options);
}
// TODO support for dictionary types ie. maps that are plain objects
// export class DictionaryTypeDescriptor extends GenericTypeDescriptor {
//     constructor(public readonly elementType: TypeDescriptor) {
//         super(Object);
//     }
//
//     getTypes(): Function[] {
//         return super.getTypes().concat(this.elementType.getTypes());
//     }
// }
//
// export function DictT(elementType: Typelike): DictionaryTypeDescriptor {
//     return new DictionaryTypeDescriptor(ensureTypeDescriptor(elementType));
// }
function isTypelike(type) {
    return type != null && (typeof type === 'function' || type instanceof TypeDescriptor);
}
function ensureTypeDescriptor(type) {
    return type instanceof TypeDescriptor ? type : new ConcreteTypeDescriptor(type);
}

// CONCATENATED MODULE: ./src/typedjson/deserializer.ts




function defaultTypeResolver(sourceObject, knownTypes) {
    if (sourceObject.__type != null) {
        return knownTypes.get(sourceObject.__type);
    }
}
/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
var deserializer_Deserializer = /** @class */ (function () {
    function Deserializer() {
        this.typeResolver = defaultTypeResolver;
        this.errorHandler = logError;
        this.deserializationStrategy = new Map([
            // primitives
            [Number, deserializeDirectly],
            [String, deserializeDirectly],
            [Boolean, deserializeDirectly],
            [Date, deserializeDate],
            [ArrayBuffer, stringToArrayBuffer],
            [DataView, stringToDataView],
            [Array, convertAsArray],
            [Set, convertAsSet],
            [Map, convertAsMap],
            // typed arrays
            [Float32Array, convertAsFloatArray],
            [Float64Array, convertAsFloatArray],
            [Uint8Array, convertAsUintArray],
            [Uint8ClampedArray, convertAsUintArray],
            [Uint16Array, convertAsUintArray],
            [Uint32Array, convertAsUintArray],
        ]);
    }
    Deserializer.prototype.setNameResolver = function (nameResolverCallback) {
        this.nameResolver = nameResolverCallback;
    };
    Deserializer.prototype.setTypeResolver = function (typeResolverCallback) {
        if (typeof typeResolverCallback !== 'function') {
            throw new TypeError('\'typeResolverCallback\' is not a function.');
        }
        this.typeResolver = typeResolverCallback;
    };
    Deserializer.prototype.getTypeResolver = function () {
        return this.typeResolver;
    };
    Deserializer.prototype.setErrorHandler = function (errorHandlerCallback) {
        if (typeof errorHandlerCallback !== 'function') {
            throw new TypeError('\'errorHandlerCallback\' is not a function.');
        }
        this.errorHandler = errorHandlerCallback;
    };
    Deserializer.prototype.getErrorHandler = function () {
        return this.errorHandler;
    };
    Deserializer.prototype.convertSingleValue = function (sourceObject, typeDescriptor, knownTypes, memberName, memberOptions) {
        if (memberName === void 0) { memberName = 'object'; }
        if (this.retrievePreserveNull(memberOptions) && sourceObject === null) {
            return null;
        }
        else if (!isValueDefined(sourceObject)) {
            return;
        }
        var deserializer = this.deserializationStrategy.get(typeDescriptor.ctor);
        if (deserializer !== undefined) {
            return deserializer(sourceObject, typeDescriptor, knownTypes, memberName, this, memberOptions);
        }
        if (typeof sourceObject === 'object') {
            return convertAsObject(sourceObject, typeDescriptor, knownTypes, memberName, this);
        }
        this.errorHandler(new TypeError("Could not deserialize '" + memberName + "': don't know how to deserialize this type'."));
    };
    Deserializer.prototype.instantiateType = function (ctor) {
        return new ctor();
    };
    Deserializer.prototype.mergeKnownTypes = function () {
        var _this = this;
        var knownTypeMaps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            knownTypeMaps[_i] = arguments[_i];
        }
        var result = new Map();
        knownTypeMaps.forEach(function (knownTypes) {
            knownTypes.forEach(function (ctor, name) {
                if (_this.nameResolver === undefined) {
                    result.set(name, ctor);
                }
                else {
                    result.set(_this.nameResolver(ctor), ctor);
                }
            });
        });
        return result;
    };
    Deserializer.prototype.createKnownTypesMap = function (knowTypes) {
        var _this = this;
        var map = new Map();
        knowTypes.forEach(function (ctor) {
            if (_this.nameResolver === undefined) {
                var knownTypeMeta = metadata_JsonObjectMetadata.getFromConstructor(ctor);
                var name_1 = (knownTypeMeta === null || knownTypeMeta === void 0 ? void 0 : knownTypeMeta.isExplicitlyMarked) === true ? knownTypeMeta.name : null;
                map.set(name_1 !== null && name_1 !== void 0 ? name_1 : ctor.name, ctor);
            }
            else {
                map.set(_this.nameResolver(ctor), ctor);
            }
        });
        return map;
    };
    Deserializer.prototype.retrievePreserveNull = function (memberOptions) {
        return getOptionValue('preserveNull', mergeOptions(this.options, memberOptions));
    };
    Deserializer.prototype.isExpectedMapShape = function (source, expectedShape) {
        return (expectedShape === 0 /* ARRAY */ && Array.isArray(source))
            || (expectedShape === 1 /* OBJECT */ && typeof source === 'object');
    };
    return Deserializer;
}());

function throwTypeMismatchError(targetType, expectedSourceType, actualSourceType, memberName) {
    throw new TypeError("Could not deserialize " + memberName + " as " + targetType + ":"
        + (" expected " + expectedSourceType + ", got " + actualSourceType + "."));
}
function makeTypeErrorMessage(expectedType, actualType, memberName) {
    var expectedTypeName = typeof expectedType === 'function'
        ? nameof(expectedType)
        : expectedType;
    var actualTypeName = typeof actualType === 'function' ? nameof(actualType) : actualType;
    return "Could not deserialize " + memberName + ": expected '" + expectedTypeName + "',"
        + (" got '" + actualTypeName + "'.");
}
function srcTypeNameForDebug(sourceObject) {
    return sourceObject == null ? 'undefined' : nameof(sourceObject.constructor);
}
function deserializeDirectly(sourceObject, typeDescriptor, knownTypes, objectName) {
    if (sourceObject.constructor !== typeDescriptor.ctor) {
        throw new TypeError(makeTypeErrorMessage(nameof(typeDescriptor.ctor), sourceObject.constructor, objectName));
    }
    return sourceObject;
}
function convertAsObject(sourceObject, typeDescriptor, knownTypes, memberName, deserializer) {
    if (typeof sourceObject !== 'object' || sourceObject === null) {
        deserializer.getErrorHandler()(new TypeError("Cannot deserialize " + memberName + ": 'sourceObject' must be a defined object."));
        return undefined;
    }
    var expectedSelfType = typeDescriptor.ctor;
    var sourceObjectMetadata = metadata_JsonObjectMetadata.getFromConstructor(expectedSelfType);
    var knownTypeConstructors = knownTypes;
    var typeResolver = deserializer.getTypeResolver();
    if (sourceObjectMetadata !== undefined) {
        // Merge known types received from "above" with known types defined on the current type.
        knownTypeConstructors = deserializer.mergeKnownTypes(knownTypeConstructors, deserializer.createKnownTypesMap(sourceObjectMetadata.knownTypes));
        if (sourceObjectMetadata.typeResolver !== undefined) {
            typeResolver = sourceObjectMetadata.typeResolver;
        }
    }
    // Check if a type-hint is available from the source object.
    var typeFromTypeHint = typeResolver(sourceObject, knownTypeConstructors);
    if (typeFromTypeHint != null) {
        // Check if type hint is a valid subtype of the expected source type.
        if (isSubtypeOf(typeFromTypeHint, expectedSelfType)) {
            // Hell yes.
            expectedSelfType = typeFromTypeHint;
            sourceObjectMetadata = metadata_JsonObjectMetadata.getFromConstructor(typeFromTypeHint);
            if (sourceObjectMetadata !== undefined) {
                // Also merge new known types from subtype.
                knownTypeConstructors = deserializer.mergeKnownTypes(knownTypeConstructors, deserializer.createKnownTypesMap(sourceObjectMetadata.knownTypes));
            }
        }
    }
    if ((sourceObjectMetadata === null || sourceObjectMetadata === void 0 ? void 0 : sourceObjectMetadata.isExplicitlyMarked) === true) {
        var sourceMetadata_1 = sourceObjectMetadata;
        // Strong-typed deserialization available, get to it.
        // First deserialize properties into a temporary object.
        var sourceObjectWithDeserializedProperties_1 = {};
        var classOptions_1 = mergeOptions(deserializer.options, sourceMetadata_1.options);
        // Deserialize by expected properties.
        sourceMetadata_1.dataMembers.forEach(function (objMemberMetadata, propKey) {
            var objMemberValue = sourceObject[propKey];
            var objMemberDebugName = nameof(sourceMetadata_1.classType) + "." + propKey;
            var objMemberOptions = mergeOptions(classOptions_1, objMemberMetadata.options);
            var revivedValue;
            if (objMemberMetadata.deserializer !== undefined) {
                revivedValue = objMemberMetadata.deserializer(objMemberValue);
            }
            else if (objMemberMetadata.type === undefined) {
                throw new TypeError("Cannot deserialize " + objMemberDebugName + " there is"
                    + " no constructor nor deserialization function to use.");
            }
            else {
                revivedValue = deserializer.convertSingleValue(objMemberValue, objMemberMetadata.type, knownTypeConstructors, objMemberDebugName, objMemberOptions);
            }
            // @todo revivedValue will never be null in RHS of ||
            if (isValueDefined(revivedValue)
                || (deserializer.retrievePreserveNull(objMemberOptions)
                    && revivedValue === null)) {
                sourceObjectWithDeserializedProperties_1[objMemberMetadata.key] = revivedValue;
            }
            else if (objMemberMetadata.isRequired === true) {
                deserializer.getErrorHandler()(new TypeError("Missing required member '" + objMemberDebugName + "'."));
            }
        });
        // Next, instantiate target object.
        var targetObject = void 0;
        if (typeof sourceObjectMetadata.initializerCallback === 'function') {
            try {
                targetObject = sourceObjectMetadata.initializerCallback(sourceObjectWithDeserializedProperties_1, sourceObject);
                // Check the validity of user-defined initializer callback.
                if (targetObject === undefined) {
                    throw new TypeError("Cannot deserialize " + memberName + ":"
                        + " 'initializer' function returned undefined/null"
                        + (", but '" + nameof(sourceObjectMetadata.classType) + "' was expected."));
                }
                else if (!(targetObject instanceof sourceObjectMetadata.classType)) {
                    throw new TypeError("Cannot deserialize " + memberName + ":"
                        + ("'initializer' returned '" + nameof(targetObject.constructor) + "'")
                        + (", but '" + nameof(sourceObjectMetadata.classType) + "' was expected")
                        + (", and '" + nameof(targetObject.constructor) + "' is not a subtype of")
                        + (" '" + nameof(sourceObjectMetadata.classType) + "'"));
                }
            }
            catch (e) {
                deserializer.getErrorHandler()(e);
                return undefined;
            }
        }
        else {
            targetObject = deserializer.instantiateType(expectedSelfType);
        }
        // Finally, assign deserialized properties to target object.
        Object.assign(targetObject, sourceObjectWithDeserializedProperties_1);
        // Call onDeserialized method (if any).
        var methodName = sourceObjectMetadata.onDeserializedMethodName;
        if (methodName !== undefined) {
            if (typeof targetObject[methodName] === 'function') {
                // check for member first
                targetObject[methodName]();
            }
            else if (typeof targetObject.constructor[methodName] === 'function') {
                // check for static
                targetObject.constructor[methodName]();
            }
            else {
                deserializer.getErrorHandler()(new TypeError("onDeserialized callback"
                    + ("'" + nameof(sourceObjectMetadata.classType) + "." + methodName + "' is not a method.")));
            }
        }
        return targetObject;
    }
    else {
        // Untyped deserialization into Object instance.
        var targetObject_1 = {};
        Object.keys(sourceObject).forEach(function (sourceKey) {
            targetObject_1[sourceKey] = deserializer.convertSingleValue(sourceObject[sourceKey], new ConcreteTypeDescriptor(sourceObject[sourceKey].constructor), knownTypes, sourceKey);
        });
        return targetObject_1;
    }
}
function convertAsArray(sourceObject, typeDescriptor, knownTypes, memberName, deserializer, memberOptions) {
    if (!(typeDescriptor instanceof ArrayTypeDescriptor)) {
        throw new TypeError("Could not deserialize " + memberName + " as Array: incorrect TypeDescriptor detected,"
            + ' please use proper annotation or function for this type');
    }
    if (!Array.isArray(sourceObject)) {
        deserializer.getErrorHandler()(new TypeError(makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
        return [];
    }
    if (typeDescriptor.elementType == null) {
        deserializer.getErrorHandler()(new TypeError("Could not deserialize " + memberName + " as Array: missing constructor reference of"
            + " Array elements."));
        return [];
    }
    return sourceObject.map(function (element) {
        // If an array element fails to deserialize, substitute with undefined. This is so that the
        // original ordering is not interrupted by faulty
        // entries, as an Array is ordered.
        try {
            return deserializer.convertSingleValue(element, typeDescriptor.elementType, knownTypes, memberName + "[]", memberOptions);
        }
        catch (e) {
            deserializer.getErrorHandler()(e);
            // Keep filling the array here with undefined to keep original ordering.
            // Note: this is just aesthetics, not returning anything produces the same result.
            return undefined;
        }
    });
}
function convertAsSet(sourceObject, typeDescriptor, knownTypes, memberName, deserializer, memberOptions) {
    if (!(typeDescriptor instanceof SetTypeDescriptor)) {
        throw new TypeError("Could not deserialize " + memberName + " as Set: incorrect TypeDescriptor detected,"
            + " please use proper annotation or function for this type");
    }
    if (!Array.isArray(sourceObject)) {
        deserializer.getErrorHandler()(new TypeError(makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
        return new Set();
    }
    if (typeDescriptor.elementType == null) {
        deserializer.getErrorHandler()(new TypeError("Could not deserialize " + memberName + " as Set: missing constructor reference of"
            + " Set elements."));
        return new Set();
    }
    var resultSet = new Set();
    sourceObject.forEach(function (element, i) {
        try {
            resultSet.add(deserializer.convertSingleValue(element, typeDescriptor.elementType, knownTypes, memberName + "[" + i + "]", memberOptions));
        }
        catch (e) {
            // Faulty entries are skipped, because a Set is not ordered, and skipping an entry
            // does not affect others.
            deserializer.getErrorHandler()(e);
        }
    });
    return resultSet;
}
function isExpectedMapShape(source, expectedShape) {
    return (expectedShape === 0 /* ARRAY */ && Array.isArray(source))
        || (expectedShape === 1 /* OBJECT */ && typeof source === 'object');
}
function convertAsMap(sourceObject, typeDescriptor, knownTypes, memberName, deserializer, memberOptions) {
    if (!(typeDescriptor instanceof MapTypeDescriptor)) {
        throw new TypeError("Could not deserialize " + memberName + " as Map: incorrect TypeDescriptor detected,"
            + 'please use proper annotation or function for this type');
    }
    var expectedShape = typeDescriptor.getCompleteOptions().shape;
    if (!isExpectedMapShape(sourceObject, expectedShape)) {
        var expectedType = expectedShape === 0 /* ARRAY */ ? Array : Object;
        deserializer.getErrorHandler()(new TypeError(makeTypeErrorMessage(expectedType, sourceObject.constructor, memberName)));
        return new Map();
    }
    if (typeDescriptor.keyType == null) {
        deserializer.getErrorHandler()(new TypeError("Could not deserialize " + memberName + " as Map: missing key constructor."));
        return new Map();
    }
    if (typeDescriptor.valueType == null) {
        deserializer.getErrorHandler()(new TypeError("Could not deserialize " + memberName + " as Map: missing value constructor."));
        return new Map();
    }
    var resultMap = new Map();
    if (expectedShape === 1 /* OBJECT */) {
        Object.keys(sourceObject).forEach(function (key) {
            try {
                var resultKey = deserializer.convertSingleValue(key, typeDescriptor.keyType, knownTypes, memberName, memberOptions);
                if (isValueDefined(resultKey)) {
                    resultMap.set(resultKey, deserializer.convertSingleValue(sourceObject[key], typeDescriptor.valueType, knownTypes, memberName + "[" + resultKey + "]", memberOptions));
                }
            }
            catch (e) {
                // Faulty entries are skipped, because a Map is not ordered,
                // and skipping an entry does not affect others.
                deserializer.getErrorHandler()(e);
            }
        });
    }
    else {
        sourceObject.forEach(function (element) {
            try {
                var key = deserializer.convertSingleValue(element.key, typeDescriptor.keyType, knownTypes, memberName, memberOptions);
                // Undefined/null keys not supported, skip if so.
                if (isValueDefined(key)) {
                    resultMap.set(key, deserializer.convertSingleValue(element.value, typeDescriptor.valueType, knownTypes, memberName + "[" + key + "]", memberOptions));
                }
            }
            catch (e) {
                // Faulty entries are skipped, because a Map is not ordered,
                // and skipping an entry does not affect others.
                deserializer.getErrorHandler()(e);
            }
        });
    }
    return resultMap;
}
function deserializeDate(sourceObject, typeDescriptor, knownTypes, memberName) {
    // Support for Date with ISO 8601 format, or with numeric timestamp (milliseconds elapsed since
    // the Epoch).
    // ISO 8601 spec.: https://www.w3.org/TR/NOTE-datetime
    if (typeof sourceObject === 'string'
        || (typeof sourceObject === 'number' && sourceObject > 0)) {
        return new Date(sourceObject);
    }
    else if (sourceObject instanceof Date) {
        return sourceObject;
    }
    else {
        throwTypeMismatchError('Date', 'an ISO-8601 string', srcTypeNameForDebug(sourceObject), memberName);
    }
}
function stringToArrayBuffer(sourceObject, typeDescriptor, knownTypes, memberName) {
    if (typeof sourceObject !== 'string') {
        throwTypeMismatchError('ArrayBuffer', 'a string source', srcTypeNameForDebug(sourceObject), memberName);
    }
    return createArrayBufferFromString(sourceObject);
}
function stringToDataView(sourceObject, typeDescriptor, knownTypes, memberName) {
    if (typeof sourceObject !== 'string') {
        throwTypeMismatchError('DataView', 'a string source', srcTypeNameForDebug(sourceObject), memberName);
    }
    return new DataView(createArrayBufferFromString(sourceObject));
}
function createArrayBufferFromString(input) {
    var buf = new ArrayBuffer(input.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = input.length; i < strLen; i++) {
        bufView[i] = input.charCodeAt(i);
    }
    return buf;
}
function convertAsFloatArray(sourceObject, typeDescriptor, knownTypes, memberName) {
    var constructor = typeDescriptor.ctor;
    if (Array.isArray(sourceObject) && sourceObject.every(function (elem) { return !isNaN(elem); })) {
        return new constructor(sourceObject);
    }
    return throwTypeMismatchError(constructor.name, 'a numeric source array', srcTypeNameForDebug(sourceObject), memberName);
}
function convertAsUintArray(sourceObject, typeDescriptor, knownTypes, memberName) {
    var constructor = typeDescriptor.ctor;
    if (Array.isArray(sourceObject) && sourceObject.every(function (elem) { return !isNaN(elem); })) {
        return new constructor(sourceObject.map(function (value) { return ~~value; }));
    }
    return throwTypeMismatchError(typeDescriptor.ctor.name, 'a numeric source array', srcTypeNameForDebug(sourceObject), memberName);
}

// CONCATENATED MODULE: ./src/typedjson/json-array-member.ts




/**
 * Specifies that a property, of type array, is part of an object when serializing.
 * @param elementConstructor Constructor of array elements (e.g. 'Number' for 'number[]', or 'Date'
 * for 'Date[]').
 * @param options Additional options.
 */
function jsonArrayMember(elementConstructor, options) {
    if (options === void 0) { options = {}; }
    return function (target, propKey) {
        var _a;
        var decoratorName = "@jsonArrayMember on " + nameof(target.constructor) + "." + String(propKey);
        if (!isTypelike(elementConstructor)) {
            logError(decoratorName + ": could not resolve constructor of array elements at runtime.");
            return;
        }
        var dimensions = options.dimensions === undefined ? 1 : options.dimensions;
        if (!isNaN(dimensions) && dimensions < 1) {
            logError(decoratorName + ": 'dimensions' option must be at least 1.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonArrayMember' has been
        // used on an array.
        if (isReflectMetadataSupported
            && Reflect.getMetadata('design:type', target, propKey) !== Array) {
            logError(decoratorName + ": property is not an Array. " + MISSING_REFLECT_CONF_MSG);
            return;
        }
        injectMetadataInformation(target, propKey, {
            type: createArrayType(ensureTypeDescriptor(elementConstructor), dimensions),
            emitDefaultValue: options.emitDefaultValue,
            isRequired: options.isRequired,
            options: extractOptionBase(options),
            key: propKey.toString(),
            name: (_a = options.name) !== null && _a !== void 0 ? _a : propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}
function createArrayType(elementType, dimensions) {
    var type = new ArrayTypeDescriptor(elementType);
    for (var i = 1; i < dimensions; ++i) {
        type = new ArrayTypeDescriptor(type);
    }
    return type;
}

// CONCATENATED MODULE: ./src/typedjson/serializer.ts
var serializer_assign = (undefined && undefined.__assign) || function () {
    serializer_assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return serializer_assign.apply(this, arguments);
};




function defaultTypeEmitter(targetObject, sourceObject, expectedSourceType, sourceTypeMetadata) {
    var _a;
    // By default, we put a "__type" property on the output object if the actual object is not the
    // same as the expected one, so that deserialization will know what to deserialize into (given
    // the required known-types are defined, and the object is a valid subtype of the expected
    // type).
    if (sourceObject.constructor !== expectedSourceType) {
        targetObject.__type = (_a = sourceTypeMetadata === null || sourceTypeMetadata === void 0 ? void 0 : sourceTypeMetadata.name) !== null && _a !== void 0 ? _a : nameof(sourceObject.constructor);
    }
}
/**
 * Utility class, converts a typed object tree (i.e. a tree of class instances, arrays of class
 * instances, and so on) to an untyped javascript object (also called "simple javascript object"),
 * and emits any necessary type hints in the process (for polymorphism).
 *
 * The converted object tree is what will be given to `JSON.stringify` to convert to string as the
 * last step, the serialization is basically like:
 *
 * (1) typed object-tree -> (2) simple JS object-tree -> (3) JSON-string
 */
var serializer_Serializer = /** @class */ (function () {
    function Serializer() {
        this.typeHintEmitter = defaultTypeEmitter;
        this.errorHandler = logError;
        this.serializationStrategy = new Map([
            // primitives
            [Date, identity],
            [Number, identity],
            [String, identity],
            [Boolean, identity],
            [ArrayBuffer, convertAsArrayBuffer],
            [DataView, convertAsDataView],
            [Array, serializer_convertAsArray],
            [Set, serializer_convertAsSet],
            [Map, serializer_convertAsMap],
            // typed arrays
            [Float32Array, convertAsTypedArray],
            [Float64Array, convertAsTypedArray],
            [Int8Array, convertAsTypedArray],
            [Uint8Array, convertAsTypedArray],
            [Uint8ClampedArray, convertAsTypedArray],
            [Int16Array, convertAsTypedArray],
            [Uint16Array, convertAsTypedArray],
            [Int32Array, convertAsTypedArray],
            [Uint32Array, convertAsTypedArray],
        ]);
    }
    Serializer.prototype.setTypeHintEmitter = function (typeEmitterCallback) {
        if (typeof typeEmitterCallback !== 'function') {
            throw new TypeError('\'typeEmitterCallback\' is not a function.');
        }
        this.typeHintEmitter = typeEmitterCallback;
    };
    Serializer.prototype.getTypeHintEmitter = function () {
        return this.typeHintEmitter;
    };
    Serializer.prototype.setErrorHandler = function (errorHandlerCallback) {
        if (typeof errorHandlerCallback !== 'function') {
            throw new TypeError('\'errorHandlerCallback\' is not a function.');
        }
        this.errorHandler = errorHandlerCallback;
    };
    Serializer.prototype.getErrorHandler = function () {
        return this.errorHandler;
    };
    Serializer.prototype.retrievePreserveNull = function (memberOptions) {
        return getOptionValue('preserveNull', mergeOptions(this.options, memberOptions));
    };
    /**
     * Convert a value of any supported serializable type.
     * The value type will be detected, and the correct serialization method will be called.
     */
    Serializer.prototype.convertSingleValue = function (sourceObject, typeDescriptor, memberName, memberOptions) {
        if (memberName === void 0) { memberName = 'object'; }
        if (this.retrievePreserveNull(memberOptions) && sourceObject === null) {
            return null;
        }
        if (!isValueDefined(sourceObject)) {
            return;
        }
        if (!isInstanceOf(sourceObject, typeDescriptor.ctor)) {
            var expectedName = nameof(typeDescriptor.ctor);
            var actualName = nameof(sourceObject.constructor);
            this.errorHandler(new TypeError("Could not serialize '" + memberName + "': expected '" + expectedName + "',"
                + (" got '" + actualName + "'.")));
            return;
        }
        var serializer = this.serializationStrategy.get(typeDescriptor.ctor);
        if (serializer !== undefined) {
            return serializer(sourceObject, typeDescriptor, memberName, this, memberOptions);
        }
        // if not present in the strategy do property by property serialization
        if (typeof sourceObject === 'object') {
            return serializer_convertAsObject(sourceObject, typeDescriptor, memberName, this, memberOptions);
        }
        this.errorHandler(new TypeError("Could not serialize '" + memberName + "': don't know how to serialize this type'."));
    };
    return Serializer;
}());

/**
 * Performs the conversion of a typed object (usually a class instance) to a simple
 * javascript object for serialization.
 */
function serializer_convertAsObject(sourceObject, typeDescriptor, memberName, serializer, memberOptions) {
    var sourceTypeMetadata;
    var targetObject;
    var typeHintEmitter = serializer.getTypeHintEmitter();
    if (sourceObject.constructor !== typeDescriptor.ctor
        && sourceObject instanceof typeDescriptor.ctor) {
        // The source object is not of the expected type, but it is a valid subtype.
        // This is OK, and we'll proceed to gather object metadata from the subtype instead.
        sourceTypeMetadata = metadata_JsonObjectMetadata.getFromConstructor(sourceObject.constructor);
    }
    else {
        sourceTypeMetadata = metadata_JsonObjectMetadata.getFromConstructor(typeDescriptor.ctor);
    }
    if (sourceTypeMetadata === undefined) {
        // Untyped serialization, "as-is", we'll just pass the object on.
        // We'll clone the source object, because type hints are added to the object itself, and we
        // don't want to modify
        // to the original object.
        targetObject = serializer_assign({}, sourceObject);
    }
    else {
        var beforeSerializationMethodName = sourceTypeMetadata.beforeSerializationMethodName;
        if (beforeSerializationMethodName !== undefined) {
            if (typeof sourceObject[beforeSerializationMethodName] === 'function') {
                // check for member first
                sourceObject[beforeSerializationMethodName]();
            }
            else if (typeof sourceObject.constructor[beforeSerializationMethodName]
                === 'function') {
                // check for static
                sourceObject.constructor[beforeSerializationMethodName]();
            }
            else {
                serializer.getErrorHandler()(new TypeError("beforeSerialization callback '"
                    + (nameof(sourceTypeMetadata.classType) + "." + beforeSerializationMethodName)
                    + "' is not a method."));
            }
        }
        var sourceMeta_1 = sourceTypeMetadata;
        // Strong-typed serialization available.
        // We'll serialize by members that have been marked with @jsonMember (including
        // array/set/map members), and perform recursive conversion on each of them. The converted
        // objects are put on the 'targetObject', which is what will be put into 'JSON.stringify'
        // finally.
        targetObject = {};
        var classOptions_1 = mergeOptions(serializer.options, sourceMeta_1.options);
        if (sourceMeta_1.typeHintEmitter !== undefined) {
            typeHintEmitter = sourceMeta_1.typeHintEmitter;
        }
        sourceMeta_1.dataMembers.forEach(function (objMemberMetadata) {
            var objMemberOptions = mergeOptions(classOptions_1, objMemberMetadata.options);
            var serialized;
            if (objMemberMetadata.serializer !== undefined) {
                serialized = objMemberMetadata.serializer(sourceObject[objMemberMetadata.key]);
            }
            else if (objMemberMetadata.type === undefined) {
                throw new TypeError("Could not serialize " + objMemberMetadata.name + ", there is"
                    + " no constructor nor serialization function to use.");
            }
            else {
                serialized = serializer.convertSingleValue(sourceObject[objMemberMetadata.key], objMemberMetadata.type, nameof(sourceMeta_1.classType) + "." + objMemberMetadata.key, objMemberOptions);
            }
            if (isValueDefined(serialized)
                // @todo check whether the or condition ever applies
                // eslint-disable-next-line @typescript-eslint/tslint/config
                || (serializer.retrievePreserveNull(objMemberOptions) && serialized === null)) {
                targetObject[objMemberMetadata.name] = serialized;
            }
        });
    }
    // Add type-hint.
    typeHintEmitter(targetObject, sourceObject, typeDescriptor.ctor, sourceTypeMetadata);
    return targetObject;
}
/**
 * Performs the conversion of an array of typed objects (or primitive values) to an array of simple
 * javascript objects
 * (or primitive values) for serialization.
 */
function serializer_convertAsArray(sourceObject, typeDescriptor, memberName, serializer, memberOptions) {
    if (!(typeDescriptor instanceof ArrayTypeDescriptor)) {
        throw new TypeError("Could not serialize " + memberName + " as Array: incorrect TypeDescriptor detected, please"
            + ' use proper annotation or function for this type');
    }
    if (typeDescriptor.elementType == null) {
        throw new TypeError("Could not serialize " + memberName + " as Array: missing element type definition.");
    }
    // Check the type of each element, individually.
    // If at least one array element type is incorrect, we return undefined, which results in no
    // value emitted during serialization. This is so that invalid element types don't unexpectedly
    // alter the ordering of other, valid elements, and that no unexpected undefined values are in
    // the emitted array.
    sourceObject.forEach(function (element, i) {
        if (!(serializer.retrievePreserveNull(memberOptions) && element === null)
            && !isInstanceOf(element, typeDescriptor.elementType.ctor)) {
            var expectedTypeName = nameof(typeDescriptor.elementType.ctor);
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            var actualTypeName = element && nameof(element.constructor);
            throw new TypeError("Could not serialize " + memberName + "[" + i + "]:"
                + (" expected '" + expectedTypeName + "', got '" + actualTypeName + "'."));
        }
    });
    // @todo, is this necessary?
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (memberName) {
        // Just for debugging purposes.
        memberName += '[]';
    }
    return sourceObject.map(function (element) {
        return serializer.convertSingleValue(element, typeDescriptor.elementType, memberName, memberOptions);
    });
}
/**
 * Performs the conversion of a set of typed objects (or primitive values) into an array
 * of simple javascript objects.
 * @returns
 */
function serializer_convertAsSet(sourceObject, typeDescriptor, memberName, serializer, memberOptions) {
    if (!(typeDescriptor instanceof SetTypeDescriptor)) {
        throw new TypeError("Could not serialize " + memberName + " as Set: incorrect TypeDescriptor detected, please"
            + ' use proper annotation or function for this type');
    }
    if (typeDescriptor.elementType == null) {
        throw new TypeError("Could not serialize " + memberName + " as Set: missing element type definition.");
    }
    // For debugging and error tracking.
    // @todo, is this necessary?
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (memberName) {
        memberName += '[]';
    }
    var resultArray = [];
    // Convert each element of the set, and put it into an output array.
    // The output array is the one serialized, as JSON.stringify does not support Set serialization.
    // (TODO: clarification needed)
    sourceObject.forEach(function (element) {
        var resultElement = serializer.convertSingleValue(element, typeDescriptor.elementType, memberName, memberOptions);
        // Add to output if the source element was undefined, OR the converted element is defined.
        // This will add intentionally undefined values to output, but not values that became
        // undefined
        // DURING serializing (usually because of a type-error).
        if (!isValueDefined(element) || isValueDefined(resultElement)) {
            resultArray.push(resultElement);
        }
    });
    return resultArray;
}
/**
 * Performs the conversion of a map of typed objects (or primitive values) into an array
 * of simple javascript objects with `key` and `value` properties.
 */
function serializer_convertAsMap(sourceObject, typeDescriptor, memberName, serializer, memberOptions) {
    if (!(typeDescriptor instanceof MapTypeDescriptor)) {
        throw new TypeError("Could not serialize " + memberName + " as Map: incorrect TypeDescriptor detected, please"
            + ' use proper annotation or function for this type');
    }
    if (typeDescriptor.valueType == null) { // @todo Check type
        throw new TypeError("Could not serialize " + memberName + " as Map: missing value type definition.");
    }
    if (typeDescriptor.keyType == null) { // @todo Check type
        throw new TypeError("Could not serialize " + memberName + " as Map: missing key type definition.");
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (memberName) {
        memberName += '[]';
    }
    // const resultArray: Array<{ key: any, value: any }> = [];
    var resultShape = typeDescriptor.getCompleteOptions().shape;
    var result = resultShape === 1 /* OBJECT */ ? {} : [];
    var preserveNull = serializer.retrievePreserveNull(memberOptions);
    // Convert each *entry* in the map to a simple javascript object with key and value properties.
    sourceObject.forEach(function (value, key) {
        var resultKeyValuePairObj = {
            key: serializer.convertSingleValue(key, typeDescriptor.keyType, memberName, memberOptions),
            value: serializer.convertSingleValue(value, typeDescriptor.valueType, memberName, memberOptions),
        };
        // We are not going to emit entries with undefined keys OR undefined values.
        var keyDefined = isValueDefined(resultKeyValuePairObj.key);
        var valueDefined = isValueDefined(resultKeyValuePairObj.value)
            // @todo check
            // eslint-disable-next-line @typescript-eslint/tslint/config
            || (resultKeyValuePairObj.value === null && preserveNull);
        if (keyDefined && valueDefined) {
            if (resultShape === 1 /* OBJECT */) {
                result[resultKeyValuePairObj.key] = resultKeyValuePairObj.value;
            }
            else {
                result.push(resultKeyValuePairObj);
            }
        }
    });
    return result;
}
/**
 * Performs the conversion of a typed javascript array to a simple untyped javascript array.
 * This is needed because typed arrays are otherwise serialized as objects, so we'll end up
 * with something like "{ 0: 0, 1: 1, ... }".
 */
function convertAsTypedArray(sourceObject) {
    return Array.from(sourceObject);
}
/**
 * Performs the conversion of a raw ArrayBuffer to a string.
 */
function convertAsArrayBuffer(buffer) {
    // ArrayBuffer -> 16-bit character codes -> character array -> joined string.
    return Array.from(new Uint16Array(buffer))
        .map(function (charCode) { return String.fromCharCode(charCode); }).join('');
}
/**
 * Performs the conversion of DataView, converting its internal ArrayBuffer to a string and
 * returning that string.
 */
function convertAsDataView(dataView) {
    return convertAsArrayBuffer(dataView.buffer);
}

// CONCATENATED MODULE: ./src/parser.ts
var parser_assign = (undefined && undefined.__assign) || function () {
    parser_assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return parser_assign.apply(this, arguments);
};








var parser_TypedJSON = /** @class */ (function () {
    /**
     * Creates a new TypedJSON instance to serialize (stringify) and deserialize (parse) object
     *     instances of the specified root class type.
     * @param rootConstructor The constructor of the root class type.
     * @param settings Additional configuration settings.
     */
    function TypedJSON(rootConstructor, settings) {
        this.serializer = new serializer_Serializer();
        this.deserializer = new deserializer_Deserializer();
        this.globalKnownTypes = [];
        this.indent = 0;
        var rootMetadata = metadata_JsonObjectMetadata.getFromConstructor(rootConstructor);
        if (rootMetadata === undefined
            || (!rootMetadata.isExplicitlyMarked && !rootMetadata.isHandledWithoutAnnotation)) {
            throw new TypeError('The TypedJSON root data type must have the @jsonObject decorator used.');
        }
        this.nameResolver = function (ctor) { return nameof(ctor); };
        this.rootConstructor = rootConstructor;
        this.errorHandler = function (error) { return logError(error); };
        if (settings !== undefined) {
            this.config(settings);
        }
        else if (TypedJSON._globalConfig !== undefined) {
            this.config({});
        }
    }
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
        return new TypedJSON(elementType, settings).toPlainSet(object);
    };
    TypedJSON.toPlainMap = function (object, keyCtor, valueCtor, settings) {
        return new TypedJSON(valueCtor, settings).toPlainMap(object, keyCtor);
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
        if (this._globalConfig === undefined) {
            this._globalConfig = config;
        }
        else {
            Object.assign(this._globalConfig, config);
        }
    };
    /**
     * Configures TypedJSON through a settings object.
     * @param settings The configuration settings object.
     */
    TypedJSON.prototype.config = function (settings) {
        if (TypedJSON._globalConfig !== undefined) {
            settings = parser_assign(parser_assign({}, TypedJSON._globalConfig), settings);
            if (settings.knownTypes !== undefined
                && TypedJSON._globalConfig.knownTypes !== undefined) {
                // Merge known-types (also de-duplicate them, so Array -> Set -> Array).
                settings.knownTypes = Array.from(new Set(settings.knownTypes.concat(TypedJSON._globalConfig.knownTypes)));
            }
        }
        var options = extractOptionBase(settings);
        this.serializer.options = options;
        this.deserializer.options = options;
        if (settings.errorHandler !== undefined) {
            this.errorHandler = settings.errorHandler;
            this.deserializer.setErrorHandler(settings.errorHandler);
            this.serializer.setErrorHandler(settings.errorHandler);
        }
        if (settings.replacer !== undefined) {
            this.replacer = settings.replacer;
        }
        if (settings.typeResolver !== undefined) {
            this.deserializer.setTypeResolver(settings.typeResolver);
        }
        if (settings.typeHintEmitter !== undefined) {
            this.serializer.setTypeHintEmitter(settings.typeHintEmitter);
        }
        if (settings.indent !== undefined) {
            this.indent = settings.indent;
        }
        if (settings.nameResolver !== undefined) {
            this.nameResolver = settings.nameResolver;
            this.deserializer.setNameResolver(settings.nameResolver);
            // this.serializer.set
        }
        if (settings.knownTypes !== undefined) {
            // Type-check knownTypes elements to recognize errors in advance.
            settings.knownTypes.forEach(function (knownType, i) {
                // tslint:disable-next-line:no-null-keyword
                if (typeof knownType === 'undefined' || knownType === null) {
                    logWarning("TypedJSON.config: 'knownTypes' contains an undefined/null value"
                        + (" (element " + i + ")."));
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
        if (rootMetadata !== undefined) {
            rootMetadata.knownTypes.forEach(function (knownTypeCtor) {
                knownTypes.set(_this.nameResolver(knownTypeCtor), knownTypeCtor);
            });
        }
        try {
            result = this.deserializer.convertSingleValue(json, ensureTypeDescriptor(this.rootConstructor), knownTypes);
        }
        catch (e) {
            this.errorHandler(e);
        }
        return result;
    };
    TypedJSON.prototype.parseAsArray = function (object, dimensions) {
        if (dimensions === void 0) { dimensions = 1; }
        var json = parseToJSObject(object, Array);
        return this.deserializer.convertSingleValue(json, createArrayType(ensureTypeDescriptor(this.rootConstructor), dimensions), this._mapKnownTypes(this.globalKnownTypes));
    };
    TypedJSON.prototype.parseAsSet = function (object) {
        var json = parseToJSObject(object, Set);
        return this.deserializer.convertSingleValue(json, SetT(this.rootConstructor), this._mapKnownTypes(this.globalKnownTypes));
    };
    TypedJSON.prototype.parseAsMap = function (object, keyConstructor) {
        var json = parseToJSObject(object, Map);
        return this.deserializer.convertSingleValue(json, MapT(keyConstructor, this.rootConstructor), this._mapKnownTypes(this.globalKnownTypes));
    };
    /**
     * Converts an instance of the specified class type to a plain JSON object.
     * @param object The instance to convert to a JSON string.
     * @returns Serialized object or undefined if an error has occured.
     */
    TypedJSON.prototype.toPlainJson = function (object) {
        try {
            return this.serializer.convertSingleValue(object, ensureTypeDescriptor(this.rootConstructor));
        }
        catch (e) {
            this.errorHandler(e);
        }
    };
    TypedJSON.prototype.toPlainArray = function (object, dimensions) {
        if (dimensions === void 0) { dimensions = 1; }
        try {
            return this.serializer.convertSingleValue(object, createArrayType(ensureTypeDescriptor(this.rootConstructor), dimensions));
        }
        catch (e) {
            this.errorHandler(e);
        }
    };
    TypedJSON.prototype.toPlainSet = function (object) {
        try {
            return this.serializer.convertSingleValue(object, SetT(this.rootConstructor));
        }
        catch (e) {
            this.errorHandler(e);
        }
    };
    TypedJSON.prototype.toPlainMap = function (object, keyConstructor) {
        try {
            return this.serializer.convertSingleValue(object, MapT(keyConstructor, this.rootConstructor));
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


// CONCATENATED MODULE: ./src/typedjson/json-object.ts


function jsonObject(optionsOrTarget) {
    var options;
    if (typeof optionsOrTarget === 'function') {
        // jsonObject is being used as a decorator, directly.
        options = {};
    }
    else {
        // jsonObject is being used as a decorator factory.
        options = optionsOrTarget !== null && optionsOrTarget !== void 0 ? optionsOrTarget : {};
    }
    function decorator(target) {
        // Create or obtain JsonObjectMetadata object.
        var objectMetadata = metadata_JsonObjectMetadata.ensurePresentInPrototype(target.prototype);
        // Fill JsonObjectMetadata.
        objectMetadata.isExplicitlyMarked = true;
        objectMetadata.onDeserializedMethodName = options.onDeserialized;
        objectMetadata.beforeSerializationMethodName = options.beforeSerialization;
        if (options.typeResolver !== undefined) {
            objectMetadata.typeResolver = options.typeResolver;
        }
        if (options.typeHintEmitter !== undefined) {
            objectMetadata.typeHintEmitter = options.typeHintEmitter;
        }
        // T extend Object so it is fine
        objectMetadata.initializerCallback = options.initializer;
        if (options.name !== undefined) {
            objectMetadata.name = options.name;
        }
        var optionsBase = extractOptionBase(options);
        if (optionsBase !== undefined) {
            objectMetadata.options = optionsBase;
        }
        if (options.knownTypes !== undefined) {
            options.knownTypes
                .filter(function (knownType) { return Boolean(knownType); })
                .forEach(function (knownType) { return objectMetadata.knownTypes.add(knownType); });
        }
    }
    if (typeof optionsOrTarget === 'function') {
        // jsonObject is being used as a decorator, directly.
        decorator(optionsOrTarget);
    }
    else {
        // jsonObject is being used as a decorator factory.
        return decorator;
    }
}
function isSubClass(target) {
    return;
}

// CONCATENATED MODULE: ./src/typedjson/json-member.ts




function jsonMember(optionsOrPrototype, propKey) {
    // @todo, why do we check if propkey is string or symbol? the type only allows symbol/string
    //    The check is not required.
    if (propKey !== undefined
        && (typeof propKey === 'string' || typeof propKey === 'symbol')) {
        var prototype = optionsOrPrototype;
        // For error messages.
        var decoratorName = "@jsonMember on " + nameof(prototype.constructor) + "." + String(propKey);
        // jsonMember used directly, no additional information directly available besides target and
        // propKey.
        // Obtain property constructor through ReflectDecorators.
        if (!isReflectMetadataSupported) {
            logError(decoratorName + ": ReflectDecorators is required if no 'constructor' option is"
                + " specified.");
            return;
        }
        var reflectPropCtor = Reflect.getMetadata('design:type', prototype, propKey);
        if (reflectPropCtor == null) {
            logError(decoratorName + ": could not resolve detected property constructor at runtime." + MISSING_REFLECT_CONF_MSG);
            return;
        }
        var typeDescriptor = ensureTypeDescriptor(reflectPropCtor);
        if (isSpecialPropertyType(decoratorName, typeDescriptor)) {
            return;
        }
        injectMetadataInformation(prototype, propKey, {
            type: typeDescriptor,
            key: propKey.toString(),
            name: propKey.toString(),
        });
    }
    else {
        // jsonMember used as a decorator factory.
        return function (target, _propKey) {
            var _a, _b;
            var options = (_a = optionsOrPrototype) !== null && _a !== void 0 ? _a : {};
            var typeDescriptor;
            var decoratorName = "@jsonMember on " + nameof(target.constructor) + "." + String(_propKey);
            if (options.hasOwnProperty('constructor')) {
                if (!isValueDefined(options.constructor)) {
                    logError(decoratorName + ": cannot resolve specified property constructor at"
                        + ' runtime.');
                    return;
                }
                // Property constructor has been specified. Use ReflectDecorators (if available) to
                // check whether that constructor is correct. Warn if not.
                typeDescriptor = ensureTypeDescriptor(options.constructor);
                if (isReflectMetadataSupported && !isSubtypeOf(typeDescriptor.ctor, Reflect.getMetadata('design:type', target, _propKey))) {
                    logWarning(decoratorName + ": detected property type does not match"
                        + " 'constructor' option.");
                }
            }
            else {
                // Use ReflectDecorators to obtain property constructor.
                if (isReflectMetadataSupported) {
                    var reflectCtor = Reflect.getMetadata('design:type', target, _propKey);
                    if (reflectCtor == null) {
                        logError(decoratorName + ": cannot resolve detected property constructor at"
                            + " runtime.");
                        return;
                    }
                    typeDescriptor = ensureTypeDescriptor(reflectCtor);
                }
                else if (options.deserializer === undefined) {
                    logError(decoratorName + ": ReflectDecorators is required if no 'constructor' option"
                        + " is specified.");
                    return;
                }
            }
            if (typeDescriptor !== undefined
                && isSpecialPropertyType(decoratorName, typeDescriptor)) {
                return;
            }
            injectMetadataInformation(target, _propKey, {
                type: typeDescriptor,
                emitDefaultValue: options.emitDefaultValue,
                isRequired: options.isRequired,
                options: extractOptionBase(options),
                key: _propKey.toString(),
                name: (_b = options.name) !== null && _b !== void 0 ? _b : _propKey.toString(),
                deserializer: options.deserializer,
                serializer: options.serializer,
            });
        };
    }
}
function isSpecialPropertyType(decoratorName, typeDescriptor) {
    if (!(typeDescriptor instanceof ArrayTypeDescriptor) && typeDescriptor.ctor === Array) {
        logError(decoratorName + ": property is an Array. Use the jsonArrayMember decorator to"
            + " serialize this property.");
        return true;
    }
    if (!(typeDescriptor instanceof SetTypeDescriptor) && typeDescriptor.ctor === Set) {
        logError(decoratorName + ": property is a Set. Use the jsonSetMember decorator to"
            + " serialize this property.");
        return true;
    }
    if (!(typeDescriptor instanceof MapTypeDescriptor) && typeDescriptor.ctor === Map) {
        logError(decoratorName + ": property is a Map. Use the jsonMapMember decorator to"
            + " serialize this property.");
        return true;
    }
    return false;
}

// CONCATENATED MODULE: ./src/typedjson/json-set-member.ts




/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Set<T>.
 * @param elementConstructor Constructor of set elements (e.g. 'Number' for Set<number> or 'Date'
 * for Set<Date>).
 * @param options Additional options.
 */
function jsonSetMember(elementConstructor, options) {
    if (options === void 0) { options = {}; }
    return function (target, propKey) {
        var _a;
        // For error messages
        var decoratorName = "@jsonSetMember on " + nameof(target.constructor) + "." + String(propKey);
        if (!isTypelike(elementConstructor)) {
            logError(decoratorName + ": could not resolve constructor of set elements at runtime.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonSetMember' has been used
        // on a set. Warn if not.
        if (isReflectMetadataSupported
            && Reflect.getMetadata('design:type', target, propKey) !== Set) {
            logError(decoratorName + ": property is not a Set. " + MISSING_REFLECT_CONF_MSG);
            return;
        }
        injectMetadataInformation(target, propKey, {
            type: SetT(elementConstructor),
            emitDefaultValue: options.emitDefaultValue,
            isRequired: options.isRequired,
            options: extractOptionBase(options),
            key: propKey.toString(),
            name: (_a = options.name) !== null && _a !== void 0 ? _a : propKey.toString(),
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
        var _a;
        // For error messages
        var decoratorName = "@jsonMapMember on " + nameof(target.constructor) + "." + String(propKey);
        if (!isTypelike(keyConstructor)) {
            logError(decoratorName + ": could not resolve constructor of map keys at runtime.");
            return;
        }
        if (!isTypelike(valueConstructor)) {
            logError(decoratorName + ": could not resolve constructor of map values at runtime.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonMapMember' has been used
        // on a map. Warn if not.
        if (isReflectMetadataSupported
            && Reflect.getMetadata('design:type', target, propKey) !== Map) {
            logError(decoratorName + ": property is not a Map. " + MISSING_REFLECT_CONF_MSG);
            return;
        }
        injectMetadataInformation(target, propKey, {
            type: MapT(keyConstructor, valueConstructor, { shape: options.shape }),
            emitDefaultValue: options.emitDefaultValue,
            isRequired: options.isRequired,
            options: extractOptionBase(options),
            key: propKey.toString(),
            name: (_a = options.name) !== null && _a !== void 0 ? _a : propKey.toString(),
            deserializer: options.deserializer,
            serializer: options.serializer,
        });
    };
}

// CONCATENATED MODULE: ./src/typedjson/to-json.ts

function toJson(optionsOrTarget) {
    if (typeof optionsOrTarget === 'function') {
        // used directly
        toJsonDecorator(optionsOrTarget, {});
        return;
    }
    // used as a factory
    return function (target) {
        toJsonDecorator(target, optionsOrTarget);
    };
}
function toJsonDecorator(target, options) {
    if (options.overwrite !== true && target.prototype.toJSON !== undefined) {
        throw new Error(target.name + " already has toJSON defined!");
    }
    target.prototype.toJSON = function () {
        return parser_TypedJSON.toPlainJson(this, Object.getPrototypeOf(this).constructor);
    };
}

// CONCATENATED MODULE: ./src/typedjson.ts
/* concated harmony reexport TypedJSON */__webpack_require__.d(__webpack_exports__, "TypedJSON", function() { return parser_TypedJSON; });
/* concated harmony reexport defaultTypeResolver */__webpack_require__.d(__webpack_exports__, "defaultTypeResolver", function() { return defaultTypeResolver; });
/* concated harmony reexport defaultTypeEmitter */__webpack_require__.d(__webpack_exports__, "defaultTypeEmitter", function() { return defaultTypeEmitter; });
/* concated harmony reexport JsonObjectMetadata */__webpack_require__.d(__webpack_exports__, "JsonObjectMetadata", function() { return metadata_JsonObjectMetadata; });
/* concated harmony reexport jsonObject */__webpack_require__.d(__webpack_exports__, "jsonObject", function() { return jsonObject; });
/* concated harmony reexport jsonMember */__webpack_require__.d(__webpack_exports__, "jsonMember", function() { return jsonMember; });
/* concated harmony reexport jsonArrayMember */__webpack_require__.d(__webpack_exports__, "jsonArrayMember", function() { return jsonArrayMember; });
/* concated harmony reexport jsonSetMember */__webpack_require__.d(__webpack_exports__, "jsonSetMember", function() { return jsonSetMember; });
/* concated harmony reexport jsonMapMember */__webpack_require__.d(__webpack_exports__, "jsonMapMember", function() { return jsonMapMember; });
/* concated harmony reexport toJson */__webpack_require__.d(__webpack_exports__, "toJson", function() { return toJson; });
/* concated harmony reexport ArrayT */__webpack_require__.d(__webpack_exports__, "ArrayT", function() { return ArrayT; });
/* concated harmony reexport SetT */__webpack_require__.d(__webpack_exports__, "SetT", function() { return SetT; });
/* concated harmony reexport MapT */__webpack_require__.d(__webpack_exports__, "MapT", function() { return MapT; });











/***/ })
/******/ ]);
});
//# sourceMappingURL=typedjson.js.map 