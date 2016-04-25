define(["require", "exports", "./types"], function (require, exports, types_1) {
    "use strict";
    var RESERVED_NAMES = [
        "__jsonTypesJsonObjectMetadataInformation__"
    ];
    /**
     * Polyfill for Object.assign, used to copy the values of all enumerable own properties from one or more source objects to a target object.
     * It will return the target object.
     * @param target The target object.
     * @param sources The source object(s).
     */
    function assign(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        var output;
        var source;
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        output = Object(target);
        for (var i = 1; i < arguments.length; i++) {
            source = arguments[i];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    }
    exports.assign = assign;
    /**
     * Returns a boolean indicating whether a given property exists on a class (constructor function), or inherited classes.
     * @param constructor The class to check.
     * @param propertyKey The property key to search for.
     * @param searchBaseClasses Whether to search on base classes as well.
     */
    function constructorHasProperty(constructor, propertyKey, searchBaseClasses) {
        if (searchBaseClasses === void 0) { searchBaseClasses = true; }
        var prototype;
        if (constructor.hasOwnProperty(propertyKey.toString())) {
            return true;
        }
        else if (searchBaseClasses) {
            prototype = constructor.prototype;
            while (prototype) {
                if (prototype.hasOwnProperty(propertyKey.toString())) {
                    return true;
                }
                prototype = prototype.prototype;
            }
        }
        return false;
    }
    exports.constructorHasProperty = constructorHasProperty;
    function error(message) {
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
    exports.error = error;
    function getClassName(target) {
        var targetType;
        if (typeof target === "function") {
            // target is constructor function.
            targetType = target;
        }
        else {
            // target is class prototype.
            targetType = target.constructor;
        }
        if ("name" in targetType && typeof targetType.name === "string") {
            // ES6 constructor.name // Awesome!
            return targetType.name;
        }
        else {
            // Extract class name from string representation of constructor function. // Meh...
            return targetType.toString().match(/function (\w*)/)[1];
        }
    }
    exports.getClassName = getClassName;
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
                return null;
        }
    }
    exports.getDefaultValue = getDefaultValue;
    function getPropertyCount(object) {
        var _this = this;
        var sum = 0;
        Object.keys(object).forEach(function (propertyKey) {
            sum++;
            if (typeof object[propertyKey] === "object" && object[propertyKey] !== null) {
                sum += _this.getPropertyCount(object[propertyKey]);
            }
            else if (object[propertyKey] instanceof Array) {
                object[propertyKey].forEach(function (elem) {
                    _this.getPropertyCount(elem);
                });
            }
        });
        return sum;
    }
    exports.getPropertyCount = getPropertyCount;
    function getPropertyDisplayName(target, propertyKey) {
        return getClassName(target) + "." + propertyKey.toString();
    }
    exports.getPropertyDisplayName = getPropertyDisplayName;
    function getTypeHintPropertyKey(typeHint) {
        switch (typeHint) {
            case types_1.TypeHint.None:
                return "";
            case types_1.TypeHint.DataContract:
                return "__type";
        }
    }
    exports.getTypeHintPropertyKey = getTypeHintPropertyKey;
    function isArray(object) {
        if (typeof Array.isArray === "function") {
            return Array.isArray(object);
        }
        else {
            if (object.prototype.toString.call(object) === "[object Array]") {
                return true;
            }
            else {
                return false;
            }
        }
    }
    exports.isArray = isArray;
    function isPrimitiveType(obj) {
        switch (typeof obj) {
            case "string":
            case "number":
            case "boolean":
                return true;
        }
        if (obj instanceof String || obj === String ||
            obj instanceof Number || obj === Number ||
            obj instanceof Boolean || obj === Boolean) {
            return true;
        }
        return false;
    }
    exports.isPrimitiveType = isPrimitiveType;
    function isReservedMemberName(name) {
        return (RESERVED_NAMES.indexOf(name) !== -1);
    }
    exports.isReservedMemberName = isReservedMemberName;
    function isSubtypeOf(A, B) {
        var aPrototype = A.prototype;
        // "A" is a class.
        if (A === B) {
            return true;
        }
        while (aPrototype) {
            if (aPrototype instanceof B) {
                return true;
            }
            aPrototype = aPrototype.prototype;
        }
        return false;
    }
    exports.isSubtypeOf = isSubtypeOf;
    function log(message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (typeof console === "object" && typeof console.log === "function") {
            console.log.apply(console, [message].concat(optionalParams));
        }
    }
    exports.log = log;
    function warn(message) {
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
    exports.warn = warn;
});
//# sourceMappingURL=helpers.js.map