"use strict";
exports.__esModule = true;
var helpers_1 = require("./helpers");
var metadata_1 = require("./metadata");
var Helpers = require("./helpers");
/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Set<T>.
 * @param elementConstructor Constructor of set elements (e.g. 'Number' for Set<number> or 'Date' for Set<Date>).
 * @param options Additional options.
 */
function jsonSetMember(elementConstructor, options) {
    if (options === void 0) { options = {}; }
    return function (target, propKey) {
        var decoratorName = "@jsonSetMember on " + helpers_1.nameof(target.constructor) + "." + propKey; // For error messages.
        if (typeof elementConstructor !== "function") {
            Helpers.logError(decoratorName + ": could not resolve constructor of set elements at runtime.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonSetMember' has been used on a set. Warn if not.
        if (Helpers.isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Set) {
            Helpers.logError(decoratorName + ": property is not a Set.");
            return;
        }
        var metadata = new metadata_1.JsonMemberMetadata();
        metadata.ctor = Set;
        metadata.elementType = [elementConstructor];
        metadata.emitDefaultValue = options.emitDefaultValue || false;
        metadata.isRequired = options.isRequired || false;
        metadata.key = propKey.toString();
        metadata.name = propKey.toString();
        metadata_1.injectMetadataInformation(target, propKey, metadata);
    };
}
exports.jsonSetMember = jsonSetMember;
