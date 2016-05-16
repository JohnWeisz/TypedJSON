# TypedJSON

*v0.1.4 experimental release*

Typed JSON parsing and serializing for TypeScript that preserves type information, using decorators. Parse JSON into actual class instances.

 > **Note:** Recommended (but not required) to be used with [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators), a prototype for an ES7 Reflection API for Decorator Metadata.

## Install & Use

The latest release is available as a [NuGet package](https://www.nuget.org/packages/TypedJSON/):

```none
Install-Package TypedJSON
```

 1. Import the 'typed-json' module
 2. Snap @JsonObject on a class
 3. Snap @JsonMember on some properties to mark them for serialization
   - Install/include [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators) (recommended), or set 'type' option (eg.: `@JsonMember({ type: String }) ...`)
 4. Parse/stringify with TypedJSON:

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

[Learn more about decorators in TypeScript](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md)

## Features

 - Parse regular JSON into actual class instances safely
 - Seamlessly integrate into existing code with decorators
 - Customize serialization and deserialization process, like custom names, default values, and ordering
 - Handles complex nested objects and polymorphism

## Documentation

 - [API reference](https://github.com/JohnWhiteTB/TypedJSON/wiki/API-reference)

## License

TypedJSON is licensed under the MIT License.
