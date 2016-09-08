_Experimental release. Minor version updates can introduce breaking changes before the first major update to 1.0, with the breaking changes always announced at least two weeks in advance. **The upcoming minor update to v0.2.0 is planned to include the following breaking changes**:_

 - *`elementType` setting (deprecated) from JsonMember removed in favor of the `elements` setting*
 - *`order` setting from JsonMember removed, properties from then on are traversed in declaration order*
 - *`TypedJSON.parse` will no longer work without specifying a type argument (use JSON.parse instead for untyped deserializing)*
 - *`typeHintPropertyKey` setting removed from the `settings` argument of TypedJSON.config, TypedJSON.parse, and TypedJSON.stringify in favor of a new `typeResolver` setting, accepting a callback function for custom type-resolving*
   - *This makes it straightforward to consume JSON from other serializers, such as JSON.net*
 - *Polyfill for the `JSON` object removed from distributions. If your app relies on this, you'll need a third party polyfill.*

*If you have concerns about these changes, please don't hesitate to [create an issue](https://github.com/JohnWhiteTB/TypedJSON/issues/new).*

# TypedJSON

Typed JSON parsing and serializing for TypeScript that preserves type information, using [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md). Parse JSON into actual class instances. Recommended (but not required) to be used with [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators), a prototype for an ES7 Reflection API for Decorator Metadata.

 - Parse regular JSON into actual class instances safely
 - Handles complex nested objects and polymorphism
 - Seamlessly integrate into existing code with [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md), ultra-lightweight syntax
 - Customize serialization and deserialization process, like custom names and default values

## Install & Use

```none
npm install typedjson
typings install npm:typedjson
```

Alternatively, the [latest release](https://github.com/JohnWhiteTB/TypedJSON/releases) is also available as a [NuGet package](https://www.nuget.org/packages/TypedJSON/):

```none
Install-Package TypedJSON
```

 1. Snap the [@JsonObject decorator](https://github.com/JohnWhiteTB/TypedJSON/wiki/API-reference#jsonobject) on a class
 2. Snap the [@JsonMember decorator](https://github.com/JohnWhiteTB/TypedJSON/wiki/API-reference#jsonmember) on properties which should be serialized and deserialized
 3. Parse and stringify with the [TypedJSON class](https://github.com/JohnWhiteTB/TypedJSON/wiki/API-reference#typedjson)

```typescript
@JsonObject
class Person {
    @JsonMember
    firstName: string;

    @JsonMember
    lastName: string;

    public getFullname() {
        return this.firstName + " " + this.lastName;
    }
}
```

```typescript
var person = TypedJSON.parse('{ "firstName": "John", "lastName": "Doe" }', Person);

person instanceof Person; // true
person.getFullname(); // "John Doe"
```

If you choose to omit using [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators), the class (constructor function) of each [@JsonMember](https://github.com/JohnWhiteTB/TypedJSON/wiki/API-reference#jsonmember) decorated property must be specified manually through the [`type` setting](https://github.com/JohnWhiteTB/TypedJSON/wiki/API-reference#jsonmember), for example:

```typescript
@JsonMember({ type: String })
firstName: string;
```

[Learn more about decorators in TypeScript](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md)

## Documentation

 - [API reference](https://github.com/JohnWhiteTB/TypedJSON/wiki/API-reference)

## How It Works

Using the JsonMember and JsonObject decorators will record metadata about classes and properties behind-the-scene. This metadata -- including property names and property types, as well as additional settings -- is available at runtime. When parsing JSON or stringifying an object, first the native JSON object is used for conversion between JSON string and simple Javascript `Object`. After this preliminary conversion is done, the recorded metadata is traversed recursively.

JSON parsing is followed by _deserialization_, which converts the simple Javascript `Object` from JSON.parse into the specified class instance by doing a recursive _assignment_ to each marked property, as well as doing name conversion (if specified) and type-checking in the process. It also ensures that properties marked as required are present in the JSON, as an `Error` is thrown otherwise. Deserialization is _safe_, as the entire process is done by traversing the _expected_ metadata definitions, as opposed to traversing the _actual_ data present in JSON. This means that incorrect JSON will cause errors during deserialization, instead of deserializing into an unexpected object-tree.

 > **Warning:** properties with type `Object` or `any` are an exception to this rule. These types will be deserialized according to the actual data present in the JSON, as these properties have no usable metadata. Also be aware that a property with an interface type is considered as having `Object` as its determined type (consider setting the `refersAbstractType` option to `true` for these properties).

JSON stringifying is followed by the _serialization_ process, which is responsible for name conversion (if specified), as well as including any additional type-hints required when processing objects with polymorphic properties. When polymorphism is involved, type-hints are required to ensure serialized objects are deserialized into the correct subtype. The default property key used for type-hints embedded into the JSON string is `__type`, which is configurable. The serialization process is much more relaxed than deserializing, as objects being serialized are expected to be of the correct type, and security implications are less significant.

## License

TypedJSON is licensed under the MIT License.
