"use strict";
exports.__esModule = true;
exports.METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";
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
exports.getDefaultValue = getDefaultValue;
function isPrimitiveType(type) {
    return (type === String || type === Boolean || type === Number);
}
exports.isPrimitiveType = isPrimitiveType;
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
exports.isPrimitiveValue = isPrimitiveValue;
/**
 * Determines if 'A' is a sub-type of 'B' (or if 'A' equals 'B').
 * @param A The supposed derived type.
 * @param B The supposed base type.
 */
function isSubtypeOf(A, B) {
    return A === B || A.prototype instanceof B;
}
exports.isSubtypeOf = isSubtypeOf;
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
exports.logError = logError;
function logMessage(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, [message].concat(optionalParams));
    }
}
exports.logMessage = logMessage;
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
exports.logWarning = logWarning;
/**
 * Checks if the value is considered defined (not undefined and not null).
 * @param value
 */
function isValueDefined(value) {
    return !(typeof value === "undefined" || value === null);
}
exports.isValueDefined = isValueDefined;
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
    else if (typeof value === "object") {
        return (value instanceof constructor);
    }
    return false;
}
exports.isInstanceOf = isInstanceOf;
exports.isReflectMetadataSupported = (typeof Reflect === "object" && typeof Reflect.getMetadata === "function");
function multilineString() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    return values.join(" ");
}
exports.multilineString = multilineString;
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
exports.nameof = nameof;
