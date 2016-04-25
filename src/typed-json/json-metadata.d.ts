import { Constructor } from "./types";
export declare class JsonMemberMetadata<T> {
    emitDefaultValue: boolean;
    /** Member name as it appears in the serialized JSON. */
    name: string;
    /** Property or field key of the json member. */
    key: string;
    /** Constuctor (type) reference of the member. */
    type: Constructor<T>;
    /** If set, indicates that the member must be present when deserializing. */
    isRequired: boolean;
    /** If the json member is an array, sets the type of array elements. */
    elementType: {
        new (): any;
    };
    /** Serialization/deserialization order. */
    order: number;
}
export declare class JsonObjectMetadata<T> {
    private _className;
    private _classType;
    private _dataMembers;
    private _knownTypes;
    private _knownTypeCache;
    isParameterized: boolean;
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param type The JsonObject class.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     */
    static getJsonObjectName(type: Constructor<any>, inherited?: boolean): string;
    /**
     * Gets JsonObject metadata information from a class or its prototype.
     * @param target The target class or prototype.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to this special inheritance case.
     */
    static getJsonObjectMetadataFromType<S>(target: Constructor<S> | any, inherited?: boolean): JsonObjectMetadata<S>;
    /**
     * Gets JsonObject metadata information from a class instance.
     * @param target The target instance.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to this special inheritance case.
     */
    static getJsonObjectMetadataFromInstance<S>(target: S, inherited?: boolean): JsonObjectMetadata<S>;
    /**
     * Gets the known type name of a JsonObject class for type hint.
     * @param target The target class.
     */
    static getKnownTypeNameFromType<S>(target: {
        new (): S;
    }): string;
    /**
     * Gets the known type name of a JsonObject instance for type hint.
     * @param target The target instance.
     */
    static getKnownTypeNameFromInstance<S>(target: S): string;
    /** Gets the metadata of all JsonMembers of the JsonObject as key-value pairs. */
    dataMembers: {
        [key: string]: JsonMemberMetadata<any>;
    };
    /** Gets or sets the type reference (constructor function) of the associated JsonObject. */
    classType: Constructor<T>;
    /** Gets or sets the name of the JsonObject as it appears in the serialized JSON. */
    className: string;
    /** Gets a key-value collection of the currently known types for this JsonObject. */
    knownTypes: {
        [key: string]: new (...args: any[]) => any;
    };
    initializer: (json: any) => T;
    serializer: (object: T) => any;
    constructor();
    /**
     * Sets a known type.
     * @param type The known type.
     */
    setKnownType(type: Constructor<any>): void;
    /**
     * Adds a JsonMember to the JsonObject.
     * @param member The JsonMember metadata.
     * @throws Error if a JsonMember with the same name already exists.
     */
    addMember<U>(member: JsonMemberMetadata<U>): void;
    /**
     * Sorts data members:
     *  1. Ordered members in defined order
     *  2. Unordered members in alphabetical order
     */
    sortMembers(): void;
    private sortMembersCompare(a, b);
}
