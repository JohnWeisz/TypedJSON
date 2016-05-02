# TypedJSON

*v0.1.3 experimental release*

Typed JSON parsing and serializing that preserves type information. Parse JSON into actual class instances. Recommended (but not required) to be used with [reflect-metadata](https://github.com/rbuckton/ReflectDecorators), a prototype for an ES7 Reflection API for Decorator Metadata.

## Install & Use

The latest version is available as a [NuGet package](https://www.nuget.org/packages/TypedJSON/):

```none
Install-Package TypedJSON
```

 1. Import the 'typed-json' module,
 2. Snap @JsonObject on a class,
 3. Snap @JsonMember on some properties to mark them for serialization,
   - Use [reflect-metadata](https://github.com/rbuckton/ReflectDecorators) to auto-determine property types (recommended), or
   - Pass options object with 'type' setting to specify property types,
     - `@JsonMember({ type: String }) ...`
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

## Features

 - Parse regular JSON into actual class instances, *safely*, no need for type data
 - Seamlessly integrate into existing code with decorators
 - Customize serialization and deserialization process, like custom names and ordering
 - Handles complex nested objects and polymorphism
 - Compatible with the built-in `JSON` object, handles untyped parsing as well

## Documentation

 - [API reference](https://github.com/JohnWhiteTB/TypedJSON/wiki)

## License

TypedJSON is licensed under the MIT License.