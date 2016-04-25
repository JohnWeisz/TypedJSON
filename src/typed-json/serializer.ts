import {JSONpolyfill} from "./polyfill";
import {ParameterlessConstructor, Constructor, SerializerSettings, TypeHint} from "./types";
import {JsonObjectMetadata, JsonMemberMetadata} from "./json-metadata";
import * as Helpers from "./helpers";

if (!JSON) {
    JSON = JSONpolyfill();
}

enum TypeHintMode {
    Always,
    Auto
}

interface WriteSettings {
    objectType: { new (): any },
    elementType?: { new (): any },
    emitDefault?: boolean,
    typeHintSyntax: TypeHint,
    typeHint?: TypeHintMode,
    name?: string
}

export abstract class Serializer {
    public static writeObject(object: any, settings?: SerializerSettings): string {
        var objectMetadata = JsonObjectMetadata.getJsonObjectMetadataFromInstance(object);

        if (!objectMetadata) {
            throw new Error("No metadata information found on the provided object.");
        }
        
        objectMetadata.sortMembers();
        settings = Helpers.assign({
            // Default settings.
            typeHinting: TypeHint.DataContract
        }, settings || {});

        return JSON.stringify(this.writeToJsonObject(object, {
            objectType: objectMetadata.classType,
            typeHintSyntax: settings.typeHinting
        }));
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
                json.push(this.writeToJsonObject(object[i], {
                    objectType: settings.elementType,
                    typeHintSyntax: settings.typeHintSyntax
                }));
            }
        } else {
            // Object with properties.
            objectMetadata = JsonObjectMetadata.getJsonObjectMetadataFromInstance(object)

            if (objectMetadata && typeof objectMetadata.serializer === "function") {
                json = objectMetadata.serializer(object);
            } else {
                json = {};

                // Add type-hint.
                if (object.constructor !== settings.objectType || settings.typeHint === TypeHintMode.Always) {
                    let typeHint = this.getTypeHint(settings.typeHintSyntax, object);

                    if (typeHint !== null) {
                        json[typeHint.key] = typeHint.value;
                    }
                }

                if (objectMetadata) {
                    // Serialize @JsonMember properties.
                    objectMetadata.sortMembers();

                    Object.keys(objectMetadata.dataMembers).forEach(propertyKey => {
                        var propertyMetadata = objectMetadata.dataMembers[propertyKey];

                        json[propertyMetadata.name] = this.writeToJsonObject(object[propertyKey], {
                            objectType: propertyMetadata.type,
                            typeHintSyntax: settings.typeHintSyntax,
                            emitDefault: propertyMetadata.emitDefaultValue,
                            elementType: propertyMetadata.elementType // Might be undefined, doesn't matter.
                        });
                    });
                } else {
                    // Serialize all own properties. Type-hints for objects are provided for deserialization.
                    Object.keys(object).forEach(propertyKey => {
                        json[propertyKey] = this.writeToJsonObject(object[propertyKey], {
                            objectType: object.constructor as any, // PotatoScript doesn't accept 'constructor' as a newable (^^.)
                            typeHintSyntax: settings.typeHintSyntax,
                            typeHint: TypeHintMode.Always
                        });
                    });
                }
            }
        }
        
        return json;
    }

    private static getTypeHint(typeHint: TypeHint, value: any) {
        switch (typeHint) {
            case TypeHint.DataContract:
                return {
                    key: "__type",
                    value: JsonObjectMetadata.getKnownTypeNameFromInstance(value)
                };

            default:
                return null;
        }
    }
}
