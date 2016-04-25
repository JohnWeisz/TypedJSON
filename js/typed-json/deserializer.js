define(["require", "exports", "./polyfill", "./types", "./json-metadata", "./helpers"], function (require, exports, polyfill_1, types_1, json_metadata_1, Helpers) {
    "use strict";
    if (!JSON) {
        JSON = polyfill_1.JSONpolyfill();
    }
    var Deserializer = (function () {
        function Deserializer() {
        }
        /**
         * Deserialize a JSON string into the provided type.
         * @param json The JSON string to deserialize.
         * @param type The type to deserialize into.
         * @param settings Serializer settings.
         * @throws Error if the provided type is not decorated with JsonObject.
         * @throws Error if 'settings' specifies 'maxObjects', and the JSON string exceeds that limit.
         */
        Deserializer.readObject = function (json, type, settings) {
            var objectMetadata = json_metadata_1.JsonObjectMetadata.getJsonObjectMetadataFromType(type);
            var value = JSON.parse(json); // Parse text into basic object, which is then processed recursively.
            var instance;
            if (!objectMetadata) {
                throw new Error("The provided class '" + Helpers.getClassName(type) + "' is not a @JsonObject.");
            }
            settings = settings || {};
            if (typeof settings.maxObjects === "number") {
                if (this.countObjects(value) > settings.maxObjects) {
                    throw new Error("JSON exceeds object count limit (" + settings.maxObjects + ").");
                }
            }
            // Sort JsonMembers so that deserialization happens as set by ordering.
            objectMetadata.sortMembers();
            instance = this.readJsonToInstance(value, {
                objectType: type,
                typeHintSyntax: settings.typeHinting || types_1.TypeHint.DataContract
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
            var typeHintPropertyKey = Helpers.getTypeHintPropertyKey(settings.typeHintSyntax);
            // Default settings.
            settings = Helpers.assign({
                objectType: Object,
                knownTypes: {}
            }, settings || {});
            if (typeof json === "undefined" || json === null) {
                if (settings.isRequired) {
                    throw new Error("Missing required member.");
                }
            }
            else if (Helpers.isPrimitiveType(settings.objectType)) {
                // number, string, boolean: assign directly so that primitives are kept.
                object = json;
            }
            else if (settings.objectType === Array) {
                // 'json' is expected to be an array.
                if (!Helpers.isArray(json)) {
                    throw new TypeError("Expected value to be an 'Array', got '" + Helpers.getClassName(json) + "'.");
                }
                object = [];
                json.forEach(function (element) {
                    object.push(_this.readJsonToInstance(element, {
                        objectType: settings.elementType || Object,
                        typeHintSyntax: settings.typeHintSyntax,
                        knownTypes: settings.knownTypes // Pass on known types to elements.
                    }));
                });
            }
            else if (settings.objectType === Date) {
                // Built-in support for Date with ISO 8601.
                // Spec.: https://www.w3.org/TR/NOTE-datetime
                if (typeof json === "string") {
                    object = new Date(json);
                }
                else {
                    throw new TypeError("Expected value to be of type 'string', got '" + typeof json + "'.");
                }
            }
            else {
                // 'json' can only be an object, instatiate.
                typeHint = this.trimTypeHintNamespace(json[typeHintPropertyKey], settings.typeHintSyntax);
                if (typeof typeHint === "string") {
                    if (!settings.knownTypes[typeHint]) {
                        throw new Error("'" + typeHint + "' is not a known type.");
                    }
                    ObjectType = settings.knownTypes[typeHint];
                    objectMetadata = json_metadata_1.JsonObjectMetadata.getJsonObjectMetadataFromType(settings.knownTypes[typeHint]);
                }
                else {
                    ObjectType = settings.objectType;
                    objectMetadata = json_metadata_1.JsonObjectMetadata.getJsonObjectMetadataFromType(settings.objectType);
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
                                objectType: propertyMetadata.type,
                                typeHintSyntax: settings.typeHintSyntax,
                                elementType: propertyMetadata.elementType,
                                isRequired: propertyMetadata.isRequired,
                                knownTypes: Helpers.assign(settings.knownTypes, objectMetadata.knownTypes)
                            });
                            // Do not create undefined/null properties.
                            if (_this.valueIsDefined(temp)) {
                                object[propertyKey] = temp;
                            }
                        });
                    }
                }
                else {
                    // Deserialize each property of (from) 'json'.
                    object = new ObjectType();
                    Object.keys(json).forEach(function (propertyKey) {
                        // Skip type-hint when copying properties.
                        if (propertyKey !== typeHintPropertyKey) {
                            object[propertyKey] = _this.readJsonToInstance(json[propertyKey], {
                                objectType: json[propertyKey].constructor,
                                typeHintSyntax: settings.typeHintSyntax,
                                knownTypes: settings.knownTypes
                            });
                        }
                    });
                }
            }
            return object;
        };
        Deserializer.valueIsDefined = function (value) {
            if (typeof value === "undefined" || value === null) {
                return false;
            }
            else {
                return true;
            }
        };
        Deserializer.trimTypeHintNamespace = function (typeHintValue, typeHintSyntax) {
            if (!typeHintValue) {
                return typeHintValue;
            }
            switch (typeHintSyntax) {
                case types_1.TypeHint.DataContract:
                    // Type-hints for DataContracts are in the form 'DataContractName:DataContractNamespace'.
                    // See https://msdn.microsoft.com/en-us/library/bb412170 section Polymorphism.
                    return typeHintValue.split(":")[0];
                default:
                    return typeHintValue;
            }
        };
        return Deserializer;
    }());
    exports.Deserializer = Deserializer;
});
