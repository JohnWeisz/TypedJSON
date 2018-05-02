import { nameof } from "./helpers";
import { JsonMemberMetadata, injectMetadataInformation } from "./metadata";
import * as Helpers from "./helpers";
export function jsonMember(optionsOrTarget, propKey) {
    if (optionsOrTarget instanceof Object && (typeof propKey === "string" || typeof propKey === "symbol")) {
        let target = optionsOrTarget;
        let decoratorName = `@jsonMember on ${nameof(target.constructor)}.${propKey}`; // For error messages.
        // jsonMember used directly, no additional information directly available besides target and propKey.
        // Obtain property constructor through ReflectDecorators.
        if (Helpers.isReflectMetadataSupported) {
            let reflectPropCtor = Reflect.getMetadata("design:type", target, propKey);
            let memberMetadata = new JsonMemberMetadata();
            if (!reflectPropCtor) {
                Helpers.logError(`${decoratorName}: could not resolve detected property constructor at runtime.`);
                return;
            }
            if (isSpecialPropertyType(reflectPropCtor, decoratorName)) {
                return;
            }
            memberMetadata.ctor = reflectPropCtor;
            memberMetadata.key = propKey.toString();
            memberMetadata.name = propKey.toString();
            injectMetadataInformation(target, propKey, memberMetadata);
        }
        else {
            Helpers.logError(`${decoratorName}: ReflectDecorators is required if no 'constructor' option is specified.`);
            return;
        }
    }
    else {
        // jsonMember used as a decorator factory.
        return (target, _propKey) => {
            let options = optionsOrTarget || {};
            let propCtor;
            let decoratorName = `@jsonMember on ${nameof(target.constructor)}.${_propKey}`; // For error messages.
            if (typeof options.hasOwnProperty("constructor")) {
                if (!Helpers.isValueDefined(options.constructor)) {
                    Helpers.logError(`${decoratorName}: cannot resolve specified property constructor at runtime.`);
                    return;
                }
                // Property constructor has been specified. Use ReflectDecorators (if available) to check whether that constructor is correct. Warn if not.
                if (Helpers.isReflectMetadataSupported && !Helpers.isSubtypeOf(options.constructor, Reflect.getMetadata("design:type", target, _propKey))) {
                    Helpers.logWarning(`${decoratorName}: detected property type does not match 'constructor' option.`);
                }
                propCtor = options.constructor;
            }
            else {
                // Use ReflectDecorators to obtain property constructor.
                if (Helpers.isReflectMetadataSupported) {
                    propCtor = Reflect.getMetadata("design:type", target, _propKey);
                    if (!propCtor) {
                        Helpers.logError(`${decoratorName}: cannot resolve detected property constructor at runtime.`);
                        return;
                    }
                }
                else {
                    Helpers.logError(`${decoratorName}: ReflectDecorators is required if no 'constructor' option is specified.`);
                    return;
                }
            }
            if (isSpecialPropertyType(propCtor, decoratorName)) {
                return;
            }
            let memberMetadata = new JsonMemberMetadata();
            memberMetadata.ctor = propCtor;
            memberMetadata.emitDefaultValue = options.emitDefaultValue || false;
            memberMetadata.isRequired = options.isRequired || false;
            memberMetadata.key = _propKey.toString();
            memberMetadata.name = _propKey.toString();
            injectMetadataInformation(target, _propKey, memberMetadata);
        };
    }
}
function isSpecialPropertyType(propCtor, decoratorName) {
    if (propCtor === Array) {
        Helpers.logError(`${decoratorName}: property is an Array. Use the jsonArrayMember decorator to serialize this property.`);
        return true;
    }
    if (propCtor === Set) {
        Helpers.logError(`${decoratorName}: property is a Set. Use the jsonSetMember decorator to serialize this property.`);
        return true;
    }
    if (propCtor === Map) {
        Helpers.logError(`${decoratorName}: property is a Map. Use the jsonMapMember decorator to serialize this property.`);
        return true;
    }
    return false;
}
//# sourceMappingURL=json-member.js.map