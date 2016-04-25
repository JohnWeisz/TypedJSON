import {ParameterlessType, SerializerSettings} from "./types";
import {JsonObjectMetadata} from "./json-metadata";
import * as Helpers from "./helpers";

export abstract class Deserializer {
    public static readObject<T>(json: string, type: { new (): T }, settings?: SerializerSettings): T {
        var objectMetadata = JsonObjectMetadata.getJsonObjectMetadataFromType(type);
        var value = JSON.parse(json); // Parse text into basic object, which is then processed recursively.
        var instance: T;

        if (!objectMetadata) {
            throw new Error(`Provided class '${Helpers.getClassName(type)}' is not a @JsonObject.`);
        }

        objectMetadata.sortMembers();
        settings = Helpers.assign({
            // Default settings.
            typeHinting: "__type"
        }, settings || {});
        
        instance = this.readJsonToInstance(value, objectMetadata, null, settings);

        return instance;
    }

    private static readJsonToInstance(
        value: any,
        objectMetadata?: JsonObjectMetadata<any>,
        knownTypes?: { [knownTypeName: string]: ParameterlessType },
        settings?: SerializerSettings
    ): any {
        var instance: any;
        var typeHint: string;


        // Search for type-hints.
        if (typeof value === "object" && value !== null && value.hasOwnProperty(settings.typeHinting)) {
            // Use the set type-hinting flavor.
            typeHint = value[settings.typeHinting];

            if (typeof typeHint === "string") {
                if (!knownTypes || !knownTypes.hasOwnProperty(typeHint)) {
                    throw new Error(`"${typeHint}" is not a known type (known types in scope are: ${Object.keys(knownTypes || {})}).`);
                }
                
                // Replace metadata information with that of the hinted type (if any).
                objectMetadata = JsonObjectMetadata.getJsonObjectMetadataFromType(knownTypes[typeHint]);
            }
        }

        if (objectMetadata) {
            // Metadata information can only be present on user-defined class types, which are always represented as objects in JSON.
            if (typeof value !== "object" && value !== null) {
                throw new TypeError(`Expected value to be of type "object", got "${typeof value}".`);
            }

            if (typeHint) {
                instance = new knownTypes[typeHint]();
            } else {
                instance = new objectMetadata.classType();
            }

            // For each @JsonMember defined in the @JsonObject:
            Object.keys(objectMetadata.dataMembers).forEach(propertyKey => {
                var memberMetadata = objectMetadata.dataMembers[propertyKey];
                var memberName = memberMetadata.name || propertyKey;

                if (!value.hasOwnProperty(memberName) || value[memberName] === null || typeof value[memberName] === "undefined") {
                    // The given @JsonMember does not exist in the JSON.
                    if (memberMetadata.isRequired) {
                        throw new Error(`Missing required member "${objectMetadata.className}.${memberName}".`);
                    }
                } else {
                    switch (memberMetadata.type) {
                        case Object:
                            // @JsonMember is object literal, initialize to empty object.
                            instance[propertyKey] = {};

                            // Object literal must be a -- wait for it -- object in JSON.
                            if (typeof value[memberName] !== "object" || value[memberName] === null) {
                                throw new TypeError(`Expected value to be of type "object", got "${typeof value}".`);
                            }

                            // For each property of the source object...
                            Object.keys(value[memberName]).forEach(sourceKey => {
                                // ... add the corresponding property on the created (destination) object.
                                instance[propertyKey][sourceKey] = this.readJsonToInstance(
                                    value[memberName][sourceKey],
                                    JsonObjectMetadata.getJsonObjectMetadataFromType(memberMetadata.elementType),
                                    objectMetadata.knownTypes,
                                    settings
                                );
                            });
                            break;

                        case Array:
                            // @JsonMember is array, initialize empty Array.
                            instance[propertyKey] = [];

                            if (value[memberName] instanceof Array) {
                                value[memberName].forEach(sourceItem => {
                                    instance[propertyKey].push(this.readJsonToInstance(
                                        sourceItem,
                                        JsonObjectMetadata.getJsonObjectMetadataFromType(memberMetadata.elementType),
                                        objectMetadata.knownTypes,
                                        settings
                                    ));
                                });
                            } else {
                                // The deserialized JSON does have a property with this name, but it's not an array.
                                throw new TypeError(`Expected value to be an Array, got "${typeof value}".`);
                            }
                            break;

                        case Date:
                            // Built-in support for Date with ISO 8601.
                            // Spec.: https://www.w3.org/TR/NOTE-datetime
                            if (typeof value[memberName] === "string") {
                                instance[propertyKey] = new Date(value[memberName]);
                            } else {
                                throw new TypeError(`Expected value to be of type "string", got "${typeof value}".`);
                            }

                            break;

                        default:
                            instance[propertyKey] = this.readJsonToInstance(
                                value[memberName],
                                JsonObjectMetadata.getJsonObjectMetadataFromType(memberMetadata.type),
                                objectMetadata.knownTypes,
                                settings
                            );
                    }
                }
            });

            return instance;
        } else {
            // No metadata information for this object, treat as leaf item.
            return value;
        }
    }
}