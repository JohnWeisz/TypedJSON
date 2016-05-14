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
interface JsonObjectOptions<T> {
    /** Name of the object as it appears in the serialized JSON. */
    name?: string;
    /** An array of known types to recognize when encountering type-hints. */
    knownTypes?: Array<{
        new (): any;
    }>;
    /** A custom serializer function transforming an instace to a JSON object. */
    serializer?: (object: T) => any;
    /** A custom deserializer function transforming a JSON object to an instace. */
    initializer?: (json: any) => T;
}
/**
 * Specifies that the type is serializable to and deserializable from a JSON string.
 * @param options Configuration settings.
 */
declare function JsonObject<T>(options?: JsonObjectOptions<T>): (target: {
    new (): T;
}) => void;
/**
 * Specifies that the type is serializable to and deserializable from a JSON string.
 */
declare function JsonObject<T>(target: {
    new (): T;
}): void;
interface JsonMemberOptions<TFunction extends Function> {
    /** Sets the member name as it appears in the serialized JSON. Default value is determined from property key. */
    name?: string;
    /** Sets the json member type. Optional if reflect metadata is available. */
    type?: TFunction;
    /** Deprecated. When the json member is an array, sets the type of array elements. Required for arrays. */
    elementType?: Function;
    /** Deprecated. When the json member is an array, sets the type of array elements. Required for arrays. */
    elements?: JsonMemberOptions<any> | Function;
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
declare function JsonMember(): PropertyDecorator;
/**
 * Specifies that the property is part of the object when serializing.
 * Parameterless use requires reflect-metadata to determine member type.
 */
declare function JsonMember(target: any, propertyKey: string | symbol): void;
/**
 * Specifies that the property is part of the object when serializing.
 * @param options Configuration settings.
 */
declare function JsonMember<TFunction extends Function>(options: JsonMemberOptions<TFunction>): PropertyDecorator;
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
     * @param settings Per-use serializer settings. Unspecified keys are assigned from global config.
     */
    parse<T>(text: string, type: {
        new (): T;
    }, settings?: SerializerSettings): T;
    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param settings Per-use serializer settings. Unspecified keys are assigned from global config.
     */
    stringify(value: any, settings?: SerializerSettings): string;
    /**
     * Configures TypedJSON with custom settings. New settings will be assigned to existing settings.
     * @param settings The settings object.
     */
    config(settings: SerializerSettings): void;
}
declare var TypedJSON: TypedJSON;
export { SerializerSettings, TypedJSON, JsonObjectOptions, JsonObject, JsonMemberOptions, JsonMember };
