"use strict";
exports.__esModule = true;
var Helpers = require("./helpers");
var metadata_1 = require("./metadata");
function jsonObject(optionsOrTarget) {
    var options;
    if (typeof optionsOrTarget === "function") {
        // jsonObject is being used as a decorator, directly.
        options = {};
    }
    else {
        // jsonObject is being used as a decorator factory.
        options = optionsOrTarget || {};
    }
    var decorator = function (target) {
        var objectMetadata;
        var parentMetadata;
        // Create or obtain JsonObjectMetadata object.
        if (!target.prototype.hasOwnProperty(Helpers.METADATA_FIELD_KEY)) {
            // Target has no JsonObjectMetadata associated with it yet, create it now.
            objectMetadata = new metadata_1.JsonObjectMetadata();
            parentMetadata = target.prototype[Helpers.METADATA_FIELD_KEY];
            // Inherit json members and known types from parent @jsonObject (if any).
            if (parentMetadata) {
                parentMetadata.dataMembers.forEach(function (memberMetadata, propKey) { return objectMetadata.dataMembers.set(propKey, memberMetadata); });
                parentMetadata.knownTypes.forEach(function (knownType) { return objectMetadata.knownTypes.add(knownType); });
            }
            if (options.name) {
                objectMetadata.name = options.name;
            }
            else {
                objectMetadata.name = target.name;
            }
            Object.defineProperty(target.prototype, Helpers.METADATA_FIELD_KEY, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: objectMetadata
            });
        }
        else {
            // Target already has JsonObjectMetadata associated with it.
            objectMetadata = target.prototype[Helpers.METADATA_FIELD_KEY];
            if (options.name) {
                objectMetadata.name = options.name;
            }
        }
        // Fill JsonObjectMetadata.
        objectMetadata.classType = target;
        objectMetadata.isExplicitlyMarked = true;
        objectMetadata.isAbstract = false;
        objectMetadata.initializerCallback = options.initializer;
        // Obtain known-types.
        if (typeof options.knownTypes === "string") {
            objectMetadata.knownTypeMethodName = options.knownTypes;
        }
        else if (options.knownTypes instanceof Array) {
            options.knownTypes.filter(function (knownType) { return !!knownType; }).forEach(function (knownType) { return objectMetadata.knownTypes.add(knownType); });
        }
    };
    if (typeof optionsOrTarget === "function") {
        // jsonObject is being used as a decorator, directly.
        decorator(optionsOrTarget);
    }
    else {
        // jsonObject is being used as a decorator factory.
        return decorator;
    }
}
exports.jsonObject = jsonObject;
