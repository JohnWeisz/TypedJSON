# TypedJSON

*v0.1.2 experimental preview*

Typed JSON parsing and serializing that preserves type information. Parse JSON into actual class instances. Recommended (but not required) to be used with [reflect-metadata](https://github.com/rbuckton/ReflectDecorators).

## Install & Use

The experimental source preview is available as a [NuGet package](https://www.nuget.org/packages/TypedJSON/):

```none
Install-Package TypedJSON
```

 1. Import the `typed-json` module,
 2. Snap `@JsonObject` on a class,
 3. Snap `@JsonMember` on some properties to mark them for serialization,
   - Pass configuration object containing a `type` setting to specify property types, or
   - Install [reflect-metadata](https://github.com/rbuckton/ReflectDecorators) to auto-determine property types (recommended),
 4. Compile and let `TypedJSON` consume your objects:

```typescript
@JsonObject
class Person {
    @JsonMember
    firstName: string;
    
    @JsonMember
    lastName: string;

    constructor(firstName?: string, lastName?: string) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public getFullname() {
        return this.firstName + " " + this.lastName;
    }
}

var person = new Person("John", "Doe");
var json = TypedJSON.stringify(person);
var clone = TypedJSON.parse(json, Person);

clone instanceof Person; // true
clone.firstName === person.firstName; // true
clone.lastName === person.lastName; // true
clone.getFullname() === person.getFullname(); // true
clone === person; // false
```

## Features

 - Parse regular JSON into actual class instances
 - Seamlessly integrate into existing code with decorators
 - Customize serialization and deserialization process, like custom names and ordering
 - Handles complex nested objects and polymorphism
 - Compatible with the built-in `JSON` object, handles untyped parsing as well

## Documentation

 - [Getting started](https://github.com/JohnWhiteTB/TypedJSON/wiki)
 - [API reference](https://github.com/JohnWhiteTB/TypedJSON/wiki)

## License

TypedJSON is licensed under the MIT License.