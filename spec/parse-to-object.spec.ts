import { parseToJSObject } from '../src/typedjson/helpers';

describe("parse To Object", function () {
    it("should passthrough objects", function () {
        const obj = {
            a: 1,
            b: 2,
        };

        const obj2 = parseToJSObject(obj);
        expect(obj2).toBe(obj);
    });

    it("should passthrough arrays", function () {
        const arr = [{
            a: 1,
            b: 2,
        }];

        const arr2 = parseToJSObject(arr);
        expect(arr2).toBe(arr);
    });

    it("should parse object string", function () {
        const arr = {
            a: 1,
            b: 2,
        };

        const arr2 = parseToJSObject(JSON.stringify(arr));
        expect(arr2).toEqual(arr);
    });

    it("should throw on primitives", function () {
        try {
            parseToJSObject(1);
            fail();
        } catch (e) {}

        try {
            parseToJSObject("asda");
            fail();
        } catch (e) {}


        try {
            parseToJSObject(false);
            fail();
        } catch (e) {}
    });
});
