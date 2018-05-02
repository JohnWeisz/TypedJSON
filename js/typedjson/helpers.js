export const METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";
export function getDefaultValue(type) {
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
export function isPrimitiveType(type) {
    return (type === String || type === Boolean || type === Number);
}
export function isPrimitiveValue(obj) {
    switch (typeof obj) {
        case "string":
        case "number":
        case "boolean":
            return true;
        default:
            return (obj instanceof String || obj instanceof Number || obj instanceof Boolean);
    }
}
/**
 * Determines if 'A' is a sub-type of 'B' (or if 'A' equals 'B').
 * @param A The supposed derived type.
 * @param B The supposed base type.
 */
export function isSubtypeOf(A, B) {
    return A === B || A.prototype instanceof B;
}
export function logError(message, ...optionalParams) {
    if (typeof console === "object" && typeof console.error === "function") {
        console.error.apply(console, [message].concat(optionalParams));
    }
    else if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, ["ERROR: " + message].concat(optionalParams));
    }
}
export function logMessage(message, ...optionalParams) {
    if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, [message].concat(optionalParams));
    }
}
export function logWarning(message, ...optionalParams) {
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
export function isValueDefined(value) {
    return !(typeof value === "undefined" || value === null);
}
export function isInstanceOf(value, constructor) {
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
export const isReflectMetadataSupported = (typeof Reflect === "object" && typeof Reflect.getMetadata === "function");
export function multilineString(...values) {
    return values.join(" ");
}
/**
 * Gets the name of a function.
 * @param fn The function whose name to get.
 */
export function nameof(fn) {
    if (typeof fn.name === "string") {
        return fn.name;
    }
    else {
        return "undefined";
    }
}
//# sourceMappingURL=helpers.js.map