import {jsonArrayMember, jsonMember, jsonObject, TypedJSON} from '../../src';

describe('lazy, basic serialization of', () => {
    describe('class with defaults', () => {
        describe('by assigment', () => {
            @jsonObject
            class WithDefaults {
                @jsonMember
                num: number = 2;

                @jsonMember
                str: string = 'Hello world';

                @jsonMember
                bool: boolean = true;

                @jsonArrayMember(() => String)
                arr: Array<string> = [];

                @jsonMember
                present: number = 10;
            }

            it('should use defaults when missing', () => {
                const deserialized = TypedJSON.parse('{"present":5}', WithDefaults);
                const expected = new WithDefaults();
                expected.present = 5;
                expect(deserialized).toEqual(expected);
            });
        });

        describe('by constructor', () => {
            @jsonObject
            class WithCtr {
                @jsonMember
                num: number;

                @jsonMember
                str: string;

                @jsonMember
                bool: boolean;

                @jsonArrayMember(() => String)
                arr: Array<string>;

                @jsonMember
                present: number;

                constructor() {
                    this.num = 2;
                    this.str = 'Hello world';
                    this.bool = true;
                    this.arr = [];
                    this.present = 10;
                }
            }

            it('should use defaults when missing', () => {
                const deserialized = TypedJSON.parse('{"present":5}', WithCtr);
                const expected = new WithCtr();
                expected.present = 5;
                expect(deserialized).toEqual(expected);
            });
        });
    });
});
