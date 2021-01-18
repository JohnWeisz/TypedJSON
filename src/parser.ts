import {Deserializer} from './deserializer';
import {logError, nameof, parseToJSObject} from './helpers';
import {createArrayType} from './json-array-member';
import {JsonObjectMetadata} from './metadata';
import {extractOptionBase, OptionsBase} from './options-base';
import {Serializer} from './serializer';
import {ensureTypeDescriptor, MapT, SetT} from './type-descriptor';
import {IndexedObject, Serializable} from './types';

export type JsonTypes = Object | boolean | string | number | null | undefined;

export interface MappedTypeConverters<T> {

    /**
     * Use this deserializer to convert a JSON value to the type.
     */
    deserializer?: ((json: any) => T | null | undefined) | null;

    /**
     * Use this serializer to convert a type back to JSON.
     */
    serializer?: ((value: T | null | undefined) => any) | null;
}

export interface ITypedJSONSettings extends OptionsBase {
    /**
     * Sets the handler callback to invoke on errors during serializing and deserializing.
     * Re-throwing errors in this function will halt serialization/deserialization.
     * The default behavior is to log errors to the console.
     */
    errorHandler?: ((e: Error) => void) | null;

    /**
     * Maps a type to their respective (de)serializer. Prevents you from having to repeat
     * (de)serializers. Register additional types with `TypedJSON.mapType`.
     */
    mappedTypes?: Map<Serializable<any>, MappedTypeConverters<any>> | null;

    nameResolver?: ((ctor: Function) => string) | null;

    /**
     * Sets the amount of indentation to use in produced JSON strings.
     * Default value is 0, or no indentation.
     */
    indent?: number | null;

    replacer?: ((key: string, value: any) => any) | null;
}

export class TypedJSON<T> {

    private static _globalConfig: ITypedJSONSettings = {};

    private serializer: Serializer = new Serializer();
    private deserializer: Deserializer<T> = new Deserializer<T>();
    private indent: number = 0;
    private rootConstructor: Serializable<T>;
    private errorHandler: (e: Error) => void;
    private nameResolver: (ctor: Function) => string;
    private replacer?: (key: string, value: any) => any;

    /**
     * Creates a new TypedJSON instance to serialize (stringify) and deserialize (parse) object
     *     instances of the specified root class type.
     * @param rootConstructor The constructor of the root class type.
     * @param settings Additional configuration settings.
     */
    constructor(rootConstructor: Serializable<T>, settings?: ITypedJSONSettings) {
        const rootMetadata = JsonObjectMetadata.getFromConstructor(rootConstructor);

        if (rootMetadata === undefined
            || (!rootMetadata.isExplicitlyMarked && !rootMetadata.isHandledWithoutAnnotation)) {
            throw new TypeError(
                'The TypedJSON root data type must have the @jsonObject decorator used.',
            );
        }

        this.nameResolver = (ctor) => nameof(ctor);
        this.rootConstructor = rootConstructor;
        this.errorHandler = (error) => logError(error);

        this.config(settings);
    }

    static parse<T>(
        object: any,
        rootType: Serializable<T>,
        settings?: ITypedJSONSettings,
    ): T | undefined {
        return new TypedJSON(rootType, settings).parse(object);
    }

    static parseAsArray<T>(
        object: any,
        elementType: Serializable<T>,
        settings?: ITypedJSONSettings,
        dimensions?: 1,
    ): Array<T>;
    static parseAsArray<T>(
        object: any,
        elementType: Serializable<T>,
        settings: ITypedJSONSettings | undefined,
        dimensions: 2,
    ): Array<Array<T>>;
    static parseAsArray<T>(
        object: any,
        elementType: Serializable<T>,
        settings: ITypedJSONSettings | undefined,
        dimensions: 3,
    ): Array<Array<Array<T>>>;
    static parseAsArray<T>(
        object: any,
        elementType: Serializable<T>,
        settings: ITypedJSONSettings | undefined,
        dimensions: 4,
    ): Array<Array<Array<Array<T>>>>;
    static parseAsArray<T>(
        object: any,
        elementType: Serializable<T>,
        settings: ITypedJSONSettings | undefined,
        dimensions: 5,
    ): Array<Array<Array<Array<Array<T>>>>>;
    static parseAsArray<T>(
        object: any,
        elementType: Serializable<T>,
        settings?: ITypedJSONSettings,
        dimensions?: number,
    ): Array<any> {
        return new TypedJSON(elementType, settings).parseAsArray(object, dimensions as any);
    }

