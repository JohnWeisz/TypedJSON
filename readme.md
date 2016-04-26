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
 - Handles complex nested objects and polymorhpism
 - Functionally a superset of the built-in `JSON` object

## Install & Use

This is an experimental preview release, `.ts` source is available as a NuGet package:

```none
Install-Package TypedJSON
```

