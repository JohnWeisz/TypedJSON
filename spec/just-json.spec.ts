import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../src';

describe('json (without automatic stringify)', () => {
    describe('string', () => {
        it('should deserialize', () => {
            // stringified json version cuz ""
            expect(TypedJSON.parse('"str"', String)).toEqual('str');
            // already parsed
            expect(TypedJSON.parse('str', String)).toEqual('str');

            // because we detect naively
            try {
                expect(TypedJSON.parse('"sdfs"fdsf"', String)).toEqual(undefined);
                fail();
            } catch (e) {
                // Ignore error
            }
        });

        it('should serialize', () => {
            expect(TypedJSON.toPlainJson('str', String)).toEqual('str');
        });
    });

    describe('rest of primitives', () => {
        it('should deserialize', () => {
            expect(TypedJSON.parse(45834, Number)).toEqual(45834);
            expect(TypedJSON.parse(true, Boolean)).toEqual(true);
            expect(TypedJSON.parse(1543915254, Date)).toEqual(new Date(1543915254));
            expect(TypedJSON.parse('1970-01-18T20:51:55.254Z', Date)).toEqual(new Date(1543915254));

            const dataBuffer = Uint8Array.from([100, 117, 112, 97]) as any;
            expect(TypedJSON.parse('畤慰', ArrayBuffer)).toEqual(dataBuffer);
            expect(TypedJSON.parse('畤慰', DataView)).toEqual(dataBuffer);
            expect(TypedJSON.parse([100, 117, 112, 97], Uint8Array)).toEqual(dataBuffer);
        });

        it('should serialize', () => {
            expect(TypedJSON.toPlainJson(45834, Number)).toEqual(45834);
            expect(TypedJSON.toPlainJson(true, Boolean)).toEqual(true);
            const dateMs = new Date(1543915254);
            expect(TypedJSON.toPlainJson(dateMs, Date)).toEqual(dateMs);
            const dateStr = new Date('2018-12-04T09:20:54');
            expect(TypedJSON.toPlainJson(dateStr, Date)).toEqual(dateStr);

            const buffer = new ArrayBuffer(4);
            const view = new DataView(buffer);
            view.setInt8(0, 100);
            view.setInt8(1, 117);
            view.setInt8(2, 112);
            view.setInt8(3, 97);
            expect(TypedJSON.toPlainJson(buffer, ArrayBuffer)).toEqual('畤慰');
            expect(TypedJSON.toPlainJson(view, DataView)).toEqual('畤慰');
            expect(TypedJSON.toPlainJson(new Uint8Array(buffer), Uint8Array))
                .toEqual([100, 117, 112, 97]);
        });
    });

    describe('object', () => {
        @jsonObject
        class SomeThing {
            @jsonMember
            propStr: String;
            @jsonMember
            propNum: number;
            @jsonArrayMember(String)
            propArr: Array<String>;
            @jsonMember
            propDate: Date;
        }

        const json = Object.freeze({
            propStr: 'dsgs',
            propNum: 653,
            propArr: ['dslfks'],
            propDate: new Date(1543915254),
        });

        it('should deserialize', () => {
            expect(TypedJSON.parse(json, SomeThing)).toEqual(Object.assign(new SomeThing(), json));
            expect(TypedJSON.parseAsArray([json], SomeThing))
                .toEqual([Object.assign(new SomeThing(), json)]);
        });

        it('should serialize', () => {
            expect(TypedJSON.toPlainJson(Object.assign(new SomeThing(), json), SomeThing))
                .toEqual(json);
            expect(TypedJSON.toPlainArray([Object.assign(new SomeThing(), json)], SomeThing))
                .toEqual([json]);
        });
    });

    describe('array', () => {
        it('should deserialize', () => {
            expect(TypedJSON.parseAsArray(['alas', 'dfsd'], String)).toEqual(['alas', 'dfsd']);
        });

        it('should serialize', () => {
            expect(TypedJSON.toPlainArray(['alas', 'dfsd'], String)).toEqual(['alas', 'dfsd']);
        });
    });
});
