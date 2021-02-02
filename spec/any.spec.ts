import {AnyT, jsonArrayMember, jsonMember, jsonObject, jsonSetMember, TypedJSON} from '../src';

describe('AnyT', () => {
    describe('on a simple class property', () => {
        @jsonObject
        class SimplePropertyAny {
            @jsonMember(AnyT)
            any: any;

            @jsonMember(AnyT)
            anyNullable?: any | null;
        }

        it('should deserialize simple object correctly', () => {
            const result = TypedJSON.parse({
                any: {foo: 'bar'},
                anyNullable: {foo: 'bar'},
            }, SimplePropertyAny);
            expect(result.any).toHaveProperties(['foo']);
            expect(result.anyNullable).toHaveProperties(['foo']);
        });

        it('should deserialize class instance correctly', () => {
            const foo = {foo: 'bar'};
            const result = TypedJSON.parse({
                any: foo,
                anyNullable: foo,
            }, SimplePropertyAny);
            expect(result.any).toEqual(foo);
            expect(result.anyNullable).toEqual(foo);
        });

        it('should serialize with referential equality', () => {
            const foo = {foo: 'bar'};
            const simplePropertyAny = new SimplePropertyAny();
            simplePropertyAny.any = foo;
            simplePropertyAny.anyNullable = foo;
            const result: any = TypedJSON.toPlainJson(simplePropertyAny, SimplePropertyAny);
            expect(result.any).toEqual(foo);
            expect(result.anyNullable).toEqual(foo);
        });
    });

    describe('on arrays', () => {
        @jsonObject
        class ArrayPropertyAny {
            @jsonArrayMember(AnyT)
            any: Array<any>;

            @jsonArrayMember(AnyT)
            anyNullable?: Array<any> | null;
        }

        it('should deserialize simple object correctly', () => {
            const result = TypedJSON.parse({
                any: [{foo: 'bar'}],
                anyNullable: [{foo: 'bar'}],
            }, ArrayPropertyAny);
            expect(result.any).toBeInstanceOf(Array);
            expect(result.any[0].foo).toEqual('bar');
            expect(result.anyNullable).toBeInstanceOf(Array);
            expect(result.anyNullable[0].foo).toEqual('bar');
        });

        it('should deserialize class instance correctly', () => {
            const foo = {foo: 'bar'};
            const result = TypedJSON.parse({
                any: [foo],
                anyNullable: [foo],
            }, ArrayPropertyAny);
            expect(result.any).toBeInstanceOf(Array);
            expect(result.any[0]).toEqual(foo);
            expect(result.anyNullable).toBeInstanceOf(Array);
            expect(result.anyNullable[0]).toEqual(foo);
        });

        it('should serialize with referential equality', () => {
            const foo = {foo: 'bar'};
            const arrayPropertyAny = new ArrayPropertyAny();
            arrayPropertyAny.any = [foo];
            arrayPropertyAny.anyNullable = [foo];
            const result: any = TypedJSON.toPlainJson(arrayPropertyAny, ArrayPropertyAny);
            expect(result.any[0]).toEqual(foo);
            expect(result.anyNullable[0]).toEqual(foo);
        });
    });

    describe('on set', () => {
        @jsonObject
        class SetPropertyAny {

            @jsonSetMember(AnyT)
            any: Set<any>;

            @jsonSetMember(AnyT)
            anyNullable?: Set<any> | null;
        }

        it('should deserialize simple object correctly', () => {
            const foo = {foo: 'bar'};
            const result = TypedJSON.parse({
                any: [foo, foo],
                anyNullable: [foo, foo],
            }, SetPropertyAny);
            expect(result.any).toBeInstanceOf(Set);
            expect(result.any.size).toBe(1);
            expect(result.any.values().next().value).toEqual(foo);
            expect(result.anyNullable).toBeInstanceOf(Set);
            expect(result.anyNullable.size).toBe(1);
            expect(result.anyNullable.values().next().value).toEqual(foo);
        });

        it('should deserialize with referential equality', () => {
            const foo = {foo: 'bar'};
            const result = TypedJSON.parse({
                any: [foo, foo],
                anyNullable: [foo, foo],
            }, SetPropertyAny);
            expect(result.any).toBeInstanceOf(Set);
            expect(result.any.values().next().value).toBe(foo);
            expect(result.anyNullable).toBeInstanceOf(Set);
            expect(result.anyNullable.values().next().value).toBe(foo);
        });

        it('should serialize with referential equality', () => {
            const foo = {foo: 'bar'};
            const setPropertyAny = new SetPropertyAny();
            setPropertyAny.any = new Set([foo, foo]);
            setPropertyAny.anyNullable = new Set([foo, foo]);
            const result: any = TypedJSON.toPlainJson(setPropertyAny, SetPropertyAny);
            expect(result.any.values().next().value).toEqual(foo);
            expect(result.anyNullable.values().next().value).toEqual(foo);
        });
    });

    it('should handle complex structures', () => {
        @jsonObject
        class Event {

            @jsonMember(AnyT)
            data?: {[k: string]: any} | null;
        }

        @jsonObject
        class A {

            @jsonArrayMember(Event)
            events: Array<Event>
        }

        const result = TypedJSON.parse({
            events: [
                {
                    data: {
                        files: [
                            {
                                name: 'file1',
                            },
                        ],
                    },
                },
            ],
        }, A);

        expect(result.events[0].data.files[0].name).toEqual('file1');
    });
});
