define(["require", "exports", "../json-metadata", "../helpers"], function (require, exports, json_metadata_1, Helpers) {
    "use strict";
    function JsonObject(options) {
        options = options || {};
        var initializer = options.initializer;
        return function (target) {
            var objectMetadata;
            var parentMetadata;
            var i;
            if (!target.prototype.hasOwnProperty("__typedJsonJsonObjectMetadataInformation__")) {
                objectMetadata = new json_metadata_1.JsonObjectMetadata();
                // If applicable, inherit @JsonMembers and @KnownTypes from parent @JsonObject.
                if (parentMetadata = target.prototype.__typedJsonJsonObjectMetadataInformation__) {
                    // @JsonMembers
                    Object.keys(parentMetadata.dataMembers).forEach(function (memberPropertyKey) {
                        objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                    });
                    // @KnownTypes
                    Object.keys(parentMetadata.knownTypes).forEach(function (key) {
                        objectMetadata.setKnownType(parentMetadata.knownTypes[key]);
                    });
                }
                Object.defineProperty(target.prototype, "__typedJsonJsonObjectMetadataInformation__", {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: objectMetadata
                });
            }
            else {
                objectMetadata = target.prototype.__typedJsonJsonObjectMetadataInformation__;
            }
            objectMetadata.classType = target;
            if (options.name) {
                objectMetadata.className = options.name;
            }
            if (options.knownTypes) {
                i = 0;
                try {
                    options.knownTypes.forEach(function (knownType) {
                        if (typeof knownType === "undefined") {
                            throw new TypeError("Known type #" + i++ + " is undefined.");
                        }
                        objectMetadata.setKnownType(knownType);
                    });
                }
                catch (e) {
                    // The missing known type might not cause trouble at all, thus the error is printed, but not thrown.
                    Helpers.error(new TypeError(("@JsonObject (on " + Helpers.getClassName(target) + "): ") + e.message));
                }
            }
            if (typeof initializer === "function") {
                objectMetadata.initializer = initializer;
            }
            return target;
        };
    }
    exports.JsonObject = JsonObject;
});
