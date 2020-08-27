import { OptionsBase } from './options-base';
import { TypeDescriptor } from './type-descriptor';
import { IndexedObject, Serializable } from './types';
export declare const METADATA_FIELD_KEY = "__typedJsonJsonObjectMetadataInformation__";
export declare type TypeResolver = (sourceObject: IndexedObject, knownTypes: Map<string, Function>) => Function | undefined | null;
export declare type TypeHintEmitter = (targetObject: IndexedObject, sourceObject: IndexedObject, expectedSourceType: Function, sourceTypeMetadata?: JsonObjectMetadata) => void;
export interface JsonMemberMetadata {
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
export declare class JsonObjectMetadata {
    dataMembers: Map<string, JsonMemberMetadata>;
    /** Set of known types used for polymorphic deserialization */
    knownTypes: Set<Serializable<any>>;
    /** If present override the global function */
    typeHintEmitter?: TypeHintEmitter;
    /** If present override the global function */
    typeResolver?: TypeResolver;
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
    options?: OptionsBase;
    onDeserializedMethodName?: string;
    beforeSerializationMethodName?: string;
    initializerCallback?: (sourceObject: Object, rawSourceObject: Object) => Object;
    constructor(classType: Function);
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param ctor The constructor of a class (with or without jsonObject).
     */
    static getJsonObjectName(ctor: Function): string;
    /**
     * Gets jsonObject metadata information from a class.
     * @param ctor The constructor class.
     */
    static getFromConstructor<T>(ctor: Serializable<T>): JsonObjectMetadata | undefined;
    static ensurePresentInPrototype(prototype: IndexedObject): JsonObjectMetadata;
    /**
     * Gets the known type name of a jsonObject class for type hint.
     * @param constructor The constructor class.
     */
    static getKnownTypeNameFromType(constructor: Function): string;
    private static doesHandleWithoutAnnotation;
}
export declare function injectMetadataInformation(prototype: IndexedObject, propKey: string | symbol, metadata: JsonMemberMetadata): void;
