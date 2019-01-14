[![Build Status](https://travis-ci.com/Neos3452/TypedJSON.svg?branch=master)](https://travis-ci.com/Neos3452/TypedJSON)

Typed JSON parsing and serializing for TypeScript with [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md). Parse JSON into actual class instances. Recommended (but not required) to be used with [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators), a prototype for an ES7 Reflection API for Decorator Metadata.

 - Seamlessly integrate into existing code with [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md), ultra-lightweight syntax
 - Parse standard JSON to typed class instances, safely, without requiring any type-information to be specified in the source JSON
   - _Note: polymorphic object structures require simple type-annotations to be present in JSON, this is configurable to be complatible with other serializers, like [Json.NET](https://www.newtonsoft.com/json)_
 
## Installation

TypedJSON is available from npm, both for browser (e.g. using webpack) and NodeJS:

```
npm install typedjson
```

 - _Optional: install [ReflectDecorators](https://github.com/rbuckton/ReflectDecorators) for additional type-safety and reduced syntax requirements. ReflectDecorators must be available globally to work._

## How to use

TypedJSON uses decorators, and requires your classes to be annotated with `@jsonObject`, and properties with `@jsonMember` (or the specific `@jsonArrayMember`, `@jsonSetMember`, and `@jsonMapMember` decorators for collections, see below). Properties which are not annotated will not be serialized or deserialized.

TypeScript needs to run with the `experimentalDecorators` and `emitDecoratorMetadata` options enabled.

### Simple class

The following example demonstrates how to annotate a basic, non-nested class for serialization, and how to serialize to JSON and back:

```ts
@jsonObject
class MyDataClass
{
    @jsonMember
    public prop1: number;

    @jsonMember
    public prop2: string;
}
```

 - _Note: this example assumes you are using ReflectDecorators. Without it, `@jsonMember` requires a type argument, which is detailed below._

To convert between your typed (and annotated) class instance and JSON, create an instance of `TypedJSON`, with the class as its argument. The class argument specifies the root type of the object-tree represented by the emitted/parsed JSON:

```ts
let serializer = new TypedJSON(MyDataClass);
let object = new MyDataClass();

let json = serializer.stringify(object);
let object2 = serializer.parse(json);

object2 instanceof MyDataClass; // true
```

Since TypedJSON does not require special syntax to be present in the source JSON (except when using polymorphic objects), any raw JSON conforming to your object schema can work, so it's not required that the JSON comes from TypedJSON, it can come from anywhere:

```ts
let object3 = serializer.parse('{ "prop1": 1, "prop2": "2" }');

object3 instanceof MyDataClass; // true
```

### Collections

Properties which are of type Array, Set, or Map require the special `@jsonArrayMember`, `@jsonSetMember` and `@jsonMapMember` property decorators (respectively), which require a type argument for members (and keys in case of Maps). For primitive types, the type arguments are the corresponding wrapper types, which the following example showcases. Everything else works the same way:

```ts
@jsonObject
class MyDataClass
{
    @jsonArrayMember(Number)
    public prop1: number[];

    @jsonSetMember(String)
    public prop2: Set<string>;
    
    @jsonMapMember(Number, MySecondDataClass)
    public prop3: Map<number, MySecondDataClass>;
}
```

Sets are serialized as arrays, maps are serialized as arrays objects, each object having a `key` and a `value` property.

Multidimensional arrays require additional configuration, see Limitations below.

### Complex, nested object tree

TypedJSON works through your objects recursively, and can consume massively complex, nested object trees (except for some limitations with uncommon, untyped structures, see below in the limitations section).

```ts
@jsonObject
class MySecondDataClass
{
    @jsonMember
    public prop1: number;

    @jsonMember
    public prop2: number;
}

@jsonObject
class MyDataClass
{
    @jsonMember
    public prop1: MySecondDataClass;
    
    @jsonArrayMember(MySecondDataClass)
    public arrayProp: MySecondDataClass[];

    @jsonMapMember(Number, MySecondDataClass)
    public mapProp: Map<number, MySecondDataClass>;
}
```

### Using without ReflectDecorators

Without ReflectDecorators, `@jsonMember` requires an additional type argument, because TypeScript cannot infer it automatically:

```diff
@jsonObject
class MyDataClass
{
-   @jsonMember
+   @jsonMember({ constructor: Number })
    public prop1: number;

-   @jsonMember
+   @jsonMember({ constructor: MySecondDataClass })
    public prop2: MySecondDataClass;
}
```

This is not needed for `@jsonArrayMember`, `@jsonMapMember`, and `@jsonSetMember`, as those types already know the property type itself, as well as element/key types (although using ReflectDecorators adds runtime-type checking to these decorators, to help you spot errors).

## Limitations

### Type-definitions

TypedJSON is primarily for use-cases where object-trees are defined using instantiatible classes, and thus only supports a subset of all type-definitions possible in TypeScript. Interfaces and inline type definitions, for example, are not supported, and the following is not going to work so well:

```ts
@jsonObject
class MyDataClass
{
    @jsonMember
    public prop1: { prop2: { prop3: [1, 2, 3] } };
}
```

Instead, prefer creating the necessary class-structure for your object tree.

### Multi-dimensional arrays

TypedJSON only supports multi-dimensional arrays of a single type (can be polymorphic), and requires specifying the array dimension:

```ts
@jsonObject
class MyDataClass
{
    @jsonArrayMember(Number, { dimensions: 2 })
    public prop1: number[][][];

    @jsonArrayMember(Number, { dimensions: 3 })
    public prop1: number[][][];
}
```

### Class declaration order matters

When referencing a class in a nested object structure, the referenced class must be declared in advance, e.g.:

```typescript
class Employee
{
    @jsonMember
    public name: string;
}

class Company
{
    @jsonArrayMember(Employee)
    public employees: Employee[];
}
```

### No inferred property types

If using ReflectDecorators to infer the constructor (type) of properties, it's always required to manually specify the property type:

```diff
@jsonObject
class MyDataClass
{
    @jsonObject
-   public firstName = "john";
+   public firstName: string = "john";
}
```

## License

TypedJSON is licensed under the MIT License.
