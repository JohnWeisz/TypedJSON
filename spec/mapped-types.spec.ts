import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../src';

TypedJSON.setGlobalConfig({
    errorHandler: e => {
        throw e;
    },
});

describe('mapped types', () => {
    class CustomType {
        value: any;

        constructor(value: any) {
            this.value = value;
        }

        hasSucceeded(): boolean {
            return this.value != null;
        }
    }

    @jsonObject
    class MappedTypesSpec {

        @jsonMember
        one: CustomType;

        @jsonMember
        two: CustomType;
    }

    const testData = {
        one: 1,
        two: 2,
    };

    describe('global', () => {
        TypedJSON.mapType(CustomType, {
            deserializer: json => new CustomType(json),
            serializer: value => value.value,
        });

        it('deserializes', () => {
            const result = TypedJSON.parse(testData, MappedTypesSpec);

            expect(result.one).toBeInstanceOf(CustomType);
            expect(result.one.hasSucceeded()).toBeTrue();
            expect(result.two).toBeInstanceOf(CustomType);
            expect(result.two.hasSucceeded()).toBeTrue();
        });

        it('serializes', () => {
            const test = new MappedTypesSpec();
            test.one = new CustomType(1);
            test.two = new CustomType(2);
            const result = TypedJSON.toPlainJson(test, MappedTypesSpec);

            expect(result).toEqual(testData);
        });
    });

    describe('instance', () => {
        const typedJson = new TypedJSON(MappedTypesSpec);
        typedJson.mapType(CustomType, {
            deserializer: json => new CustomType(json),
            serializer: value => value.value,
        });

        it('deserializes', () => {
            const result = typedJson.parse(testData);

            expect(result.one).toBeInstanceOf(CustomType);
            expect(result.one.hasSucceeded()).toBeTrue();
            expect(result.two).toBeInstanceOf(CustomType);
            expect(result.two.hasSucceeded()).toBeTrue();
        });

        it('serializes', () => {
            const test = new MappedTypesSpec();
            test.one = new CustomType(1);
            test.two = new CustomType(2);
            const result = typedJson.toPlainJson(test);

            expect(result).toEqual(testData);
        });
    });

    describe('works with constructor,', () => {
        @jsonObject
        class MappedTypeWithConstructor {

            @jsonMember({constructor: CustomType})
            nullable: any;
        }

        const typedJson = new TypedJSON(MappedTypeWithConstructor);
        const CustomTypeMap = {
            deserializer: json => new CustomType(json),
            serializer: value => value.value,
        };
        typedJson.mapType(CustomType, CustomTypeMap);

        it('deserializes', () => {
            spyOn(CustomTypeMap, 'deserializer').and.callThrough();
            const result = typedJson.parse({nullable: 5});
            expect(result.nullable?.hasSucceeded()).toBeTrue();
            expect(result.nullable?.value).toBe(5);
            expect(CustomTypeMap.deserializer).toHaveBeenCalled();
        });

        it('serializes', () => {
            spyOn(CustomTypeMap, 'serializer').and.callThrough();
            const object = new MappedTypeWithConstructor();
            object.nullable = new CustomType(5);
            const result = typedJson.toPlainJson(object);
            expect(CustomTypeMap.serializer).toHaveBeenCalled();
            expect(result).toEqual({nullable: 5});
        });
    });

    it('can be overwritten with deserializer/serializer prop', () => {
        const jsonMemberOptions = {
            deserializer: json => new CustomType(0),
            serializer: value => 1,
        };

        const CustomTypeMap = {
            deserializer: json => new CustomType(json),
            serializer: value => value.value,
        };

        spyOn(CustomTypeMap, 'serializer').and.callThrough();
        spyOn(jsonMemberOptions, 'serializer').and.callThrough();
        spyOn(CustomTypeMap, 'deserializer').and.callThrough();
        spyOn(jsonMemberOptions, 'deserializer').and.callThrough();

        @jsonObject
        class OverriddenSerializer {
            @jsonMember(jsonMemberOptions)
            overwritten: CustomType;

            @jsonMember
            simple: CustomType;
        }

        const typedJson = new TypedJSON(OverriddenSerializer);
        typedJson.mapType(CustomType, CustomTypeMap);

        const parsed = typedJson.parse({data: 5, simple: 5});
        expect(CustomTypeMap.deserializer).toHaveBeenCalledTimes(1);
        expect(jsonMemberOptions.deserializer).toHaveBeenCalledTimes(1);
        expect(parsed.overwritten.value).toBe(0);
        expect(parsed.simple.value).toBe(5);

        const plain: any = typedJson.toPlainJson(parsed);
        expect(CustomTypeMap.serializer).toHaveBeenCalledTimes(1);
        expect(jsonMemberOptions.serializer).toHaveBeenCalledTimes(1);
        expect(plain.overwritten).toBe(1);
        expect(plain.simple).toBe(5);
    });

    it('works on arrays', () => {
        @jsonObject
        class MappedTypeWithArray {

            @jsonArrayMember(CustomType)
            array: Array<CustomType>;
        }

        const typedJson = new TypedJSON(MappedTypeWithArray);
        const CustomTypeMap = {
            deserializer: json => new CustomType(json),
            serializer: value => value.value,
        };
        typedJson.mapType(CustomType, CustomTypeMap);

        spyOn(CustomTypeMap, 'serializer').and.callThrough();
        spyOn(CustomTypeMap, 'deserializer').and.callThrough();
        const parsed = typedJson.parse({array: [1, 5]});
        expect(CustomTypeMap.deserializer).toHaveBeenCalled();
        expect(parsed.array.map(c => c.value)).toEqual([1, 5]);

        const plain: any = typedJson.toPlainJson(parsed);
        expect(CustomTypeMap.serializer).toHaveBeenCalled();
        expect(plain.array).toEqual([1, 5]);
    });
});
