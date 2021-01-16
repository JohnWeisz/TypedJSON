import {
    jsonArrayMember,
    jsonMapMember,
    jsonMember,
    jsonObject,
    jsonSetMember,
    TypedJSON,
} from '../../src';

describe('Lazy types', () => {
    describe('simple member', () => {
        @jsonObject
        class Root {

            @jsonMember(() => Lazy)
            lazy: Lazy;
        }

        @jsonObject
        class Lazy {

            @jsonMember
            name: string;
        }

        const typedJson = new TypedJSON(Root);

        it('should deserialize', () => {
            const result = typedJson.parse({
                lazy: {
                    name: 'hello',
                },
            });

            expect(result.lazy).toBeInstanceOf(Lazy);
            expect(result.lazy.name).toBe('hello');
        });

        it('should serialize', () => {
            const root = new Root();
            root.lazy = new Lazy();
            root.lazy.name = 'hello';
            const result: any = typedJson.toPlainJson(root);

            expect(result.lazy.name).toBe('hello');
        });
    });

    describe('array member', () => {
        @jsonObject
        class Root {

            @jsonArrayMember(() => Lazy)
            lazy: Array<Lazy>;
        }

        @jsonObject
        class Lazy {

            @jsonMember
            name: string;
        }

        const typedJson = new TypedJSON(Root);

        it('should deserialize', () => {
            const result = typedJson.parse({
                lazy: [{name: 'hello'}],
            });

            expect(result.lazy.length).toBe(1);
            expect(result.lazy[0]).toBeInstanceOf(Lazy);
            expect(result.lazy[0].name).toBe('hello');
        });

        it('should serialize', () => {
            const root = new Root();
            const lazy = new Lazy();
            lazy.name = 'hello';
            root.lazy = [lazy];
            const result: any = typedJson.toPlainJson(root);

            expect(result.lazy.length).toBe(1);
            expect(result.lazy[0].name).toBe('hello');
        });
    });

    describe('map member', () => {
        @jsonObject
        class Root {

            @jsonMapMember(() => String, () => LazyValue)
            lazy: Map<String, LazyValue>;
        }

        @jsonObject
        class LazyValue {

            @jsonMember
            name: string;
        }

        const typedJson = new TypedJSON(Root);

        it('should deserialize', () => {
            const result = typedJson.parse({
                lazy: [{key: 'key', value: {name: 'hello'}}],
            });

            expect(result.lazy.size).toBe(1);
            expect(result.lazy).toBeInstanceOf(Map);
            expect(result.lazy.get('key')).toBeInstanceOf(LazyValue);
            expect(result.lazy.get('key').name).toBe('hello');
        });

        it('should serialize', () => {
            const root = new Root();
            const lazy = new LazyValue();
            lazy.name = 'hello';
            root.lazy = new Map<string, LazyValue>([['key', lazy]]);
            const result: any = typedJson.toPlainJson(root);

            expect(result.lazy.length).toBe(1);
            expect(result.lazy[0].key).toBe('key');
            expect(result.lazy[0].value.name).toBe('hello');
        });
    });

    describe('set member', () => {
        @jsonObject
        class Root {

            @jsonSetMember(() => Lazy)
            lazy: Set<Lazy>;
        }

        @jsonObject
        class Lazy {

            @jsonMember
            name: string;
        }

        const typedJson = new TypedJSON(Root);

        it('should deserialize', () => {
            const result = typedJson.parse({
                lazy: [{name: 'hello'}],
            });

            expect(result.lazy.size).toBe(1);
            expect(result.lazy).toBeInstanceOf(Set);
            expect(result.lazy.values().next().value).toBeInstanceOf(Lazy);
            expect(result.lazy.values().next().value.name).toBe('hello');
        });

        it('should serialize', () => {
            const root = new Root();
            const lazy = new Lazy();
            lazy.name = 'hello';
            root.lazy = new Set([lazy]);
            const result: any = typedJson.toPlainJson(root);

            expect(result.lazy.length).toBe(1);
            expect(result.lazy[0].name).toBe('hello');
        });
    });
});
