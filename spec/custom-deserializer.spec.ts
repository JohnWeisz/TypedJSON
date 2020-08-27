import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../src/typedjson';

describe('custom member deserializer', () => {
    @jsonObject
    class Person {
        @jsonMember({deserializer: (json: any) => json[0]})
        firstName: string;

        @jsonMember
        lastName: string;

        getFullName() {
            return `${this.firstName} ${this.lastName}`;
        }
    }

    beforeAll(function () {
        this.person = TypedJSON.parse('{ "firstName": ["John"], "lastName": "Doe" }', Person);
    });

    it('should properly deserialize', function () {
        expect(this.person.firstName).toBe('John');
        expect(this.person.lastName).toBe('Doe');
    });

    it('should return object of proper type', function () {
        expect(this.person instanceof Person).toBeTruthy();
    });

    it('should return object with callable functions', function () {
        expect(this.person.getFullName).toBeDefined();
        expect(this.person.getFullName()).toBe('John Doe');
    });

    it('should not affect serialization', function () {
        expect(TypedJSON.stringify(this.person, Person))
            .toBe('{"firstName":"John","lastName":"Doe"}');
    });
});

describe('custom array member deserializer', () => {
    @jsonObject
    class Obj {
        @jsonArrayMember(Number, {
            deserializer: (json: any) => json.split(',').map((v) => parseInt(v, 10)),
        })
        nums: Array<number>;

        @jsonMember
        str: string;

        sum() {
            return this.nums.reduce((sum, cur) => sum + cur, 0);
        }
    }

    beforeAll(function () {
        this.obj = TypedJSON.parse('{ "nums": "1,2,3,4,5", "str": "Some string" }', Obj);
    });

    it('should properly deserialize', function () {
        expect(this.obj.nums).toEqual([1, 2, 3, 4, 5]);
        expect(this.obj.str).toBe('Some string');
    });

    it('should obj object of proper type', function () {
        expect(this.obj instanceof Obj).toBeTruthy();
    });

    it('should return object with callable functions', function () {
        expect(this.obj.sum).toBeDefined();
        expect(this.obj.sum()).toBe(15);
    });

    it('should not affect serialization', function () {
        expect(TypedJSON.stringify(this.obj, Obj)).toBe('{"nums":[1,2,3,4,5],"str":"Some string"}');
    });
});

describe('custom delegating array member serializer', () => {
    @jsonObject
    class Inner {
        @jsonMember
        prop: string;

        woo(): string {
            return 'hoo';
        }
    }

    function objArrayDeserializer(
        values: Array<{prop: string; shouldDeserialize: boolean}> | undefined,
    ) {
        if (values === undefined) {
            return;
        }

        return TypedJSON.parseAsArray(
            values.filter(value => value.shouldDeserialize),
            Inner,
        );
    }

    @jsonObject
    class Obj {
        @jsonArrayMember(Inner, {deserializer: objArrayDeserializer})
        inners: Array<Inner>;

        @jsonMember
        str: string;
    }

    beforeAll(function () {
        this.obj = TypedJSON.parse(
            JSON.stringify({
                inners: [
                    {
                        prop: 'something',
                        shouldDeserialize: false,
                    },
                    {
                        prop: 'gogo',
                        shouldDeserialize: true,
                    },
                ],
                str: 'Text',
            }),
            Obj,
        );
    });

    it('should properly serialize', function () {
        expect(this.obj).toBeDefined();
        expect(this.obj instanceof Obj).toBeTruthy();
        expect(this.obj.str).toEqual('Text');
        expect(this.obj.inners.length).toEqual(1);
        expect(this.obj.inners[0] instanceof Inner).toBeTruthy();
        expect(this.obj.inners[0]).not.toHaveProperties(['shouldDeserialize']);
        expect(this.obj.inners[0]).toHaveProperties({prop: 'gogo'});
        expect(this.obj.inners[0].woo()).toEqual('hoo');
    });
});
