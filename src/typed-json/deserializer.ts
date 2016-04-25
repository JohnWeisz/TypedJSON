import {JSONpolyfill} from "./polyfill";
import {ParameterlessConstructor, SerializerSettings, TypeHint, Constructor} from "./types";
import {JsonObjectMetadata, JsonMemberMetadata} from "./json-metadata";
import * as Helpers from "./helpers";

if (!JSON) {
    JSON = JSONpolyfill();
}

interface ReadSettings<T> {
    objectType: { new (...args: any[]): T },
    isRequired?: boolean,
    elementType?: { new (...args: any[]): any },
    typeHintSyntax: TypeHint,
    knownTypes?: { [name: string]: { new (...args: any[]): any } },
    propertyNameQualifier?: string
}

export abstract class Deserializer {
    /**
     * Deserialize a JSON string into the provided type.
     * @param json The JSON string to deserialize.
     * @param type The type to deserialize into.
     * @param settings Serializer settings.
     * @throws Error if the provided type is not decorated with JsonObject.
     * @throws Error if 'settings' specifies 'maxObjects', and the JSON string exceeds that limit.
     */
    public static readObject<T>(json: string, type: { new (...args: any[]): T }, settings?: SerializerSettings): T {
        var objectMetadata = JsonObjectMetadata.getJsonObjectMetadataFromType(type);
        var value = JSON.parse(json); // Parse text into basic object, which is then processed recursively.
        var instance: T;

        if (!objectMetadata) {
            throw new Error(`The provided class '${Helpers.getClassName(type)}' is not a @JsonObject.`);
        }

        settings = settings || {};

        if (typeof settings.maxObjects === "number") {
            if (this.countObjects(value) > settings.maxObjects) {
                throw new Error(`JSON exceeds object count limit (${settings.maxObjects}).`);
            }
        }

        // Sort JsonMembers so that deserialization happens as set by ordering.
        objectMetadata.sortMembers();
        
        instance = this.readJsonToInstance(value, {
            objectType: type,
            typeHintSyntax: settings.typeHinting || TypeHint.DataContract
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
        var temp: any;
        var typeHintPropertyKey = Helpers.getTypeHintPropertyKey(settings.typeHintSyntax);

        // Default settings.
        settings = Helpers.assign<any>({
            objectType: Object,
            knownTypes: {}
        }, settings || {});
        
        if (typeof json === "undefined" || json === null) {
            if (settings.isRequired) {
                throw new Error(`Missing required member.`);
            }
        } else if (Helpers.isPrimitiveType(settings.objectType)) {
            // number, string, boolean: assign directly so that primitives are kept.
            object = json;
        } else if (settings.objectType as any === Array) {
            // 'json' is expected to be an array.
            if (!Helpers.isArray(json)) {
                throw new TypeError(`Expected value to be an 'Array', got '${Helpers.getClassName(json)}'.`);
            }

            object = [];

            json.forEach(element => {
                object.push(this.readJsonToInstance(element, {
                    objectType: settings.elementType || Object,
                    typeHintSyntax: settings.typeHintSyntax,
                    knownTypes: settings.knownTypes // Pass on known types to elements.
                }));
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
            typeHint = this.trimTypeHintNamespace(json[typeHintPropertyKey], settings.typeHintSyntax);

            if (typeof typeHint === "string") {
                if (!settings.knownTypes[typeHint]) {
                    throw new Error(`'${typeHint}' is not a known type.`);
                }

                ObjectType = settings.knownTypes[typeHint];
                objectMetadata = JsonObjectMetadata.getJsonObjectMetadataFromType(settings.knownTypes[typeHint]);
            } else {
                ObjectType = settings.objectType;
                objectMetadata = JsonObjectMetadata.getJsonObjectMetadataFromType(settings.objectType);
            }
            
            if (objectMetadata) {
                if (typeof objectMetadata.initializer === "function") {
                    // Let the initializer function handle it.
                    object = objectMetadata.initializer(json) || null;
                } else {
                    // Deserialize @JsonMembers.
                    object = new ObjectType();

                    Object.keys(objectMetadata.dataMembers).forEach(propertyKey => {
                        var propertyMetadata = objectMetadata.dataMembers[propertyKey];

                        temp = this.readJsonToInstance(json[propertyMetadata.name], {
                            objectType: propertyMetadata.type,
                            typeHintSyntax: settings.typeHintSyntax, // Pass on.
                            elementType: propertyMetadata.elementType, // Might be undefined, doesn't matter.
                            isRequired: propertyMetadata.isRequired,
                            knownTypes: Helpers.assign(settings.knownTypes, objectMetadata.knownTypes)
                        });

                        // Do not create undefined/null properties.
                        if (this.valueIsDefined(temp)) {
                            object[propertyKey] = temp;
                        }
                    });
                }
            } else {
                // Deserialize each property of (from) 'json'.
                object = new ObjectType();

                Object.keys(json).forEach(propertyKey => {
                    // Skip type-hint when copying properties.
                    if (propertyKey !== typeHintPropertyKey) {
                        object[propertyKey] = this.readJsonToInstance(json[propertyKey], {
                            objectType: json[propertyKey].constructor,
                            typeHintSyntax: settings.typeHintSyntax, // Pass on.
                            knownTypes: settings.knownTypes
                        });
                    }
                });
            }
        }

        return object;
    }

    private static valueIsDefined(value: any): boolean {
        if (typeof value === "undefined" || value === null) {
            return false;
        } else {
            return true;
        }
    }

    private static trimTypeHintNamespace(typeHintValue: string, typeHintSyntax: TypeHint) {
        if (!typeHintValue) {
            return typeHintValue;
        }

        switch (typeHintSyntax) {
            case TypeHint.DataContract:
                // Type-hints for DataContracts are in the form 'DataContractName:DataContractNamespace'.
                // See https://msdn.microsoft.com/en-us/library/bb412170 section Polymorphism.
                return typeHintValue.split(":")[0];

            default:
                return typeHintValue;
        }
    }
}
