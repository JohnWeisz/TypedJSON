/*!
TypedJSON v0.1.2 - https://github.com/JohnWhiteTB/TypedJSON

Typed JSON parsing and serializing that preserves type information. Parse JSON into actual class instances. Recommended (but not required)
to be used with reflect-metadata (global installation): https://github.com/rbuckton/ReflectDecorators. 


The MIT License (MIT)
Copyright (c) 2016 John White

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";

declare type Constructor<T> = { new (): T };

declare abstract class Reflect {
    public static getMetadata(metadataKey: string, target: any, targetKey: string | symbol): any;
}

interface SerializerSettings {
    /** Property key to recognize as type-hints. Default is "__type". */
    typeHintPropertyKey?: string;

    /** When set, enable emitting and recognizing type-hints. Default is true */
    enableTypeHints?: boolean;
    
    /** Maximum number of objects allowed when deserializing from JSON. Default is no limit. */
    maxObjects?: number;

    /** A function that transforms the JSON after serializing. Called recursively for every object. */
    replacer?: (key: string, value: any) => any;

    /** A function that transforms the JSON before deserializing. Called recursively for every object. */
    reviver?: (key: any, value: any) => any;
}

//#region "JSON Polyfill"
if (!JSON) {
    JSON = {
        parse: function (sJSON) { return eval('(' + sJSON + ')'); },
        stringify: (function () {
            var toString = Object.prototype.toString;
            var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
            var escMap = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
            var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
            var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
            return function stringify(value) {
                if (value == null) {
                    return 'null';
                } else if (typeof value === 'number') {
                    return isFinite(value) ? value.toString() : 'null';
                } else if (typeof value === 'boolean') {
                    return value.toString();
                } else if (typeof value === 'object') {
                    if (typeof value.toJSON === 'function') {
                        return stringify(value.toJSON());
                    } else if (isArray(value)) {
                        var res = '[';
                        for (var i = 0; i < value.length; i++)
                            res += (i ? ', ' : '') + stringify(value[i]);
                        return res + ']';
                    } else if (toString.call(value) === '[object Object]') {
                        var tmp = [];
                        for (var k in value) {
                            if (value.hasOwnProperty(k))
                                tmp.push(stringify(k) + ': ' + stringify(value[k]));
                        }
                        return '{' + tmp.join(', ') + '}';
                    }
                }
                return '"' + value.toString().replace(escRE, escFunc) + '"';
            };
        })()
    };
}
//#endregion

