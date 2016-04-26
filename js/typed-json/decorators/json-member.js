define(["require", "exports", "../json-metadata", "../helpers"], function (require, exports, json_metadata_1, Helpers) {
    "use strict";
    function JsonMember(optionsOrTarget, propertyKey) {
        var memberMetadata = new json_metadata_1.JsonMemberMetadata();
        var options;
        var decorator;
        if (typeof propertyKey === "string" || typeof propertyKey === "symbol") {
            options = {};
        }
        else {
            options = optionsOrTarget || {};
        }
        memberMetadata = Helpers.assign(memberMetadata, options);
        decorator = function (target, propertyKey) {
            var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey.toString());
            ;
            var objectMetadata;
            var parentMetadata;
            var reflectType;
            var propertyName = Helpers.getPropertyDisplayName(target, propertyKey);
            if (typeof target === "function") {
                throw new TypeError("@JsonMember cannot be used on a static property ('" + propertyName + "').");
            }
            if (typeof target[propertyKey] === "function") {
                throw new TypeError("@JsonMember cannot be used on a method ('" + propertyName + "').");
            }
            memberMetadata.key = propertyKey.toString();
            memberMetadata.name = options.name || propertyKey.toString();
            if (Helpers.isReservedMemberName(memberMetadata.name)) {
                throw new Error("@JsonMember: '" + memberMetadata.name + "' is a reserved name.");
            }
            if (options.hasOwnProperty("type") && typeof options.type === "undefined") {
                throw new TypeError("@JsonMember: 'type' of property '" + propertyName + "' is undefined.");
            }
            if (options.hasOwnProperty("elementType") && typeof options.elementType === "undefined") {
                throw new TypeError("@JsonMember: 'elementType' of property '" + propertyName + "' is undefined.");
            }
            if (typeof Reflect === "object" && typeof Reflect.getMetadata === "function") {
                reflectType = Reflect.getMetadata("design:type", target, propertyKey);
                if (typeof reflectType === "undefined") {
                    throw new TypeError("@JsonMember: type detected for property '" + propertyName + "' is undefined.");
                }
                if (!memberMetadata.type || typeof memberMetadata.type !== "function") {
                    memberMetadata.type = reflectType;
                }
                else if (memberMetadata.type !== reflectType) {
                    Helpers.warn("@JsonMember: 'type' specified for '" + propertyName + "' does not match detected type.");
                }
            }
            if (typeof memberMetadata.type !== "function") {
                throw new Error("@JsonMember: no valid 'type' specified for property '" + propertyName + "'.");
            }
            else if (memberMetadata.type === Array && typeof memberMetadata.elementType !== "function") {
                throw new Error("@JsonMember: no valid 'elementType' specified for property '" + propertyName + "'.");
            }
            if (!target.hasOwnProperty("__typedJsonJsonObjectMetadataInformation__")) {
                objectMetadata = new json_metadata_1.JsonObjectMetadata();
                if (parentMetadata = target.__typedJsonJsonObjectMetadataInformation__) {
                    Object.keys(parentMetadata.dataMembers).forEach(function (memberPropertyKey) {
                        objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                    });
                }
                Object.defineProperty(target, "__typedJsonJsonObjectMetadataInformation__", {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: objectMetadata
                });
            }
            else {
                objectMetadata = target.__typedJsonJsonObjectMetadataInformation__;
            }
            if (memberMetadata.type) {
                objectMetadata.setKnownType(memberMetadata.type);
            }
            if (memberMetadata.elementType) {
                objectMetadata.setKnownType(memberMetadata.elementType);
            }
            try {
                objectMetadata.addMember(memberMetadata);
            }
            catch (e) {
                var className = Helpers.getClassName(objectMetadata.classType);
                throw new Error("@JsonMember: member '" + memberMetadata.name + "' already exists on '" + className + "'.");
            }
        };
        if (typeof propertyKey === "string" || typeof propertyKey === "symbol") {
            return decorator(optionsOrTarget, propertyKey);
        }
        else {
            return decorator;
        }
    }
    exports.JsonMember = JsonMember;
});
