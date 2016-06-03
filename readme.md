# TypedJSON

*v0.1.4 experimental release*

Typed JSON parsing and serializing for TypeScript that preserves type information, using [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md). Parse JSON into actual class instances.

 > **Note:** Recommended (but not required) to be used with [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators), a prototype for an ES7 Reflection API for Decorator Metadata.

## Install & Use

The latest release is available as a [NuGet package](https://www.nuget.org/packages/TypedJSON/):

```none
Install-Package TypedJSON
```

 1. Snap the @JsonObject decorator on a class
 2. Snap the @JsonMember decorator on properties which should be serialized and deserialized
 3. Parse and stringify with TypedJSON

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

> **Note:** If you choose to omit using [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators), also make sure to pass the `type` setting to each @JsonMember, for example: `@JsonMember({ type: String })`.

```typescript
var person = TypedJSON.parse('{ "firstName": "John", "lastName": "Doe" }', Person);

person instanceof Person; // true
person.getFullname(); // "John Doe"
```

[Learn more about decorators in TypeScript](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md)

## Features

 - Parse regular JSON into actual class instances safely
 - Seamlessly integrate into existing code with decorators, lightweight syntax
 - Customize serialization and deserialization process, like custom names, default values, and ordering
 - Handles complex nested objects and polymorphism

## Documentation

 - [API reference](https://github.com/JohnWhiteTB/TypedJSON/wiki/API-reference)

## License

TypedJSON is licensed under the MIT License.
