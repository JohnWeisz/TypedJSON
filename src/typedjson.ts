import { parseToJSObject } from './typedjson/helpers';
import { Constructor } from "./typedjson/types";
import * as Helpers from "./typedjson/helpers";
import { JsonObjectMetadata } from "./typedjson/metadata";
import { Deserializer } from "./typedjson/deserializer";
import { Serializer } from "./typedjson/serializer";

export interface ITypedJSONSettings
{
    /**
     * Sets the handler callback to invoke on errors during serializing and deserializing.
     * Re-throwing errors in this function will halt serialization/deserialization.
     * The default behavior is to log errors to the console.
     */
    errorHandler?: (e: Error) => void;

    /**
     * Sets a callback that determines the constructor of the correct sub-type of polymorphic
     * objects while deserializing.
     * The default behavior is to read the type-name from the '__type' property of 'sourceObject',
     * and look it up in 'knownTypes'.
     * The constructor of the sub-type should be returned.
     */
    typeResolver?: (sourceObject: Object, knownTypes: Map<string, Function>) => Function;

    nameResolver?: (ctor: Function) => string;

    /**
     * Sets a callback that writes type-hints to serialized objects.
     * The default behavior is to write the type-name to the '__type' property, if a derived type
     * is present in place of a base type.
     */
    typeHintEmitter?:
        (targetObject: Object, sourceObject: Object, expectedSourceType: Function) => void;

    /**
     * Sets the amount of indentation to use in produced JSON strings.
     * Default value is 0, or no indentation.
     */
    indent?: number;

    replacer?: (key: string, value: any) => any;

    knownTypes?: Array<Constructor<any>>;
}

export class TypedJSON<T>
{
    //#region Static
    public static parse<T>(
        object: any, rootType: Constructor<T>, settings?: ITypedJSONSettings,
    ): T|undefined {
        return new TypedJSON(rootType, settings).parse(object);
    }

    public static parseAsArray<T>(
        object: any,
        elementType: Constructor<T>,
        settings?: ITypedJSONSettings,
        dimensions?: 1
    ): T[];
    public static parseAsArray<T>(
        object: any,
        elementType: Constructor<T>,
        settings: ITypedJSONSettings|undefined,
        dimensions: 2
    ): T[][];
    public static parseAsArray<T>(
        object: any,
        elementType: Constructor<T>,
        settings: ITypedJSONSettings|undefined,
        dimensions: 3
    ): T[][][];
    public static parseAsArray<T>(
        object: any,
        elementType: Constructor<T>,
        settings: ITypedJSONSettings|undefined,
        dimensions: 4
    ): T[][][][];
    public static parseAsArray<T>(
        object: any,
        elementType: Constructor<T>,
        settings: ITypedJSONSettings|undefined,
        dimensions: 5
    ): T[][][][][];
    public static parseAsArray<T>(
        object: any,
        elementType: Constructor<T>,
        settings?: ITypedJSONSettings,
        dimensions?: number
    ): any[] {
        return new TypedJSON(elementType, settings).parseAsArray(object, dimensions as any);
    }

    public static parseAsSet<T>(
        object: any, elementType: Constructor<T>, settings?: ITypedJSONSettings,
    ): Set<T> {
        return new TypedJSON(elementType, settings).parseAsSet(object);
    }

    public static parseAsMap<K, V>(
        object: any,
        keyType: Constructor<K>,
        valueType: Constructor<V>,
        settings?: ITypedJSONSettings,
    ): Map<K, V> {
        return new TypedJSON(valueType, settings).parseAsMap(object, keyType);
    }

    public static toPlainJson<T>(
        object: T, rootType: Constructor<T>, settings?: ITypedJSONSettings,
    ): Object|undefined {
        return new TypedJSON(rootType, settings).toPlainJson(object);
    }

    public static toPlainArray<T>(
        object: T[], elementType: Constructor<T>, dimensions?: 1, settings?: ITypedJSONSettings,
    ): Object[];
    public static toPlainArray<T>(
        object: T[][], elementType: Constructor<T>, dimensions: 2, settings?: ITypedJSONSettings,
    ): Object[][];
    public static toPlainArray<T>(
        object: T[][][], elementType: Constructor<T>, dimensions: 3, settings?: ITypedJSONSettings,
    ): Object[][][];
    public static toPlainArray<T>(
        object: T[][][][], elementType: Constructor<T>, dimensions: 4, settings?: ITypedJSONSettings,
    ): Object[][][][];
    public static toPlainArray<T>(
        object: T[][][][][], elementType: Constructor<T>, dimensions: 5, settings?: ITypedJSONSettings,
    ): Object[][][][][];
    public static toPlainArray<T>(
        object: any[], elementType: Constructor<T>, dimensions: number, settings?: ITypedJSONSettings,
    ): any[];
    public static toPlainArray<T>(
        object: any[], elementType: Constructor<T>, dimensions?: any, settings?: ITypedJSONSettings,
    ): any[] {
        return new TypedJSON(elementType, settings).toPlainArray(object, dimensions);
    }

