"use strict";
exports.__esModule = true;
var helpers_1 = require("./helpers");
var metadata_1 = require("./metadata");
var Helpers = require("./helpers");
/**
 * Specifies that the property is part of the object when serializing.
 * Use this decorator on properties of type Map<K, V>.
 * @param keyConstructor Constructor of map keys (e.g. 'Number' for 'Map<number, Date>').
 * @param valueConstructor Constructor of map values (e.g. 'Date' for 'Map<number, Date>').
 * @param options Additional options.
 */
function jsonMapMember(keyConstructor, valueConstructor, options) {
    if (options === void 0) { options = {}; }
    return function (target, propKey) {
        var decoratorName = "@jsonMapMember on " + helpers_1.nameof(target.constructor) + "." + propKey; // For error messages.
        if (typeof keyConstructor !== "function") {
            Helpers.logError(decoratorName + ": could not resolve constructor of map keys at runtime.");
            return;
        }
        if (typeof valueConstructor !== "function") {
            Helpers.logError(decoratorName + ": could not resolve constructor of map values at runtime.");
            return;
        }
        // If ReflectDecorators is available, use it to check whether 'jsonMapMember' has been used on a map. Warn if not.
        if (Helpers.isReflectMetadataSupported && Reflect.getMetadata("design:type", target, propKey) !== Map) {
            Helpers.logError(decoratorName + ": property is not a Map.");
            return;
        }
        var metadata = new metadata_1.JsonMemberMetadata();
        metadata.ctor = Map;
        metadata.elementType = [valueConstructor];
        metadata.keyType = keyConstructor;
        metadata.emitDefaultValue = options.emitDefaultValue || false;
        metadata.isRequired = options.isRequired || false;
        metadata.key = propKey.toString();
        metadata.name = propKey.toString();
        metadata_1.injectMetadataInformation(target, propKey, metadata);
    };
}
exports.jsonMapMember = jsonMapMember;
