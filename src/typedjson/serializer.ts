import { nameof, logError, isValueDefined, isInstanceOf, isTypeTypedArray, isDirectlySerializableNativeType } from "./helpers";
import { IndexedObject } from "./types";
import { JsonObjectMetadata } from "./metadata";
import { getOptionValue, mergeOptions, OptionsBase } from "./options-base";

export interface IScopeTypeInfo
{
    selfType: Function;
    elementTypes?: Function[];
    keyType?: Function;
}

export interface IScopeArrayTypeInfo extends IScopeTypeInfo
{
    selfType: new () => Array<any>;
    elementTypes: Function[];
}

function isArrayTypeInfo(typeInfo: IScopeTypeInfo): typeInfo is IScopeArrayTypeInfo {
    return typeInfo.selfType === Array;
}

export interface IScopeSetTypeInfo extends IScopeTypeInfo
{
    selfType: new () => Set<any>;
    elementTypes: [Function];
}

function isSetTypeInfo(typeInfo: IScopeTypeInfo): typeInfo is IScopeSetTypeInfo {
    return typeInfo.selfType === Set;
}

export interface IScopeMapTypeInfo extends IScopeTypeInfo
{
    selfType: new () => Map<any, any>;
    elementTypes: [Function];
    keyType: Function;
}

