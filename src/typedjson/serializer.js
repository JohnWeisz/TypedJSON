"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var helpers_1 = require("./helpers");
var Helpers = require("./helpers");
var metadata_1 = require("./metadata");
/**
 * Utility class, converts a typed object tree (i.e. a tree of class instances, arrays of class instances, and so on) to an untyped javascript object (also
 * called "simple javascript object"), and emits any necessary type hints in the process (for polymorphism).
 *
 * The converted object tree is what will be given to `JSON.stringify` to convert to string as the last step, the serialization is basically like:
 *
 * (1) typed object-tree -> (2) simple JS object-tree -> (3) JSON-string
 */
var Serializer = /** @class */ (function () {
    function Serializer() {
        this._typeHintEmitter = function (targetObject, sourceObject, expectedSourceType) {
            // By default, we put a "__type" property on the output object if the actual object is not the same as the expected one, so that deserialization
            // will know what to deserialize into (given the required known-types are defined, and the object is a valid subtype of the expected type).
            if (sourceObject.constructor !== expectedSourceType) {
                // TODO: Perhaps this can work correctly without string-literal access?
                // tslint:disable-next-line:no-string-literal
                targetObject["__type"] = helpers_1.nameof(sourceObject.constructor);
            }
        };
        this._errorHandler = function (error) { return Helpers.logError(error); };
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
        if (!Helpers.isValueDefined(sourceObject))
            return;
        if (!Helpers.isInstanceOf(sourceObject, typeInfo.selfType)) {
            var expectedName = helpers_1.nameof(typeInfo.selfType);
            var actualName = helpers_1.nameof(sourceObject.constructor);
            this._errorHandler(new TypeError("Could not serialize '" + memberName + "': expected '" + expectedName + "', got '" + actualName + "'."));
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
            sourceTypeMetadata = metadata_1.JsonObjectMetadata.getFromConstructor(sourceObject.constructor);
        }
        else {
            sourceTypeMetadata = metadata_1.JsonObjectMetadata.getFromConstructor(typeInfo.selfType);
        }
        if (sourceTypeMetadata) {
            // Strong-typed serialization available.
            // We'll serialize by members that have been marked with @jsonMember (including array/set/map members), and perform recursive conversion on
            // each of them. The converted objects are put on the 'targetObject', which is what will be put into 'JSON.stringify' finally.
            targetObject = {};
            sourceTypeMetadata.dataMembers.forEach(function (memberMetadata, propKey) {
                targetObject[propKey] = _this.convertSingleValue(sourceObject[propKey], {
                    selfType: memberMetadata.ctor,
                    elementTypes: memberMetadata.elementType,
                    keyType: memberMetadata.keyType
                }, helpers_1.nameof(sourceTypeMetadata.classType) + "." + propKey);
            });
        }
        else {
            // Untyped serialization, "as-is", we'll just pass the object on.
            // We'll clone the source object, because type hints are added to the object itself, and we don't want to modify to the original object.
            targetObject = __assign({}, sourceObject);
        }
        // Add type-hint.
        this._typeHintEmitter(targetObject, sourceObject, typeInfo.selfType);
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
        if (expectedElementType.length === 0 || !expectedElementType[0]) {
            this._errorHandler(new TypeError("Could not serialize " + memberName + " as Array: missing element type definition."));
            return;
        }
        // Check the type of each element, individually.
        // If at least one array element type is incorrect, we return undefined, which results in no value emitted during serialization.
        // This is so that invalid element types don't unexpectedly alter the ordering of other, valid elements, and that no unexpected undefined values are in
        // the emitted array.
        try {
            sourceObject.forEach(function (element, i) {
                if (!Helpers.isInstanceOf(element, expectedElementType[0])) {
                    var expectedTypeName = helpers_1.nameof(expectedElementType[0]);
                    var actualTypeName = helpers_1.nameof(element.constructor);
                    throw new TypeError("Could not serialize " + memberName + "[" + i + "]: expected '" + expectedTypeName + "', got '" + actualTypeName + "'.");
                }
            });
        }
        catch (e) {
            this._errorHandler(e);
            return;
        }
        var typeInfoForElements = {
            selfType: expectedElementType[0],
            elementTypes: expectedElementType.length > 1 ? expectedElementType.slice(1) : [] // For multidimensional arrays.
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
        if (!expectedElementType) {
            this._errorHandler(new TypeError("Could not serialize " + memberName + " as Set: missing element type definition."));
            return;
        }
        var elementTypeInfo = {
            selfType: expectedElementType
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
            if (!Helpers.isValueDefined(element) || Helpers.isValueDefined(resultElement)) {
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
            if (Helpers.isValueDefined(resultKeyValuePairObj.key) && Helpers.isValueDefined(resultKeyValuePairObj.value)) {
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
    /**
     * Determines whether the specified type is a type that can be passed on "as-is" into `JSON.stringify`.
     * Values of these types don't need special conversion.
     * @param ctor The constructor of the type (wrapper constructor for primitive types, e.g. `Number` for `number`).
     */
    Serializer.prototype._isDirectlySerializableNativeType = function (ctor) {
        return ~[Date, Number, String, Boolean].indexOf(ctor);
    };
    Serializer.prototype._isTypeTypedArray = function (ctor) {
        return ~[Float32Array, Float64Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array].indexOf(ctor);
    };
    return Serializer;
}());
exports.Serializer = Serializer;
