import {ParameterlessConstructor, Constructor} from "./types";
import * as Helpers from "./helpers";

export class JsonMemberMetadata<T> {
    /** If set, a default value will be emitted for uninitialized members. */
    public emitDefaultValue: boolean;

    /** Member name as it appears in the serialized JSON. */
    public name: string;

    /** Property or field key of the json member. */
    public key: string;

    /** Constuctor (type) reference of the member. */
    public type: Constructor<T>;

    /** If set, indicates that the member must be present when deserializing. */
    public isRequired: boolean;

    /** If the json member is an array, sets the type of array elements. */
    public elementType: { new (): any };

    /** Serialization/deserialization order. */
    public order: number;
}

export class JsonObjectMetadata<T> {
    private _className: string;
    private _dataMembers: { [key: string]: JsonMemberMetadata<any> };
    private _knownTypes: Array<Constructor<any>>;
    private _knownTypeCache: { [key: string]: Constructor<any> };
    
    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param type The JsonObject class.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     */
    public static getJsonObjectName(type: Constructor<any>, inherited: boolean = true): string {
        var metadata = this.getFromType(type, inherited);

        if (metadata !== null) {
            return metadata.className;
        } else {
            return Helpers.getClassName(type);
        }
    }

    /**
     * Gets JsonObject metadata information from a class or its prototype.
     * @param target The target class or prototype.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
     */
    public static getFromType<S>(target: Constructor<S> | any, inherited: boolean = true): JsonObjectMetadata<S> {
        var targetPrototype: any;

        if (typeof target === "function") {
            targetPrototype = target.prototype;
        } else {
            targetPrototype = target;
        }

        if (!targetPrototype) {
            return null;
        }

        if (targetPrototype.hasOwnProperty("__typedJsonJsonObjectMetadataInformation__")) {
            // The class (prototype) contains an own Json Object metadata.
            return targetPrototype.__typedJsonJsonObjectMetadataInformation__;
        } else if (inherited && targetPrototype.__typedJsonJsonObjectMetadataInformation__) {
            // The class (prototype) does not contain own Json Object metadata, but it inherits, and inheritance is set to allowed.
            return targetPrototype.__typedJsonJsonObjectMetadataInformation__;
        }

        return null;
    }

    /**
     * Gets JsonObject metadata information from a class instance.
     * @param target The target instance.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
     */
    public static getFromInstance<S>(target: S, inherited: boolean = true): JsonObjectMetadata<S> {
        return this.getFromType<S>(Object.getPrototypeOf(target), inherited);
    }

    /**
     * Gets the known type name of a JsonObject class for type hint.
     * @param target The target class.
     */
    public static getKnownTypeNameFromType<S>(target: Constructor<S>): string {
        var metadata = this.getFromType<S>(target, false);

        if (metadata) {
            return metadata.className;
        } else {
            return Helpers.getClassName(target);
        }
    }

    /**
     * Gets the known type name of a JsonObject instance for type hint.
     * @param target The target instance.
     */
    public static getKnownTypeNameFromInstance<S>(target: S): string {
        var metadata = this.getFromInstance<S>(target, false);

        if (metadata) {
            return metadata.className;
        } else {
            return Helpers.getClassName(target.constructor);
        }
    }

    /** Gets the metadata of all JsonMembers of the JsonObject as key-value pairs. */
    public get dataMembers(): { [key: string]: JsonMemberMetadata<any> } {
        return this._dataMembers;
    }

    /** Gets or sets the constructor function for the JsonObject. */
    public classType: Constructor<T>;

    /** Gets or sets the name of the JsonObject as it appears in the serialized JSON. */
    public get className(): string {
        if (this._className !== null && typeof this._className !== "undefined") {
            return this._className;
        } else {
            return this.classType.toString().match(/function (\w*)/)[1];
        }
    }
    public set className(value: string) {
        this._className = value;
    }

    /** Gets a key-value collection of the currently known types for this JsonObject. */
    public get knownTypes() {
        var knownTypes: { [key: string]: Constructor<any> };
        var knownTypeName: string;

        if (false && this._knownTypeCache) {
            return this._knownTypeCache;
        } else {
            knownTypes = {};

            this._knownTypes.forEach((knownType) => {
                // KnownType names are not inherited from JsonObject settings, as it would render them useless.
                knownTypeName = JsonObjectMetadata.getKnownTypeNameFromType(knownType);

                knownTypes[knownTypeName] = knownType;
            });

            this._knownTypeCache = knownTypes;

            return knownTypes;
        }
    }

    public initializer: (json: any) => T;
    public serializer: (object: T) => any;

    constructor() {
        this._dataMembers = {};
        this._knownTypes = [];
        this._knownTypeCache = null;
    }

    /**
     * Sets a known type.
     * @param type The known type.
     */
    public setKnownType(type: Constructor<any>): void {
        if (this._knownTypes.indexOf(type) === -1) {
            this._knownTypes.push(type);
            this._knownTypeCache = null;
        }
    }

    /**
     * Adds a JsonMember to the JsonObject.
     * @param member The JsonMember metadata.
     * @throws Error if a JsonMember with the same name already exists.
     */
    public addMember<U>(member: JsonMemberMetadata<U>) {
        Object.keys(this._dataMembers).forEach(propertyKey => {
            if (this._dataMembers[propertyKey].name === member.name) {
                throw new Error(`A member with the name '${member.name}' already exists.`);
            }
        });

        this._dataMembers[member.key] = member;
    }

    /**
     * Sorts data members:
     *  1. Ordered members in defined order
     *  2. Unordered members in alphabetical order
     */
    public sortMembers(): void {
        var memberArray: JsonMemberMetadata<any>[] = [];

        Object.keys(this._dataMembers).forEach((propertyKey) => {
            memberArray.push(this._dataMembers[propertyKey]);
        });

        memberArray = memberArray.sort(this.sortMembersCompare);

        this._dataMembers = {};

        memberArray.forEach((dataMember) => {
            this._dataMembers[dataMember.key] = dataMember;
        });
    }

    private sortMembersCompare(a: JsonMemberMetadata<any>, b: JsonMemberMetadata<any>) {
        if (typeof a.order !== "number" && typeof b.order !== "number") {
            // a and b both both implicitly ordered, alphabetical order
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
        } else if (typeof a.order !== "number") {
            // a is implicitly ordered, comes after b (compare: a is greater)
            return 1;
        } else if (typeof b.order !== "number") {
            // b is implicitly ordered, comes after a (compare: b is greater)
            return -1;
        } else {
            // a and b are both explicitly ordered
            if (a.order < b.order) {
                return -1;
            } else if (a.order > b.order) {
                return 1;
            } else {
                // ordering is the same, use alphabetical order
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
            }
        }

        return 0;
    }
}