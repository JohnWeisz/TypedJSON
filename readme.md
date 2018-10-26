[![Build Status](https://travis-ci.com/Neos3452/TypedJSON.svg?branch=master)](https://travis-ci.com/Neos3452/TypedJSON)

**Example & how to use**

There are no publicly available, dedicated docs yet for 1.0, but most methods are commented nicely, and here's a quick example on how to serialize various types (I recommend using [reflect-metadata](https://github.com/rbuckton/reflect-metadata) in your project, so you don't have to manually annotate the type of `@jsonMember` properties twice, see at the bottom of this page):

```ts
@jsonObject
class MyDataClass
{
    // Primitives serialization
    @jsonMember
    public prop1: number; // or string, boolean, etc.

    // Array serialization
    @jsonArrayMember(Number)
    public arrayProp: number[];

    // Map serialization
    @jsonMapMember(Number, String)
    public mapProp: Map<number, string>;

    // Set serialization
    @jsonSetMember(Number)
    public setProp: Set<number>;
}
```

Of course, all 4 serialization techniques (single, array, map, set) support nested objects (nested object class must be also decorated with `@jsonObject` for this to work, obviously). Example:

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

Additionally, there's built-in support for TypedArray objects (serialized as `number[]`), `Date`, `ArrayBuffer` (serialized as string at this time, so this might not be a good idea, prefer using a TypedArray instead), this is available by simply using `@jsonMember`. Serialization of Maps, Sets, and Arrays of root objects is also supported.

After annotating your objects as shown above, you simply consume them by creating a new `TypedJSON` object, supplying the _constructor_ of the root data type to it:

```ts
let object = new MyDataClass(); // ...
let serializer = new TypedJSON(MyDataClass);

let json = serializer.stringify(object);
let object2 = serializer.parse(json);
```

**How are these objects serialized?**

Sets and arrays are simply serialized as arrays, Maps are serialized as arrays of _key-value-pair objects_, TypedArrays are serialized as numeric arrays.

**How to use without reflect-metadata?**

If you don't use `reflect-metadata`, you need to manually add the constructor reference to `@jsonMember`, e.g.:

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

This is not needed for `@jsonArrayMember`, `@jsonMapMember`, and `@jsonSetMember`, as those types already know the property type itself, as well as element/key types (although using `reflect-metadata` adds runtime-type checking to these decorators, to help you spot errors).