    public static toPlainSet<T>(
        object: Set<T>, elementType: Constructor<T>, settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(elementType, settings).stringifyAsSet(object);
    }

    public static toPlainMap<K, V>(
        object: Map<K, V>,
        keyCtor: Constructor<K>,
        valueCtor: Constructor<V>,
        settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(valueCtor, settings).stringifyAsMap(object, keyCtor);
    }

    public static stringify<T>(
        object: T, rootType: Constructor<T>, settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(rootType, settings).stringify(object);
    }

    public static stringifyAsArray<T>(
        object: T[], elementType: Constructor<T>, dimensions?: 1, settings?: ITypedJSONSettings,
    ): string;
    public static stringifyAsArray<T>(
        object: T[][], elementType: Constructor<T>, dimensions: 2, settings?: ITypedJSONSettings,
    ): string;
    public static stringifyAsArray<T>(
        object: T[][][], elementType: Constructor<T>, dimensions: 3, settings?: ITypedJSONSettings,
    ): string;
    public static stringifyAsArray<T>(
        object: T[][][][], elementType: Constructor<T>, dimensions: 4, settings?: ITypedJSONSettings,
    ): string;
    public static stringifyAsArray<T>(
        object: T[][][][][], elementType: Constructor<T>, dimensions: 5, settings?: ITypedJSONSettings,
    ): string;
    public static stringifyAsArray<T>(
        object: any[], elementType: Constructor<T>, dimensions: number, settings?: ITypedJSONSettings,
    ): string;
    public static stringifyAsArray<T>(
        object: any[], elementType: Constructor<T>, dimensions?: any, settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(elementType, settings).stringifyAsArray(object, dimensions);
    }

    public static stringifyAsSet<T>(
        object: Set<T>, elementType: Constructor<T>, settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(elementType, settings).stringifyAsSet(object);
    }

    public static stringifyAsMap<K, V>(
        object: Map<K, V>,
        keyCtor: Constructor<K>,
        valueCtor: Constructor<V>,
        settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(valueCtor, settings).stringifyAsMap(object, keyCtor);
    }

    private static _globalConfig: ITypedJSONSettings;

    public static setGlobalConfig(config: ITypedJSONSettings)
    {
        if (this._globalConfig)
        {
            Object.assign(this._globalConfig, config);
        }
        else
        {
            this._globalConfig = config;
        }
    }

    //#endregion

    private serializer: Serializer = new Serializer();
    private deserializer: Deserializer<T> = new Deserializer<T>();
    private globalKnownTypes: Array<Constructor<any>> = [];
    private indent: number = 0;
    private rootConstructor: Constructor<T>;
    private errorHandler: (e: Error) => void;
    private nameResolver: (ctor: Function) => string;
    private replacer?: (key: string, value: any) => any;

    /**
     * Creates a new TypedJSON instance to serialize (stringify) and deserialize (parse) object
     *     instances of the specified root class type.
     * @param rootType The constructor of the root class type.
     * @param settings Additional configuration settings.
     */
    constructor(rootConstructor: Constructor<T>, settings?: ITypedJSONSettings)
    {
        let rootMetadata = JsonObjectMetadata.getFromConstructor(rootConstructor);

        if (!rootMetadata || !rootMetadata.isExplicitlyMarked)
        {
            throw new TypeError("The TypedJSON root data type must have the @jsonObject decorator used.");
        }

        this.nameResolver = (ctor) => Helpers.nameof(ctor);
        this.rootConstructor = rootConstructor;
        this.errorHandler = (error) => Helpers.logError(error);

        if (settings)
        {
            this.config(settings);
        }
        else if (TypedJSON._globalConfig)
        {
            this.config({});
        }
    }

