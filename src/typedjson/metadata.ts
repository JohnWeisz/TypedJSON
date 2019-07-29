import { nameof, logError, METADATA_FIELD_KEY, isDirectlySerializableNativeType, isTypeTypedArray } from "./helpers";
import { IndexedObject } from "./types";
import { OptionsBase } from "./options-base";

export interface JsonMemberMetadata
{
    /** If set, a default value will be emitted for uninitialized members. */
    emitDefaultValue?: boolean;

    /** Member name as it appears in the serialized JSON. */
    name: string;

    /** Property or field key of the json member. */
    key: string;

    /** Constuctor (type) reference of the member. */
    ctor?: Function;

    /** If set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;

    options?: OptionsBase;

    /** If the json member is an array, map or set, sets member options of elements/values. Subsequent values define the types of nested arrays. */
    elementType?: Function[];

    /** If the json member is a map, sets member options of array keys. */
    keyType?: Function;

    /** Custom deserializer to use. */
    deserializer?: (json: any) => any;

    /** Custom serializer to use. */
    serializer?: (value: any) => any;
}

export class JsonObjectMetadata
{
    //#region Static
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param ctor The constructor of a class (with or without jsonObject).
     */
    public static getJsonObjectName(ctor: Function): string
    {
        const metadata = JsonObjectMetadata.getFromConstructor(ctor);
        return metadata ? nameof(metadata.classType) : nameof(ctor);
    }

    /**
     * Gets jsonObject metadata information from a class.
     * @param ctor The constructor class.
     */
    public static getFromConstructor(ctor: Function): JsonObjectMetadata|undefined
    {
        const prototype = ctor.prototype;
        if (!prototype)
        {
            return;
        }

        let metadata: JsonObjectMetadata|undefined;
        if (prototype.hasOwnProperty(METADATA_FIELD_KEY))
        {
            // The class prototype contains own jsonObject metadata
            metadata = prototype[METADATA_FIELD_KEY];
        }

        // Ignore implicitly added jsonObject (through jsonMember)
        if (metadata && metadata.isExplicitlyMarked)
        {
            return metadata;
        }

        // In the end maybe it is something which we can handle directly
        if (JsonObjectMetadata.doesHandleWithoutAnnotation(ctor))
        {
            const primitiveMeta = new JsonObjectMetadata(ctor);
            primitiveMeta.isExplicitlyMarked = true;
            // we do not store the metadata here to not modify builtin prototype
            return primitiveMeta;
        }
    }

    /**
     * Gets the known type name of a jsonObject class for type hint.
     * @param constructor The constructor class.
     */
    public static getKnownTypeNameFromType(constructor: Function): string
    {
        const metadata = JsonObjectMetadata.getFromConstructor(constructor);
        return metadata ? nameof(metadata.classType) : nameof(constructor);
    }

    private static doesHandleWithoutAnnotation(ctor: Function): boolean
    {
        return isDirectlySerializableNativeType(ctor) || isTypeTypedArray(ctor)
            || ctor === DataView || ctor === ArrayBuffer;
    }
    //#endregion

    constructor(
        classType: Function,
    ) {
        this.classType = classType;
    }

    public dataMembers: Map<string, JsonMemberMetadata> = new Map<string, JsonMemberMetadata>();

    public knownTypes: Set<Function> = new Set<Function>();

    public knownTypeMethodName?: string;

    /** Gets or sets the constructor function for the jsonObject. */
    public classType: Function;

    /**
     * Indicates whether this class was explicitly annotated with @jsonObject
     * or implicitly by @jsonMember
     */
    public isExplicitlyMarked: boolean = false;

    /**
     * Indicates whether this type is handled without annotation. This is usually
     * used for the builtin types (except for Maps, Sets, and normal Arrays).
     */
    public isHandledWithoutAnnotation: boolean = false;

    /** Name used to encode polymorphic type */
    public name?: string;

    public options?: OptionsBase;

    public onDeserializedMethodName?: string;

    public initializerCallback?: (sourceObject: Object, rawSourceObject: Object) => Object;
}

export function injectMetadataInformation(constructor: IndexedObject, propKey: string | symbol, metadata: JsonMemberMetadata)
{
    const decoratorName = `@jsonMember on ${nameof(constructor.constructor)}.${String(propKey)}`; // For error messages.
    let objectMetadata: JsonObjectMetadata;

    // When a property decorator is applied to a static member, 'constructor' is a constructor function.
    // See: https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
    // ... and static members are not supported here, so abort.
    if (typeof constructor === "function")
    {
        logError(`${decoratorName}: cannot use a static property.`);
        return;
    }

    // Methods cannot be serialized.
    // @ts-ignore symbol indexing is not supported by ts
    if (typeof constructor[propKey] === "function")
    {
        logError(`${decoratorName}: cannot use a method property.`);
        return;
    }

    if (!metadata || (!metadata.ctor && !metadata.deserializer))
    {
        logError(`${decoratorName}: JsonMemberMetadata has unknown ctor.`);
        return;
    }

    // Add jsonObject metadata to 'constructor' if not yet exists ('constructor' is the prototype).
    // NOTE: this will not fire up custom serialization, as 'constructor' must be explicitly marked with '@jsonObject' as well.
    if (!constructor.hasOwnProperty(METADATA_FIELD_KEY))
    {
        // No *own* metadata, create new.
        objectMetadata = new JsonObjectMetadata(constructor.constructor);

        // Inherit @JsonMembers from parent @jsonObject (if any).
        const parentMetadata: JsonObjectMetadata = constructor[METADATA_FIELD_KEY];
        if (parentMetadata) // && !constructor.hasOwnProperty(Helpers.METADATA_FIELD_KEY)
        {
            parentMetadata.dataMembers.forEach((_metadata, _propKey) => objectMetadata.dataMembers.set(_propKey, _metadata));
        }

        // ('constructor' is the prototype of the involved class, metadata information is added to this class prototype).
        Object.defineProperty(constructor, METADATA_FIELD_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata
        });
    }
    else
    {
        // JsonObjectMetadata already exists on 'constructor'.
        objectMetadata = constructor[METADATA_FIELD_KEY];
    }

    if (!metadata.deserializer)
    {
        // @ts-ignore above is a check (!deser && !ctor)
        objectMetadata.knownTypes.add(metadata.ctor);
    }

    if (metadata.keyType)
        objectMetadata.knownTypes.add(metadata.keyType);

    if (metadata.elementType)
        metadata.elementType.forEach(elemCtor => objectMetadata.knownTypes.add(elemCtor));

    // clear metadata of undefined properties to save memory
    (Object.keys(metadata) as [keyof JsonMemberMetadata])
        .forEach((key) => (metadata[key] === undefined) && delete metadata[key]);
    objectMetadata.dataMembers.set(metadata.name, metadata);
}
