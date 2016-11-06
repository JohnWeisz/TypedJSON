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
    var JSON;
    if (!JSON) {
        JSON = {
            parse: function (sJSON) {
                var returnval = sJSON;
                if (typeof returnval === 'object') {
                    return returnval;
                }
                else {
                    return eval('(' + sJSON + ')');
                }
            },
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
    var Helpers;
    (function (Helpers) {
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
                targetType = target;
            }
            else if (typeof target === "object") {
                targetType = target.constructor;
            }
            if (!targetType) {
                return "undefined";
            }
            if ("name" in targetType && typeof targetType.name === "string") {
                return targetType.name;
            }
            else {
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
                metadata = targetPrototype[METADATA_FIELD_KEY];
            }
            else if (inherited && targetPrototype[METADATA_FIELD_KEY]) {
                metadata = targetPrototype[METADATA_FIELD_KEY];
            }
            if (metadata && metadata.isExplicitlyMarked) {
                return metadata;
            }
            else {
                return null;
            }
        };
        JsonObjectMetadata.getFromInstance = function (target, inherited) {
            if (inherited === void 0) { inherited = true; }
            return this.getFromType(Object.getPrototypeOf(target), inherited);
        };
        JsonObjectMetadata.getKnownTypeNameFromType = function (target) {
            var metadata = this.getFromType(target, false);
            if (metadata) {
                return metadata.className;
            }
            else {
                return Helpers.getClassName(target);
            }
        };
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
            get: function () {
                return this._dataMembers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonObjectMetadata.prototype, "className", {
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
            get: function () {
                var knownTypes;
                var knownTypeName;
                knownTypes = {};
                this._knownTypes.forEach(function (knownType) {
                    knownTypeName = JsonObjectMetadata.getKnownTypeNameFromType(knownType);
                    knownTypes[knownTypeName] = knownType;
                });
                this._knownTypeCache = knownTypes;
                return knownTypes;
            },
            enumerable: true,
            configurable: true
        });
        JsonObjectMetadata.prototype.setKnownType = function (type) {
            if (this._knownTypes.indexOf(type) === -1) {
                this._knownTypes.push(type);
                this._knownTypeCache = null;
            }
        };
        JsonObjectMetadata.prototype.addMember = function (member) {
            var _this = this;
            Object.keys(this._dataMembers).forEach(function (propertyKey) {
                if (_this._dataMembers[propertyKey].name === member.name) {
                    throw new Error("A member with the name '" + member.name + "' already exists.");
                }
            });
            this._dataMembers[member.key] = member;
        };
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
                if (a.name < b.name) {
                    return -1;
                }
                else if (a.name > b.name) {
                    return 1;
                }
            }
            else if (typeof a.order !== "number") {
                return 1;
            }
            else if (typeof b.order !== "number") {
                return -1;
            }
            else {
                if (a.order < b.order) {
                    return -1;
                }
                else if (a.order > b.order) {
                    return 1;
                }
                else {
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
            options = {};
        }
        else {
            options = optionsOrTarget || {};
        }
        var initializer = options.initializer;
        var serializer = options.serializer;
        var decorator = function (target) {
            var objectMetadata;
            var parentMetadata;
            var i;
            if (!target.prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
                objectMetadata = new JsonObjectMetadata();
                if (parentMetadata = target.prototype[METADATA_FIELD_KEY]) {
                    Object.keys(parentMetadata.dataMembers).forEach(function (memberPropertyKey) {
                        objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                    });
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
                    Helpers.error(new TypeError("@JsonObject: " + e.message + " (on '" + Helpers.getClassName(target) + "')"));
                }
            }
            if (typeof initializer === "function") {
                objectMetadata.initializer = initializer;
            }

            if (typeof serializer === "function") {
                objectMetadata.serializer = serializer;
            }
        };
        if (typeof optionsOrTarget === "function") {
            return decorator(optionsOrTarget);
        }
        else {
            return decorator;
        }
    }
    exports.JsonObject = JsonObject;
    function jsonMemberTypeInit(metadata, propertyName, warnArray) {
        if (warnArray === void 0) { warnArray = false; }
        if (metadata.elements) {
            if (typeof metadata.elements === "function") {
                metadata.elements = {
                    type: metadata.elements
                };
            }
            if (!metadata.type) {
                metadata.type = Array;
            }
        }
        if (metadata.type === Array) {
            if (!metadata.elements) {
                if (warnArray) {
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
            options = {};
        }
        else {
            options = optionsOrTarget || {};
        }
        decorator = function (target, propertyKey) {
            var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey.toString());
            ;
            var objectMetadata;
            var parentMetadata;
            var reflectType;
            var propertyName = Helpers.getPropertyDisplayName(target, propertyKey);
            if (typeof target === "function") {
                throw new TypeError("@JsonMember cannot be used on a static property ('" + propertyName + "').");
            }
            if (typeof target[propertyKey] === "function") {
                throw new TypeError("@JsonMember cannot be used on a method property ('" + propertyName + "').");
            }
            if (options.hasOwnProperty("elementType")) {
                Helpers.warn(propertyName + ": the 'elementType' option is deprecated, use 'elements' instead.");
                options.elements = options.elementType;
                if (options.elementType === Array) {
                    memberMetadata.forceEnableTypeHinting = true;
                }
            }
            memberMetadata = Helpers.assign(memberMetadata, options);
            memberMetadata.key = propertyKey.toString();
            memberMetadata.name = options.name || propertyKey.toString();
            if (Helpers.isReservedMemberName(memberMetadata.name)) {
                throw new Error("@JsonMember: '" + memberMetadata.name + "' is a reserved name.");
            }
            if (options.hasOwnProperty("type") && typeof options.type === "undefined") {
                throw new TypeError("@JsonMember: 'type' of '" + propertyName + "' is undefined.");
            }
            if (typeof Reflect === "object" && typeof Reflect.getMetadata === "function") {
                reflectType = Reflect.getMetadata("design:type", target, propertyKey);
                if (typeof reflectType === "undefined") {
                    throw new TypeError("@JsonMember: type detected for '" + propertyName + "' is undefined.");
                }
                if (!memberMetadata.type || typeof memberMetadata.type !== "function") {
                    memberMetadata.type = reflectType;
                }
                else if (memberMetadata.type !== reflectType) {
                    Helpers.warn("@JsonMember: 'type' specified for '" + propertyName + "' does not match detected type.");
                }
            }
            jsonMemberTypeInit(memberMetadata, propertyName);
            if (!target.hasOwnProperty(METADATA_FIELD_KEY)) {
                objectMetadata = new JsonObjectMetadata();
                if (parentMetadata = target[METADATA_FIELD_KEY]) {
                    Object.keys(parentMetadata.dataMembers).forEach(function (memberPropertyKey) {
                        objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                    });
                }
                Object.defineProperty(target, METADATA_FIELD_KEY, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: objectMetadata
                });
            }
            else {
                objectMetadata = target[METADATA_FIELD_KEY];
            }
            jsonMemberKnownTypes(memberMetadata).forEach(function (knownType) {
                objectMetadata.setKnownType(knownType);
            });
            try {
                objectMetadata.addMember(memberMetadata);
            }
            catch (e) {
                throw new Error("Member '" + memberMetadata.name + "' already exists on '" + Helpers.getClassName(objectMetadata.classType) + "'.");
            }
        };
        if (typeof propertyKey === "string" || typeof propertyKey === "symbol") {
            return decorator(optionsOrTarget, propertyKey);
        }
        else {
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
        Serializer.writeToJsonObject = function (object, settings) {
            var _this = this;
            var json;
            var objectMetadata;
            if (object === null || typeof object === "undefined") {
                if (settings.emitDefault) {
                    json = Helpers.getDefaultValue(settings.objectType);
                }
                else {
                    json = object;
                }
            }
            else if (Helpers.isPrimitive(object) || object instanceof Date) {
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
                objectMetadata = JsonObjectMetadata.getFromInstance(object);
                if (objectMetadata && typeof objectMetadata.serializer === "function") {
                    json = objectMetadata.serializer(object);
                }
                else {
                    json = {};
                    if (settings.enableTypeHints && (settings.requireTypeHints || object.constructor !== settings.objectType)) {
                        json[settings.typeHintPropertyKey] = JsonObjectMetadata.getKnownTypeNameFromInstance(object);
                    }
                    if (objectMetadata) {
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
        Deserializer.readObject = function (json, type, settings) {
            var value;
            var instance;
            var metadata = JsonObjectMetadata.getFromType(type);
            if (typeof json === 'Object') {
                value = json;
            }
            else {
                value = JSON.parse(json, settings.reviver);
            }
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
                        var count_1 = 0;
                        value.forEach(function (item) {
                            count_1 += _this.countObjects(item);
                        });
                        return count_1;
                    }
                    else {
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
                if (json.constructor !== settings.objectType) {
                    var expectedTypeName = Helpers.getClassName(settings.objectType).toLowerCase();
                    var foundTypeName = Helpers.getClassName(json.constructor).toLowerCase();
                    throw new TypeError("Expected value to be of type '" + expectedTypeName + "', got '" + foundTypeName + "'.");
                }
                object = json;
            }
            else if (settings.objectType === Array) {
                if (!Helpers.isArray(json)) {
                    throw new TypeError("Expected value to be of type 'Array', got '" + Helpers.getClassName(json.constructor) + "'.");
                }
                object = [];
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
                if (typeof json === "string") {
                    object = new Date(json);
                }
                else if (json instanceof Date) {
                    object = json;
                }
                else {
                    throw new TypeError("Expected value to be of type 'string', got '" + typeof json + "'.");
                }
            }
            else {
                typeHint = json[settings.typeHintPropertyKey];
                if (typeHint && settings.enableTypeHints) {
                    if (typeof typeHint !== "string") {
                        throw new TypeError("Type-hint (" + settings.typeHintPropertyKey + ") must be a string.");
                    }
                    if (!settings.knownTypes[typeHint]) {
                        throw new Error("'" + typeHint + "' is not a known type.");
                    }
                    if (settings.strictTypeHintMode && !Helpers.isSubtypeOf(settings.knownTypes[typeHint], settings.objectType)) {
                        throw new Error("'" + typeHint + "' is not a subtype of '" + Helpers.getClassName(settings.objectType) + "'.");
                    }
                    ObjectType = settings.knownTypes[typeHint];
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
                        object = objectMetadata.initializer(json) || null;
                    }
                    else {
                        objectMetadata.sortMembers();
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
                            if (Helpers.valueIsDefined(temp)) {
                                object[propertyKey] = temp;
                            }
                        });
                    }
                }
                else {
                    object = {};
                    Object.keys(json).forEach(function (propertyKey) {
                        if (json[propertyKey] && propertyKey !== settings.typeHintPropertyKey) {
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
});