    static parseAsSet<T>(
        object: any,
        elementType: Serializable<T>,
        settings?: ITypedJSONSettings,
    ): Set<T> {
        return new TypedJSON(elementType, settings).parseAsSet(object);
    }

    static parseAsMap<K, V>(
        object: any,
        keyType: Serializable<K>,
        valueType: Serializable<V>,
        settings?: ITypedJSONSettings,
    ): Map<K, V> {
        return new TypedJSON(valueType, settings).parseAsMap(object, keyType);
    }

    static toPlainJson<T>(
        object: T,
        rootType: Serializable<T>,
        settings?: ITypedJSONSettings,
    ): JsonTypes {
        return new TypedJSON(rootType, settings).toPlainJson(object);
    }

    static toPlainArray<T>(
        object: Array<T>,
        elementType: Serializable<T>,
        dimensions?: 1,
        settings?: ITypedJSONSettings,
    ): Array<Object>;
    static toPlainArray<T>(
        object: Array<Array<T>>,
        elementType: Serializable<T>,
        dimensions: 2,
        settings?: ITypedJSONSettings,
    ): Array<Array<Object>>;
    static toPlainArray<T>(
        object: Array<Array<Array<T>>>,
        elementType: Serializable<T>,
        dimensions: 3,
        settings?: ITypedJSONSettings,
    ): Array<Array<Array<Object>>>;
    static toPlainArray<T>(
        object: Array<Array<Array<Array<T>>>>,
        elementType: Serializable<T>,
        dimensions: 4, settings?: ITypedJSONSettings,
    ): Array<Array<Array<Array<Object>>>>;
    static toPlainArray<T>(
        object: Array<Array<Array<Array<Array<T>>>>>,
        elementType: Serializable<T>,
        dimensions: 5,
        settings?: ITypedJSONSettings,
    ): Array<Array<Array<Array<Array<Object>>>>>;
    static toPlainArray<T>(
        object: Array<any>,
        elementType: Serializable<T>,
        dimensions: number,
        settings?: ITypedJSONSettings,
    ): Array<any>;
    static toPlainArray<T>(
        object: Array<any>,
        elementType: Serializable<T>,
        dimensions?: any,
        settings?: ITypedJSONSettings,
    ): Array<any> {
        return new TypedJSON(elementType, settings).toPlainArray(object, dimensions);
    }

    static toPlainSet<T>(
        object: Set<T>,
        elementType: Serializable<T>,
        settings?: ITypedJSONSettings,
    ): Array<Object> | undefined {
        return new TypedJSON(elementType, settings).toPlainSet(object);
    }

    static toPlainMap<K, V>(
        object: Map<K, V>,
        keyCtor: Serializable<K>,
        valueCtor: Serializable<V>,
        settings?: ITypedJSONSettings,
    ): IndexedObject | Array<{key: any; value: any}> | undefined {
        return new TypedJSON(valueCtor, settings).toPlainMap(object, keyCtor);
    }

    static stringify<T>(
        object: T,
        rootType: Serializable<T>,
        settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(rootType, settings).stringify(object);
    }

    static stringifyAsArray<T>(
        object: Array<T>,
        elementType: Serializable<T>,
        dimensions?: 1,
        settings?: ITypedJSONSettings,
    ): string;
    static stringifyAsArray<T>(
        object: Array<Array<T>>,
        elementType: Serializable<T>,
        dimensions: 2,
        settings?: ITypedJSONSettings,
    ): string;
    static stringifyAsArray<T>(
        object: Array<Array<Array<T>>>,
        elementType: Serializable<T>,
        dimensions: 3,
        settings?: ITypedJSONSettings,
    ): string;
    static stringifyAsArray<T>(
        object: Array<Array<Array<Array<T>>>>,
        elementType: Serializable<T>,
        dimensions: 4,
        settings?: ITypedJSONSettings,
    ): string;
    static stringifyAsArray<T>(
        object: Array<Array<Array<Array<Array<T>>>>>,
        elementType: Serializable<T>,
        dimensions: 5,
        settings?: ITypedJSONSettings,
    ): string;
    static stringifyAsArray<T>(
        object: Array<any>,
        elementType: Serializable<T>,
        dimensions: number, settings?: ITypedJSONSettings,
    ): string;
    static stringifyAsArray<T>(
        object: Array<any>,
        elementType: Serializable<T>,
        dimensions?: any,
        settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(elementType, settings).stringifyAsArray(object, dimensions);
    }

