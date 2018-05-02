import * as Helpers from "./helpers";
import { JsonObjectMetadata } from "./metadata";
export function jsonObject(optionsOrTarget) {
    let options;
    if (typeof optionsOrTarget === "function") {
        // jsonObject is being used as a decorator, directly.
        options = {};
    }
    else {
        // jsonObject is being used as a decorator factory.
        options = optionsOrTarget || {};
    }
    let decorator = function (target) {
        let objectMetadata;
        let parentMetadata;
        // Create or obtain JsonObjectMetadata object.
        if (!target.prototype.hasOwnProperty(Helpers.METADATA_FIELD_KEY)) {
            // Target has no JsonObjectMetadata associated with it yet, create it now.
            objectMetadata = new JsonObjectMetadata();
            parentMetadata = target.prototype[Helpers.METADATA_FIELD_KEY];
            // Inherit json members and known types from parent @jsonObject (if any).
            if (parentMetadata) {
                parentMetadata.dataMembers.forEach((memberMetadata, propKey) => objectMetadata.dataMembers.set(propKey, memberMetadata));
                parentMetadata.knownTypes.forEach((knownType) => objectMetadata.knownTypes.add(knownType));
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
            options.knownTypes.filter(knownType => !!knownType).forEach(knownType => objectMetadata.knownTypes.add(knownType));
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
//# sourceMappingURL=json-object.js.map