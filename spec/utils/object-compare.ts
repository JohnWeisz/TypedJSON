if (!console) {
    console = {
        warn: function (...args: any[]) { }
    } as any;
}

export function isEqual<T>(a: Object, b: Object): boolean;
export function isEqual<T>(a: T, b: T): boolean;
export function isEqual<T>(a: Array < T >, b: Array<T>): boolean;
export function isEqual<T>(a: any, b: any): boolean {
    if (typeof a === "object") {
        if (Object.keys(a).length !== Object.keys(b).length) {
            // 'b' has a different number of properties, and thus can no longer be considered equal.
            console.warn(`Property count mismatch (a: ${Object.keys(a).length} keys, b: ${Object.keys(b).length} keys) on:`);
            console.warn(a);
            console.warn(b);
            return false;
        } else {
            // Alphabetical iteration over object property keys.
            return Object.keys(a).sort().reduce((acc, k) => {
                if (typeof a[k] === "function" && typeof b[k] === "function") {
                    return true;
                } else {
                    return acc && isEqual(a[k], b[k]);
                }
            }, true);
        }
    } else if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length) {
            // 'b' has a different number of elements, not equal.
            console.warn(`Array length mismatch (a: ${a.length} elements, b: ${b.length} elements) on:`);
            console.warn(a);
            console.warn(b);
            return false;
        } else {
            // Compare all Array elements recursively.
            for (var i = 0; i < a.length; i++) {
                if (!isEqual(a[i], b[i])) {
                    // Array elements not equal.
                    return false;
                }
            }
        }
    } else {
        if (a !== b) {
            console.warn(`Value mismatch (a: '${a}', b: '${b}').`);
            return false;
        } else {
            return true;
        }
    }
}
