import { nameof, logError, METADATA_FIELD_KEY } from "./helpers";
import { IndexedObject } from "./types";

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
     * Gets jsonObject metadata information from a class or its prototype.
     * @param target The target class or prototype.
     * @param allowInherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     */
    public static getFromConstructor(target: Object | Function): JsonObjectMetadata|undefined
    {
        const targetPrototype = (typeof target === "function") ? target.prototype : target;

        if (!targetPrototype)
        {
            return;
        }

        let metadata: JsonObjectMetadata|undefined;
        if (targetPrototype.hasOwnProperty(METADATA_FIELD_KEY))
        {
            // The class prototype contains own jsonObject metadata
            metadata = targetPrototype[METADATA_FIELD_KEY];
        }

        // Ignore implicitly added jsonObject (through jsonMember)
        if (metadata && metadata.isExplicitlyMarked)
        {
            return metadata;
        }
    }

    /**
     * Gets jsonObject metadata information from a class instance.
     * @param target The target instance.
     */
    public static getFromInstance(target: any): JsonObjectMetadata|undefined
    {
        return JsonObjectMetadata.getFromConstructor(Object.getPrototypeOf(target));
    }

    /**
     * Gets the known type name of a jsonObject class for type hint.
     * @param target The target class.
     */
    public static getKnownTypeNameFromType(target: Function): string
    {
        var metadata = JsonObjectMetadata.getFromConstructor(target);
        return metadata ? nameof(metadata.classType) : nameof(target);
    }

    /**
     * Gets the known type name of a jsonObject instance for type hint.
     * @param target The target instance.
     */
    public static getKnownTypeNameFromInstance(target: any): string
    {
        var metadata = JsonObjectMetadata.getFromInstance(target);
        return metadata ? nameof(metadata.classType) : nameof(target.constructor);
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

    /** Name used to encode polymorphic type */
    public name?: string;

    public onDeserializedMethodName?: string;

    public initializerCallback?: (sourceObject: Object, rawSourceObject: Object) => Object;
}

export function injectMetadataInformation(target: IndexedObject, propKey: string | symbol, metadata: JsonMemberMetadata)
{
    const decoratorName = `@jsonMember on ${nameof(target.constructor)}.${String(propKey)}`; // For error messages.
    let objectMetadata: JsonObjectMetadata;

    // When a property decorator is applied to a static member, 'target' is a constructor function.
    // See: https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
    // ... and static members are not supported here, so abort.
    if (typeof target === "function")
    {
        logError(`${decoratorName}: cannot use a static property.`);
        return;
    }

    // Methods cannot be serialized.
    // @ts-ignore symbol indexing is not supported by ts
    if (typeof target[propKey] === "function")
    {
        logError(`${decoratorName}: cannot use a method property.`);
        return;
    }

    if (!metadata || (!metadata.ctor && !metadata.deserializer))
    {
        logError(`${decoratorName}: JsonMemberMetadata has unknown ctor.`);
        return;
    }

    // Add jsonObject metadata to 'target' if not yet exists ('target' is the prototype).
    // NOTE: this will not fire up custom serialization, as 'target' must be explicitly marked with '@jsonObject' as well.
    if (!target.hasOwnProperty(METADATA_FIELD_KEY))
    {
        // No *own* metadata, create new.
        objectMetadata = new JsonObjectMetadata(target.constructor);

        // Inherit @JsonMembers from parent @jsonObject (if any).
        const parentMetadata: JsonObjectMetadata = target[METADATA_FIELD_KEY];
        if (parentMetadata) // && !target.hasOwnProperty(Helpers.METADATA_FIELD_KEY)
        {
            parentMetadata.dataMembers.forEach((_metadata, _propKey) => objectMetadata.dataMembers.set(_propKey, _metadata));
        }

        // ('target' is the prototype of the involved class, metadata information is added to this class prototype).
        Object.defineProperty(target, METADATA_FIELD_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata
        });
    }
    else
    {
        // JsonObjectMetadata already exists on 'target'.
        objectMetadata = target[METADATA_FIELD_KEY];
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

    objectMetadata.dataMembers.set(metadata.name, metadata);
}
