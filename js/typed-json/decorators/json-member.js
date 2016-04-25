define(["require", "exports", "../json-metadata", "../helpers"], function (require, exports, json_metadata_1, Helpers) {
    "use strict";
    function JsonMember(options) {
        var memberMetadata = new json_metadata_1.JsonMemberMetadata();
        options = options || {};
        if (options.hasOwnProperty("isRequired")) {
            memberMetadata.isRequired = options.isRequired;
        }
        if (options.hasOwnProperty("order")) {
            memberMetadata.order = options.order;
        }
        if (options.hasOwnProperty("type")) {
            memberMetadata.type = options.type;
        }
        if (options.hasOwnProperty("elementType")) {
            memberMetadata.elementType = options.elementType;
        }
        if (options.hasOwnProperty("emitDefaultValue")) {
            memberMetadata.emitDefaultValue = options.emitDefaultValue;
        }
        return function (target, propertyKey) {
            var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey.toString());
            ;
            var objectMetadata;
            var parentMetadata;
            var reflectType;
            var propertyName = Helpers.getPropertyDisplayName(target, propertyKey);
            // Static members are not supported (when a property decorator is applied to a static member, target is the constructor function).
            if (typeof target === "function") {
                throw new TypeError("@JsonMember cannot be used on a static property ('" + propertyName + "').");
            }
            // Functions (methods) cannot be serialized.
            if (typeof target[propertyKey] === "function") {
                throw new TypeError("@JsonMember cannot be used on a method ('" + propertyName + "').");
            }
            memberMetadata.key = propertyKey.toString();
            memberMetadata.name = options.name || propertyKey.toString(); // Property key is used as default member name if not specified.
            // Check for reserved member names.
            if (Helpers.isReservedMemberName(memberMetadata.name)) {
                throw new Error("@JsonMember: '" + memberMetadata.name + "' is a reserved name.");
            }
            // It is a common error for types to exist at compile time, but not at runtime (often caused by improper/misbehaving imports).
            if (options.hasOwnProperty("type") && typeof options.type === "undefined") {
                throw new TypeError("@JsonMember: 'type' of property '" + propertyName + "' is undefined.");
            }
            // ... same for elementType.
            if (options.hasOwnProperty("elementType") && typeof options.elementType === "undefined") {
                throw new TypeError("@JsonMember: 'elementType' of property '" + propertyName + "' is undefined.");
            }
            //#region "Reflect Metadata support"
            if (typeof Reflect === "object" && typeof Reflect.getMetadata === "function") {
                reflectType = Reflect.getMetadata("design:type", target, propertyKey);
                if (typeof reflectType === "undefined") {
                    // If Reflect.getMetadata exists, functionality for *setting* metadata should also exist, and metadata *should* be set.
                    throw new TypeError("@JsonMember: type detected for property '" + propertyName + "' is undefined.");
                }
                if (!memberMetadata.type || typeof memberMetadata.type !== "function") {
                    // Get type information using reflect metadata.
                    memberMetadata.type = reflectType;
                }
                else if (memberMetadata.type !== reflectType) {
                    Helpers.warn("@JsonMember: 'type' specified for '" + propertyName + "' does not match detected type.");
                }
            }
            //#endregion "Reflect Metadata support"
            // Ensure valid types have been specified ('type' at all times, 'elementType' for arrays).
            if (typeof memberMetadata.type !== "function") {
                throw new Error("@JsonMember: no valid 'type' specified for property '" + propertyName + "'.");
            }
            else if (memberMetadata.type === Array && typeof memberMetadata.elementType !== "function") {
                throw new Error("@JsonMember: no valid 'elementType' specified for property '" + propertyName + "'.");
            }
            // Add JsonObject metadata to 'target' if not yet exists (implicit @JsonObject, 'target' is the prototype).
            if (!target.hasOwnProperty("__typedJsonJsonObjectMetadataInformation__")) {
                objectMetadata = new json_metadata_1.JsonObjectMetadata();
                // Where applicable, inherit @JsonMembers from parent @JsonObject.
                if (parentMetadata = target.__typedJsonJsonObjectMetadataInformation__) {
                    // @JsonMembers
                    Object.keys(parentMetadata.dataMembers).forEach(function (memberPropertyKey) {
                        objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                    });
                }
                // 'target' is the prototype of the involved class (metadata information is added to the class prototype).
                Object.defineProperty(target, "__typedJsonJsonObjectMetadataInformation__", {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: objectMetadata
                });
            }
            else {
                // JsonObjectMetadata already exists on target.
                objectMetadata = target.__typedJsonJsonObjectMetadataInformation__;
            }
            // Automatically add known types.
            if (memberMetadata.type) {
                objectMetadata.setKnownType(memberMetadata.type);
            }
            if (memberMetadata.elementType) {
                objectMetadata.setKnownType(memberMetadata.elementType);
            }
            // Register @JsonMember with @JsonObject (will overwrite previous member when used multiple times on same property).
            try {
                objectMetadata.addMember(memberMetadata);
            }
            catch (e) {
                var className = Helpers.getClassName(objectMetadata.classType);
                throw new Error("@JsonMember: member '" + memberMetadata.name + "' already exists on '" + className + "'.");
            }
        };
    }
    exports.JsonMember = JsonMember;
});
