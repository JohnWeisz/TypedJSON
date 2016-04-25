import {Constructor, ParameterlessConstructor, TypeHint} from "./types";

const RESERVED_NAMES = [
    "__typedJsonJsonObjectMetadataInformation__"
];

/**
 * Polyfill for Object.assign, used to copy the values of all enumerable own properties from one or more source objects to a target object.
 * It will return the target object.
 * @param target The target object.
 * @param sources The source object(s).
 */
export function assign<T>(target: T, ...sources: Array<any>): T {
    var output: T;
    var source: any;

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

/**
 * Returns a boolean indicating whether a given property exists on a class (constructor function), or inherited classes.
 * @param constructor The class to check.
 * @param propertyKey The property key to search for.
 * @param searchBaseClasses Whether to search on base classes as well.
 */
export function constructorHasProperty(constructor: Constructor<any>, propertyKey: string | symbol, searchBaseClasses: boolean = true) {
    var prototype: any;

    if (constructor.hasOwnProperty(propertyKey.toString())) {
        return true;
    } else if (searchBaseClasses) {
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

export function error(message?: any, ...optionalParams: Array<any>) {
    if (typeof console === "object" && typeof console.error === "function") {
        console.error.apply(console, [message].concat(optionalParams));
    } else if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, ["ERROR: " + message].concat(optionalParams));
    }
}

/**
 * Gets the string representation of a class.
 * @param target The class (constructor function) reference.
 */
export function getClassName(target: Constructor<any>);
/**
 * Gets a string representation of a class from its prototype.
 * @param target The class prototype.
 */
export function getClassName(target: Object);
export function getClassName(target: Constructor<any> | Object) {
    var targetType: Constructor<any>;

    if (typeof target === "function") {
        // target is constructor function.
        targetType = target as Constructor<any>;
    } else {
        // target is class prototype.
        targetType = target.constructor as Constructor<any>;
    }

    if ("name" in targetType && typeof (targetType as any).name === "string") {
        // ES6 constructor.name // Awesome!
        return (targetType as any).name;
    } else {
        // Extract class name from string representation of constructor function. // Meh...
        return targetType.toString().match(/function (\w*)/)[1];
    }
}

export function getDefaultValue<T>(type: { new (...args: any[]): T }): T {
    switch (type as any) {
        case Number:
            return 0 as any;

        case String:
            return "" as any;

        case Boolean:
            return false as any;

        case Array:
            return [] as any;

        default:
            return null;
    }
}

export function getPropertyCount(object: any) {
    var sum = 0;

    Object.keys(object).forEach((propertyKey) => {
        sum++;

        if (typeof object[propertyKey] === "object" && object[propertyKey] !== null) {
            sum += this.getPropertyCount(object[propertyKey]);
        } else if (object[propertyKey] instanceof Array) {
            object[propertyKey].forEach((elem: any) => {
                this.getPropertyCount(elem);
            });
        }
    });

    return sum;
}

export function getPropertyDisplayName(target: Constructor<any> | Object, propertyKey: string | symbol) {
    return `${getClassName(target)}.${propertyKey.toString()}`;
}

export function getTypeHintPropertyKey(typeHint: TypeHint) {
    switch (typeHint) {
        case TypeHint.None:
            return "";

        case TypeHint.DataContract:
            return "__type";
    }
}

export function isArray(object: any) {
    if (typeof Array.isArray === "function") {
        return Array.isArray(object);
    } else {
        if (object.prototype.toString.call(object) === "[object Array]") {
            return true;
        } else {
            return false;
        }
    }
}

export function isPrimitiveType(obj: any) {
    switch (typeof obj) {
        case "string":
        case "number":
        case "boolean":
            return true;
    }

    if (obj instanceof String || obj === String ||
        obj instanceof Number || obj === Number ||
        obj instanceof Boolean || obj === Boolean
    ) {
        return true;
    }

    return false;
}

export function isReservedMemberName(name: string) {
    return (RESERVED_NAMES.indexOf(name) !== -1);
}

export function isSubtypeOf(A: Constructor<any>, B: Constructor<any>) {
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

export function log(message?: any, ...optionalParams: Array<any>) {
    if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, [message].concat(optionalParams));
    }
}

export function warn(message?: any, ...optionalParams: Array<any>) {
    if (typeof console === "object" && typeof console.warn === "function") {
        console.warn.apply(console, [message].concat(optionalParams));
    } else if (typeof console === "object" && typeof console.log === "function") {
        console.log.apply(console, ["WARNING: " + message].concat(optionalParams));
    }
}
