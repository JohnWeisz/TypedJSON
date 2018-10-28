declare namespace jasmine {
    interface Matchers<T> {
        toHaveProperties(expectation: Partial<T>|(keyof T)[], ...expectationFailOutput: any[]);
        toBeInstanceOf(expectation: Function, ...expectationFailOutput: any[]);
    }
}

beforeEach(function() {
    jasmine.addMatchers({
        toHaveProperties(util, customEqualityMatchers) {
            function equalOnPropNames<T extends Object>(actual: T, expected: (keyof T)[]) {
                return expected.every(prop => prop in actual);
            }

            function equalOnPropValues<T extends Object>(actual: T, expected: Partial<T>) {
                return Object.keys(expected)
                    .every(
                        key => key in actual
                            && util.equals(expected[key], actual[key], customEqualityMatchers),
                    );
            }

            return {
                compare<T extends Object>(
                    actual: T,
                    expected: Partial<T>|(keyof T)[],
                    ...customMsgs: any[]
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
                            name, pass, actual, expected, ...customMsgs,
                        ),
                    };
                }
            };
        },
        toBeInstanceOf(util) {
            return {
                compare<T>(
                    actual: T,
                    expected: Function,
                    ...customMsgs: any[]
                ) {
                    const pass = actual instanceof expected;
                    return {
                        pass,
                        message: util.buildFailureMessage(
                            'To be instance of', pass, actual, expected, ...customMsgs,
                        ),
                    }
                },
            };
        },
    });
});
