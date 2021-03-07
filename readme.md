[![npm version](https://img.shields.io/npm/v/typedjson.svg?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/typedjson)
[![Build Status](https://img.shields.io/github/workflow/status/JohnWeisz/TypedJSON/Node%20CI?label=CI&logo=github&style=for-the-badge)
](https://github.com/JohnWeisz/TypedJSON/actions)
[![Build Status](https://img.shields.io/npm/l/typedjson?&style=for-the-badge&color=green)
](https://github.com/JohnWeisz/typedjson/blob/master/LICENSE)

Typed JSON parsing and serializing for TypeScript with [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md). Annotate your data-classes with simple-to-use decorators and parse standard JSON into actual class instances. For more type-safety and less syntax, recommended to be used with [reflect-metadata](https://github.com/rbuckton/reflect-metadata), a prototype for an ES7 Reflection API for Decorator Metadata.

 - Seamlessly integrate into existing code with [decorators](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md), ultra-lightweight syntax
 - Parse standard JSON to typed class instances, safely, without requiring any type-information to be specified in the source JSON
   - _Note: polymorphic object structures require simple type-annotations to be present in JSON, this is configurable to be compatible with other serializers, like [Json.NET](https://www.newtonsoft.com/json)_
 
## Installation

TypedJSON is available from npm, both for browser (e.g. using webpack) and NodeJS:

```
npm install typedjson
```

 - _Optional: install [reflect-metadata](https://github.com/rbuckton/reflect-metadata) for additional type-safety and reduced syntax requirements. `reflect-metadata` must be available globally to work. This can usually be done with `import 'reflect-metadata';` in your main bundle/entrypoint/index.js._

## How to use

TypedJSON uses decorators, and requires your classes to be annotated with `@jsonObject`, and properties with `@jsonMember` (or the specific `@jsonArrayMember`, `@jsonSetMember`, and `@jsonMapMember` decorators for collections, see below). Properties which are not annotated will not be serialized or deserialized.

TypeScript needs to run with the `experimentalDecorators` and `emitDecoratorMetadata` options enabled.

### Simple class

The following example demonstrates how to annotate a basic, non-nested class for serialization, and how to serialize to JSON and back:

```typescript
import 'reflect-metadata';
import { jsonObject, jsonMember, TypedJSON } from 'typedjson';

@jsonObject
class MyDataClass
{
    @jsonMember
    public prop1: number;

    @jsonMember
    public prop2: string;
}
```

_Note: this example assumes you are using ReflectDecorators. Without it, `@jsonMember` requires a type argument, which is detailed below._

To convert between your typed (and annotated) class instance and JSON, create an instance of `TypedJSON`, with the class as its argument. The class argument specifies the root type of the object-tree represented by the emitted/parsed JSON:

```typescript
const serializer = new TypedJSON(MyDataClass);
const object = new MyDataClass();

const json = serializer.stringify(object);
const object2 = serializer.parse(json);

object2 instanceof MyDataClass; // true
```

Since TypedJSON does not require special syntax to be present in the source JSON (except when using polymorphic objects), any raw JSON conforming to your object schema can work, so it's not required that the JSON comes from TypedJSON, it can come from anywhere:

```typescript
const object3 = serializer.parse('{ "prop1": 1, "prop2": "2" }');

object3 instanceof MyDataClass; // true
```

Note TypedJSON supports parsing arrays and maps at root level as well. Those methods are defined in [parser.ts](https://github.com/JohnWeisz/TypedJSON/blob/master/src/parser.ts). Here is an example showing how to parse a json array:
```typescript
const object4 = serializer.parseAsArray('[{ "prop1": 1, "prop2": "2" }]');
object4; // [ MyDataClass { prop1: 1, prop2: '2' } ]
```

### Mapping types

At times, you might find yourself using a custom type such as `Point`, `Decimal`, or `BigInt`. In this case, `TypedJSON.mapType` can be used to define serialization and deserialization functions to prevent the need of repeating on each member. Example:

```typescript
import {jsonObject, jsonMember, TypedJSON} from 'typedjson';
import * as Decimal from 'decimal.js'; // Or any other library your type originates from

TypedJSON.mapType(BigInt, {
    deserializer: json => json == null ? json : BigInt(json),
    serializer: value => value == null ? value : value.toString(),
});

TypedJSON.mapType(Decimal, {
    deserializer: json => json == null ? json : new Decimal(json),
    serializer: value => value == null ? value : value.toString(),
});

@jsonObject
class MappedTypes {

    @jsonMember
    cryptoKey: bigint;

    @jsonMember
    money: Decimal;
}

const result = TypedJSON.parse({cryptoKey: '1234567890123456789', money: '12345.67'}, MappedTypes);
console.log(result.money instanceof Decimal); // true 
console.log(typeof result.cryptoKey === 'bigint'); // true 
```

Do note that in order to prevent the values from being parsed as `Number`, losing precision in the process, they have to be strings.

### Collections

Properties which are of type Array, Set, or Map require the special `@jsonArrayMember`, `@jsonSetMember` and `@jsonMapMember` property decorators (respectively), which require a type argument for members (and keys in case of Maps). For primitive types, the type arguments are the corresponding wrapper types, which the following example showcases. Everything else works the same way:

```typescript
import 'reflect-metadata';
import { jsonObject, jsonArrayMember, jsonSetMember, jsonMapMember, TypedJSON } from 'typedjson';

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

```typescript
import 'reflect-metadata';
import { jsonObject, jsonMember, jsonArrayMember, jsonMapMember, TypedJSON } from 'typedjson';

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

### Any type
In case you don't want TypedJSON to make any conversion the `AnyT` type can be used. 

```typescript
import {AnyT, jsonObject, jsonMember} from 'typedjson';

@jsonObject
class Something {
    @jsonMember(AnyT)
    anythingGoes: any;
}
```

### Using without ReflectDecorators

Without ReflectDecorators, `@jsonMember` requires an additional type argument, because TypeScript cannot infer it automatically:

```diff
- import 'reflect-metadata';
  import { jsonObject, jsonMember, TypedJSON } from 'typedjson';

  @jsonObject
  class MyDataClass
  {
-     @jsonMember
+     @jsonMember(Number)
      public prop1: number;

-     @jsonMember
+     @jsonMember(MySecondDataClass)
      public prop2: MySecondDataClass;
  }
```

This is not needed for `@jsonArrayMember`, `@jsonMapMember`, and `@jsonSetMember`, as those types already know the property type itself, as well as element/key types (although using ReflectDecorators adds runtime-type checking to these decorators, to help you spot errors).

### Using `JSON.stringify`

If you want to use `JSON.stringify` to serialize the objects using TypedJSON you can annotate a class with `@toJson` and it will create `toJSON` function on the class prototype. By default it will throw an error if such function is already defined, but you can override this behavior by setting `overwrite` to `true` in the decorator's options.

### Using js objects instead of strings

Sometimes instead of serializing your data to a string you might want to get a normal javascript object. This can be especially useful when working with a framework like angular which does the stringification for you or when you want to stringify using a different library then a builtin `JSON.stringify`.

To do that TypedJSON exposes `toPlainJson` and friends. The return value is the one that is normally passed to stringification. For deserialization all `parse` methods apart from strings also accept javascript objects.

### Options

#### preserveNull

By default TypedJSON ignores the properties that are set to null. If you want to override this behavior you can set this option to `true`.<br/>
You can set it globally or on TypedJSON instance to have everything preserve null values or on class level or member level to only affect the respective thing.

#### onDeserialized and beforeSerialization

On `@jsonObject` you can specify name of methods to be called before serializing the object or after it was deserialized. This method can be a static method or instance member. In case you have static and member with the same name - the member method is preferred.

#### serializer and deserializer

On `@jsonMember` decorator family you can provide your own functions to perform custom serialization and deserialization. This could be useful if you want to transform your input/output. For example, if instead of using javascript Date object you want to use moment.js object, you could use code like this:

```typescript
@jsonObject
class UsingMoment {
    @jsonMember({ deserializer: value => moment(value), serializer: timestamp => timestamp.format() })
    timestamp: Moment;
}
```

Note, that with those custom function you get full control over the serialization and deserialization process. This means, you will also receive any undefined (even if a property is not present), and null values. Basically, anything that comes in with an input json.

Custom deserializing and serializing functions can also fall back to the current runtime, so you don't need to create and configure a new one:

```typescript
function objArrayDeserializer(
    json: Array<{prop: string; shouldDeserialize: boolean}>,
    params: CustomDeserializerParams,
) {
    return json.filter(value => value.shouldDeserialize).map(
        value => params.fallback(value, Inner),
    );
}

@jsonObject
class Obj {
    @jsonArrayMember(Inner, {deserializer: objArrayDeserializer})
    inners: Array<Inner>;

    @jsonMember
    str: string;
}
```

#### Different property name in JSON and class

You can provide a name for a property if it differs between a serialized JSON and your class definition.

```typescript
import 'reflect-metadata';
import { jsonObject, jsonMember, TypedJSON } from 'typedjson';

@jsonObject
class MyDataClass {
    @jsonMember({ name: 'kebab-case' })
    camelCase: string;
}
```

For even more advanced cases, it is possible to provide different names for deserialization and serialization, although it requires more typing. In such a case however, you might want to reconsider your model - maybe you are putting two different things into a single class.

```typescript
@jsonObject
class Model {
    private _prop: any;

    @jsonMember
    public get outputProp(): any {
        return this._prop;
    }
    public set outputProp(value: any) {
        // noop
    }

    @jsonMember
    public get inputProp(): any {
        return undefined;
    }
    public set inputProp(value: any) {
        this._prop = value;
    }
}
```

## Limitations

### Declaration order &amp; circular class dependencies

Because of how decorators work at runtime, dependent class declaration order matters in TypedJSON. If a dependency is referenced before it is declared, it will result in an undefined reference and cause errors:

```typescript
@jsonObject
class Foo {
    @jsonMember // error, because Bar is only defined later
    bar: Bar;
    
    @jsonMember(Bar) // error, because Bar is only defined later
    baz: Bar;
}


@jsonObject
class Bar {
    @jsonMember
    foo: Foo;
}
```

This can be resolved by fixing the declaration order of your dependent classes (i.e. by moving `Bar` before `Foo` in the above example).

In cases where this is not possible (most commonly because of a circular class-dependency), the more flexible lazy type definition syntax can be used instead:

```diff
  import {jsonObject, jsonMember} from 'typedjson';

  @jsonObject
  class Foo {
-     @jsonMember
+     @jsonMember(() => Bar)
      bar: Bar;
  
-     @jsonMember(Bar)
+     @jsonMember(() => Bar)
      baz: Bar;
  }
  
  @jsonObject
  class Bar {
-     @jsonMember
+     @jsonMember(() => Foo)
      foo: Foo;
  }
```

_Note: this is necessary even when inferring the type from the TypeScript type-annotation, requiring the use of an explicit lazy type definition at all times._

### Type-definitions

TypedJSON is primarily for use-cases where object-trees are defined using instantiatible classes, and thus only supports a subset of all type-definitions possible in TypeScript. Interfaces and inline type definitions, for example, are not supported, and the following is not going to work so well:

```typescript
import 'reflect-metadata';
import { jsonObject, jsonMember, TypedJSON } from 'typedjson';

@jsonObject
class MyDataClass
{
    @jsonMember
    public prop1: { prop2: { prop3: [1, 2, 3] } };
}
```

Instead, prefer creating the necessary class-structure for your object tree.

### Multi-dimensional arrays

TypedJSON only supports multi-dimensional arrays of a single type (can be polymorphic), and requires specifying the array dimension to do so:

```typescript
import 'reflect-metadata';
import { jsonObject, jsonArrayMember, TypedJSON } from 'typedjson';

@jsonObject
class MyDataClass
{
    @jsonArrayMember(Number, { dimensions: 2 })
    public prop1: number[][];

    @jsonArrayMember(Number, { dimensions: 3 })
    public prop2: number[][][];
}
```

### No inferred property types

If using ReflectDecorators to infer the constructor (type) of properties, it's always required to manually specify the property type:

```diff
  import 'reflect-metadata';
  import { jsonObject, jsonMember, TypedJSON } from 'typedjson';

  @jsonObject
  class MyDataClass
  {
      @jsonMember
-     public firstName = "john";
+     public firstName: string = "john";
  }
```

### No support for wrapped primitives

TypedJSON requires type-detection and considers wrapped primitives as their corresponding primitive type. For example, `Number` is always treated as `number` (note the case-difference), and no distinction can be made.

## Angular 8

With angular 8 there were changes to the default config of tsc and some options that are required are missing (https://github.com/angular/angular/issues/31495). To use TypedJSON you need to modify your tsconfig.json to include both `experimentalDecorators` and `emitDecoratorMetadata`.

With Angular 8 you also do not need to install `reflect-metadata` as it is already included in `core-js`. However, you still need to instruct ng cli to include it in the build. Add `import 'core-js/proposals/reflect-metadata';` to you polyfills.ts.

You can see all the necessary changes along with an example project here: https://github.com/Neos3452/test-typed-json/commit/5ce6f6bfd3b35dbb3fcfe14c28f0691036969934

## License

TypedJSON is licensed under the MIT License.
