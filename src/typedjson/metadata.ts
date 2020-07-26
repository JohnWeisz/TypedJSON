import { nameof, logError, isDirectlySerializableNativeType, isTypeTypedArray } from "./helpers";
import { IndexedObject, Serializable } from "./types";
import { OptionsBase } from "./options-base";
import { TypeDescriptor } from "./type-descriptor";

export const METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";

export type TypeResolver = (sourceObject: IndexedObject, knownTypes: Map<string, Function>) => Function|undefined|null;
export type TypeHintEmitter
    = (
        targetObject: IndexedObject,
        sourceObject: IndexedObject,
        expectedSourceType: Function,
        sourceTypeMetadata?: JsonObjectMetadata,
    ) => void;

export interface JsonMemberMetadata
{
    /** If set, a default value will be emitted for uninitialized members. */
    emitDefaultValue?: boolean;

    /** Member name as it appears in the serialized JSON. */
    name: string;

    /** Property or field key of the json member. */
    key: string;

    /** Type descriptor of the member. */
    type?: TypeDescriptor;

    /** If set, indicates that the member must be present when deserializing. */
    isRequired?: boolean;

    options?: OptionsBase;

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
    public static getFromConstructor<T>(ctor: Serializable<T>): JsonObjectMetadata|undefined
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

    public static ensurePresentInPrototype(prototype: IndexedObject): JsonObjectMetadata
    {
        if (prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            return prototype[METADATA_FIELD_KEY];
        }
            // Target has no JsonObjectMetadata associated with it yet, create it now.
        const objectMetadata = new JsonObjectMetadata(prototype.constructor);

        // Inherit json members and known types from parent @jsonObject (if any).
        const parentMetadata: JsonObjectMetadata = prototype[METADATA_FIELD_KEY];
        if (parentMetadata)
        {
            parentMetadata.dataMembers
                .forEach((memberMetadata, propKey) =>
                    objectMetadata.dataMembers.set(propKey, memberMetadata));
            parentMetadata.knownTypes
                .forEach((knownType) => objectMetadata.knownTypes.add(knownType));
            objectMetadata.typeResolver = parentMetadata.typeResolver;
            objectMetadata.typeHintEmitter = parentMetadata.typeHintEmitter;
        }

        Object.defineProperty(prototype, METADATA_FIELD_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata
        });
        return objectMetadata;
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

    public dataMembers = new Map<string, JsonMemberMetadata>();

    /** Set of known types used for polymorphic deserialization */
    public knownTypes = new Set<Serializable<any>>();
    /** If present override the global function */
    public typeHintEmitter?: TypeHintEmitter;
    /** If present override the global function */
    public typeResolver?: TypeResolver;

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

    public beforeSerializationMethodName?: string;

    public initializerCallback?: (sourceObject: Object, rawSourceObject: Object) => Object;
}

export function injectMetadataInformation(prototype: IndexedObject, propKey: string | symbol, metadata: JsonMemberMetadata)
{
    const decoratorName = `@jsonMember on ${nameof(prototype.constructor)}.${String(propKey)}`; // For error messages.

    // When a property decorator is applied to a static member, 'constructor' is a constructor function.
    // See: https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Decorators.md#property-decorators
    // ... and static members are not supported here, so abort.
    if (typeof prototype === "function")
    {
        logError(`${decoratorName}: cannot use a static property.`);
        return;
    }

    // Methods cannot be serialized.
    // @ts-ignore symbol indexing is not supported by ts
    if (typeof prototype[propKey] === "function")
    {
        logError(`${decoratorName}: cannot use a method property.`);
        return;
    }

    if (!metadata || (!metadata.type && !metadata.deserializer))
    {
        logError(`${decoratorName}: JsonMemberMetadata has unknown type.`);
        return;
    }

    // Add jsonObject metadata to 'constructor' if not yet exists ('constructor' is the prototype).
    // NOTE: this will not fire up custom serialization, as 'constructor' must be explicitly marked with '@jsonObject' as well.
    const objectMetadata = JsonObjectMetadata.ensurePresentInPrototype(prototype);

    if (!metadata.deserializer)
    {
        // @ts-ignore above is a check (!deser && !ctor)
        metadata.type.getTypes().forEach(ctor => objectMetadata.knownTypes.add(ctor));
    }

    // clear metadata of undefined properties to save memory
    (Object.keys(metadata) as [keyof JsonMemberMetadata])
        .forEach((key) => (metadata[key] === undefined) && delete metadata[key]);
    objectMetadata.dataMembers.set(metadata.name, metadata);
}
