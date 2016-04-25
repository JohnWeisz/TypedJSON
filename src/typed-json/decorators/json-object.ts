import {ClassDecorator, Constructor, ParameterlessConstructor} from "../types";
import {JsonObjectMetadata} from "../json-metadata";
import * as Helpers from "../helpers";

export interface JsonObjectOptions<T> {
    name?: string;
    knownTypes?: Array<ParameterlessConstructor<any>>;
    serializer?: (object: T) => any;

    /** Custom initializer function, returning the deserialized instance created within. */
    initializer?: (json: any) => T;
}

export interface JsonObjectOptionsInitializable<T> extends JsonObjectOptions<T> {
    /** Custom initializer function, returning the deserialized instance created within. */
    initializer: (json: any) => T;
}

/**
 * Specifies that the type is serializable to and deserializable from a JSON string.
 */
export function JsonObject(): (target: ParameterlessConstructor<any>) => void;

/**
 * Specifies that the type is serializable to and deserializable from a JSON string.
 * @param options Configuration settings.
 */
export function JsonObject<T>(options: JsonObjectOptions<T>): (target: ParameterlessConstructor<T>) => void;

/**
 * Specifies that the type is serializable to and deserializable from a JSON string.
 * @param options Configuration settings.
 */
export function JsonObject<T>(options: JsonObjectOptionsInitializable<T>): (target: Constructor<T>) => void;

export function JsonObject<T>(options?: JsonObjectOptionsInitializable<T>): (target: Constructor<T>) => void {
    options = options || {} as any;

    var initializer = options.initializer;

    return function (target: Constructor<T>): Constructor<T> | void {
        var objectMetadata: JsonObjectMetadata<T>;
        var parentMetadata: JsonObjectMetadata<T>;
        var i;

        if (!target.prototype.hasOwnProperty("__typedJsonJsonObjectMetadataInformation__")) {
            objectMetadata = new JsonObjectMetadata<T>();

            // If applicable, inherit @JsonMembers and @KnownTypes from parent @JsonObject.
            if (parentMetadata = target.prototype.__typedJsonJsonObjectMetadataInformation__) {
                // @JsonMembers
                Object.keys(parentMetadata.dataMembers).forEach(memberPropertyKey => {
                    objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                });

                // @KnownTypes
                Object.keys(parentMetadata.knownTypes).forEach(key => {
                    objectMetadata.setKnownType(parentMetadata.knownTypes[key]);
                });
            }

            Object.defineProperty(target.prototype, "__typedJsonJsonObjectMetadataInformation__", {
                enumerable: false,
                configurable: false,
                writable: false,
                value: objectMetadata
            });
        } else {
            objectMetadata = target.prototype.__typedJsonJsonObjectMetadataInformation__;
        }

        objectMetadata.classType = target;

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

        return target;
    };
}