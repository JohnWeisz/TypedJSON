import {
    isDirectlySerializableNativeType,
    isInstanceOf,
    isTypeTypedArray,
    isValueDefined,
    logError,
    nameof,
} from "./helpers";
import { IndexedObject } from "./types";
import { JsonObjectMetadata } from "./metadata";
import { getOptionValue, mergeOptions, OptionsBase } from "./options-base";
import {
    ArrayTypeDescriptor,
    ConcreteTypeDescriptor,
    MapShape,
    MapTypeDescriptor,
    SetTypeDescriptor,
    TypeDescriptor,
} from "./type-descriptor";

export type TypeHintEmitter
    = (
        targetObject: IndexedObject,
        sourceObject: IndexedObject,
        expectedSourceType: Function,
        sourceTypeMetadata?: JsonObjectMetadata,
    ) => void;

function defaultTypeEmitter(
    targetObject: IndexedObject,
    sourceObject: IndexedObject,
    expectedSourceType: Function,
    sourceTypeMetadata?: JsonObjectMetadata,
) {
    // By default, we put a "__type" property on the output object if the actual object is not the
    // same as the expected one, so that deserialization will know what to deserialize into (given
    // the required known-types are defined, and the object is a valid subtype of the expected type).
    if (sourceObject.constructor !== expectedSourceType)
    {
        targetObject.__type = sourceTypeMetadata && sourceTypeMetadata.name
            ? sourceTypeMetadata.name
            : nameof(sourceObject.constructor);
    }
}

/**
 * Utility class, converts a typed object tree (i.e. a tree of class instances, arrays of class
 * instances, and so on) to an untyped javascript object (also called "simple javascript object"),
 * and emits any necessary type hints in the process (for polymorphism).
 *
 * The converted object tree is what will be given to `JSON.stringify` to convert to string as the
 * last step, the serialization is basically like:
 *
 * (1) typed object-tree -> (2) simple JS object-tree -> (3) JSON-string
 */
export class Serializer
{
    public options?: OptionsBase;
    private _typeHintEmitter: TypeHintEmitter = defaultTypeEmitter;
    private _errorHandler: (error: Error) => void = logError;

