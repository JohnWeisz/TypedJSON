# TypedJSON

*Work In Progress*

Typed JSON parsing and serializing that preserves type information:

```typescript
@JsonObject
class Person {
    @JsonMember firstName: string;
    @JsonMember lastName: string;

    constructor(firstName?: string, lastName?: string) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
}

var person = new Person("John", "Doe");
var json = TypedJSON.stringify(person);
var clone = TypedJSON.parse(json, Person);

clone instanceof Person; // true
clone.firstName === person.firstName; // true
clone.lastName === person.lastName; // true
clone === person; // false
```

## Features

 - Deserialize JSON into actual class instances
 - Seamlessly integrate into existing code with decorators
 - Customize serialization and deserialization process, like custom names and ordering
 - Handles complex nested objects and polymorphism
 - Functionally a superset of the built-in `JSON` object

## Install & Use

This is an experimental source preview release, grab the `typed-json.ts` file and the `typed-json` folder and import them into your project:

```typescript
import {TypedJSON, JsonObject, JsonMember} from "./typed-json";
```

 1. Snap `@JsonObject` on a class to make it serializable,
 2. Snap `@JsonMember` on properties to mark them for serialization,
   - Pass a configuration object containing a `type` setting to specify property type (and other settings), or
   - Install [reflect-metadata](https://github.com/rbuckton/ReflectDecorators) to auto-determine property type (recommended),
 3. Let `TypedJSON` consume your instances and classes as shown above.

A NuGet package for the `.ts` source is underway.