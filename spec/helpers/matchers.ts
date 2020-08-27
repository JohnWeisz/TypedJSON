beforeEach(() => {
    jasmine.addMatchers({
        toHaveProperties(util, customEqualityMatchers): jasmine.CustomMatcher {
            function equalOnPropNames<T extends Object>(
                actual: T,
                expected: Array<keyof T>,
            ): boolean {
                return expected.every(prop => prop in actual);
            }

            function equalOnPropValues<T extends {[k: string]: any}>(
                actual: T,
                expected: Partial<T>,
            ): boolean {
                return Object.keys(expected)
                    .every(
                        key => key in actual
                            && util.equals(expected[key], actual[key], customEqualityMatchers),
                    );
            }

            return {
                compare<T extends Object>(
                    actual: T,
                    expected: Partial<T> | Array<keyof T>,
                    ...customMsgs: Array<any>
                ) {
                    let pass: boolean;
                    let name: string;
                    if (Array.isArray(expected)) {
                        pass = equalOnPropNames(actual, expected);
                        name = 'To have properties';
                    } else {
                        pass = equalOnPropValues(actual, expected);
                        name = 'To have properties equal to';
                    }

                    return {
                        pass,
                        message: util.buildFailureMessage(
                            name,
                            pass,
                            actual,
                            expected,
                            ...customMsgs,
                        ),
                    };
                },
            };
        },
        toBeInstanceOf(util): jasmine.CustomMatcher {
            return {
                compare<T>(
                    actual: T,
                    expected: Function,
                    ...customMsgs: Array<any>
                ) {
                    const pass = actual instanceof expected;
                    return {
                        pass,
                        message: util.buildFailureMessage(
                            'To be instance of',
                            pass,
                            actual,
                            expected,
                            ...customMsgs,
                        ),
                    };
                },
            };
        },
        toBeOfLength(util): jasmine.CustomMatcher {
            return {
                compare<T extends ArrayLike<T>>(
                    actual: T,
                    expected: number,
                    ...customMsgs: Array<any>
                ) {
                    const pass = actual?.length === expected;
                    return {
                        pass,
                        message: util.buildFailureMessage(
                            'To be of length',
                            pass,
                            actual,
                            expected,
                            ...customMsgs,
                        ),
                    };
                },
            };
        },
    });
    jasmine.addCustomEqualityTester((first: any, second: any): boolean | undefined => {
        const firstAsInt8Array: Int8Array | undefined = tryAsInt8Array(first);
        const secondAsInt8Array: Int8Array | undefined = tryAsInt8Array(second);

        if (firstAsInt8Array === undefined || secondAsInt8Array === undefined) {
            return;
        }

        if (firstAsInt8Array.length !== secondAsInt8Array.length) {
            return false;
        }
        return firstAsInt8Array.every((num, i) => num == secondAsInt8Array[i]);
    });
});

function tryAsInt8Array(obj: any): Int8Array | undefined {
    if (obj instanceof ArrayBuffer) {
        return new Int8Array(obj);
    } else if (ArrayBuffer.isView(obj)) {
        return new Int8Array(obj.buffer);
    }
}

declare namespace jasmine {
    /* eslint-disable @typescript-eslint/method-signature-style */
    interface Matchers<T> {
        toHaveProperties(
            expectation: Partial<T> | Array<keyof T>,
            ...expectationFailOutput: Array<any>,
        ): boolean;

        toBeInstanceOf(expectation: Function, ...expectationFailOutput: Array<any>): boolean;
    }

    interface ArrayLikeMatchers<T> extends Matchers<ArrayLike<T>> {
        toBeOfLength: (expectation: number, ...expectationFailOutput: Array<any>) => boolean;
    }
}
