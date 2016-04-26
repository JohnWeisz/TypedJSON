define(["require", "exports"], function (require, exports) {
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
                console.warn("Property count mismatch (a: " + Object.keys(a).length + " keys, b: " + Object.keys(b).length + " keys) on:");
                console.warn(a);
                console.warn(b);
                return false;
            }
            else {
                return Object.keys(a).sort().reduce(function (acc, k) {
                    return acc && isEqual(a[k], b[k]);
                }, true);
            }
        }
        else if (a instanceof Array && b instanceof Array) {
            if (a.length !== b.length) {
                console.warn("Array length mismatch (a: " + a.length + " elements, b: " + b.length + " elements) on:");
                console.warn(a);
                console.warn(b);
                return false;
            }
            else {
                for (var i = 0; i < a.length; i++) {
                    if (!isEqual(a[i], b[i])) {
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