function isMapTypeInfo(typeInfo: IScopeTypeInfo): typeInfo is IScopeMapTypeInfo {
    return typeInfo.selfType === Map;
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
    public options?: OptionsBase;
    private _typeHintEmitter: (targetObject: IndexedObject, sourceObject: IndexedObject, expectedSourceType: Function, sourceTypeMetadata?: JsonObjectMetadata) => void;
    private _errorHandler: (error: Error) => void;

    constructor()
    {
        this._typeHintEmitter = (targetObject, sourceObject, expectedSourceType, sourceTypeMetadata?: JsonObjectMetadata) =>
        {
            // By default, we put a "__type" property on the output object if the actual object is not the same as the expected one, so that deserialization
            // will know what to deserialize into (given the required known-types are defined, and the object is a valid subtype of the expected type).
            if (sourceObject.constructor !== expectedSourceType)
            {
                const name = sourceTypeMetadata && sourceTypeMetadata.name
                    ? sourceTypeMetadata.name
                    : nameof(sourceObject.constructor);
                // TODO: Perhaps this can work correctly without string-literal access?
                // tslint:disable-next-line:no-string-literal
                targetObject["__type"] = name;
            }
        };

        this._errorHandler = (error) => logError(error);
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
    public convertSingleValue(
        sourceObject: any,
        typeInfo: IScopeTypeInfo,
        memberName: string = "object",
        memberOptions?: OptionsBase,
    ): any {
        if (this.retrievePreserveNull(memberOptions) && sourceObject === null) return null;
        if (!isValueDefined(sourceObject)) return;

        if (!isInstanceOf(sourceObject, typeInfo.selfType))
        {
            let expectedName = nameof(typeInfo.selfType);
            let actualName = nameof(sourceObject.constructor);

            this._errorHandler(new TypeError(
                `Could not serialize '${memberName}': expected '${expectedName}', got '${actualName}'.`),
            );
            return;
        }

        if (isDirectlySerializableNativeType(typeInfo.selfType))
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
        else if (isArrayTypeInfo(typeInfo))
        {
            return this.convertAsArray(sourceObject, typeInfo.elementTypes, memberName, memberOptions);
        }
        else if (isSetTypeInfo(typeInfo))
        {
            return this.convertAsSet(sourceObject, typeInfo.elementTypes[0], memberName, memberOptions);
        }
        else if (isMapTypeInfo(typeInfo))
        {
            return this.convertAsMap(sourceObject, typeInfo.keyType, typeInfo.elementTypes[0], memberName, memberOptions);
        }
        else if (isTypeTypedArray(typeInfo.selfType))
        {
            return this.convertAsTypedArray(sourceObject);
        }
        else if (typeof sourceObject === "object")
        {
            return this.convertAsObject(sourceObject, typeInfo, memberName, memberOptions);
        }
    }

    /**
     * Performs the conversion of a typed object (usually a class instance) to a simple
     * javascript object for serialization.
     */
    public convertAsObject(
        sourceObject: IndexedObject,
        typeInfo: IScopeTypeInfo,
        memberName?: string,
        memberOptions?: OptionsBase,
    ) {
        let sourceTypeMetadata: JsonObjectMetadata|undefined;
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

            if (sourceTypeMetadata.beforeSerializationMethodName) {
                // check for member first
                if (typeof (sourceObject as any)[sourceTypeMetadata.beforeSerializationMethodName] === "function")
                {
                    (sourceObject as any)[sourceTypeMetadata.beforeSerializationMethodName]();
                }
                // check for static
                else if (typeof (sourceObject.constructor as any)[sourceTypeMetadata.beforeSerializationMethodName] === "function")
                {
                    (sourceObject.constructor as any)[sourceTypeMetadata.beforeSerializationMethodName]();
                }
                else 
                {
                    this._errorHandler(new TypeError(
                        `beforeSerialization callback '${nameof(sourceTypeMetadata.classType)}.${sourceTypeMetadata.beforeSerializationMethodName}' is not a method.`
                    ));
                }
            }

            const sourceMeta = sourceTypeMetadata;
            // Strong-typed serialization available.
            // We'll serialize by members that have been marked with @jsonMember (including array/set/map members),
            // and perform recursive conversion on each of them. The converted objects are put on the 'targetObject',
            // which is what will be put into 'JSON.stringify' finally.
            targetObject = {};

            const classOptions = mergeOptions(this.options, sourceMeta.options);

            sourceMeta.dataMembers.forEach((memberMetadata) =>
            {
                const memberOptions = mergeOptions(classOptions, memberMetadata.options);
                let serialized;
                if (memberMetadata.serializer) {
                    serialized = memberMetadata.serializer(sourceObject[memberMetadata.key]);
                } else if (memberMetadata.ctor) {
                    serialized = this.convertSingleValue(
                        sourceObject[memberMetadata.key],
                        {
                            selfType: memberMetadata.ctor,
                            elementTypes: memberMetadata.elementType,
                            keyType: memberMetadata.keyType,
                        },
                        `${nameof(sourceMeta.classType)}.${memberMetadata.key}`,
                        memberOptions,
                    );
                } else {
                    throw new TypeError(
                        `Could not serialize ${memberMetadata.name}, there is`
                        + ` no constructor nor serialization function to use.`,
                    );
                }

                if (isValueDefined(serialized)
                    || (this.retrievePreserveNull(memberOptions) && serialized === null)
                ) {
                    targetObject[memberMetadata.name] = serialized;
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
        this._typeHintEmitter(targetObject, sourceObject, typeInfo.selfType, sourceTypeMetadata);

        return targetObject;
    }

    /**
     * Performs the conversion of an array of typed objects (or primitive values) to an array of simple javascript objects (or primitive values) for
     * serialization.
     * @param expectedElementType The expected type of elements. If the array is supposed to be multi-dimensional, subsequent elements define lower dimensions.
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     */
    public convertAsArray(
        sourceObject: any[],
        expectedElementType: Function[],
        memberName = "object",
        memberOptions?: OptionsBase,
    ): any[] {
        if (expectedElementType.length === 0 || !expectedElementType[0])
           throw new TypeError(`Could not serialize ${memberName} as Array: missing element type definition.`);

        // Check the type of each element, individually.
        // If at least one array element type is incorrect, we return undefined, which results in no
        // value emitted during serialization. This is so that invalid element types don't unexpectedly
        // alter the ordering of other, valid elements, and that no unexpected undefined values are in
        // the emitted array.
        sourceObject.forEach((element, i) =>
        {
            if (!(this.retrievePreserveNull(memberOptions) && element === null)
                && !isInstanceOf(element, expectedElementType[0])
            ) {
                const expectedTypeName = nameof(expectedElementType[0]);
                const actualTypeName = element && nameof(element.constructor);
                throw new TypeError(`Could not serialize ${memberName}[${i}]:` +
                    ` expected '${expectedTypeName}', got '${actualTypeName}'.`);
            }
        });

        const typeInfoForElements: IScopeTypeInfo = {
            selfType: expectedElementType[0],
            // For multidimensional arrays.
            elementTypes: expectedElementType.length > 1 ? expectedElementType.slice(1) : [],
        };

        if (memberName)
        {
            // Just for debugging purposes.
            memberName += "[]";
        }

        return sourceObject.map(
            element => this.convertSingleValue(
                element, typeInfoForElements, memberName, memberOptions
            ),
        );
    }

    /**
     * Performs the conversion of a set of typed objects (or primitive values) into an array
     * of simple javascript objects.
     *
     * @param sourceObject
     * @param expectedElementType The constructor of the expected Set elements
     *        (e.g. `Number` for `Set<number>`, or `MyClass` for `Set<MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     * @returns
     */
    public convertAsSet(
        sourceObject: Set<any>,
        expectedElementType: Function,
        memberName = "object",
        memberOptions?: OptionsBase,
    ): any[] {
        if (!expectedElementType)
            throw new TypeError(`Could not serialize ${memberName} as Set: missing element type definition.`);

        let elementTypeInfo: IScopeTypeInfo = {
            selfType: expectedElementType,
        };

        // For debugging and error tracking.
        if (memberName) memberName += "[]";

        let resultArray: any[] = [];

        // Convert each element of the set, and put it into an output array.
        // The output array is the one serialized, as JSON.stringify does not support Set serialization.
        // (TODO: clarification needed)
        sourceObject.forEach(element =>
        {
            let resultElement = this.convertSingleValue(element, elementTypeInfo, memberName, memberOptions);

            // Add to output if the source element was undefined, OR the converted element is defined.
            // This will add intentionally undefined values to output, but not values that became undefined
            // DURING serializing (usually because of a type-error).
            if (!isValueDefined(element) || isValueDefined(resultElement))
            {
                resultArray.push(resultElement);
            }
        });

        return resultArray;
    }

    /**
     * Performs the conversion of a map of typed objects (or primitive values) into an array
     * of simple javascript objects with `key` and `value` properties.
     *
     * @param sourceObject
     * @param expectedKeyType The constructor of the expected Map keys
     *        (e.g. `Number` for `Map<number, any>`, or `MyClass` for `Map<MyClass, any>`).
     * @param expectedElementType The constructor of the expected Map values
     *        (e.g. `Number` for `Map<any, number>`, or `MyClass` for `Map<any, MyClass>`).
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     */
    public convertAsMap(
        sourceObject: Map<any, any>,
        expectedKeyType: Function,
        expectedElementType: Function,
        memberName = "object",
        memberOptions?: OptionsBase,
    ): Array<{ key: any, value: any }> {
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

        const resultArray: Array<{ key: any, value: any }> = [];
        const preserveNull = this.retrievePreserveNull(memberOptions);

        // Convert each *entry* in the map to a simple javascript object with key and value properties.
        sourceObject.forEach((value, key) =>
        {
            let resultKeyValuePairObj = {
                key: this.convertSingleValue(key, keyTypeInfo, memberName, memberOptions),
                value: this.convertSingleValue(value, elementTypeInfo, memberName, memberOptions),
            };

            // We are not going to emit entries with undefined keys OR undefined values.
            const keyDefined = isValueDefined(resultKeyValuePairObj.key);
            const valueDefined = isValueDefined(resultKeyValuePairObj.value)
                || (resultKeyValuePairObj.value === null && preserveNull);
            if (keyDefined && valueDefined)
            {
                resultArray.push(resultKeyValuePairObj);
            }
        });

        return resultArray;
    }

    /**
     * Performs the conversion of a typed javascript array to a simple untyped javascript array.
     * This is needed because typed arrays are otherwise serialized as objects, so we'll end up
     * with something like "{ 0: 0, 1: 1, ... }".
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
     * Performs the conversion of DataView, converting its internal ArrayBuffer to a string and
     * returning that string.
     */
    public convertAsDataView(dataView: DataView)
    {
        return this.convertAsArrayBuffer(dataView.buffer);
    }

    private retrievePreserveNull(memberOptions?: OptionsBase): boolean {
        return getOptionValue('preserveNull', mergeOptions(this.options, memberOptions));
    }
}
