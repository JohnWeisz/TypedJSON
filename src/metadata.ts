import {isDirectlySerializableNativeType, isTypeTypedArray, logError, nameof} from './helpers';
import {OptionsBase} from './options-base';
import {TypeDescriptor} from './type-descriptor';
import {IndexedObject, Serializable} from './types';

export const METADATA_FIELD_KEY = '__typedJsonJsonObjectMetadataInformation__';

export interface JsonMemberMetadata {
    /** If set, a default value will be emitted for uninitialized members. */
    emitDefaultValue?: boolean | null;

    /** Member name as it appears in the serialized JSON. */
    name: string;

    /** Property or field key of the json member. */
    key: string;

    /** Type descriptor of the member. */
    type?: (() => TypeDescriptor) | null;

    /** If set, indicates that the member must be present when deserializing. */
    isRequired?: boolean | null;

    options?: OptionsBase | null;

    /** Custom deserializer to use. */
    deserializer?: ((json: any) => any) | null;

    /** Custom serializer to use. */
    serializer?: ((value: any) => any) | null;
}

export class JsonObjectMetadata {

    dataMembers = new Map<string, JsonMemberMetadata>();

    /** Gets or sets the constructor function for the jsonObject. */
    classType: Function;

    /**
     * Indicates whether this class was explicitly annotated with @jsonObject
     * or implicitly by @jsonMember
     */
    isExplicitlyMarked: boolean = false;

    /**
     * Indicates whether this type is handled without annotation. This is usually
     * used for the builtin types (except for Maps, Sets, and normal Arrays).
     */
    isHandledWithoutAnnotation: boolean = false;

    /** Name used to encode polymorphic type */
    name?: string | null;

    options?: OptionsBase | null;

    onDeserializedMethodName?: string | null;

    /**
     * Function to be used to mutate the resulting serialization given the source object.
     */
    onSerializeType?: (source: any, result: {[k: string]: any}) => {[k: string]: any};

    beforeSerializationMethodName?: string | null;

    initializerCallback?: ((sourceObject: Object, rawSourceObject: Object) => Object) | null;

    /**
     * Given the data to be parsed, return the matching subtype. Used in conjunction with
     * `subTypes`.
     */
    resolveType?: (type: any) => Serializable<any> | undefined;

    constructor(
        classType: Function,
    ) {
        this.classType = classType;
    }

    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param ctor The constructor of a class (with or without jsonObject).
     */
    static getJsonObjectName(ctor: Function): string {
        const metadata = JsonObjectMetadata.getFromConstructor(ctor);
        return metadata === undefined ? nameof(ctor) : nameof(metadata.classType);
    }

    /**
     * Gets jsonObject metadata information from a class.
     * @param ctor The constructor class.
     */
    static getFromConstructor<T>(ctor: Serializable<T>): JsonObjectMetadata | undefined {
        const prototype = ctor.prototype;
        if (prototype == null) {
            return;
        }

        let metadata: JsonObjectMetadata | undefined;
        if (prototype.hasOwnProperty(METADATA_FIELD_KEY) === true) {
            // The class prototype contains own jsonObject metadata
            metadata = prototype[METADATA_FIELD_KEY];
        }

        // Ignore implicitly added jsonObject (through jsonMember)
        if (metadata?.isExplicitlyMarked === true) {
            return metadata;
        }

        // In the end maybe it is something which we can handle directly
        if (JsonObjectMetadata.doesHandleWithoutAnnotation(ctor)) {
            const primitiveMeta = new JsonObjectMetadata(ctor);
            primitiveMeta.isExplicitlyMarked = true;
            // we do not store the metadata here to not modify builtin prototype
            return primitiveMeta;
        }
    }

    static getSubTypeMetadata<T>(
        ctor: Serializable<T>,
        data: IndexedObject,
    ): JsonObjectMetadata | undefined {
        const metadata = this.getFromConstructor(ctor);

        if (metadata === undefined) {
            return undefined;
        }

        if (metadata.resolveType === undefined) {
            return metadata;
        }

        const resolvedType = metadata.resolveType(data);

        if (resolvedType === ctor) {
            return metadata;
        }

        if (resolvedType === undefined) {
            throw new Error(`No matching subtype returned for ${ctor.name}`);
        }

        return this.getSubTypeMetadata(resolvedType, data);
    }

    static ensurePresentInPrototype(prototype: IndexedObject): JsonObjectMetadata {
        if (prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            return prototype[METADATA_FIELD_KEY];
        }
        // Target has no JsonObjectMetadata associated with it yet, create it now.
        const objectMetadata = new JsonObjectMetadata(prototype.constructor);

        // Inherit json members and known types from parent @jsonObject (if any).
        const parentMetadata: JsonObjectMetadata | undefined = prototype[METADATA_FIELD_KEY];
        if (parentMetadata !== undefined) {
            objectMetadata.onSerializeType = parentMetadata.onSerializeType;
            parentMetadata.dataMembers.forEach((memberMetadata, propKey) => {
                objectMetadata.dataMembers.set(propKey, memberMetadata);
            });
        }

        Object.defineProperty(prototype, METADATA_FIELD_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata,
        });
        return objectMetadata;
    }

    private static doesHandleWithoutAnnotation(ctor: Function): boolean {
        return isDirectlySerializableNativeType(ctor) || isTypeTypedArray(ctor)
            || ctor === DataView || ctor === ArrayBuffer;
    }
}

export function injectMetadataInformation(
    prototype: IndexedObject,
    propKey: string | symbol,
    metadata: JsonMemberMetadata,
) {
    // For error messages
    const decoratorName = `@jsonMember on ${nameof(prototype.constructor)}.${String(propKey)}`;

    // When a property decorator is applied to a static member, 'constructor' is a constructor
    // function.
    // See:
    // eslint-disable-next-line max-len
    // https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
    // ... and static members are not supported here, so abort.
    if (typeof prototype as any === 'function') {
        logError(`${decoratorName}: cannot use a static property.`);
        return;
    }

    // Methods cannot be serialized.
    // symbol indexing is not supported by ts
    if (typeof prototype[propKey as string] === 'function') {
        logError(`${decoratorName}: cannot use a method property.`);
        return;
    }

    // @todo check if metadata is ever undefined, if so, change parameter type
    if (metadata as any == null
        || (metadata.type === undefined && metadata.deserializer === undefined)) {
        logError(`${decoratorName}: JsonMemberMetadata has unknown type.`);
        return;
    }

    // Add jsonObject metadata to 'constructor' if not yet exists ('constructor' is the prototype).
    // NOTE: this will not fire up custom serialization, as 'constructor' must be explicitly marked
    // with '@jsonObject' as well.
    const objectMetadata = JsonObjectMetadata.ensurePresentInPrototype(prototype);

    // clear metadata of undefined properties to save memory
    (Object.keys(metadata) as Array<keyof JsonMemberMetadata>)
        .forEach((key) => (metadata[key] === undefined) && delete metadata[key]);
    objectMetadata.dataMembers.set(metadata.name, metadata);
}
