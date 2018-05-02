"use strict";
exports.__esModule = true;
var helpers_1 = require("./helpers");
var metadata_1 = require("./metadata");
var Helpers = require("./helpers");
/**
 * Specifies that a property, of type array, is part of an object when serializing.
 * @param elementConstructor Constructor of array elements (e.g. 'Number' for 'number[]', or 'Date' for 'Date[]').
 * @param options Additional options.
 */
function jsonArrayMember(elementConstructor, options) {
    if (options === void 0) { options = {}; }
    return function (target, propKey) {
        var decoratorName = "@jsonArrayMember on " + helpers_1.nameof(target.constructor) + "." + propKey; // For error messages.
        if (typeof elementConstructor !== "function") {
            Helpers.logError(decoratorName + ": could not resolve constructor of array elements at runtime.");
            return;
        }
        if (!isNaN(options.dimensions) && options.dimensions < 1) {
            Helpers.logError(decoratorName + ": 'dimensions' option must be at least 1.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonArrayMember' has been used on an array.
        if (Helpers.isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Array) {
            Helpers.logError(decoratorName + ": property is not an Array.");
            return;
        }
        var metadata = new metadata_1.JsonMemberMetadata();
        metadata.ctor = Array;
        if (options.dimensions && options.dimensions >= 1) {
            metadata.elementType = [];
            for (var i = 1; i < options.dimensions; i++) {
                metadata.elementType.push(Array);
            }
            metadata.elementType.push(elementConstructor);
        }
        else {
            metadata.elementType = [elementConstructor];
        }
        metadata.emitDefaultValue = options.emitDefaultValue || false;
        metadata.isRequired = options.isRequired || false;
        metadata.key = propKey.toString();
        metadata.name = propKey.toString();
        metadata_1.injectMetadataInformation(target, propKey, metadata);
    };
}
exports.jsonArrayMember = jsonArrayMember;