    public setTypeHintEmitter(typeEmitterCallback: TypeHintEmitter)
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
        typeDescriptor: TypeDescriptor,
        memberName: string = "object",
        memberOptions?: OptionsBase,
    ): any {
        if (this.retrievePreserveNull(memberOptions) && sourceObject === null) return null;
        if (!isValueDefined(sourceObject)) return;

        if (!isInstanceOf(sourceObject, typeDescriptor.ctor))
        {
            let expectedName = nameof(typeDescriptor.ctor);
            let actualName = nameof(sourceObject.constructor);

            this._errorHandler(new TypeError(
                `Could not serialize '${memberName}': expected '${expectedName}', got '${actualName}'.`),
            );
            return;
        }

        if (isDirectlySerializableNativeType(typeDescriptor.ctor))
        {
            return sourceObject;
        }
        else if (typeDescriptor.ctor === ArrayBuffer)
        {
            return this.convertAsArrayBuffer(sourceObject);
        }
        else if (typeDescriptor.ctor === DataView)
        {
            return this.convertAsDataView(sourceObject);
        }
        else if (typeDescriptor instanceof ArrayTypeDescriptor)
        {
            return this.convertAsArray(sourceObject, typeDescriptor, memberName, memberOptions);
        }
        else if (typeDescriptor instanceof SetTypeDescriptor)
        {
            return this.convertAsSet(sourceObject, typeDescriptor, memberName, memberOptions);
        }
        else if (typeDescriptor instanceof MapTypeDescriptor)
        {
            return this.convertAsMap(sourceObject, typeDescriptor, memberName, memberOptions);
        }
        else if (isTypeTypedArray(typeDescriptor.ctor))
        {
            return this.convertAsTypedArray(sourceObject);
        }
        else if (typeof sourceObject === "object")
        {
            return this.convertAsObject(sourceObject, typeDescriptor, memberName, memberOptions);
        }
    }

    /**
     * Performs the conversion of a typed object (usually a class instance) to a simple
     * javascript object for serialization.
     */
    public convertAsObject(
        sourceObject: IndexedObject,
        typeDescriptor: ConcreteTypeDescriptor,
        memberName?: string,
        memberOptions?: OptionsBase,
    ) {
        let sourceTypeMetadata: JsonObjectMetadata|undefined;
        let targetObject: IndexedObject;

        if (sourceObject.constructor !== typeDescriptor.ctor && sourceObject instanceof typeDescriptor.ctor)
        {
            // The source object is not of the expected type, but it is a valid subtype.
            // This is OK, and we'll proceed to gather object metadata from the subtype instead.
            sourceTypeMetadata = JsonObjectMetadata.getFromConstructor(sourceObject.constructor);
        }
        else
        {
            sourceTypeMetadata = JsonObjectMetadata.getFromConstructor(typeDescriptor.ctor);
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

            sourceMeta.dataMembers.forEach((objMemberMetadata) =>
            {
                const objMemberOptions = mergeOptions(classOptions, objMemberMetadata.options);
                let serialized;
                if (objMemberMetadata.serializer) {
                    serialized = objMemberMetadata.serializer(sourceObject[objMemberMetadata.key]);
                } else if (objMemberMetadata.type) {
                    serialized = this.convertSingleValue(
                        sourceObject[objMemberMetadata.key],
                        objMemberMetadata.type,
                        `${nameof(sourceMeta.classType)}.${objMemberMetadata.key}`,
                        objMemberOptions,
                    );
                } else {
                    throw new TypeError(
                        `Could not serialize ${objMemberMetadata.name}, there is`
                        + ` no constructor nor serialization function to use.`,
                    );
                }

                if (isValueDefined(serialized)
                    || (this.retrievePreserveNull(objMemberOptions) && serialized === null)
                ) {
                    targetObject[objMemberMetadata.name] = serialized;
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
        this._typeHintEmitter(targetObject, sourceObject, typeDescriptor.ctor, sourceTypeMetadata);

        return targetObject;
    }

    /**
     * Performs the conversion of an array of typed objects (or primitive values) to an array of simple javascript objects (or primitive values) for
     * serialization.
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     */
    public convertAsArray(
        sourceObject: any[],
        typeDescriptor: ArrayTypeDescriptor,
        memberName = "object",
        memberOptions?: OptionsBase,
    ): any[] {
        if (!typeDescriptor.elementType)
        {
            throw new TypeError(`Could not serialize ${memberName} as Array: missing element type definition.`);
        }

        // Check the type of each element, individually.
        // If at least one array element type is incorrect, we return undefined, which results in no
        // value emitted during serialization. This is so that invalid element types don't unexpectedly
        // alter the ordering of other, valid elements, and that no unexpected undefined values are in
        // the emitted array.
        sourceObject.forEach((element, i) =>
        {
            if (!(this.retrievePreserveNull(memberOptions) && element === null)
                && !isInstanceOf(element, typeDescriptor.elementType.ctor)
            ) {
                const expectedTypeName = nameof(typeDescriptor.elementType.ctor);
                const actualTypeName = element && nameof(element.constructor);
                throw new TypeError(`Could not serialize ${memberName}[${i}]:` +
                    ` expected '${expectedTypeName}', got '${actualTypeName}'.`);
            }
        });

        if (memberName)
        {
            // Just for debugging purposes.
            memberName += "[]";
        }

        return sourceObject.map(
            element => this.convertSingleValue(
                element, typeDescriptor.elementType, memberName, memberOptions
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
        typeDescriptor: SetTypeDescriptor,
        memberName = "object",
        memberOptions?: OptionsBase,
    ): any[] {
        if (!typeDescriptor.elementType)
        {
            throw new TypeError(`Could not serialize ${memberName} as Set: missing element type definition.`);
        }

        // For debugging and error tracking.
        if (memberName)
        {
            memberName += "[]";
        }

        let resultArray: any[] = [];

        // Convert each element of the set, and put it into an output array.
        // The output array is the one serialized, as JSON.stringify does not support Set serialization.
        // (TODO: clarification needed)
        sourceObject.forEach(element =>
        {
            const resultElement = this.convertSingleValue(element, typeDescriptor.elementType, memberName, memberOptions);

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
     * @param memberName Name of the object being serialized, used for debugging purposes.
     * @param memberOptions If converted as a member, the member options.
     */
    public convertAsMap(
        sourceObject: Map<any, any>,
        typeDescriptor: MapTypeDescriptor,
        memberName = "object",
        memberOptions?: OptionsBase,
    ): IndexedObject|Array<{ key: any, value: any }> {
        if (!typeDescriptor.valueType)
        {
            throw new TypeError(`Could not serialize ${memberName} as Map: missing value type definition.`);
        }

        if (!typeDescriptor.keyType)
        {
            throw new TypeError(`Could not serialize ${memberName} as Map: missing key type definition.`);
        }

        if (memberName)
        {
            memberName += "[]";
        }

        // const resultArray: Array<{ key: any, value: any }> = [];
        const resultShape = typeDescriptor.getCompleteOptions().shape;
        const result = resultShape === MapShape.OBJECT ? ({} as IndexedObject) : [];
        const preserveNull = this.retrievePreserveNull(memberOptions);

        // Convert each *entry* in the map to a simple javascript object with key and value properties.
        sourceObject.forEach((value, key) =>
        {
            let resultKeyValuePairObj = {
                key: this.convertSingleValue(key, typeDescriptor.keyType, memberName, memberOptions),
                value: this.convertSingleValue(value, typeDescriptor.valueType, memberName, memberOptions),
            };

            // We are not going to emit entries with undefined keys OR undefined values.
            const keyDefined = isValueDefined(resultKeyValuePairObj.key);
            const valueDefined = isValueDefined(resultKeyValuePairObj.value)
                || (resultKeyValuePairObj.value === null && preserveNull);
            if (keyDefined && valueDefined)
            {
                if (resultShape === MapShape.OBJECT) {
                    result[resultKeyValuePairObj.key] = resultKeyValuePairObj.value;
                } else {
                    result.push(resultKeyValuePairObj);
                }
            }
        });

        return result;
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
