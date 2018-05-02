import * as Helpers from "./typedjson/helpers";
import { JsonObjectMetadata } from "./typedjson/metadata";
import { Deserializer } from "./typedjson/deserializer";
import { Serializer } from "./typedjson/serializer";
export class TypedJSON {
    /**
     * Creates a new TypedJSON instance to serialize (stringify) and deserialize (parse) object instances of the specified root class type.
     * @param rootType The constructor of the root class type.
     * @param settings Additional configuration settings.
     */
    constructor(rootConstructor, settings) {
        //#endregion
        this.serializer = new Serializer();
        this.deserializer = new Deserializer();
        this.globalKnownTypes = [];
        this.indent = 0;
        let rootMetadata = JsonObjectMetadata.getFromConstructor(rootConstructor);
        if (!rootMetadata || !rootMetadata.isExplicitlyMarked) {
            throw new TypeError("The TypedJSON root data type must have the @jsonObject decorator used.");
        }
        this.nameResolver = (ctor) => Helpers.nameof(ctor);
        this.rootConstructor = rootConstructor;
        this.errorHandler = (error) => Helpers.logError(error);
        if (settings) {
            this.config(settings);
        }
        else if (TypedJSON._globalConfig) {
            this.config({});
        }
    }
    //#region Static
    static parse(json, rootType, settings) {
        return new TypedJSON(rootType, settings).parse(json);
    }
    static parseAsArray(json, elementType, settings) {
        return new TypedJSON(elementType, settings).parseAsArray(json);
    }
    static parseAsSet(json, elementType, settings) {
        return new TypedJSON(elementType, settings).parseAsSet(json);
    }
    static parseAsMap(json, keyType, valueType, settings) {
        return new TypedJSON(valueType, settings).parseAsMap(json, keyType);
    }
    static stringify(object, rootType, settings) {
        return new TypedJSON(rootType, settings).stringify(object);
    }
    static stringifyAsArray(object, elementType, dimensions = 1, settings) {
        return new TypedJSON(elementType, settings).stringifyAsArray(object, dimensions);
    }
    static stringifyAsSet(object, elementType, settings) {
        return new TypedJSON(elementType, settings).stringifyAsSet(object);
    }
    static stringifyAsMap(object, keyCtor, valueCtor, settings) {
        return new TypedJSON(valueCtor, settings).stringifyAsMap(object, keyCtor);
    }
    static setGlobalConfig(config) {
        if (this._globalConfig) {
            Object.assign(this._globalConfig, config);
        }
        else {
            this._globalConfig = config;
        }
    }
    /**
     * Configures TypedJSON through a settings object.
     * @param settings The configuration settings object.
     */
    config(settings) {
        if (TypedJSON._globalConfig) {
            settings = Object.assign({}, TypedJSON._globalConfig, settings);
            if (settings.knownTypes && TypedJSON._globalConfig.knownTypes) {
                // Merge known-types (also de-duplicate them, so Array -> Set -> Array).
                settings.knownTypes = Array.from(new Set(settings.knownTypes.concat(TypedJSON._globalConfig.knownTypes)));
            }
        }
        if (settings.errorHandler) {
            this.errorHandler = settings.errorHandler;
            this.deserializer.setErrorHandler(settings.errorHandler);
            this.serializer.setErrorHandler(settings.errorHandler);
        }
        if (settings.replacer)
            this.replacer = settings.replacer;
        if (settings.typeResolver)
            this.deserializer.setTypeResolver(settings.typeResolver);
        if (settings.typeHintEmitter)
            this.serializer.setTypeHintEmitter(settings.typeHintEmitter);
        if (settings.indent)
            this.indent = settings.indent;
        if (settings.nameResolver) {
            this.nameResolver = settings.nameResolver;
            this.deserializer.setNameResolver(settings.nameResolver);
            // this.serializer.set
        }
        if (settings.knownTypes) {
            // Type-check knownTypes elements to recognize errors in advance.
            settings.knownTypes.forEach((knownType, i) => {
                // tslint:disable-next-line:no-null-keyword
                if (typeof knownType === "undefined" || knownType === null) {
                    Helpers.logWarning(`TypedJSON.config: 'knownTypes' contains an undefined/null value (element ${i}).`);
                }
            });
            this.globalKnownTypes = settings.knownTypes;
        }
    }
    /**
     * Converts a JSON string to the root class type.
     * @param json The JSON string to parse and convert.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     */
    parse(json) {
        let rootMetadata = JsonObjectMetadata.getFromConstructor(this.rootConstructor);
        let result;
        let knownTypes = new Map();
        this.globalKnownTypes.filter(ktc => ktc).forEach(knownTypeCtor => {
            knownTypes.set(this.nameResolver(knownTypeCtor), knownTypeCtor);
        });
        if (rootMetadata) {
            rootMetadata.knownTypes.forEach(knownTypeCtor => {
                knownTypes.set(this.nameResolver(knownTypeCtor), knownTypeCtor);
            });
        }
        try {
            result = this.deserializer.convertSingleValue(JSON.parse(json), {
                selfConstructor: this.rootConstructor,
                knownTypes: knownTypes
            });
        }
        catch (e) {
            this.errorHandler(e);
        }
        return result;
    }
    parseAsArray(json, dimensions = 1) {
        let object = JSON.parse(json);
        if (object instanceof Array) {
            return this.deserializer.convertAsArray(object, {
                selfConstructor: Array,
                elementConstructor: new Array((dimensions - 1) || 0).fill(Array).concat(this.rootConstructor),
                knownTypes: this._mapKnownTypes(this.globalKnownTypes)
            });
        }
        else {
            this.errorHandler(new TypeError(`Expected 'json' to define an Array, but got ${typeof object}.`));
        }
        return [];
    }
    parseAsSet(json) {
        let object = JSON.parse(json);
        // A Set<T> is serialized as T[].
        if (object instanceof Array) {
            return this.deserializer.convertAsSet(object, {
                selfConstructor: Array,
                elementConstructor: [this.rootConstructor],
                knownTypes: this._mapKnownTypes(this.globalKnownTypes)
            });
        }
        else {
            this.errorHandler(new TypeError(`Expected 'json' to define a Set (using an Array), but got ${typeof object}.`));
        }
        return new Set();
    }
    parseAsMap(json, keyConstructor) {
        let object = JSON.parse(json);
        // A Set<T> is serialized as T[].
        if (object instanceof Array) {
            return this.deserializer.convertAsMap(object, {
                selfConstructor: Array,
                elementConstructor: [this.rootConstructor],
                knownTypes: this._mapKnownTypes(this.globalKnownTypes),
                keyConstructor: keyConstructor
            });
        }
        else {
            this.errorHandler(new TypeError(`Expected 'json' to define a Set (using an Array), but got ${typeof object}.`));
        }
        return new Map();
    }
    /**
     * Converts an instance of the specified class type to a JSON string.
     * @param object The instance to convert to a JSON string.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     */
    stringify(object) {
        let serializedObject;
        if (!(object instanceof this.rootConstructor)) {
            this.errorHandler(TypeError(`Expected object type to be '${Helpers.nameof(this.rootConstructor)}', got '${Helpers.nameof(object.constructor)}'.`));
            return undefined;
        }
        try {
            serializedObject = this.serializer.convertSingleValue(object, {
                selfType: this.rootConstructor
            });
            return JSON.stringify(serializedObject, this.replacer, this.indent);
        }
        catch (e) {
            this.errorHandler(e);
        }
        return "";
    }
    stringifyAsArray(object, dimensions = 1) {
        let elementConstructorArray = new Array((dimensions - 1) || 0).fill(Array).concat(this.rootConstructor);
        return JSON.stringify(this.serializer.convertAsArray(object, elementConstructorArray), this.replacer, this.indent);
    }
    stringifyAsSet(object) {
        return JSON.stringify(this.serializer.convertAsSet(object, this.rootConstructor), this.replacer, this.indent);
    }
    stringifyAsMap(object, keyConstructor) {
        return JSON.stringify(this.serializer.convertAsMap(object, keyConstructor, this.rootConstructor), this.replacer, this.indent);
    }
    _mapKnownTypes(constructors) {
        let map = new Map();
        constructors.filter(ctor => ctor).forEach(ctor => map.set(this.nameResolver(ctor), ctor));
        return map;
    }
}
export { jsonObject } from "./typedjson/json-object";
export { jsonMember } from "./typedjson/json-member";
export { jsonArrayMember } from "./typedjson/json-array-member";
export { jsonSetMember } from "./typedjson/json-set-member";
export { jsonMapMember } from "./typedjson/json-map-member";
//# sourceMappingURL=typedjson.js.map