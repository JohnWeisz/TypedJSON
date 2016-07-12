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
    typeHintPropertyKey?: string;
    enableTypeHints?: boolean;
    maxObjects?: number;
    replacer?: (key: string, value: any) => any;
    reviver?: (key: any, value: any) => any;
}
interface JsonObjectOptions<T> {
    name?: string;
    knownTypes?: Array<{
        new (): any;
    }>;
    serializer?: (object: T) => any;
    initializer?: (json: any) => T;
}
declare function JsonObject<T>(options?: JsonObjectOptions<T>): (target: {
    new (): T;
}) => void;
declare function JsonObject<T>(target: {
    new (): T;
}): void;
interface JsonMemberOptions<TFunction extends Function> {
    name?: string;
    type?: TFunction;
    elementType?: Function;
    elements?: JsonMemberOptions<any> | Function;
    isRequired?: boolean;
    order?: number;
    emitDefaultValue?: boolean;
    refersAbstractType?: boolean;
}
declare function JsonMember(): PropertyDecorator;
declare function JsonMember(target: any, propertyKey: string | symbol): void;
declare function JsonMember<TFunction extends Function>(options: JsonMemberOptions<TFunction>): PropertyDecorator;
interface TypedJSON {
    parse(text: string, reviver?: (key: any, value: any) => any): any;
    stringify(value: any): string;
    stringify(value: any, replacer: (key: string, value: any) => any): string;
    stringify(value: any, replacer: any[]): string;
    stringify(value: any, replacer: (key: string, value: any) => any, space: string | number): string;
    stringify(value: any, replacer: any[], space: string | number): string;
    parse<T>(text: string, type: {
        new (): T;
    }, settings?: SerializerSettings): T;
    stringify(value: any, settings?: SerializerSettings): string;
    config(settings: SerializerSettings): void;
}
declare var TypedJSON: TypedJSON;
export { SerializerSettings, TypedJSON, JsonObjectOptions, JsonObject, JsonMemberOptions, JsonMember };