    /**
     * Configures TypedJSON through a settings object.
     * @param settings The configuration settings object.
     */
    public config(settings: ITypedJSONSettings)
    {
        if (TypedJSON._globalConfig)
        {
            settings = {
                ...TypedJSON._globalConfig,
                ...settings
            };

            if (settings.knownTypes && TypedJSON._globalConfig.knownTypes)
            {
                // Merge known-types (also de-duplicate them, so Array -> Set -> Array).
                settings.knownTypes = Array.from(new Set(
                    settings.knownTypes.concat(TypedJSON._globalConfig.knownTypes),
                ));
            }
        }

        if (settings.errorHandler)
        {
            this.errorHandler = settings.errorHandler;
            this.deserializer.setErrorHandler(settings.errorHandler);
            this.serializer.setErrorHandler(settings.errorHandler);
        }

        if (settings.replacer) this.replacer = settings.replacer;
        if (settings.typeResolver) this.deserializer.setTypeResolver(settings.typeResolver);
        if (settings.typeHintEmitter) this.serializer.setTypeHintEmitter(settings.typeHintEmitter);
        if (settings.indent) this.indent = settings.indent;

        if (settings.nameResolver)
        {
            this.nameResolver = settings.nameResolver;
            this.deserializer.setNameResolver(settings.nameResolver);
            // this.serializer.set
        }

        if (settings.knownTypes)
        {
            // Type-check knownTypes elements to recognize errors in advance.
            settings.knownTypes.forEach((knownType, i) =>
            {
                // tslint:disable-next-line:no-null-keyword
                if (typeof knownType === "undefined" || knownType === null)
                {
                    Helpers.logWarning(
                        `TypedJSON.config: 'knownTypes' contains an undefined/null value (element ${i}).`);
                }
            });

            this.globalKnownTypes = settings.knownTypes;
        }
    }

    /**
     * Converts a JSON string to the root class type.
     * @param object The JSON to parse and convert.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     * @returns Deserialized T or undefined if there were errors.
     */
    public parse(object: any): T|undefined
    {
        const jsonObj = parseToJSObject(object);

        let rootMetadata = JsonObjectMetadata.getFromConstructor(this.rootConstructor);
        let result: T|undefined;
        let knownTypes = new Map<string, Function>();

        this.globalKnownTypes.filter(ktc => ktc).forEach(knownTypeCtor =>
        {
            knownTypes.set(this.nameResolver(knownTypeCtor), knownTypeCtor);
        });

        if (rootMetadata)
        {
            rootMetadata.knownTypes.forEach(knownTypeCtor =>
            {
                knownTypes.set(this.nameResolver(knownTypeCtor), knownTypeCtor);
            });
        }

        try
        {
            result = this.deserializer.convertSingleValue(jsonObj, {
                selfConstructor: this.rootConstructor,
                knownTypes: knownTypes,
            }) as T;
        }
        catch (e)
        {
            this.errorHandler(e);
        }

        return result;
    }

    public parseAsArray(object: any, dimensions?: 1): T[];
    public parseAsArray(object: any, dimensions: 2): T[][];
    public parseAsArray(object: any, dimensions: 3): T[][][];
    public parseAsArray(object: any, dimensions: 4): T[][][][];
    public parseAsArray(object: any, dimensions: 5): T[][][][][];
    public parseAsArray(object: any, dimensions: number): any[];
    public parseAsArray(object: any, dimensions: number = 1): any[]
    {
        const jsonObj = parseToJSObject(object);
        if (jsonObj instanceof Array)
        {
            return this.deserializer.convertAsArray(jsonObj, {
                selfConstructor: Array,
                elementConstructor: new Array(dimensions - 1)
                    .fill(Array)
                    .concat(this.rootConstructor),
                knownTypes: this._mapKnownTypes(this.globalKnownTypes),
            });
        }
        else
        {
            this.errorHandler(new TypeError(`Expected 'json' to define an Array`
                + `, but got ${typeof jsonObj}.`));
        }

        return [];
    }

    public parseAsSet(object: any): Set<T>
    {
        const jsonObj = parseToJSObject(object);
        // A Set<T> is serialized as T[].
        if (jsonObj instanceof Array)
        {
            return this.deserializer.convertAsSet(jsonObj, {
                selfConstructor: Array,
                elementConstructor: [this.rootConstructor],
                knownTypes: this._mapKnownTypes(this.globalKnownTypes)
            });
        }
        else
        {
            this.errorHandler(new TypeError(`Expected 'json' to define a Set (using an Array)`
                + `, but got ${typeof jsonObj}.`,
            ));
        }

        return new Set<T>();
    }

