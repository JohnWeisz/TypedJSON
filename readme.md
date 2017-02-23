> **Author's note, please read if incorporating TypedJSON into a serious application:**
>
> TypedJSON is currently an experimental release and is not guaranteed to satisfy all use-cases reliably.
> 
> The upcoming update is a major update to v1.0.0, and an almost complete rehaul of the TypedJSON API with significant improvements over the initial release, based on significant amounts of feedback and practical use. This version is coming with a massive test-suite to start going towards more serious application possibilities, as many aspects of TypedJSON were found suitable for enterprise-grade use.
>
> Since numerous unnecessary features and decisions will be abandoned, **this update will introduce breaking changes**, of which the most notable will be:
> - Properties of type `Array`, `Map`, `Set` will use JsonArrayMember, JsonMapMember, and JsonSetMember (respectively, and yes, support for these new ES6 collection types is finally coming)
> - JsonMember will no longer support `Array`
> - Configurable type-hint key replaced with configurable type-resolver and type-emitter callbacks (although with an identical default behavior)
> 
> **Why the breaking changes?**
> 
> 1. Because I feel the syntax of TypedJSON is so lightweight that, at this stage, it would be absolutely trivial to incorporate these changes into virtually any project
> 2. Because it is better to do a hard-switch to a (subjectively) better API as early on as possible, without the burden of legacy code
> 
> This update is live as soon as all integration testing is done, anticipated in March, 2017. The main principle of TypedJSON is not subject to change, the API is permanently locked to a decorator-based approach.
>
> Notable non-breaking changes in this update will be:
> - Support for ES6 `Set` and ES6 `Map` (although not for `WeakMap` and `WeakSet`)
> - Support for all typed arrays (such as `Float32Array` and `Uint8Array`)
> - Meaningful error messages and configurable error handler callback
> - Known-types can be acquired through static methods of decorated classes (as `Function[]`)

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
