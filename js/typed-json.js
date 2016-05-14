/*!
TypedJSON v0.2.0 - https://github.com/JohnWhiteTB/TypedJSON

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
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    var METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";
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
                    }
                    else if (typeof value === 'number') {
                        return isFinite(value) ? value.toString() : 'null';
                    }
                    else if (typeof value === 'boolean') {
                        return value.toString();
                    }
                    else if (typeof value === 'object') {
                        if (typeof value.toJSON === 'function') {
                            return stringify(value.toJSON());
                        }
                        else if (isArray(value)) {
                            var res = '[';
                            for (var i = 0; i < value.length; i++)
                                res += (i ? ', ' : '') + stringify(value[i]);
                            return res + ']';
                        }
                        else if (toString.call(value) === '[object Object]') {
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
    var Helpers;
    (function (Helpers) {
        /**
         * Polyfill for Object.assign.
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
        Helpers.assign = assign;
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
        Helpers.error = error;
        function getClassName(target) {
            var targetType;
            if (typeof target === "function") {
                // target is constructor function.
                targetType = target;
            }
            else if (typeof target === "object") {
                // target is class prototype.
                targetType = target.constructor;
            }
            if (!targetType) {
                return "undefined";
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
        Helpers.getClassName = getClassName;
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
        Helpers.getDefaultValue = getDefaultValue;
        function getPropertyDisplayName(target, propertyKey) {
            return getClassName(target) + "." + propertyKey.toString();
        }
        Helpers.getPropertyDisplayName = getPropertyDisplayName;
        function isArray(object) {
            if (typeof Array.isArray === "function") {
                return Array.isArray(object);
            }
            else {
                if (object instanceof Array) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        Helpers.isArray = isArray;
        function isPrimitive(obj) {
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
        Helpers.isPrimitive = isPrimitive;
        function isReservedMemberName(name) {
            return (name === METADATA_FIELD_KEY);
        }
        Helpers.isReservedMemberName = isReservedMemberName;
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
        Helpers.isSubtypeOf = isSubtypeOf;
        function log(message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            if (typeof console === "object" && typeof console.log === "function") {
                console.log.apply(console, [message].concat(optionalParams));
            }
        }
        Helpers.log = log;
        /**
         * Copy the values of all enumerable own properties from one or more source objects to a shallow copy of the target object.
         * It will return the new object.
         * @param target The target object.
         * @param sources The source object(s).
         */
        function merge(target) {
            var sources = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sources[_i - 1] = arguments[_i];
            }
            var output;
            var source;
            if (target === undefined || target === null) {
                throw new TypeError("Cannot convert undefined or null to object");
            }
            output = {};
            Object.keys(target).forEach(function (nextKey) {
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
        Helpers.merge = merge;
        function valueIsDefined(value) {
            if (typeof value === "undefined" || value === null) {
                return false;
            }
            else {
                return true;
            }
        }
        Helpers.valueIsDefined = valueIsDefined;
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
        Helpers.warn = warn;
    })(Helpers || (Helpers = {}));
    //#endregion
    //#region "Metadata"
    var JsonMemberMetadata = (function () {
        function JsonMemberMetadata() {
        }
        return JsonMemberMetadata;
    }());
    var JsonObjectMetadata = (function () {
        function JsonObjectMetadata() {
            this._dataMembers = {};
            this._knownTypes = [];
            this._knownTypeCache = null;
            this.isExplicitlyMarked = false;
        }
        /**
         * Gets the name of a class as it appears in a serialized JSON string.
         * @param type The JsonObject class.
         * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
         */
        JsonObjectMetadata.getJsonObjectName = function (type, inherited) {
            if (inherited === void 0) { inherited = true; }
            var metadata = this.getFromType(type, inherited);
            if (metadata !== null) {
                return metadata.className;
            }
            else {
                return Helpers.getClassName(type);
            }
        };
        JsonObjectMetadata.getFromType = function (target, inherited) {
            if (inherited === void 0) { inherited = true; }
            var targetPrototype;
            var metadata;
            if (typeof target === "function") {
                targetPrototype = target.prototype;
            }
            else {
                targetPrototype = target;
            }
            if (!targetPrototype) {
                return null;
            }
            if (targetPrototype.hasOwnProperty(METADATA_FIELD_KEY)) {
                // The class prototype contains own JsonObject metadata.
                metadata = targetPrototype[METADATA_FIELD_KEY];
            }
            else if (inherited && targetPrototype[METADATA_FIELD_KEY]) {
                // The class prototype inherits JsonObject metadata.
                metadata = targetPrototype[METADATA_FIELD_KEY];
            }
            if (metadata && metadata.isExplicitlyMarked) {
                // Ignore implicitly added JsonObject.
                return metadata;
            }
            else {
                return null;
            }
        };
        /**
         * Gets JsonObject metadata information from a class instance.
         * @param target The target instance.
         * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
         * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
         */
        JsonObjectMetadata.getFromInstance = function (target, inherited) {
            if (inherited === void 0) { inherited = true; }
            return this.getFromType(Object.getPrototypeOf(target), inherited);
        };
        /**
         * Gets the known type name of a JsonObject class for type hint.
         * @param target The target class.
         */
        JsonObjectMetadata.getKnownTypeNameFromType = function (target) {
            var metadata = this.getFromType(target, false);
            if (metadata) {
                return metadata.className;
            }
            else {
                return Helpers.getClassName(target);
            }
        };
        /**
         * Gets the known type name of a JsonObject instance for type hint.
         * @param target The target instance.
         */
        JsonObjectMetadata.getKnownTypeNameFromInstance = function (target) {
            var metadata = this.getFromInstance(target, false);
            if (metadata) {
                return metadata.className;
            }
            else {
                return Helpers.getClassName(target.constructor);
            }
        };
        Object.defineProperty(JsonObjectMetadata.prototype, "dataMembers", {
            /** Gets the metadata of all JsonMembers of the JsonObject as key-value pairs. */
            get: function () {
                return this._dataMembers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonObjectMetadata.prototype, "className", {
            /** Gets or sets the name of the JsonObject as it appears in the serialized JSON. */
            get: function () {
                if (typeof this._className === "string") {
                    return this._className;
                }
                else {
                    return Helpers.getClassName(this.classType);
                }
            },
            set: function (value) {
                this._className = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonObjectMetadata.prototype, "knownTypes", {
            /** Gets a key-value collection of the currently known types for this JsonObject. */
            get: function () {
                var knownTypes;
                var knownTypeName;
                if (false && this._knownTypeCache) {
                    return this._knownTypeCache;
                }
                else {
                    knownTypes = {};
                    this._knownTypes.forEach(function (knownType) {
                        // KnownType names are not inherited from JsonObject settings, as it would render them useless.
                        knownTypeName = JsonObjectMetadata.getKnownTypeNameFromType(knownType);
                        knownTypes[knownTypeName] = knownType;
                    });
                    this._knownTypeCache = knownTypes;
                    return knownTypes;
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Sets a known type.
         * @param type The known type.
         */
        JsonObjectMetadata.prototype.setKnownType = function (type) {
            if (this._knownTypes.indexOf(type) === -1) {
                this._knownTypes.push(type);
                this._knownTypeCache = null;
            }
        };
        /**
         * Adds a JsonMember to the JsonObject.
         * @param member The JsonMember metadata.
         * @throws Error if a JsonMember with the same name already exists.
         */
        JsonObjectMetadata.prototype.addMember = function (member) {
            var _this = this;
            Object.keys(this._dataMembers).forEach(function (propertyKey) {
                if (_this._dataMembers[propertyKey].name === member.name) {
                    throw new Error("A member with the name '" + member.name + "' already exists.");
                }
            });
            this._dataMembers[member.key] = member;
        };
        /**
         * Sorts data members:
         *  1. Ordered members in defined order
         *  2. Unordered members in alphabetical order
         */
        JsonObjectMetadata.prototype.sortMembers = function () {
            var _this = this;
            var memberArray = [];
            Object.keys(this._dataMembers).forEach(function (propertyKey) {
                memberArray.push(_this._dataMembers[propertyKey]);
            });
            memberArray = memberArray.sort(this.sortMembersCompare);
            this._dataMembers = {};
            memberArray.forEach(function (dataMember) {
                _this._dataMembers[dataMember.key] = dataMember;
            });
        };
        JsonObjectMetadata.prototype.sortMembersCompare = function (a, b) {
            if (typeof a.order !== "number" && typeof b.order !== "number") {
                // a and b both both implicitly ordered, alphabetical order
                if (a.name < b.name) {
                    return -1;
                }
                else if (a.name > b.name) {
                    return 1;
                }
            }
            else if (typeof a.order !== "number") {
                // a is implicitly ordered, comes after b (compare: a is greater)
                return 1;
            }
            else if (typeof b.order !== "number") {
                // b is implicitly ordered, comes after a (compare: b is greater)
                return -1;
            }
            else {
                // a and b are both explicitly ordered
                if (a.order < b.order) {
                    return -1;
                }
                else if (a.order > b.order) {
                    return 1;
                }
                else {
                    // ordering is the same, use alphabetical order
                    if (a.name < b.name) {
                        return -1;
                    }
                    else if (a.name > b.name) {
                        return 1;
                    }
                }
            }
            return 0;
        };
        return JsonObjectMetadata;
    }());
    function JsonObject(optionsOrTarget) {
        var options;
        if (typeof optionsOrTarget === "function") {
            // JsonObject is being used as a decorator, directly.
            options = {};
        }
        else {
            // JsonObject is being used as a decorator factory.
            options = optionsOrTarget || {};
        }
        var initializer = options.initializer;
        var decorator = function (target) {
            var objectMetadata;
            var parentMetadata;
            var i;
            if (!target.prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
                objectMetadata = new JsonObjectMetadata();
                // If applicable, inherit @JsonMembers and @KnownTypes from parent @JsonObject.
                if (parentMetadata = target.prototype[METADATA_FIELD_KEY]) {
                    // @JsonMembers
                    Object.keys(parentMetadata.dataMembers).forEach(function (memberPropertyKey) {
                        objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                    });
                    // @KnownTypes
                    Object.keys(parentMetadata.knownTypes).forEach(function (key) {
                        objectMetadata.setKnownType(parentMetadata.knownTypes[key]);
                    });
                }
                Object.defineProperty(target.prototype, METADATA_FIELD_KEY, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: objectMetadata
                });
            }
            else {
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
                    options.knownTypes.forEach(function (knownType) {
                        if (typeof knownType === "undefined") {
                            throw new TypeError("Known type #" + i++ + " is undefined.");
                        }
                        objectMetadata.setKnownType(knownType);
                    });
                }
                catch (e) {
                    // The missing known type might not cause trouble at all, thus the error is printed, but not thrown.
                    Helpers.error(new TypeError("@JsonObject: " + e.message + " (on '" + Helpers.getClassName(target) + "')"));
                }
            }
            if (typeof initializer === "function") {
                objectMetadata.initializer = initializer;
            }
        };
        if (typeof optionsOrTarget === "function") {
            // JsonObject is being used as a decorator, directly.
            return decorator(optionsOrTarget);
        }
        else {
            // JsonObject is being used as a decorator factory.
            return decorator;
        }
    }
    exports.JsonObject = JsonObject;
    function jsonMemberTypeInit(metadata, propertyName, warnArray) {
        if (warnArray === void 0) { warnArray = false; }
        if (metadata.elements) {
            // 'elements' type shorthand.
            if (typeof metadata.elements === "function") {
                // Type shorthand was used.
                metadata.elements = {
                    type: metadata.elements
                };
            }
            if (!metadata.type) {
                // If the 'elements' option is set, 'type' is automatically assumed to be 'Array' unless specified.
                metadata.type = Array;
            }
        }
        if (metadata.type === Array) {
            if (!metadata.elements) {
                if (warnArray) {
                    // Provide backwards compatibility.
                    Helpers.warn("No valid 'elements' option was specified for '" + propertyName + "'.");
                }
                else {
                    throw new Error("No valid 'elements' option was specified for '" + propertyName + "'.");
                }
            }
            else {
                jsonMemberTypeInit(metadata.elements, propertyName + '[]', true);
            }
        }
        if (typeof metadata.type !== "function") {
            throw new Error("No valid 'type' option was specified for '" + propertyName + "'.");
        }
    }
    function jsonMemberKnownTypes(metadata) {
        var knownTypes = new Array();
        knownTypes.push(metadata.type);
        if (metadata.elements) {
            knownTypes = knownTypes.concat(jsonMemberKnownTypes(metadata.elements));
        }
        return knownTypes;
    }
    function JsonMember(optionsOrTarget, propertyKey) {
        var memberMetadata = new JsonMemberMetadata();
        var options;
        var decorator;
        if (typeof propertyKey === "string" || typeof propertyKey === "symbol") {
            // JsonMember is being used as a decorator, directly.
            options = {};
        }
        else {
            // JsonMember is being used as a decorator factory.
            options = optionsOrTarget || {};
        }
        decorator = function (target, propertyKey) {
            var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey.toString());
            ;
            var objectMetadata;
            var parentMetadata;
            var reflectType;
            var propertyName = Helpers.getPropertyDisplayName(target, propertyKey); // For error messages.
            // When a property decorator is applied to a static member, 'target' is a constructor function.
            // See: https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
            // And static members are not supported.
            if (typeof target === "function") {
                throw new TypeError("@JsonMember cannot be used on a static property ('" + propertyName + "').");
            }
            // Methods cannot be serialized.
            if (typeof target[propertyKey] === "function") {
                throw new TypeError("@JsonMember cannot be used on a method property ('" + propertyName + "').");
            }
            // 'elementType' is deprecated, but still provide backwards compatibility for now.
            if (options.hasOwnProperty("elementType")) {
                Helpers.warn(propertyName + ": the 'elementType' option is deprecated, use 'elements' instead.");
                options.elements = options.elementType;
                if (options.elementType === Array) {
                    memberMetadata.forceEnableTypeHinting = true;
                }
            }
            memberMetadata = Helpers.assign(memberMetadata, options);
            memberMetadata.key = propertyKey.toString();
            memberMetadata.name = options.name || propertyKey.toString(); // Property key is used as default member name if not specified.
            // Check for reserved member names.
            if (Helpers.isReservedMemberName(memberMetadata.name)) {
                throw new Error("@JsonMember: '" + memberMetadata.name + "' is a reserved name.");
            }
            // It is a common error for types to exist at compile time, but not at runtime (often caused by improper/misbehaving imports).
            if (options.hasOwnProperty("type") && typeof options.type === "undefined") {
                throw new TypeError("@JsonMember: 'type' of '" + propertyName + "' is undefined.");
            }
            // ReflectDecorators support to auto-infer property types.
            //#region "Reflect Metadata support"
            if (typeof Reflect === "object" && typeof Reflect.getMetadata === "function") {
                reflectType = Reflect.getMetadata("design:type", target, propertyKey);
                if (typeof reflectType === "undefined") {
                    // If Reflect.getMetadata exists, functionality for *setting* metadata should also exist, and metadata *should* be set.
                    throw new TypeError("@JsonMember: type detected for '" + propertyName + "' is undefined.");
                }
                if (!memberMetadata.type || typeof memberMetadata.type !== "function") {
                    // Get type information using reflect metadata.
                    memberMetadata.type = reflectType;
                }
                else if (memberMetadata.type !== reflectType) {
                    Helpers.warn("@JsonMember: 'type' specified for '" + propertyName + "' does not match detected type.");
                }
            }
            //#endregion "Reflect Metadata support"
            // Ensure valid types have been specified ('type' at all times, 'elements' for arrays).
            jsonMemberTypeInit(memberMetadata, propertyName);
            // Add JsonObject metadata to 'target' if not yet exists ('target' is the prototype).
            // NOTE: this will not fire up custom serialization, as 'target' must be explicitly marked with '@JsonObject' as well.
            if (!target.hasOwnProperty(METADATA_FIELD_KEY)) {
                // No *own* metadata, create new.
                objectMetadata = new JsonObjectMetadata();
                // Inherit @JsonMembers from parent @JsonObject, if any.
                if (parentMetadata = target[METADATA_FIELD_KEY]) {
                    Object.keys(parentMetadata.dataMembers).forEach(function (memberPropertyKey) {
                        objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                    });
                }
                // ('target' is the prototype of the involved class, metadata information is added to the class prototype).
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
            // Automatically add known types.
            jsonMemberKnownTypes(memberMetadata).forEach(function (knownType) {
                objectMetadata.setKnownType(knownType);
            });
            // Register @JsonMember with @JsonObject (will override previous member when used multiple times on same property).
            try {
                objectMetadata.addMember(memberMetadata);
            }
            catch (e) {
                throw new Error("Member '" + memberMetadata.name + "' already exists on '" + Helpers.getClassName(objectMetadata.classType) + "'.");
            }
        };
        if (typeof propertyKey === "string" || typeof propertyKey === "symbol") {
            // JsonMember is being used as a decorator, call decorator function directly.
            return decorator(optionsOrTarget, propertyKey);
        }
        else {
            // JsonMember is being used as a decorator factory, return decorator function.
            return decorator;
        }
    }
    exports.JsonMember = JsonMember;
    var Serializer = (function () {
        function Serializer() {
        }
        Serializer.writeObject = function (object, settings) {
            var objectMetadata = JsonObjectMetadata.getFromInstance(object);
            var ObjectType;
            if (objectMetadata) {
                ObjectType = objectMetadata.classType;
            }
            else {
                ObjectType = object.constructor;
            }
            return JSON.stringify(this.writeToJsonObject(object, {
                objectType: ObjectType,
                enableTypeHints: settings.enableTypeHints,
                typeHintPropertyKey: settings.typeHintPropertyKey
            }), settings.replacer);
        };
        /**
         * Convert a @JsonObject class instance to a JSON object for serialization.
         * @param object The instance to convert.
         * @param settings Settings defining how the instance should be serialized.
         */
        Serializer.writeToJsonObject = function (object, settings) {
            var _this = this;
            var json;
            var objectMetadata;
            if (object === null || typeof object === "undefined") {
                // Uninitialized or null object returned "as-is" (or default value if set).
                if (settings.emitDefault) {
                    json = Helpers.getDefaultValue(settings.objectType);
                }
                else {
                    json = object;
                }
            }
            else if (Helpers.isPrimitive(object) || object instanceof Date) {
                // Primitive types and Date stringified "as-is".
                json = object;
            }
            else if (object instanceof Array) {
                json = [];
                for (var i = 0, n = object.length; i < n; i++) {
                    json.push(this.writeToJsonObject(object[i], {
                        elements: settings.elements ? settings.elements.elements : null,
                        enableTypeHints: settings.enableTypeHints,
                        objectType: settings.elements ? settings.elements.type : Object,
                        requireTypeHints: settings.requireTypeHints,
                        typeHintPropertyKey: settings.typeHintPropertyKey
                    }));
                }
            }
            else {
                // Object with properties.
                objectMetadata = JsonObjectMetadata.getFromInstance(object);
                if (objectMetadata && typeof objectMetadata.serializer === "function") {
                    json = objectMetadata.serializer(object);
                }
                else {
                    json = {};
                    // Add type-hint.
                    if (settings.enableTypeHints && (settings.requireTypeHints || object.constructor !== settings.objectType)) {
                        json[settings.typeHintPropertyKey] = JsonObjectMetadata.getKnownTypeNameFromInstance(object);
                    }
                    if (objectMetadata) {
                        // Serialize @JsonMember properties.
                        objectMetadata.sortMembers();
                        Object.keys(objectMetadata.dataMembers).forEach(function (propertyKey) {
                            var propertyMetadata = objectMetadata.dataMembers[propertyKey];
                            json[propertyMetadata.name] = _this.writeToJsonObject(object[propertyKey], {
                                elements: propertyMetadata.elements,
                                emitDefault: propertyMetadata.emitDefaultValue,
                                enableTypeHints: settings.enableTypeHints,
                                name: propertyMetadata.name,
                                objectType: propertyMetadata.type,
                                requireTypeHints: settings.requireTypeHints,
                                typeHintPropertyKey: settings.typeHintPropertyKey
                            });
                        });
                    }
                    else {
                        // Serialize all own properties.
                        Object.keys(object).forEach(function (propertyKey) {
                            json[propertyKey] = _this.writeToJsonObject(object[propertyKey], {
                                enableTypeHints: settings.enableTypeHints,
                                objectType: Object,
                                requireTypeHints: settings.requireTypeHints,
                                typeHintPropertyKey: settings.typeHintPropertyKey
                            });
                        });
                    }
                }
            }
            return json;
        };
        return Serializer;
    }());
    var Deserializer = (function () {
        function Deserializer() {
        }
        /**
         * Deserialize a JSON string into the provided type.
         * @param json The JSON string to deserialize.
         * @param type The type to deserialize into.
         * @param settings Serializer settings.
         * @throws Error if 'settings' specifies 'maxObjects', and the JSON string exceeds that limit.
         */
        Deserializer.readObject = function (json, type, settings) {
            var value;
            var instance;
            var metadata = JsonObjectMetadata.getFromType(type);
            value = JSON.parse(json, settings.reviver); // Parse text into basic object, which is then processed recursively.
            if (typeof settings.maxObjects === "number") {
                if (this.countObjects(value) > settings.maxObjects) {
                    throw new Error("JSON exceeds object count limit (" + settings.maxObjects + ").");
                }
            }
            instance = this.readJsonToInstance(value, {
                objectType: type,
                typeHintPropertyKey: settings.typeHintPropertyKey,
                enableTypeHints: settings.enableTypeHints,
                strictTypeHintMode: true,
                knownTypes: metadata ? metadata.knownTypes : {}
            });
            return instance;
        };
        Deserializer.countObjects = function (value) {
            var _this = this;
            switch (typeof value) {
                case "object":
                    if (value === null) {
                        return 0;
                    }
                    else if (Helpers.isArray(value)) {
                        // Count array elements.
                        var count_1 = 0;
                        value.forEach(function (item) {
                            count_1 += _this.countObjects(item);
                        });
                        return count_1;
                    }
                    else {
                        // Count object properties.
                        var count_2 = 0;
                        Object.keys(value).forEach(function (propertyKey) {
                            count_2 += _this.countObjects(value[propertyKey]);
                        });
                        return count_2;
                    }
                case "undefined":
                    return 0;
                default:
                    return 1;
            }
        };
        Deserializer.readJsonToInstance = function (json, settings) {
            var _this = this;
            var object;
            var objectMetadata;
            var ObjectType;
            var typeHint;
            var temp;
            var knownTypes;
            if (typeof json === "undefined" || json === null) {
                if (settings.isRequired) {
                    throw new Error("Missing required member.");
                }
            }
            else if (Helpers.isPrimitive(settings.objectType)) {
                // number, string, boolean: assign directly.
                if (json.constructor !== settings.objectType) {
                    var expectedTypeName = Helpers.getClassName(settings.objectType).toLowerCase();
                    var foundTypeName = Helpers.getClassName(json.constructor).toLowerCase();
                    throw new TypeError("Expected value to be of type '" + expectedTypeName + "', got '" + foundTypeName + "'.");
                }
                object = json;
            }
            else if (settings.objectType === Array) {
                // 'json' is expected to be an Array.
                if (!Helpers.isArray(json)) {
                    throw new TypeError("Expected value to be of type 'Array', got '" + Helpers.getClassName(json.constructor) + "'.");
                }
                object = [];
                // Read array elements recursively.
                json.forEach(function (element) {
                    object.push(_this.readJsonToInstance(element, {
                        elements: settings.elements ? settings.elements.elements : null,
                        enableTypeHints: settings.enableTypeHints,
                        knownTypes: settings.knownTypes,
                        objectType: settings.elements ? settings.elements.type : element.constructor,
                        requireTypeHints: settings.requireTypeHints,
                        strictTypeHintMode: settings.strictTypeHintMode,
                        typeHintPropertyKey: settings.typeHintPropertyKey
                    }));
                });
            }
            else if (settings.objectType === Date) {
                // Built-in support for Date with ISO 8601 format.
                // ISO 8601 spec.: https://www.w3.org/TR/NOTE-datetime
                if (typeof json === "string") {
                    object = new Date(json);
                }
                else {
                    throw new TypeError("Expected value to be of type 'string', got '" + typeof json + "'.");
                }
            }
            else {
                // 'json' can only be an object.
                // Check if a type-hint is present.
                typeHint = json[settings.typeHintPropertyKey];
                if (typeHint && settings.enableTypeHints) {
                    if (typeof typeHint !== "string") {
                        throw new TypeError("Type-hint (" + settings.typeHintPropertyKey + ") must be a string.");
                    }
                    // Check if type-hint refers to a known type.
                    if (!settings.knownTypes[typeHint]) {
                        throw new Error("'" + typeHint + "' is not a known type.");
                    }
                    // In strict mode, check if type-hint is a subtype of the expected type.
                    if (settings.strictTypeHintMode && !Helpers.isSubtypeOf(settings.knownTypes[typeHint], settings.objectType)) {
                        throw new Error("'" + typeHint + "' is not a subtype of '" + Helpers.getClassName(settings.objectType) + "'.");
                    }
                    // Type-hinting was enabled and a valid type-hint has been found.
                    ObjectType = settings.knownTypes[typeHint];
                    // Also replace object metadata with that of what was referenced in the type-hint.
                    objectMetadata = JsonObjectMetadata.getFromType(ObjectType);
                }
                else {
                    if (settings.enableTypeHints && settings.requireTypeHints) {
                        throw new Error("Missing required type-hint.");
                    }
                    ObjectType = settings.objectType;
                    objectMetadata = JsonObjectMetadata.getFromType(settings.objectType);
                }
                if (objectMetadata) {
                    if (typeof objectMetadata.initializer === "function") {
                        // Let the initializer function handle it.
                        object = objectMetadata.initializer(json) || null;
                    }
                    else {
                        // Deserialize @JsonMembers.
                        object = new ObjectType();
                        Object.keys(objectMetadata.dataMembers).forEach(function (propertyKey) {
                            var propertyMetadata = objectMetadata.dataMembers[propertyKey];
                            temp = _this.readJsonToInstance(json[propertyMetadata.name], {
                                elements: propertyMetadata.elements,
                                enableTypeHints: settings.enableTypeHints,
                                isRequired: propertyMetadata.isRequired,
                                knownTypes: Helpers.merge(settings.knownTypes, objectMetadata.knownTypes || {}),
                                objectType: propertyMetadata.type,
                                requireTypeHints: settings.requireTypeHints,
                                strictTypeHintMode: settings.strictTypeHintMode,
                                typeHintPropertyKey: settings.typeHintPropertyKey
                            });
                            // Do not make undefined/null property assignments.
                            if (Helpers.valueIsDefined(temp)) {
                                object[propertyKey] = temp;
                            }
                        });
                    }
                }
                else {
                    // Deserialize each property of (from) 'json'.
                    object = {};
                    Object.keys(json).forEach(function (propertyKey) {
                        // Skip type-hint when copying properties.
                        if (propertyKey !== settings.typeHintPropertyKey) {
                            object[propertyKey] = _this.readJsonToInstance(json[propertyKey], {
                                enableTypeHints: settings.enableTypeHints,
                                knownTypes: settings.knownTypes,
                                objectType: json[propertyKey].constructor,
                                requireTypeHints: settings.requireTypeHints,
                                typeHintPropertyKey: settings.typeHintPropertyKey
                            });
                        }
                    });
                }
            }
            return object;
        };
        return Deserializer;
    }());
    // Default settings.
    var configSettings = {
        enableTypeHints: true,
        typeHintPropertyKey: "__type"
    };
    var TypedJSON = {
        config: function (settings) {
            configSettings = Helpers.merge(configSettings, settings);
        },
        stringify: function (value, settings) {
            return Serializer.writeObject(value, Helpers.merge(configSettings, settings || {}));
        },
        parse: function (json, type, settings) {
            if (JsonObjectMetadata.getFromType(type)) {
                return Deserializer.readObject(json, type, Helpers.merge(configSettings, settings || {}));
            }
            else {
                return JSON.parse.apply(JSON, arguments);
            }
        }
    };
    exports.TypedJSON = TypedJSON;
    //#endregion
});