    public parseAsMap<K>(object: any, keyConstructor: Constructor<K>): Map<K, T>
    {
        const jsonObj = parseToJSObject(object);
        // A Set<T> is serialized as T[].
        if (jsonObj instanceof Array)
        {
            return this.deserializer.convertAsMap(jsonObj, {
                selfConstructor: Array,
                elementConstructor: [this.rootConstructor],
                knownTypes: this._mapKnownTypes(this.globalKnownTypes),
                keyConstructor: keyConstructor
            });
        }
        else
        {
            this.errorHandler(new TypeError(`Expected 'json' to define a Set (using an Array)`
                + `, but got ${typeof jsonObj}.`,
            ));
        }

        return new Map<K, T>();
    }

    /**
     * Converts an instance of the specified class type to a plain JSON object.
     * @param object The instance to convert to a JSON string.
     * @returns Serialized object or undefined if an error has occured.
     */
    public toPlainJson(object: T): Object|undefined
    {
        if (!(object as any instanceof this.rootConstructor))
        {
            this.errorHandler(new TypeError(
                `Expected object type to be '${Helpers.nameof(this.rootConstructor)}'`
                    + `, got '${Helpers.nameof(object.constructor)}'.`,
            ));
            return undefined;
        }

        try
        {
            return this.serializer.convertSingleValue(object, {
                selfType: this.rootConstructor
            });
        }
        catch (e)
        {
            this.errorHandler(e);
        }
    }

    public toPlainArray(object: T[], dimensions?: 1): Object[];
    public toPlainArray(object: T[][], dimensions: 2): Object[][];
    public toPlainArray(object: T[][][], dimensions: 3): Object[][][];
    public toPlainArray(object: T[][][][], dimensions: 4): Object[][][][];
    public toPlainArray(object: T[][][][][], dimensions: 5): Object[][][][][];
    public toPlainArray(object: any[], dimensions: 1|2|3|4|5 = 1): Object[]|undefined
    {
        try
        {
            const elementConstructorArray =
                new Array(dimensions - 1).fill(Array).concat(this.rootConstructor);
            return this.serializer.convertAsArray(object, elementConstructorArray);
        }
        catch (e)
        {
            this.errorHandler(e);
        }
    }

    public toPlainSet(object: Set<T>): Object[]|undefined
    {
        try
        {
            return this.serializer.convertAsSet(object, this.rootConstructor);
        }
        catch (e)
        {
            this.errorHandler(e);
        }
    }

    public toPlainMap<K>(object: Map<K, T>, keyConstructor: Constructor<K>): { key: any, value: any }[]|undefined
    {
        try
        {
            return this.serializer.convertAsMap(object, keyConstructor, this.rootConstructor);
        }
        catch (e)
        {
            this.errorHandler(e);
        }
    }

    /**
     * Converts an instance of the specified class type to a JSON string.
     * @param object The instance to convert to a JSON string.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     * @returns String with the serialized object or an empty string if an error has occured, but
     *     the errorHandler did not throw.
     */
    public stringify(object: T): string
    {
        const result = this.toPlainJson(object);
        if (result === undefined) {
            return '';
        }
        return JSON.stringify(result, this.replacer, this.indent);
    }

    public stringifyAsArray(object: T[], dimensions?: 1): string;
    public stringifyAsArray(object: T[][], dimensions: 2): string;
    public stringifyAsArray(object: T[][][], dimensions: 3): string;
    public stringifyAsArray(object: T[][][][], dimensions: 4): string;
    public stringifyAsArray(object: T[][][][][], dimensions: 5): string;
    public stringifyAsArray(object: any[], dimensions: any): string
    {
        return JSON.stringify(this.toPlainArray(object, dimensions), this.replacer, this.indent);
    }

    public stringifyAsSet(object: Set<T>): string
    {
        return JSON.stringify(this.toPlainSet(object), this.replacer, this.indent);
    }

    public stringifyAsMap<K>(object: Map<K, T>, keyConstructor: Constructor<K>): string
    {
        return JSON.stringify(this.toPlainMap(object, keyConstructor), this.replacer, this.indent);
    }

    private _mapKnownTypes(constructors: Array<Constructor<any>>)
    {
        let map = new Map<string, Constructor<any>>();

        constructors.filter(ctor => ctor).forEach(ctor => map.set(this.nameResolver(ctor), ctor));

        return map;
    }
}

export { jsonObject } from "./typedjson/json-object";
export { jsonMember } from "./typedjson/json-member";
export { jsonArrayMember } from "./typedjson/json-array-member";
export { jsonSetMember } from "./typedjson/json-set-member";
export { jsonMapMember } from "./typedjson/json-map-member";
