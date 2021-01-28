import {AnyT, jsonArrayMember, jsonMember, jsonObject, jsonSetMember, TypedJSON} from '../src';

describe('AnyT', () => {
    class Foo {
        constructor(public foo: string) {
        }
    }

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
            const result = TypedJSON.parse({
                any: new Foo('bar'),
                anyNullable: new Foo('bar'),
            }, SimplePropertyAny);
            expect(result.any).toBeInstanceOf(Foo);
            expect(result.any.foo).toEqual('bar');
            expect(result.anyNullable).toBeInstanceOf(Foo);
            expect(result.anyNullable.foo).toEqual('bar');
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
            const result = TypedJSON.parse({
                any: [new Foo('bar')],
                anyNullable: [new Foo('bar')],
            }, ArrayPropertyAny);
            expect(result.any).toBeInstanceOf(Array);
            expect(result.any[0]).toBeInstanceOf(Foo);
            expect(result.any[0].foo).toEqual('bar');
            expect(result.anyNullable).toBeInstanceOf(Array);
            expect(result.anyNullable[0]).toBeInstanceOf(Foo);
            expect(result.anyNullable[0].foo).toEqual('bar');
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
            expect(result.any.values().next().value.foo).toEqual('bar');
            expect(result.anyNullable).toBeInstanceOf(Set);
            expect(result.anyNullable.size).toBe(1);
            expect(result.anyNullable.values().next().value.foo).toEqual('bar');
        });

        it('should deserialize class instance correctly', () => {
            const foo = new Foo('bar');
            const result = TypedJSON.parse({
                any: [foo, foo],
                anyNullable: [foo, foo],
            }, SetPropertyAny);
            expect(result.any).toBeInstanceOf(Set);
            const firstValueAny = result.any.values().next().value;
            expect(firstValueAny).toBeInstanceOf(Foo);
            expect(firstValueAny.foo).toEqual('bar');
            expect(result.anyNullable).toBeInstanceOf(Set);
            const firstValueAnyNullable = result.anyNullable.values().next().value;
            expect(firstValueAnyNullable).toBeInstanceOf(Foo);
            expect(firstValueAnyNullable.foo).toEqual('bar');
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
