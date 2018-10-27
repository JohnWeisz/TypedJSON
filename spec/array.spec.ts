import {jsonObject, jsonMember, TypedJSON} from "../js/typedjson";

describe('array of objects', function () {
    @jsonObject
    class Simple {
        @jsonMember
        strProp: string;

        @jsonMember
        numProp: number;

        constructor(init: {strProp: string, numProp: number})
        constructor()
        constructor(init?: {strProp: string, numProp: number}) {
            if (init) {
                this.strProp = init.strProp;
                this.numProp = init.numProp;
            }
        }

        public foo() {
            return `${this.strProp}-${this.numProp}`;
        }
    }

    it('deserialized should be of proper type', function () {
        const expectation = [
            { strProp: 'delta', numProp: 4 },
            { strProp: 'bravo', numProp: 2 },
            { strProp: 'gamma', numProp: 0 },
        ];

        const result = TypedJSON.parseAsArray(JSON.stringify(expectation), Simple);

        expect(result.length).toBe(3, 'Deserialized array is of wrong length');
        result.forEach((obj, index) => {
            expect(obj instanceof Simple).toBeTruthy(`${index} was not of type Simple`);
            expect(obj).toHaveProperties(expectation[index], '${index} was deserialized incorrectly');
        });
    });

    it('serialized should contain all elements', function () {
        const expectation = [
            { strProp: 'delta', numProp: 4 },
            { strProp: 'bravo', numProp: 2 },
            { strProp: 'gamma', numProp: 0 },
        ];

        const result = TypedJSON.stringifyAsArray(expectation.map(obj => new Simple(obj)), Simple);

        expect(result).toBe(JSON.stringify(expectation));
    });
});
