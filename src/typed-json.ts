import {JSONpolyfill} from "./typed-json/polyfill";
import {JsonObjectMetadata} from "./typed-json/json-metadata";
import {JsonMember} from "./typed-json/decorators/json-member";
import {JsonObject} from "./typed-json/decorators/json-object";
import {SerializerSettings} from "./typed-json/types";
import {Serializer} from "./typed-json/serializer";
import {Deserializer} from "./typed-json/deserializer";

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
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value to be converted.
     */
    stringify(value: any): string;

    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value to be converted.
     * @param settings Serializer settings.
     */
    stringify(value: any, settings: SerializerSettings): string;

    /**
     * Converts a JavaScript Object Notation (JSON) string into an instance of the provided class.
     * @param text A valid JSON string.
     * @param type A class from which an instance is created using the provided JSON string.
     */
    parse<T>(text: string, type: { new (): T }): T;

    /**
     * Converts a JavaScript Object Notation (JSON) string into an instance of the provided class.
     * @param text A valid JSON string.
     * @param type A class from which an instance is created using the provided JSON string.
     * @param settings Serializer settings.
     */
    parse<T>(text: string, type: { new (): T }, settings: SerializerSettings): T;
}

if (!JSON) {
    JSON = JSONpolyfill();
}

var TypedJSON: TypedJSON = {
    stringify: function (value: any, settings?: SerializerSettings): string {
        if (JsonObjectMetadata.getJsonObjectMetadataFromInstance(value)) {
            // Use Serializer for custom serialization.
            return Serializer.writeObject(value, settings);
        } else {
            // Call original 'JSON.stringify'.
            return JSON.stringify.apply(JSON, arguments);
        }
    },
    parse: function (text: string, type?: any, settings?: SerializerSettings): any {
        var metadata = JsonObjectMetadata.getJsonObjectMetadataFromType<any>(type);

        if (typeof type === "function" && metadata && metadata.classType === type) {
            // Use Deserializer for custom deserialization using the provided class type.
            return Deserializer.readObject(text, type, settings);
        } else {
            // Call original 'JSON.parse'.
            return JSON.parse.apply(JSON, arguments);
        }
    }
};

export {TypedJSON, JsonObject, JsonMember};