    static stringifyAsSet<T>(
        object: Set<T>,
        elementType: Serializable<T>,
        settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(elementType, settings).stringifyAsSet(object);
    }

    static stringifyAsMap<K, V>(
        object: Map<K, V>,
        keyCtor: Serializable<K>,
        valueCtor: Serializable<V>,
        settings?: ITypedJSONSettings,
    ): string {
        return new TypedJSON(valueCtor, settings).stringifyAsMap(object, keyCtor);
    }

    static setGlobalConfig(config: ITypedJSONSettings) {
        Object.assign(this._globalConfig, config);
    }

    /**
     * Map a type to its (de)serializer.
     */
    static mapType<T, R = T>(type: Serializable<T>, converters: MappedTypeConverters<R>): void {
        if (this._globalConfig.mappedTypes == null) {
            this._globalConfig.mappedTypes = new Map<any, any>();
        }

        this._globalConfig.mappedTypes.set(type, converters);
    }

    /**
     * Configures TypedJSON through a settings object.
     * @param settings The configuration settings object.
     */
    config(settings?: ITypedJSONSettings) {
        settings = {
            ...TypedJSON._globalConfig,
            ...settings,
        };

        const options = extractOptionBase(settings);
        this.serializer.options = options;
        this.deserializer.options = options;

        if (settings.errorHandler != null) {
            this.errorHandler = settings.errorHandler;
            this.deserializer.setErrorHandler(settings.errorHandler);
            this.serializer.setErrorHandler(settings.errorHandler);
        }

        if (settings.replacer != null) {
            this.replacer = settings.replacer;
        }

        if (settings.indent != null) {
            this.indent = settings.indent;
        }

        if (settings.mappedTypes != null) {
            settings.mappedTypes.forEach((upDown, type) => {
                this.setSerializationStrategies(type, upDown);
            });
        }

        if (settings.nameResolver != null) {
            this.nameResolver = settings.nameResolver;
            this.deserializer.setNameResolver(settings.nameResolver);
        }
    }

    mapType<T, R = T>(type: Serializable<T>, converters: MappedTypeConverters<R>): void {
        this.setSerializationStrategies(type, converters);
    }

    /**
     * Converts a JSON string to the root class type.
     * @param object The JSON to parse and convert.
     * @throws Error if any errors are thrown in the specified errorHandler callback (re-thrown).
     * @returns Deserialized T or undefined if there were errors.
     */
    parse(object: any): T | undefined {
        const json = parseToJSObject(object, this.rootConstructor);

        let result: T | undefined;

        try {
            result = this.deserializer.convertSingleValue(
                json,
                ensureTypeDescriptor(this.rootConstructor),
            ) as T;
        } catch (e) {
            this.errorHandler(e);
        }

        return result;
    }

    parseAsArray(object: any, dimensions?: 1): Array<T>;
    parseAsArray(object: any, dimensions: 2): Array<Array<T>>;
    parseAsArray(object: any, dimensions: 3): Array<Array<Array<T>>>;
    parseAsArray(object: any, dimensions: 4): Array<Array<Array<Array<T>>>>;
    parseAsArray(object: any, dimensions: 5): Array<Array<Array<Array<Array<T>>>>>;
    parseAsArray(object: any, dimensions: number): Array<any>;
    parseAsArray(object: any, dimensions: number = 1): Array<any> {
        const json = parseToJSObject(object, Array);
        return this.deserializer.convertSingleValue(
            json,
            createArrayType(ensureTypeDescriptor(this.rootConstructor), dimensions),
        );
    }