//#region "Helpers"
namespace Helpers {
    /**
     * Polyfill for Object.assign.
     * @param target The target object.
     * @param sources The source object(s).
     */
    export function assign<T extends Object>(target: T, ...sources: Array<any>): T {
        var output: T;
        var source: any;

        if (target === undefined || target === null) {
            throw new TypeError("Cannot convert undefined or null to object");
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
    export function getClassName(target: Constructor<any>): string;
    /**
     * Gets a string representation of a class from its prototype.
     * @param target The class prototype.
     */
    export function getClassName(target: Object): string;
    export function getClassName(target: Constructor<any> | Object): string {
        var targetType: Constructor<any>;

        if (typeof target === "function") {
            // target is constructor function.
            targetType = target as Constructor<any>;
        } else if (typeof target === "object") {
            // target is class prototype.
            targetType = target.constructor as Constructor<any>;
        }

        if (!targetType) {
            return "undefined";
        }

        if ("name" in targetType && typeof (targetType as any).name === "string") {
            // ES6 constructor.name // Awesome!
            return (targetType as any).name;
        } else {
            // Extract class name from string representation of constructor function. // Meh...
            return targetType.toString().match(/function (\w*)/)[1];
        }
    }

    export function getDefaultValue<T>(type: { new (): T }): T {
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
    
    export function getPropertyDisplayName(target: Constructor<any> | Object, propertyKey: string | symbol) {
        return `${getClassName(target)}.${propertyKey.toString()}`;
    }
    
    export function isArray(object: any) {
        if (typeof Array.isArray === "function") {
            return Array.isArray(object);
        } else {
            if (object instanceof Array) {
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
        return (name === METADATA_FIELD_KEY);
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

    /**
     * Copy the values of all enumerable own properties from one or more source objects to a shallow copy of the target object.
     * It will return the new object.
     * @param target The target object.
     * @param sources The source object(s).
     */
    export function merge<T extends Object>(target: T, ...sources: Array<any>): T {
        var output: T;
        var source: any;

        if (target === undefined || target === null) {
            throw new TypeError("Cannot convert undefined or null to object");
        }

        output = {} as T;

        Object.keys(target).forEach(nextKey => {
            output[nextKey] = target[nextKey];
        });

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

    export function valueIsDefined(value: any): boolean {
        if (typeof value === "undefined" || value === null) {
            return false;
        } else {
            return true;
        }
    }

    export function warn(message?: any, ...optionalParams: Array<any>) {
        if (typeof console === "object" && typeof console.warn === "function") {
            console.warn.apply(console, [message].concat(optionalParams));
        } else if (typeof console === "object" && typeof console.log === "function") {
            console.log.apply(console, ["WARNING: " + message].concat(optionalParams));
        }
    }
}
//#endregion

//#region "Metadata"
class JsonMemberMetadata<T> {
    /** If set, a default value will be emitted for uninitialized members. */
    public emitDefaultValue: boolean;

    /** Member name as it appears in the serialized JSON. */
    public name: string;

    /** Property or field key of the json member. */
    public key: string;

    /** Constuctor (type) reference of the member. */
    public type: Constructor<T>;

    /** If set, indicates that the member must be present when deserializing. */
    public isRequired: boolean;

    /** If the json member is an array, sets the type of array elements. */
    public elementType: { new (): any };

    /** Serialization/deserialization order. */
    public order: number;

    public forceEnableTypeHinting: boolean;
}

class JsonObjectMetadata<T> {
    private _className: string;
    private _dataMembers: { [key: string]: JsonMemberMetadata<any> };
    private _knownTypes: Array<Constructor<any>>;
    private _knownTypeCache: { [key: string]: Constructor<any> };

    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param type The JsonObject class.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     */
    public static getJsonObjectName(type: Constructor<any>, inherited: boolean = true): string {
        var metadata = this.getFromType(type, inherited);

        if (metadata !== null) {
            return metadata.className;
        } else {
            return Helpers.getClassName(type);
        }
    }

    /**
     * Gets JsonObject metadata information from a class or its prototype.
     * @param target The target class.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
     */
    public static getFromType<S>(target: { new (): S }, inherited?: boolean): JsonObjectMetadata<S>;
    
    /**
     * Gets JsonObject metadata information from a class or its prototype.
     * @param target The target prototype.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
     */
    public static getFromType(target: any, inherited?: boolean): JsonObjectMetadata<any>;

    public static getFromType<S>(target: { new (): S } | any, inherited: boolean = true): JsonObjectMetadata<S> {
        var targetPrototype: any;

        if (typeof target === "function") {
            targetPrototype = target.prototype;
        } else {
            targetPrototype = target;
        }

        if (!targetPrototype) {
            return null;
        }

        if (targetPrototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            // The class prototype contains own JsonObject metadata.
            return targetPrototype[METADATA_FIELD_KEY];
        } else if (inherited && targetPrototype[METADATA_FIELD_KEY]) {
            // The class prototype inherits JsonObject metadata.
            return targetPrototype[METADATA_FIELD_KEY];
        }

        return null;
    }

    /**
     * Gets JsonObject metadata information from a class instance.
     * @param target The target instance.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
     */
    public static getFromInstance<S>(target: S, inherited: boolean = true): JsonObjectMetadata<S> {
        return this.getFromType<S>(Object.getPrototypeOf(target), inherited);
    }

    /**
     * Gets the known type name of a JsonObject class for type hint.
     * @param target The target class.
     */
    public static getKnownTypeNameFromType<S>(target: Constructor<S>): string {
        var metadata = this.getFromType<S>(target, false);

        if (metadata) {
            return metadata.className;
        } else {
            return Helpers.getClassName(target);
        }
    }

    /**
     * Gets the known type name of a JsonObject instance for type hint.
     * @param target The target instance.
     */
    public static getKnownTypeNameFromInstance<S>(target: S): string {
        var metadata = this.getFromInstance<S>(target, false);

        if (metadata) {
            return metadata.className;
        } else {
            return Helpers.getClassName(target.constructor);
        }
    }

    /** Gets the metadata of all JsonMembers of the JsonObject as key-value pairs. */
    public get dataMembers(): { [key: string]: JsonMemberMetadata<any> } {
        return this._dataMembers;
    }

    /** Gets or sets the constructor function for the JsonObject. */
    public classType: Constructor<T>;

    /** Gets or sets the name of the JsonObject as it appears in the serialized JSON. */
    public get className(): string {
        if (typeof this._className === "string") {
            return this._className;
        } else {
            return Helpers.getClassName(this.classType);
        }
    }
    public set className(value: string) {
        this._className = value;
    }

    /** Gets a key-value collection of the currently known types for this JsonObject. */
    public get knownTypes() {
        var knownTypes: { [key: string]: Constructor<any> };
        var knownTypeName: string;

        if (false && this._knownTypeCache) {
            return this._knownTypeCache;
        } else {
            knownTypes = {};

            this._knownTypes.forEach((knownType) => {
                // KnownType names are not inherited from JsonObject settings, as it would render them useless.
                knownTypeName = JsonObjectMetadata.getKnownTypeNameFromType(knownType);

                knownTypes[knownTypeName] = knownType;
            });

            this._knownTypeCache = knownTypes;

            return knownTypes;
        }
    }

    public isExplicitlyMarked: boolean;
    public initializer: (json: any) => T;
    public serializer: (object: T) => any;

    constructor() {
        this._dataMembers = {};
        this._knownTypes = [];
        this._knownTypeCache = null;
        this.isExplicitlyMarked = false;
    }

    /**
     * Sets a known type.
     * @param type The known type.
     */
    public setKnownType(type: Constructor<any>): void {
        if (this._knownTypes.indexOf(type) === -1) {
            this._knownTypes.push(type);
            this._knownTypeCache = null;
        }
    }

    /**
     * Adds a JsonMember to the JsonObject.
     * @param member The JsonMember metadata.
     * @throws Error if a JsonMember with the same name already exists.
     */
    public addMember<U>(member: JsonMemberMetadata<U>) {
        Object.keys(this._dataMembers).forEach(propertyKey => {
            if (this._dataMembers[propertyKey].name === member.name) {
                throw new Error(`A member with the name '${member.name}' already exists.`);
            }
        });

        this._dataMembers[member.key] = member;
    }

    /**
     * Sorts data members:
     *  1. Ordered members in defined order
     *  2. Unordered members in alphabetical order
     */
    public sortMembers(): void {
        var memberArray: JsonMemberMetadata<any>[] = [];

        Object.keys(this._dataMembers).forEach((propertyKey) => {
            memberArray.push(this._dataMembers[propertyKey]);
        });

        memberArray = memberArray.sort(this.sortMembersCompare);

        this._dataMembers = {};

        memberArray.forEach((dataMember) => {
            this._dataMembers[dataMember.key] = dataMember;
        });
    }

    private sortMembersCompare(a: JsonMemberMetadata<any>, b: JsonMemberMetadata<any>) {
        if (typeof a.order !== "number" && typeof b.order !== "number") {
            // a and b both both implicitly ordered, alphabetical order
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
        } else if (typeof a.order !== "number") {
            // a is implicitly ordered, comes after b (compare: a is greater)
            return 1;
        } else if (typeof b.order !== "number") {
            // b is implicitly ordered, comes after a (compare: b is greater)
            return -1;
        } else {
            // a and b are both explicitly ordered
            if (a.order < b.order) {
                return -1;
            } else if (a.order > b.order) {
                return 1;
            } else {
                // ordering is the same, use alphabetical order
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
            }
        }

        return 0;
    }
}
//#endregion

//#region "JsonObject"
interface JsonObjectOptions<T> {
    /** Name of the object as it appears in the serialized JSON. */
    name?: string;

    /** An array of known types to recognize when encountering type-hints. */
    knownTypes?: Array<{ new (): any }>;

    /** A custom serializer function transforming an instace to a JSON object. */
    serializer?: (object: T) => any;

    /** A custom deserializer function transforming a JSON object to an instace. */
    initializer?: (json: any) => T;
}

/**
 * Specifies that the type is serializable to and deserializable from a JSON string.
 * @param options Configuration settings.
 */
function JsonObject<T>(options?: JsonObjectOptions<T>): (target: { new (): T }) => void;

/**
 * Specifies that the type is serializable to and deserializable from a JSON string.
 */
function JsonObject<T>(target: { new (): T }): void;

function JsonObject<T>(optionsOrTarget?: JsonObjectOptions<T> | { new (): T }): (target: Constructor<T>) => void | void {
    var options: JsonObjectOptions<T>;

    if (typeof optionsOrTarget === "function") {
        // JsonObject is being used as a decorator, directly.
        options = {};
    } else {
        // JsonObject is being used as a decorator factory.
        options = optionsOrTarget || {};
    }

    var initializer = options.initializer;
    var decorator = function (target: Constructor<T>): void {
        var objectMetadata: JsonObjectMetadata<T>;
        var parentMetadata: JsonObjectMetadata<T>;
        var i;

        if (!target.prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            objectMetadata = new JsonObjectMetadata<T>();

            // If applicable, inherit @JsonMembers and @KnownTypes from parent @JsonObject.
            if (parentMetadata = target.prototype[METADATA_FIELD_KEY]) {
                // @JsonMembers
                Object.keys(parentMetadata.dataMembers).forEach(memberPropertyKey => {
                    objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                });

                // @KnownTypes
                Object.keys(parentMetadata.knownTypes).forEach(key => {
                    objectMetadata.setKnownType(parentMetadata.knownTypes[key]);
                });
            }

            Object.defineProperty(target.prototype, METADATA_FIELD_KEY, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: objectMetadata
            });
        } else {
            objectMetadata = target.prototype[METADATA_FIELD_KEY];
        }

        objectMetadata.classType = target;
        objectMetadata.isExplicitlyMarked = true;

        if (options.name) {
            objectMetadata.className = options.name;
        }

        if (options.knownTypes) {
            i = 0;

            try {
                options.knownTypes.forEach(knownType => {
                    if (typeof knownType === "undefined") {
                        throw new TypeError(`Known type #${i++} is undefined.`);
                    }

                    objectMetadata.setKnownType(knownType);
                });
            } catch (e) {
                // The missing known type might not cause trouble at all, thus the error is printed, but not thrown.
                Helpers.error(new TypeError(`@JsonObject (on ${Helpers.getClassName(target)}): ` + e.message));
            }
        }

        if (typeof initializer === "function") {
            objectMetadata.initializer = initializer;
        }
    };

    if (typeof optionsOrTarget === "function") {
        // JsonObject is being used as a decorator, directly.
        return decorator(optionsOrTarget as Constructor<T>) as any;
    } else {
        // JsonObject is being used as a decorator factory.
        return decorator;
    }
}
//#endregion

//#region "JsonMember"
interface JsonMemberOptions<TFunction extends Function> {
    /** Sets the member name as it appears in the serialized JSON. Default value is determined from property key. */
    name?: string;

    /** Sets the json member type. Optional if reflect metadata is available. */
    type?: TFunction;

    /** When the json member is an array, sets the type of array elements. Required for arrays. */
    elementType?: Function;

    /** When set, indicates that the member must be present when deserializing a JSON string. */
    isRequired?: boolean;

    /** Sets the serialization and deserialization order of the json member. */
    order?: number;

    /** When set, a default value is emitted when an uninitialized member is serialized. */
    emitDefaultValue?: boolean;

    /** When set, type-hint is mandatory when deserializing. Set for properties with interface or abstract types/element-types. */
    refersAbstractType?: boolean;
}

/**
 * Specifies that the property is part of the object when serializing.
 * Parameterless use requires reflect-metadata to determine member type.
 */
function JsonMember(): PropertyDecorator;

/**
 * Specifies that the property is part of the object when serializing.
 * Parameterless use requires reflect-metadata to determine member type.
 */
function JsonMember(target: any, propertyKey: string | symbol): void;

/**
 * Specifies that the property is part of the object when serializing.
 * @param options Configuration settings.
 */
function JsonMember<TFunction extends Function>(options: JsonMemberOptions<TFunction>): PropertyDecorator;

function JsonMember<TFunction extends Function>(optionsOrTarget?: JsonMemberOptions<TFunction> | any, propertyKey?: string | symbol): PropertyDecorator | void {
    var memberMetadata = new JsonMemberMetadata<TFunction>();
    var options: JsonMemberOptions<TFunction>;
    var decorator: PropertyDecorator;

    if (typeof propertyKey === "string" || typeof propertyKey === "symbol") {
        // JsonMember is being used as a decorator, directly.
        options = {};
    } else {
        // JsonMember is being used as a decorator factory.
        options = optionsOrTarget || {};
    }

    memberMetadata = Helpers.assign(memberMetadata, options);

    decorator = function (target: any, propertyKey: string | symbol): void {
        var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey.toString());;
        var objectMetadata: JsonObjectMetadata<any>;
        var parentMetadata: JsonObjectMetadata<any>;
        var reflectType: any;
        var propertyName = Helpers.getPropertyDisplayName(target, propertyKey);

        // Static members are not supported (when a property decorator is applied to a static member, 'target' is constructor function).
        if (typeof target === "function") {
            throw new TypeError(`@JsonMember cannot be used on a static property ('${propertyName}').`);
        }

        // Functions (methods) cannot be serialized.
        if (typeof target[propertyKey] === "function") {
            throw new TypeError(`@JsonMember cannot be used on a method ('${propertyName}').`);
        }

        memberMetadata.key = propertyKey.toString();
        memberMetadata.name = options.name || propertyKey.toString(); // Property key is used as default member name if not specified.

        // Check for reserved member names.
        if (Helpers.isReservedMemberName(memberMetadata.name)) {
            throw new Error(`@JsonMember: '${memberMetadata.name}' is a reserved name.`);
        }

        // It is a common error for types to exist at compile time, but not at runtime (often caused by improper/misbehaving imports).
        if (options.hasOwnProperty("type") && typeof options.type === "undefined") {
            throw new TypeError(`@JsonMember: 'type' of property '${propertyName}' is undefined.`);
        }

        // ... same for elementType.
        if (options.hasOwnProperty("elementType") && typeof options.elementType === "undefined") {
            throw new TypeError(`@JsonMember: 'elementType' of property '${propertyName}' is undefined.`);
        }

        //#region "Reflect Metadata support"
        if (typeof Reflect === "object" && typeof Reflect.getMetadata === "function") {
            reflectType = Reflect.getMetadata("design:type", target, propertyKey);

            if (typeof reflectType === "undefined") {
                // If Reflect.getMetadata exists, functionality for *setting* metadata should also exist, and metadata *should* be set.
                throw new TypeError(`@JsonMember: type detected for property '${propertyName}' is undefined.`);
            }

            if (!memberMetadata.type || typeof memberMetadata.type !== "function") {
                // Get type information using reflect metadata.
                memberMetadata.type = reflectType;
            } else if (memberMetadata.type !== reflectType) {
                Helpers.warn(`@JsonMember: 'type' specified for '${propertyName}' does not match detected type.`);
            }
        }
        //#endregion "Reflect Metadata support"

        // Ensure valid types have been specified ('type' at all times, 'elementType' for arrays).
        if (typeof memberMetadata.type !== "function") {
            throw new Error(`@JsonMember: no valid 'type' specified for property '${propertyName}'.`);
        } else if (memberMetadata.type as any === Array && typeof memberMetadata.elementType !== "function") {
            throw new Error(`@JsonMember: no valid 'elementType' specified for property '${propertyName}'.`);
        }

        if (memberMetadata.type as any === Array && memberMetadata.elementType === Array) {
            memberMetadata.forceEnableTypeHinting = true;
        }

        // Add JsonObject metadata to 'target' if not yet exists (implicit @JsonObject, 'target' is the prototype).
        // However, this will *not* fire up custom serialization, as 'target' must be explicitly marked with '@JsonObject' as well.
        if (!target.hasOwnProperty(METADATA_FIELD_KEY)) {
            objectMetadata = new JsonObjectMetadata();

            // Where applicable, inherit @JsonMembers from parent @JsonObject.
            if (parentMetadata = target[METADATA_FIELD_KEY]) {
                // @JsonMembers
                Object.keys(parentMetadata.dataMembers).forEach(memberPropertyKey => {
                    objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                });
            }

            // 'target' is the prototype of the involved class (metadata information is added to the class prototype).
            Object.defineProperty(target, METADATA_FIELD_KEY, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: objectMetadata
            });
        } else {
            // JsonObjectMetadata already exists on target.
            objectMetadata = target[METADATA_FIELD_KEY];
        }

        // Automatically add known types.
        if (memberMetadata.type) {
            objectMetadata.setKnownType(memberMetadata.type);
        }

        if (memberMetadata.elementType) {
            objectMetadata.setKnownType(memberMetadata.elementType);
        }

        // Register @JsonMember with @JsonObject (will overwrite previous member when used multiple times on same property).
        try {
            objectMetadata.addMember(memberMetadata);
        } catch (e) {
            let className = Helpers.getClassName(objectMetadata.classType);
            throw new Error(`@JsonMember: member '${memberMetadata.name}' already exists on '${className}'.`);
        }
    };

    if (typeof propertyKey === "string" || typeof propertyKey === "symbol") {
        // JsonMember is being used as a decorator, directly.
        return decorator(optionsOrTarget, propertyKey);
    } else {
        // JsonMember is being used as a decorator factory.
        return decorator;
    }
}
//#endregion

//#region "Serializer"
interface WriteSettings {
    objectType: { new (): any },
    elementType?: { new (): any },
    emitDefault?: boolean,
    typeHintPropertyKey: string,
    enableTypeHints?: boolean,
    requireTypeHints?: boolean,
    name?: string
}

abstract class Serializer {
    public static writeObject(object: any, settings: SerializerSettings): string {
        var objectMetadata = JsonObjectMetadata.getFromInstance(object);

        if (!objectMetadata || !objectMetadata.isExplicitlyMarked) {
            throw new Error("Type being serialized is not a @JsonObject.");
        }

        objectMetadata.sortMembers();

        return JSON.stringify(this.writeToJsonObject(object, {
            objectType: objectMetadata.classType,
            enableTypeHints: settings.enableTypeHints,
            typeHintPropertyKey: settings.typeHintPropertyKey
        }), settings.replacer);
    }

    /**
     * Convert a @JsonObject class instance to a JSON object for serialization.
     * @param object The instance to convert.
     * @param settings Settings defining how the instance should be serialized.
     */
    private static writeToJsonObject<T>(object: T, settings: WriteSettings): any {
        var json: any;
        var objectMetadata: JsonObjectMetadata<T>;
        
        if (object === null || typeof object === "undefined") {
            // Uninitialized or null object returned "as-is" (or default value if set).
            if (settings.emitDefault) {
                json = Helpers.getDefaultValue(settings.objectType);
            } else {
                json = object;
            }
        } else if (Helpers.isPrimitiveType(object) || object instanceof Date) {
            // Primitive types and Date stringified "as-is".
            json = object;
        } else if (object instanceof Array) {
            json = [];

            /*
            if (!settings.elementType) {
                // TODO: attempt to auto-infer elementType from array elements?
            }
            */

            for (var i = 0, n = (object as any).length; i < n; i++) {
                json.push(this.writeToJsonObject(object[i], Helpers.merge(settings, {
                    objectType: settings.elementType || Object
                })));
            }
        } else {
            // Object with properties.
            objectMetadata = JsonObjectMetadata.getFromInstance(object)
            
            if (objectMetadata && !objectMetadata.isExplicitlyMarked) {
                throw new Error("Class is not JsonObject.");
            }

            if (objectMetadata && typeof objectMetadata.serializer === "function") {
                json = objectMetadata.serializer(object);
            } else {
                json = {};

                // Add type-hint.
                if (settings.requireTypeHints || (object.constructor !== settings.objectType && settings.enableTypeHints)) {
                    json[settings.typeHintPropertyKey] = JsonObjectMetadata.getKnownTypeNameFromInstance(object);
                }

                if (objectMetadata) {
                    // Serialize @JsonMember properties.
                    objectMetadata.sortMembers();

                    Object.keys(objectMetadata.dataMembers).forEach(propertyKey => {
                        var propertyMetadata = objectMetadata.dataMembers[propertyKey];
                        
                        json[propertyMetadata.name] = this.writeToJsonObject(object[propertyKey], Helpers.merge(settings, {
                            objectType: propertyMetadata.type,
                            emitDefault: propertyMetadata.emitDefaultValue,
                            elementType: propertyMetadata.elementType || Object,
                            requireTypeHints: propertyMetadata.forceEnableTypeHinting || settings.requireTypeHints
                        }));
                    });
                } else {
                    // Serialize all own properties.
                    Object.keys(object).forEach(propertyKey => {
                        json[propertyKey] = this.writeToJsonObject(object[propertyKey], Helpers.merge(settings, {
                            objectType: Object,
                            elementType: Object
                        }));
                    });
                }
            }
        }

        return json;
    }
}
//#endregion

//#region "Deserializer"
interface ReadSettings<T> {
    objectType: { new (): T },
    isRequired?: boolean,
    elementType?: { new (): any },
    typeHintPropertyKey: string,
    enableTypeHints?: boolean,
    knownTypes?: { [name: string]: { new (): any } },
    requireTypeHints?: boolean;
    strictTypeHintMode?: boolean;
}

abstract class Deserializer {
    /**
     * Deserialize a JSON string into the provided type.
     * @param json The JSON string to deserialize.
     * @param type The type to deserialize into.
     * @param settings Serializer settings.
     * @throws Error if the provided type is not decorated with JsonObject.
     * @throws Error if 'settings' specifies 'maxObjects', and the JSON string exceeds that limit.
     */
    public static readObject<T>(json: string, type: { new (): T }, settings: SerializerSettings): T {
        var objectMetadata: JsonObjectMetadata<T>;
        var value: any;
        var instance: T;
        
        objectMetadata = JsonObjectMetadata.getFromType(type);
        value = JSON.parse(json, settings.reviver); // Parse text into basic object, which is then processed recursively.

        if (!objectMetadata || !objectMetadata.isExplicitlyMarked) {
            throw new Error(`The provided class '${Helpers.getClassName(type)}' is not a @JsonObject.`);
        }

        if (typeof settings.maxObjects === "number") {
            if (this.countObjects(value) > settings.maxObjects) {
                throw new Error(`JSON exceeds object count limit (${settings.maxObjects}).`);
            }
        }

        // Sort JsonMembers so that deserialization happens as set by ordering.
        objectMetadata.sortMembers();

        instance = this.readJsonToInstance(value, {
            objectType: type,
            typeHintPropertyKey: settings.typeHintPropertyKey,
            enableTypeHints: settings.enableTypeHints,
            strictTypeHintMode: true,
            knownTypes: {}
        });

        return instance;
    }

    private static countObjects(value: any): number {
        switch (typeof value) {
            case "object":
                if (value === null) {
                    return 0;
                } else if (Helpers.isArray(value)) {
                    // Count array elements.
                    let count = 0;

                    value.forEach(item => {
                        count += this.countObjects(item);
                    });

                    return count;
                } else {
                    // Count object properties.
                    let count = 0;

                    Object.keys(value).forEach(propertyKey => {
                        count += this.countObjects(value[propertyKey]);
                    });

                    return count;
                }

            case "undefined":
                return 0;

            default: // Primitives.
                return 1;
        }
    }

    private static readJsonToInstance<T>(
        json: any,
        settings: ReadSettings<T>
    ): T {
        var object: any;
        var objectMetadata: JsonObjectMetadata<any>;
        var ObjectType: Constructor<T>;
        var typeHint: string;
        var temp: any
        
        if (typeof json === "undefined" || json === null) {
            if (settings.isRequired) {
                throw new Error(`Missing required member.`);
            }
        } else if (Helpers.isPrimitiveType(settings.objectType)) {
            // number, string, boolean: assign directly.
            if (json.constructor !== settings.objectType) {
                let expectedTypeName = Helpers.getClassName(settings.objectType);
                let foundTypeName = Helpers.getClassName(json.constructor);

                throw new TypeError(`Expected value to be of type '${expectedTypeName}', got '${foundTypeName}'.`);
            }

            object = json;
        } else if (settings.objectType as any === Array) {
            // 'json' is expected to be an array.
            if (!Helpers.isArray(json)) {
                throw new TypeError(`Expected value to be of type 'Array', got '${Helpers.getClassName(json.constructor)}'.`);
            }

            object = [];

            json.forEach(element => {
                object.push(this.readJsonToInstance(element, Helpers.merge(settings, {
                    objectType: settings.elementType || Object,
                    elementType: Object
                })));
            });
        } else if (settings.objectType as any === Date) {
            // Built-in support for Date with ISO 8601.
            // Spec.: https://www.w3.org/TR/NOTE-datetime
            if (typeof json === "string") {
                object = new Date(json);
            } else {
                throw new TypeError(`Expected value to be of type 'string', got '${typeof json}'.`);
            }
        } else {
            // 'json' can only be an object, instatiate.
            typeHint = json[settings.typeHintPropertyKey];

            if (typeHint && settings.enableTypeHints) {
                if (typeof typeHint !== "string") {
                    throw new TypeError("Type-hint must be a string.");
                }

                // Check if type-hint refers to a known type.
                if (!settings.knownTypes[typeHint]) {
                    throw new Error(`'${typeHint}' is not a known type.`);
                }

                // In strict mode, check if type-hint is a subtype of the expected type.
                if (settings.strictTypeHintMode && !Helpers.isSubtypeOf(settings.knownTypes[typeHint], settings.objectType)) {
                    throw new Error(`'${typeHint}' is not a subtype of '${Helpers.getClassName(settings.objectType)}'.`);
                }

                ObjectType = settings.knownTypes[typeHint];
                objectMetadata = JsonObjectMetadata.getFromType(settings.knownTypes[typeHint]);
            } else {
                if (settings.enableTypeHints && settings.requireTypeHints) {
                    throw new Error("Missing required type-hint.");
                }

                ObjectType = settings.objectType;
                objectMetadata = JsonObjectMetadata.getFromType(settings.objectType);
            }
            
            if (objectMetadata) {
                if (!objectMetadata.isExplicitlyMarked) {
                    throw new Error("Class it not JsonObject.");
                }

                if (typeof objectMetadata.initializer === "function") {
                    // Let the initializer function handle it.
                    object = objectMetadata.initializer(json) || null;
                } else {
                    // Deserialize @JsonMembers.
                    object = new ObjectType();

                    Object.keys(objectMetadata.dataMembers).forEach(propertyKey => {
                        var propertyMetadata = objectMetadata.dataMembers[propertyKey];

                        temp = this.readJsonToInstance(json[propertyMetadata.name], Helpers.merge(settings, {
                            objectType: propertyMetadata.type,
                            elementType: propertyMetadata.elementType, // Might be undefined, doesn't matter.
                            isRequired: propertyMetadata.isRequired,
                            knownTypes: Helpers.merge(settings.knownTypes, objectMetadata.knownTypes),
                            requireTypeHints: propertyMetadata.forceEnableTypeHinting || false
                        }));

                        // Do not create undefined/null properties.
                        if (Helpers.valueIsDefined(temp)) {
                            object[propertyKey] = temp;
                        }
                    });
                }
            } else {
                // Deserialize each property of (from) 'json'.
                object = new ObjectType();

                Object.keys(json).forEach(propertyKey => {
                    // Skip type-hint when copying properties.
                    if (propertyKey !== settings.typeHintPropertyKey) {
                        object[propertyKey] = this.readJsonToInstance(json[propertyKey], Helpers.merge(settings, {
                            objectType: json[propertyKey].constructor,
                            knownTypes: settings.knownTypes
                        }));
                    }
                });
            }
        }

        return object;
    }
}
//#endregion

//#region "TypedJSON"
interface TypedJSON {
    /**
     * Converts a JavaScript Object Notation (JSON) string into an object.
     * @param text A valid JSON string.
     * @param reviver A function that transforms the results. This function is called for each member of the object. 
     * If a member contains nested objects, the nested objects are transformed before the parent object is. 
     */
    parse(text: string, reviver?: (key: any, value: any) => any): any;

    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     */
    stringify(value: any): string;

    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param replacer A function that transforms the results.
     */
    stringify(value: any, replacer: (key: string, value: any) => any): string;

    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param replacer Array that transforms the results.
     */
    stringify(value: any, replacer: any[]): string;

    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param replacer A function that transforms the results.
     * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    stringify(value: any, replacer: (key: string, value: any) => any, space: string | number): string;

    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param replacer Array that transforms the results.
     * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    stringify(value: any, replacer: any[], space: string | number): string;
    
    /**
     * Converts a JavaScript Object Notation (JSON) string into an instance of the provided class.
     * @param text A valid JSON string.
     * @param type A class from which an instance is created using the provided JSON string.
     */
    parse<T>(text: string, type: { new (): T }): T;
    
    /**
     * Configures TypedJSON with custom settings. New settings will be assigned to existing settings.
     * @param settings The settings object.
     */
    config(settings: SerializerSettings): TypedJSON;
}

// Default settings.
var configSettings: SerializerSettings = {
    enableTypeHints: true,
    typeHintPropertyKey: "__type"
};

var TypedJSON: TypedJSON = {
    config: function (settings: SerializerSettings) {
        configSettings = Helpers.merge(configSettings, settings);

        // For chained calls, like 'TypedJSON.config(...).parse(...)'.
        return this;
    },
    stringify: function (value: any): string {
        var metadata = JsonObjectMetadata.getFromInstance(value);

        if (metadata && metadata.isExplicitlyMarked) {
            // Use Serializer for custom serialization.
            return Serializer.writeObject(value, configSettings);
        } else {
            // Call original 'JSON.stringify'.
            return JSON.stringify.apply(JSON, arguments);
        }
    },
    parse: function (text: string, type?: any): any {
        var metadata = JsonObjectMetadata.getFromType<any>(type);

        if (typeof type === "function" && metadata && metadata.classType === type && metadata.isExplicitlyMarked) {
            // Use Deserializer for custom deserialization using the provided class type.
            return Deserializer.readObject(text, type, configSettings);
        } else {
            // Call original 'JSON.parse'.
            return JSON.parse.apply(JSON, arguments);
        }
    }
};
//#endregion

export { SerializerSettings, TypedJSON, JsonObjectOptions, JsonObject, JsonMemberOptions, JsonMember };