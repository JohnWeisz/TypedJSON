import { nameof } from "./helpers";
import * as Helpers from "./helpers";
import { IndexedObject } from "./types";
import { JsonMemberMetadata, JsonObjectMetadata } from "./metadata";

export interface IScopeTypeInfo
{
    selfType: Function;
    elementTypes?: Function[];
    keyType?: Function;
}

/**
 * Utility class, converts a typed object tree (i.e. a tree of class instances, arrays of class instances, and so on) to an untyped javascript object (also
 * called "simple javascript object"), and emits any necessary type hints in the process (for polymorphism).
 *
 * The converted object tree is what will be given to `JSON.stringify` to convert to string as the last step, the serialization is basically like:
 *
 * (1) typed object-tree -> (2) simple JS object-tree -> (3) JSON-string
 */
export class Serializer
{
    private _typeHintEmitter: (targetObject: IndexedObject, sourceObject: IndexedObject, expectedSourceType: Function) => void;
    private _errorHandler: (error: Error) => void;

    constructor()
    {
        this._typeHintEmitter = (targetObject, sourceObject, expectedSourceType) =>
        {
            // By default, we put a "__type" property on the output object if the actual object is not the same as the expected one, so that deserialization
            // will know what to deserialize into (given the required known-types are defined, and the object is a valid subtype of the expected type).
            if (sourceObject.constructor !== expectedSourceType)
            {
                // TODO: Perhaps this can work correctly without string-literal access?
                // tslint:disable-next-line:no-string-literal
                targetObject["__type"] = nameof(sourceObject.constructor);
            }
        };

        this._errorHandler = (error) => Helpers.logError(error);
    }

    public setTypeHintEmitter(typeEmitterCallback: (targetObject: Object, sourceObject: Object, expectedSourceType: Function) => void)
    {
        if (typeof typeEmitterCallback !== "function")
        {
            throw new TypeError("'typeEmitterCallback' is not a function.");
        }

        this._typeHintEmitter = typeEmitterCallback;
    }

    public setErrorHandler(errorHandlerCallback: (error: Error) => void)
    {
        if (typeof errorHandlerCallback !== "function")
        {
            throw new TypeError("'errorHandlerCallback' is not a function.");
        }

        this._errorHandler = errorHandlerCallback;
    }

    /**
     * Convert a value of any supported serializable type.
     * The value type will be detected, and the correct serialization method will be called.
     */
    public convertSingleValue(sourceObject: any, typeInfo: IScopeTypeInfo, memberName: string = "object"): any
    {
        if (!Helpers.isValueDefined(sourceObject)) return;

        if (!Helpers.isInstanceOf(sourceObject, typeInfo.selfType))
        {
            let expectedName = nameof(typeInfo.selfType);
            let actualName = nameof(sourceObject.constructor);

            this._errorHandler(new TypeError(`Could not serialize '${memberName}': expected '${expectedName}', got '${actualName}'.`));
            return;
        }

        if (this._isDirectlySerializableNativeType(typeInfo.selfType))
        {
            return sourceObject;
        }
        else if (typeInfo.selfType === ArrayBuffer)
        {
            return this.convertAsArrayBuffer(sourceObject);
        }
        else if (typeInfo.selfType === DataView)
        {
            return this.convertAsDataView(sourceObject);
        }
        else if (typeInfo.selfType === Array)
        {
            return this.convertAsArray(sourceObject, typeInfo.elementTypes, memberName);
        }
        else if (typeInfo.selfType === Set)
        {
            return this.convertAsSet(sourceObject, typeInfo.elementTypes[0], memberName);
        }
        else if (typeInfo.selfType === Map)
        {
            return this.convertAsMap(sourceObject, typeInfo.keyType, typeInfo.elementTypes[0], memberName);
        }
        else if (this._isTypeTypedArray(typeInfo.selfType))
        {
            return this.convertAsTypedArray(sourceObject);
        }
        else if (typeof sourceObject === "object")
        {
            return this.convertAsObject(sourceObject, typeInfo, memberName);
        }
    }