    parseAsSet(object: any): Set<T> {
        const json = parseToJSObject(object, Set);
        return this.deserializer.convertSingleValue(
            json,
            SetT(this.rootConstructor),
        );
    }

    parseAsMap<K>(object: any, keyConstructor: Serializable<K>): Map<K, T> {
        const json = parseToJSObject(object, Map);
        return this.deserializer.convertSingleValue(
            json,
            MapT(keyConstructor, this.rootConstructor),
        );
    }

    /**
     * Converts an instance of the specified class type to a plain JSON object.
     * @param object The instance to convert to a JSON string.
     * @returns Serialized object or undefined if an error has occured.
     */
    toPlainJson(object: T): JsonTypes {
        try {
            return this.serializer.convertSingleValue(
                object,
                ensureTypeDescriptor(this.rootConstructor),
            );
        } catch (e) {
            this.errorHandler(e);
        }
    }

    toPlainArray(object: Array<T>, dimensions?: 1): Array<Object>;
    toPlainArray(object: Array<Array<T>>, dimensions: 2): Array<Array<Object>>;
    toPlainArray(object: Array<Array<Array<T>>>, dimensions: 3): Array<Array<Array<Object>>>;
    toPlainArray(
        object: Array<Array<Array<Array<T>>>>,
        dimensions: 4,
    ): Array<Array<Array<Array<Object>>>>;
    toPlainArray(
        object: Array<Array<Array<Array<Array<T>>>>>,
        dimensions: 5,
    ): Array<Array<Array<Array<Array<Object>>>>>;
    toPlainArray(object: Array<any>, dimensions: 1 | 2 | 3 | 4 | 5 = 1): Array<Object> | undefined {
        try {
            return this.serializer.convertSingleValue(
                object,
                createArrayType(ensureTypeDescriptor(this.rootConstructor), dimensions),
            );
        } catch (e) {
            this.errorHandler(e);
        }
    }

    toPlainSet(object: Set<T>): Array<Object> | undefined {
        try {
            return this.serializer.convertSingleValue(object, SetT(this.rootConstructor));
        } catch (e) {
            this.errorHandler(e);
        }
    }

    toPlainMap<K>(
        object: Map<K, T>,
        keyConstructor: Serializable<K>,
    ): IndexedObject | Array<{key: any; value: any}> | undefined {
        try {
            return this.serializer.convertSingleValue(
                object,
                MapT(keyConstructor, this.rootConstructor),
            );
        } catch (e) {
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
    stringify(object: T): string {
        const result = this.toPlainJson(object);
        if (result === undefined) {
            return '';
        }
        return JSON.stringify(result, this.replacer, this.indent);
    }

    stringifyAsArray(object: Array<T>, dimensions?: 1): string;
    stringifyAsArray(object: Array<Array<T>>, dimensions: 2): string;
    stringifyAsArray(object: Array<Array<Array<T>>>, dimensions: 3): string;
    stringifyAsArray(object: Array<Array<Array<Array<T>>>>, dimensions: 4): string;
    stringifyAsArray(object: Array<Array<Array<Array<Array<T>>>>>, dimensions: 5): string;
    stringifyAsArray(object: Array<any>, dimensions: any): string {
        return JSON.stringify(this.toPlainArray(object, dimensions), this.replacer, this.indent);
    }

    stringifyAsSet(object: Set<T>): string {
        return JSON.stringify(this.toPlainSet(object), this.replacer, this.indent);
    }

    stringifyAsMap<K>(object: Map<K, T>, keyConstructor: Serializable<K>): string {
        return JSON.stringify(this.toPlainMap(object, keyConstructor), this.replacer, this.indent);
    }

    private setSerializationStrategies<T, R = T>(
        type: Serializable<T>,
        converters: MappedTypeConverters<R>,
    ): void {
        if (converters.deserializer != null) {
            this.deserializer.setDeserializationStrategy(type, (value) => {
                return converters.deserializer!(value);
            });
        }

        if (converters.serializer != null) {
            this.serializer.setSerializationStrategy(type, (value) => {
                return converters.serializer!(value);
            });
        }
    }
}
