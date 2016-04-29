(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    if (!console) {
        console = {
            warn: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
            }
        };
    }
    function isEqual(a, b) {
        if (typeof a === "object") {
            if (Object.keys(a).length !== Object.keys(b).length) {
                // 'b' has a different number of properties, and thus can no longer be considered equal.
                console.warn("Property count mismatch (a: " + Object.keys(a).length + " keys, b: " + Object.keys(b).length + " keys) on:");
                console.warn(a);
                console.warn(b);
                return false;
            }
            else {
                // Alphabetical iteration over object property keys.
                return Object.keys(a).sort().reduce(function (acc, k) {
                    if (typeof a[k] === "function" && typeof b[k] === "function") {
                        return true;
                    }
                    else {
                        return acc && isEqual(a[k], b[k]);
                    }
                }, true);
            }
        }
        else if (a instanceof Array && b instanceof Array) {
            if (a.length !== b.length) {
                // 'b' has a different number of elements, not equal.
                console.warn("Array length mismatch (a: " + a.length + " elements, b: " + b.length + " elements) on:");
                console.warn(a);
                console.warn(b);
                return false;
            }
            else {
                // Compare all Array elements recursively.
                for (var i = 0; i < a.length; i++) {
                    if (!isEqual(a[i], b[i])) {
                        // Array elements not equal.
                        return false;
                    }
                }
            }
        }
        else {
            if (a !== b) {
                console.warn("Value mismatch (a: '" + a + "', b: '" + b + "').");
                return false;
            }
            else {
                return true;
            }
        }
    }
    exports.isEqual = isEqual;
});
