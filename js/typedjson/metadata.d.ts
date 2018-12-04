import { IndexedObject } from "./types";
export interface JsonMemberMetadata {
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
export declare class JsonObjectMetadata {
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param ctor The constructor of a class (with or without jsonObject).
     */
    static getJsonObjectName(ctor: Function): string;
    /**
     * Gets jsonObject metadata information from a class.
     * @param ctor The constructor class.
     */
    static getFromConstructor(ctor: Function): JsonObjectMetadata | undefined;
    /**
     * Gets the known type name of a jsonObject class for type hint.
     * @param constructor The constructor class.
     */
    static getKnownTypeNameFromType(constructor: Function): string;
    private static doesHandleWithoutAnnotation(ctor);
    constructor(classType: Function);
    dataMembers: Map<string, JsonMemberMetadata>;
    knownTypes: Set<Function>;
    knownTypeMethodName?: string;
    /** Gets or sets the constructor function for the jsonObject. */
    classType: Function;
    /**
     * Indicates whether this class was explicitly annotated with @jsonObject
     * or implicitly by @jsonMember
     */
    isExplicitlyMarked: boolean;
    /**
     * Indicates whether this type is handled without annotation. This is usually
     * used for the builtin types (except for Maps, Sets, and normal Arrays).
     */
    isHandledWithoutAnnotation: boolean;
    /** Name used to encode polymorphic type */
    name?: string;
    onDeserializedMethodName?: string;
    initializerCallback?: (sourceObject: Object, rawSourceObject: Object) => Object;
}
export declare function injectMetadataInformation(constructor: IndexedObject, propKey: string | symbol, metadata: JsonMemberMetadata): void;
