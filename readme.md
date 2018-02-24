> A snapshot for 1.0 is now available under the v1-experimental folder (source-code only). For an actual, real-world use case of TypedJSON (1.0), check out **[AudioNodes](https://audionodes.com/)**, a modular audio production suite with the capabilities of a full-time desktop-based digital audio workstation. 1.0 has a slightly different API, the documentation is updated soon to reflect these changes.

# TypedJSON

Strong-typed JSON parsing and serializing for TypeScript with [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md). Parse JSON into actual class instances. Recommended (but not required) to be used with [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators), a prototype for an ES7 Reflection API for Decorator Metadata.

 - Parse regular JSON to typed class instances, safely
 - Seamlessly integrate into existing code with [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md), ultra-lightweight syntax

## Install & Use

```none
npm install typedjson-npm
typings install npm:typedjson-npm
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

## License

TypedJSON is licensed under the MIT License.