    /**
     * Performs the conversion of a typed object (usually a class instance) to a simple javascript object for serialization.
     */
    public convertAsObject(sourceObject: IndexedObject, typeInfo: IScopeTypeInfo, memberName?: string)
    {
        let sourceTypeMetadata: JsonObjectMetadata;
        let targetObject: IndexedObject;

        if (sourceObject.constructor !== typeInfo.selfType && sourceObject instanceof typeInfo.selfType)
        {
            // The source object is not of the expected type, but it is a valid subtype.
            // This is OK, and we'll proceed to gather object metadata from the subtype instead.
            sourceTypeMetadata = JsonObjectMetadata.getFromConstructor(sourceObject.constructor);
        }
        else
        {
            sourceTypeMetadata = JsonObjectMetadata.getFromConstructor(typeInfo.selfType);
        }

        if (sourceTypeMetadata)
        {
            // Strong-typed serialization available.
            // We'll serialize by members that have been marked with @jsonMember (including array/set/map members), and perform recursive conversion on
            // each of them. The converted objects are put on the 'targetObject', which is what will be put into 'JSON.stringify' finally.
            targetObject = {};

            sourceTypeMetadata.dataMembers.forEach((memberMetadata, propKey) =>
            {
                if (memberMetadata.serializer) {
                    targetObject[memberMetadata.name] = memberMetadata.serializer(sourceObject[memberMetadata.key]);
                } else {
                    targetObject[memberMetadata.name] = this.convertSingleValue(sourceObject[memberMetadata.key], {
                        selfType: memberMetadata.ctor,
                        elementTypes: memberMetadata.elementType,
                        keyType: memberMetadata.keyType
                    }, `${nameof(sourceTypeMetadata.classType)}.${memberMetadata.key}`);
                }
            });
        }
        else
        {
            // Untyped serialization, "as-is", we'll just pass the object on.
            // We'll clone the source object, because type hints are added to the object itself, and we don't want to modify to the original object.
            targetObject = { ...sourceObject };
        }

        // Add type-hint.
        this._typeHintEmitter(targetObject, sourceObject, typeInfo.selfType);

        return targetObject;
    }

    /**
     * Performs the conversion of an array of typed objects (or primitive values) to an array of simple javascript objects (or primitive values) for
     * serialization.
     * @param expectedElementType The expected type of elements. If the array is supposed to be multi-dimensional, subsequent elements define lower dimensions.
     * @param memberName Name of the object being serialized, used for debugging purposes.
     */
    public convertAsArray(sourceObject: any[], expectedElementType: Function[], memberName = "object")
    {
        if (expectedElementType.length === 0 || !expectedElementType[0])
        {
            this._errorHandler(new TypeError(`Could not serialize ${memberName} as Array: missing element type definition.`));
            return;
        }

        // Check the type of each element, individually.
        // If at least one array element type is incorrect, we return undefined, which results in no value emitted during serialization.
        // This is so that invalid element types don't unexpectedly alter the ordering of other, valid elements, and that no unexpected undefined values are in
        // the emitted array.
        try
        {
            sourceObject.forEach((element, i) =>
            {
                if (!Helpers.isInstanceOf(element, expectedElementType[0]))
                {
                    let expectedTypeName = nameof(expectedElementType[0]);
                    let actualTypeName = nameof(element.constructor);
                    throw new TypeError(`Could not serialize ${memberName}[${i}]: expected '${expectedTypeName}', got '${actualTypeName}'.`);
                }
            });
        }
        catch (e)
        {
            this._errorHandler(e);
            return;
        }

        let typeInfoForElements: IScopeTypeInfo = {
            selfType: expectedElementType[0],
            elementTypes: expectedElementType.length > 1 ? expectedElementType.slice(1) : [] // For multidimensional arrays.
        };

        if (memberName)
        {
            // Just for debugging purposes.
            memberName += "[]";
        }

        return sourceObject.map(element => this.convertSingleValue(element, typeInfoForElements, memberName));
    }

