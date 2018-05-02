"use strict";
exports.__esModule = true;
var helpers_1 = require("./helpers");
var Helpers = require("./helpers");
var metadata_1 = require("./metadata");
/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
var Deserializer = /** @class */ (function () {
    function Deserializer() {
        this._typeResolver = function (sourceObject, knownTypes) {
            if (sourceObject.__type)
                return knownTypes.get(sourceObject.__type);
        };
        this._errorHandler = function (error) { return Helpers.logError(error); };
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
        if (typeof errorHandlerCallback !== "function")
            throw new TypeError("'errorHandlerCallback' is not a function.");
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
        var sourceObjectMetadata = metadata_1.JsonObjectMetadata.getFromConstructor(expectedSelfType);
        var knownTypeConstructors = sourceObjectTypeInfo.knownTypes;
        if (sourceObjectMetadata) {
            // Merge known types received from "above" with known types defined on the current type.
            knownTypeConstructors = this._mergeKnownTypes(knownTypeConstructors, this._createKnownTypesMap(sourceObjectMetadata.knownTypes));
        }
        // Check if a type-hint is available from the source object.
        var typeFromTypeHint = this._typeResolver(sourceObject, knownTypeConstructors);
        if (typeFromTypeHint) {
            // Check if type hint is a valid subtype of the expected source type.
            if (Helpers.isSubtypeOf(typeFromTypeHint, expectedSelfType)) {
                // Hell yes.
                expectedSelfType = typeFromTypeHint;
                sourceObjectMetadata = metadata_1.JsonObjectMetadata.getFromConstructor(typeFromTypeHint);
                if (sourceObjectMetadata) {
                    // Also merge new known types from subtype.
                    knownTypeConstructors = this._mergeKnownTypes(knownTypeConstructors, this._createKnownTypesMap(sourceObjectMetadata.knownTypes));
                }
            }
        }
        if (sourceObjectMetadata && sourceObjectMetadata.isExplicitlyMarked) {
            // Strong-typed deserialization available, get to it.
            // First deserialize properties into a temporary object.
            var sourceObjectWithDeserializedProperties_1 = {};
            // Deserialize by expected properties.
            sourceObjectMetadata.dataMembers.forEach(function (memberMetadata, propKey) {
                var memberValue = sourceObject[propKey];
                var memberNameForDebug = helpers_1.nameof(sourceObjectMetadata.classType) + "." + propKey;
                var expectedMemberType = memberMetadata.ctor;
                var revivedValue = _this.convertSingleValue(memberValue, {
                    selfConstructor: expectedMemberType,
                    elementConstructor: memberMetadata.elementType,
                    keyConstructor: memberMetadata.keyType,
                    knownTypes: knownTypeConstructors
                }, memberNameForDebug);
                if (Helpers.isValueDefined(revivedValue)) {
                    sourceObjectWithDeserializedProperties_1[propKey] = revivedValue;
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
                        throw new TypeError(Helpers.multilineString("Cannot deserialize " + objectName + ":", "'initializer' function returned undefined/null, but '" + helpers_1.nameof(sourceObjectMetadata.classType) + "' was expected."));
                    }
                    else if (!(targetObject instanceof sourceObjectMetadata.classType)) {
                        throw new TypeError(Helpers.multilineString("Cannot deserialize " + objectName + ":", "'initializer' returned '" + helpers_1.nameof(targetObject.constructor) + "', but '" + helpers_1.nameof(sourceObjectMetadata.classType) + "' was expected,", "and '" + helpers_1.nameof(targetObject.constructor) + "' is not a subtype of '" + helpers_1.nameof(sourceObjectMetadata.classType) + "'"));
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
                    this._errorHandler(new TypeError("onDeserialized callback '" + helpers_1.nameof(sourceObjectMetadata.classType) + "." + sourceObjectMetadata.onDeserializedMethodName + "' is not a method."));
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
        var srcTypeNameForDebug = sourceObject ? helpers_1.nameof(sourceObject.constructor) : "undefined";
        if (!Helpers.isValueDefined(sourceObject)) {
            return sourceObject;
        }
        else if (this._isDirectlyDeserializableNativeType(expectedSelfType)) {
            if (sourceObject.constructor === expectedSelfType) {
                return sourceObject;
            }
            else {
                throw new TypeError(this._makeTypeErrorMessage(helpers_1.nameof(expectedSelfType), sourceObject.constructor, memberName));
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
                if (Helpers.isValueDefined(key)) {
                    resultMap.set(key, _this.convertSingleValue(element.value, valueTypeInfo, memberName + ("[" + key + "]")));
                }
            }
            catch (e) {
                // Faulty entries are skipped, because a Map is not ordered, and skipping an entry does not affect others.
                _this._errorHandler(e);
            }
        });
        return resultMap;
    };
    Deserializer.prototype._throwTypeMismatchError = function (targetType, expectedSourceType, actualSourceType, memberName) {
        if (memberName === void 0) { memberName = "object"; }
        throw new TypeError("Could not deserialize " + memberName + " as " + targetType + ": expected " + expectedSourceType + ", got " + actualSourceType + ".");
    };
    Deserializer.prototype._makeTypeErrorMessage = function (expectedType, actualType, memberName) {
        if (memberName === void 0) { memberName = "object"; }
        var expectedTypeName = (typeof expectedType === "function") ? helpers_1.nameof(expectedType) : expectedType;
        var actualTypeName = (typeof actualType === "function") ? helpers_1.nameof(actualType) : actualType;
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
                map.set(ctor.name, ctor);
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
exports.Deserializer = Deserializer;
