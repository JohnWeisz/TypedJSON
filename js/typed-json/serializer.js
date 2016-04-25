define(["require", "exports", "./polyfill", "./types", "./json-metadata", "./helpers"], function (require, exports, polyfill_1, types_1, json_metadata_1, Helpers) {
    "use strict";
    if (!JSON) {
        JSON = polyfill_1.JSONpolyfill();
    }
    var TypeHintMode;
    (function (TypeHintMode) {
        TypeHintMode[TypeHintMode["Always"] = 0] = "Always";
        TypeHintMode[TypeHintMode["Auto"] = 1] = "Auto";
    })(TypeHintMode || (TypeHintMode = {}));
    var Serializer = (function () {
        function Serializer() {
        }
        Serializer.writeObject = function (object, settings) {
            var objectMetadata = json_metadata_1.JsonObjectMetadata.getFromInstance(object);
            if (!objectMetadata) {
                throw new Error("No metadata information found on the provided object.");
            }
            objectMetadata.sortMembers();
            settings = Helpers.assign({
                // Default settings.
                typeHinting: types_1.TypeHint.DataContract
            }, settings || {});
            return JSON.stringify(this.writeToJsonObject(object, {
                objectType: objectMetadata.classType,
                typeHintSyntax: settings.typeHinting
            }));
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
            else if (Helpers.isPrimitiveType(object) || object instanceof Date) {
                // Primitive types and Date stringified "as-is".
                json = object;
            }
            else if (object instanceof Array) {
                json = [];
                /*
                if (!settings.elementType) {
                    // TODO: attempt to auto-infer elementType from array elements?
                }
                */
                for (var i = 0, n = object.length; i < n; i++) {
                    json.push(this.writeToJsonObject(object[i], {
                        objectType: settings.elementType,
                        typeHintSyntax: settings.typeHintSyntax
                    }));
                }
            }
            else {
                // Object with properties.
                objectMetadata = json_metadata_1.JsonObjectMetadata.getFromInstance(object);
                if (objectMetadata && typeof objectMetadata.serializer === "function") {
                    json = objectMetadata.serializer(object);
                }
                else {
                    json = {};
                    // Add type-hint.
                    if (object.constructor !== settings.objectType || settings.typeHint === TypeHintMode.Always) {
                        var typeHint = this.getTypeHint(settings.typeHintSyntax, object);
                        if (typeHint !== null) {
                            json[typeHint.key] = typeHint.value;
                        }
                    }
                    if (objectMetadata) {
                        // Serialize @JsonMember properties.
                        objectMetadata.sortMembers();
                        Object.keys(objectMetadata.dataMembers).forEach(function (propertyKey) {
                            var propertyMetadata = objectMetadata.dataMembers[propertyKey];
                            json[propertyMetadata.name] = _this.writeToJsonObject(object[propertyKey], {
                                objectType: propertyMetadata.type,
                                typeHintSyntax: settings.typeHintSyntax,
                                emitDefault: propertyMetadata.emitDefaultValue,
                                elementType: propertyMetadata.elementType // Might be undefined, doesn't matter.
                            });
                        });
                    }
                    else {
                        // Serialize all own properties. Type-hints for objects are provided for deserialization.
                        Object.keys(object).forEach(function (propertyKey) {
                            json[propertyKey] = _this.writeToJsonObject(object[propertyKey], {
                                objectType: object.constructor,
                                typeHintSyntax: settings.typeHintSyntax,
                                typeHint: TypeHintMode.Always
                            });
                        });
                    }
                }
            }
            return json;
        };
        Serializer.getTypeHint = function (typeHint, value) {
            switch (typeHint) {
                case types_1.TypeHint.DataContract:
                    return {
                        key: "__type",
                        value: json_metadata_1.JsonObjectMetadata.getKnownTypeNameFromInstance(value)
                    };
                default:
                    return null;
            }
        };
        return Serializer;
    }());
    exports.Serializer = Serializer;
});