    /**
     * Performs the conversion of a set of typed objects (or primitive values) into an array of simple javascript objects.
     *
     * @param sourceObject
     * @param expectedElementType The constructor of the expected Set elements (e.g. `Number` for `Set<number>`, or `MyClass` for `Set<MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @returns
     */
    public convertAsSet(sourceObject: Set<any>, expectedElementType: Function, memberName = "object")
    {
        if (!expectedElementType)
        {
            this._errorHandler(new TypeError(`Could not serialize ${memberName} as Set: missing element type definition.`));
            return;
        }

        let elementTypeInfo: IScopeTypeInfo = {
            selfType: expectedElementType
        };

        // For debugging and error tracking.
        if (memberName) memberName += "[]";

        let resultArray: any[] = [];

        // Convert each element of the set, and put it into an output array.
        // The output array is the one serialized, as JSON.stringify does not support Set serialization. (TODO: clarification needed)
        sourceObject.forEach(element =>
        {
            let resultElement = this.convertSingleValue(element, elementTypeInfo, memberName);

            // Add to output if the source element was undefined, OR the converted element is defined. This will add intentionally undefined values to output,
            // but not values that became undefined DURING serializing (usually because of a type-error).
            if (!Helpers.isValueDefined(element) || Helpers.isValueDefined(resultElement))
            {
                resultArray.push(resultElement);
            }
        });

        return resultArray;
    }

    /**
     * Performs the conversion of a map of typed objects (or primitive values) into an array of simple javascript objects with `key` and `value` properties.
     *
     * @param sourceObject
     * @param expectedKeyType The constructor of the expected Map keys (e.g. `Number` for `Map<number, any>`, or `MyClass` for `Map<MyClass, any>`).
     * @param expectedElementType The constructor of the expected Map values (e.g. `Number` for `Map<any, number>`, or `MyClass` for `Map<any, MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     */
    public convertAsMap(sourceObject: Map<any, any>, expectedKeyType: Function, expectedElementType: Function, memberName = "object")
    {
        if (!expectedElementType)
            throw new TypeError(`Could not serialize ${memberName} as Map: missing value type definition.`);

        if (!expectedKeyType)
            throw new TypeError(`Could not serialize ${memberName} as Map: missing key type definition.`);

        let elementTypeInfo: IScopeTypeInfo = {
            selfType: expectedElementType,
            elementTypes: [expectedElementType]
        };

        let keyTypeInfo: IScopeTypeInfo = {
            selfType: expectedKeyType
        };

        if (memberName) memberName += "[]";

        let resultArray: Array<{ key: any, value: any }> = [];

        // Convert each *entry* in the map to a simple javascript object with key and value properties.
        sourceObject.forEach((value, key) =>
        {
            let resultKeyValuePairObj = {
                key: this.convertSingleValue(key, keyTypeInfo, memberName),
                value: this.convertSingleValue(value, elementTypeInfo, memberName)
            };

            // We are not going to emit entries with undefined keys OR undefined values.
            if (Helpers.isValueDefined(resultKeyValuePairObj.key) && Helpers.isValueDefined(resultKeyValuePairObj.value))
            {
                resultArray.push(resultKeyValuePairObj);
            }
        });

        return resultArray;
    }

    /**
     * Performs the conversion of a typed javascript array to a simple untyped javascript array.
     * This is needed because typed arrays are otherwise serialized as objects, so we'll end up with something like "{ 0: 0, 1: 1, ... }".
     *
     * @param sourceObject
     * @returns
     */
    public convertAsTypedArray(sourceObject: ArrayBufferView)
    {
        return Array.from(sourceObject as any);
    }

    /**
     * Performs the conversion of a raw ArrayBuffer to a string.
     */
    public convertAsArrayBuffer(buffer: ArrayBuffer)
    {
        // ArrayBuffer -> 16-bit character codes -> character array -> joined string.
        return Array.from(new Uint16Array(buffer)).map(charCode => String.fromCharCode(charCode)).join("");
    }

    /**
     * Performs the conversion of DataView, converting its internal ArrayBuffer to a string and returning that string.
     */
    public convertAsDataView(dataView: DataView)
    {
        return this.convertAsArrayBuffer(dataView.buffer);
    }

    /**
     * Determines whether the specified type is a type that can be passed on "as-is" into `JSON.stringify`.
     * Values of these types don't need special conversion.
     * @param ctor The constructor of the type (wrapper constructor for primitive types, e.g. `Number` for `number`).
     */
    private _isDirectlySerializableNativeType(ctor: Function)
    {
        return ~[Date, Number, String, Boolean].indexOf(ctor as any);
    }

    private _isTypeTypedArray(ctor: Function)
    {
        return ~[Float32Array, Float64Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array].indexOf(ctor as any);
    }
}
