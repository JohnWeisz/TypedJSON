import {parseToJSObject} from '../src/typedjson/helpers';

describe('parse To Object', () => {
    it('should passthrough objects', () => {
        const obj = {
            a: 1,
            b: 2,
        };

        const obj2 = parseToJSObject(obj, Object);
        expect(obj2).toBe(obj);
    });

    it('should passthrough arrays', () => {
        const arr = [{
            a: 1,
            b: 2,
        }];

        const arr2 = parseToJSObject(arr, Array);
        expect(arr2).toBe(arr);
    });

    it('should parse object string', () => {
        const arr = {
            a: 1,
            b: 2,
        };

        const arr2 = parseToJSObject(JSON.stringify(arr), Object);
        expect(arr2).toEqual(arr);
    });

    it('should passthrough primitives', () => {
        expect(parseToJSObject(1, Number)).toBe(1);
        expect(parseToJSObject(false, Boolean)).toBe(false);
    });

    it('should parse strings with quotes, but passthrough other', () => {
        // string is obvious
        expect(parseToJSObject('"I am a string"', String)).toEqual('I am a string');
        expect(parseToJSObject('just a string', String)).toBe('just a string');
        // but also the types that are serialized to string
        expect(parseToJSObject('"1970-01-18T20:51:55.254Z"', Date))
            .toEqual('1970-01-18T20:51:55.254Z');
        expect(parseToJSObject('1970-01-18T20:51:55.254Z', Date)).toBe('1970-01-18T20:51:55.254Z');
        expect(parseToJSObject('"畤慰"', ArrayBuffer)).toEqual('畤慰');
        expect(parseToJSObject('畤慰', ArrayBuffer)).toBe('畤慰');
        expect(parseToJSObject('"畤慰"', DataView)).toEqual('畤慰');
        expect(parseToJSObject('畤慰', DataView)).toBe('畤慰');
    });

    it('should passthrough builtins', () => {
      const date = new Date();
      expect(parseToJSObject(date, Date)).toBe(date);
      const buffer = new ArrayBuffer(3);
      expect(parseToJSObject(buffer, ArrayBuffer)).toBe(buffer);
    });
});
