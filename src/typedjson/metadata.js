"use strict";
exports.__esModule = true;
var helpers_1 = require("./helpers");
var Helpers = require("./helpers");
var JsonMemberMetadata = /** @class */ (function () {
    function JsonMemberMetadata() {
    }
    return JsonMemberMetadata;
}());
exports.JsonMemberMetadata = JsonMemberMetadata;
var JsonObjectMetadata = /** @class */ (function () {
    function JsonObjectMetadata() {
        //#endregion
        this.dataMembers = new Map();
        this.knownTypes = new Set();
    }
    //#region Static
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param ctor The constructor of a class (with or without jsonObject).
     */
    JsonObjectMetadata.getJsonObjectName = function (ctor) {
        var metadata = this.getFromConstructor(ctor);
        return metadata ? helpers_1.nameof(metadata.classType) : helpers_1.nameof(ctor);
    };
    /**
     * Gets jsonObject metadata information from a class or its prototype.
     * @param target The target class or prototype.
     * @param allowInherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     */
    JsonObjectMetadata.getFromConstructor = function (target) {
        var targetPrototype;
        var metadata;
        targetPrototype = (typeof target === "function") ? target.prototype : target;
        if (!targetPrototype) {
            return undefined;
        }
        if (targetPrototype.hasOwnProperty(Helpers.METADATA_FIELD_KEY)) {
            // The class prototype contains own jsonObject metadata.
            metadata = targetPrototype[Helpers.METADATA_FIELD_KEY];
        }
        if (metadata && metadata.isExplicitlyMarked) // Ignore implicitly added jsonObject (through jsonMember).
         {
            return metadata;
        }
        else {
            return undefined;
        }
    };
    /**
     * Gets jsonObject metadata information from a class instance.
     * @param target The target instance.
     */
    JsonObjectMetadata.getFromInstance = function (target) {
        return this.getFromConstructor(Object.getPrototypeOf(target));
    };
    /**
     * Gets the known type name of a jsonObject class for type hint.
     * @param target The target class.
     */
    JsonObjectMetadata.getKnownTypeNameFromType = function (target) {
        var metadata = this.getFromConstructor(target);
        return metadata ? helpers_1.nameof(metadata.classType) : helpers_1.nameof(target);
    };
    /**
     * Gets the known type name of a jsonObject instance for type hint.
     * @param target The target instance.
     */
    JsonObjectMetadata.getKnownTypeNameFromInstance = function (target) {
        var metadata = this.getFromInstance(target);
        return metadata ? helpers_1.nameof(metadata.classType) : helpers_1.nameof(target.constructor);
    };
    return JsonObjectMetadata;
}());
exports.JsonObjectMetadata = JsonObjectMetadata;
function injectMetadataInformation(target, propKey, metadata) {
    var decoratorName = "@jsonMember on " + helpers_1.nameof(target.constructor) + "." + propKey; // For error messages.
    var objectMetadata;
    var parentMetadata;
    // When a property decorator is applied to a static member, 'target' is a constructor function.
    // See: https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
    // ... and static members are not supported here, so abort.
    if (typeof target === "function") {
        Helpers.logError(decoratorName + ": cannot use a static property.");
        return;
    }
    // Methods cannot be serialized.
    if (typeof target[propKey] === "function") {
        Helpers.logError(decoratorName + ": cannot use a method property.");
        return;
    }
    if (!metadata || !metadata.ctor) {
        Helpers.logError(decoratorName + ": JsonMemberMetadata has unknown ctor.");
        return;
    }
    // Add jsonObject metadata to 'target' if not yet exists ('target' is the prototype).
    // NOTE: this will not fire up custom serialization, as 'target' must be explicitly marked with '@jsonObject' as well.
    if (!target.hasOwnProperty(Helpers.METADATA_FIELD_KEY)) {
        // No *own* metadata, create new.
        objectMetadata = new JsonObjectMetadata();
        parentMetadata = target[Helpers.METADATA_FIELD_KEY];
        objectMetadata.name = target.constructor.name; // Default.
        // Inherit @JsonMembers from parent @jsonObject (if any).
        if (parentMetadata) // && !target.hasOwnProperty(Helpers.METADATA_FIELD_KEY)
         {
            parentMetadata.dataMembers.forEach(function (_metadata, _propKey) { return objectMetadata.dataMembers.set(_propKey, _metadata); });
        }
        // ('target' is the prototype of the involved class, metadata information is added to this class prototype).
        Object.defineProperty(target, Helpers.METADATA_FIELD_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata
        });
    }
    else {
        // JsonObjectMetadata already exists on 'target'.
        objectMetadata = target[Helpers.METADATA_FIELD_KEY];
    }
    objectMetadata.knownTypes.add(metadata.ctor);
    if (metadata.keyType)
        objectMetadata.knownTypes.add(metadata.keyType);
    if (metadata.elementType)
        metadata.elementType.forEach(function (elemCtor) { return objectMetadata.knownTypes.add(elemCtor); });
    objectMetadata.dataMembers.set(propKey.toString(), metadata);
}
exports.injectMetadataInformation = injectMetadataInformation;
