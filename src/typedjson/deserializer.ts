import { nameof, logError, isSubtypeOf, isValueDefined, isDirectlyDeserializableNativeType } from "./helpers";
import { Constructor, IndexedObject } from "./types";
import { JsonObjectMetadata } from "./metadata";
import { getOptionValue, mergeOptions, OptionsBase } from "./options-base";

export interface IScopeTypeInfo
{
    selfConstructor: Function;
    elementConstructor?: Function[];
    keyConstructor?: Function;
    knownTypes: Map<string, Function>;
}

export type TypeResolver = (sourceObject: Object, knownTypes: Map<string, Function>) => Function|undefined|null;

function defaultTypeResolver(sourceObject: any, knownTypes: Map<string, Function>): Function|undefined {
    if (sourceObject.__type) return knownTypes.get(sourceObject.__type);
}

/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
export class Deserializer<T>
{
    public options?: OptionsBase;

    private _typeResolver: TypeResolver = defaultTypeResolver;
    private _nameResolver?: (ctor: Function) => string;
    private _errorHandler: (error: Error) => void = logError;

    public setNameResolver(nameResolverCallback: (ctor: Function) => string)
    {
        this._nameResolver = nameResolverCallback;
    }

    public setTypeResolver(typeResolverCallback: TypeResolver)
    {
        if (typeof typeResolverCallback !== "function")
        {
            throw new TypeError("'typeResolverCallback' is not a function.");
        }

        this._typeResolver = typeResolverCallback;
    }

    public setErrorHandler(errorHandlerCallback: (error: Error) => void)
    {
        if (typeof errorHandlerCallback !== "function")
        {
            throw new TypeError("'errorHandlerCallback' is not a function.");
        }

        this._errorHandler = errorHandlerCallback;
    }

    public convertAsObject(
        sourceObject: IndexedObject,
        sourceObjectTypeInfo: IScopeTypeInfo,
        objectName = "object",
        memberOptions?: OptionsBase,
    ) {
        if (typeof sourceObject !== "object" || sourceObject === null)
        {
            this._errorHandler(new TypeError(`Cannot deserialize ${objectName}: 'sourceObject' must be a defined object.`));
            return undefined;
        }

        let expectedSelfType = sourceObjectTypeInfo.selfConstructor;
        let sourceObjectMetadata = JsonObjectMetadata.getFromConstructor(expectedSelfType);
        let knownTypeConstructors = sourceObjectTypeInfo.knownTypes;

        if (sourceObjectMetadata)
        {
            // Merge known types received from "above" with known types defined on the current type.
            knownTypeConstructors = this._mergeKnownTypes(
                knownTypeConstructors,
                this._createKnownTypesMap(sourceObjectMetadata.knownTypes),
            );
        }

        // Check if a type-hint is available from the source object.
        const typeFromTypeHint = this._typeResolver(sourceObject, knownTypeConstructors);

        if (typeFromTypeHint)
        {
            // Check if type hint is a valid subtype of the expected source type.
            if (isSubtypeOf(typeFromTypeHint, expectedSelfType))
            {
                // Hell yes.
                expectedSelfType = typeFromTypeHint;
                sourceObjectMetadata = JsonObjectMetadata.getFromConstructor(typeFromTypeHint);

                if (sourceObjectMetadata)
                {
                    // Also merge new known types from subtype.
                    knownTypeConstructors = this._mergeKnownTypes(
                        knownTypeConstructors,
                        this._createKnownTypesMap(sourceObjectMetadata.knownTypes),
                    );
                }
            }
        }

        if (sourceObjectMetadata && sourceObjectMetadata.isExplicitlyMarked)
        {
            const sourceMetadata = sourceObjectMetadata;
            // Strong-typed deserialization available, get to it.
            // First deserialize properties into a temporary object.
            const sourceObjectWithDeserializedProperties = {} as IndexedObject;

            const classOptions = mergeOptions(this.options, sourceMetadata.options);

            // Deserialize by expected properties.
            sourceMetadata.dataMembers.forEach((objMemberMetadata, propKey) =>
            {
                const objMemberValue = sourceObject[propKey];
                const objMemberDebugName = `${nameof(sourceMetadata.classType)}.${propKey}`;
                const objMemberOptions = mergeOptions(classOptions, objMemberMetadata.options);

                let revivedValue;
                if (objMemberMetadata.deserializer) {
                    revivedValue = objMemberMetadata.deserializer(objMemberValue);
                } else if (objMemberMetadata.ctor) {
                    revivedValue = this.convertSingleValue(
                        objMemberValue,
                        {
                            selfConstructor: objMemberMetadata.ctor,
                            elementConstructor: objMemberMetadata.elementType,
                            keyConstructor: objMemberMetadata.keyType,
                            knownTypes: knownTypeConstructors
                        },
                        objMemberDebugName,
                        objMemberOptions,
                    );
                } else {
                    throw new TypeError(
                        `Cannot deserialize ${objMemberDebugName} there is`
                        + ` no constructor nor deserialization function to use.`,
                    );
                }

                if (isValueDefined(revivedValue)
                    || (this.retrievePreserveNull(objMemberOptions) && revivedValue === null)
                ) {
                    sourceObjectWithDeserializedProperties[objMemberMetadata.key] = revivedValue;
                }
                else if (objMemberMetadata.isRequired)
                {
                    this._errorHandler(new TypeError(`Missing required member '${objMemberDebugName}'.`));
                }
            });

            // Next, instantiate target object.
            let targetObject: IndexedObject;

            if (typeof sourceObjectMetadata.initializerCallback === "function")
            {
                try
                {
                    targetObject = sourceObjectMetadata.initializerCallback(
                        sourceObjectWithDeserializedProperties,
                        sourceObject,
                    );

                    // Check the validity of user-defined initializer callback.
                    if (!targetObject)
                    {
                        throw new TypeError(
                            `Cannot deserialize ${objectName}:`
                            + ` 'initializer' function returned undefined/null`
                            + `, but '${nameof(sourceObjectMetadata.classType)}' was expected.`,
                        );
                    }
                    else if (!(targetObject instanceof sourceObjectMetadata.classType))
                    {
                        throw new TypeError(
                            `Cannot deserialize ${objectName}:`
                            + `'initializer' returned '${nameof(targetObject.constructor)}'`
                            + `, but '${nameof(sourceObjectMetadata.classType)}' was expected`
                            + `, and '${nameof(targetObject.constructor)}' is not a subtype of`
                            + ` '${nameof(sourceObjectMetadata.classType)}'`,
                        );
                    }
                }
                catch (e)
                {
                    this._errorHandler(e);
                    return undefined;
                }
            }
            else
            {
                targetObject = this._instantiateType(expectedSelfType);
            }

            // Finally, assign deserialized properties to target object.
            Object.assign(targetObject, sourceObjectWithDeserializedProperties);

            // Call onDeserialized method (if any).
            if (sourceObjectMetadata.onDeserializedMethodName)
            {
                // check for member first
                if (typeof (targetObject as any)[sourceObjectMetadata.onDeserializedMethodName] === "function")
                {
                    (targetObject as any)[sourceObjectMetadata.onDeserializedMethodName]();
                }
                // check for static
                else if (typeof (targetObject.constructor as any)[sourceObjectMetadata.onDeserializedMethodName] === "function")
                {
                    (targetObject.constructor as any)[sourceObjectMetadata.onDeserializedMethodName]();
                }
                else
                {
                    this._errorHandler(new TypeError(
                        `onDeserialized callback '${nameof(sourceObjectMetadata.classType)}.${sourceObjectMetadata.onDeserializedMethodName}' is not a method.`
                    ));
                }
            }

            return targetObject;
        }
        else
        {
            // Untyped deserialization into Object instance.
            let targetObject = {} as IndexedObject;

            Object.keys(sourceObject).forEach(sourceKey =>
            {
                targetObject[sourceKey] = this.convertSingleValue(sourceObject[sourceKey], {
                    selfConstructor: sourceObject[sourceKey].constructor,
                    knownTypes: sourceObjectTypeInfo.knownTypes,
                    elementConstructor: sourceObjectTypeInfo.elementConstructor,
                    keyConstructor: sourceObjectTypeInfo.keyConstructor
                }, sourceKey);
            });

            return targetObject;
        }
    }

    public convertSingleValue(
        sourceObject: any,
        typeInfo: IScopeTypeInfo,
        memberName = "object",
        memberOptions?: OptionsBase,
    ) {
        let expectedSelfType = typeInfo.selfConstructor;
        let srcTypeNameForDebug = sourceObject ? nameof(sourceObject.constructor) : "undefined";

        if (this.retrievePreserveNull(memberOptions) && sourceObject === null)
        {
            return null;
        }
        else if (!isValueDefined(sourceObject))
        {
            return;
        }
        else if (isDirectlyDeserializableNativeType(expectedSelfType))
        {
            if (sourceObject.constructor === expectedSelfType)
            {
                return sourceObject;
            }
            else
            {
                throw new TypeError(this._makeTypeErrorMessage(nameof(expectedSelfType), sourceObject.constructor, memberName));
            }
        }
        else if (expectedSelfType === Date)
        {
            // Support for Date with ISO 8601 format, or with numeric timestamp (milliseconds elapsed since the Epoch).
            // ISO 8601 spec.: https://www.w3.org/TR/NOTE-datetime

            if (typeof sourceObject === "string" || (typeof sourceObject === "number" && sourceObject > 0))
                return new Date(sourceObject as any);
            else if (sourceObject instanceof Date)
                return sourceObject
            else
                this._throwTypeMismatchError("Date", "an ISO-8601 string", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Float32Array || expectedSelfType === Float64Array)
        {
            // Deserialize Float Array from number[].
            return this._convertAsFloatArray(
                sourceObject,
                expectedSelfType as any,
                srcTypeNameForDebug,
                memberName,
            );
        }
        else if (
            expectedSelfType === Uint8Array
            || expectedSelfType === Uint8ClampedArray
            || expectedSelfType === Uint16Array
            || expectedSelfType === Uint32Array
        ) {
            // Deserialize Uint array from number[].
            return this._convertAsUintArray(
                sourceObject,
                expectedSelfType as any,
                srcTypeNameForDebug,
                memberName,
            );
        }
        else if (expectedSelfType === ArrayBuffer)
        {
            if (typeof sourceObject === "string")
                return this._stringToArrayBuffer(sourceObject);
            else
                this._throwTypeMismatchError("ArrayBuffer", "a string source", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === DataView)
        {
            if (typeof sourceObject === "string")
                return this._stringToDataView(sourceObject);
            else
                this._throwTypeMismatchError("DataView", "a string source", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Array)
        {
            if (Array.isArray(sourceObject))
                return this.convertAsArray(sourceObject, typeInfo, memberName, memberOptions);
            else
                throw new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName));
        }
        else if (expectedSelfType === Set)
        {
            if (Array.isArray(sourceObject))
                return this.convertAsSet(sourceObject, typeInfo, memberName, memberOptions);
            else
                this._throwTypeMismatchError("Set", "Array", srcTypeNameForDebug, memberName);
        }
        else if (expectedSelfType === Map)
        {
            if (Array.isArray(sourceObject))
                return this.convertAsMap(sourceObject, typeInfo, memberName, memberOptions);
            else
                this._throwTypeMismatchError("Map", "a source array of key-value-pair objects", srcTypeNameForDebug, memberName);
        }
        else if (sourceObject && typeof sourceObject === "object")
        {
            return this.convertAsObject(sourceObject, typeInfo, memberName, memberOptions);
        }
    }

    public convertAsArray(
        sourceObject: any,
        typeInfo: IScopeTypeInfo,
        memberName = "object",
        memberOptions?: OptionsBase,
    ): any[] {
        if (!(Array.isArray(sourceObject)))
        {
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
            return [];
        }

        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length)
        {
            this._errorHandler(new TypeError(`Could not deserialize ${memberName} as Array: missing constructor reference of Array elements.`));
            return [];
        }

        let elementTypeInfo: IScopeTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };

        return sourceObject.map(element =>
        {
            // If an array element fails to deserialize, substitute with undefined. This is so that the original ordering is not interrupted by faulty
            // entries, as an Array is ordered.
            try
            {
                return this.convertSingleValue(element, elementTypeInfo, `${memberName}[]`, memberOptions);
            }
            catch (e)
            {
                this._errorHandler(e);

                // Keep filling the array here with undefined to keep original ordering.
                // Note: this is just aesthetics, not returning anything produces the same result.
                return undefined;
            }
        });
    }

    public convertAsSet(
        sourceObject: any,
        typeInfo: IScopeTypeInfo,
        memberName = "object",
        memberOptions?: OptionsBase,
    ): Set<any> {
        if (!(Array.isArray(sourceObject)))
        {
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));
            return new Set<any>();
        }

        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length)
        {
            this._errorHandler(new TypeError(`Could not deserialize ${memberName} as Set: missing constructor reference of Set elements.`));
            return new Set<any>();
        }

        let elementTypeInfo: IScopeTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };
        let resultSet = new Set<any>();

        sourceObject.forEach((element, i) =>
        {
            try
            {
                resultSet.add(this.convertSingleValue(
                    element,
                    elementTypeInfo,
                    `${memberName}[${i}]`,
                    memberOptions,
                ));
            }
            catch (e)
            {
                // Faulty entries are skipped, because a Set is not ordered, and skipping an entry
                // does not affect others.
                this._errorHandler(e);
            }
        });

        return resultSet;
    }

    public convertAsMap(
        sourceObject: any,
        typeInfo: IScopeTypeInfo,
        memberName = "object",
        memberOptions?: OptionsBase,
    ): Map<any, any> {
        if (!(Array.isArray(sourceObject)))
            this._errorHandler(new TypeError(this._makeTypeErrorMessage(Array, sourceObject.constructor, memberName)));

        if (!typeInfo.keyConstructor)
        {
            this._errorHandler(new TypeError(`Could not deserialize ${memberName} as Map: missing key constructor.`));
            return new Map<any, any>();
        }

        if (!typeInfo.elementConstructor || !typeInfo.elementConstructor.length)
        {
            this._errorHandler(new TypeError(`Could not deserialize ${memberName} as Map: missing value constructor.`));
            return new Map<any, any>();
        }

        let keyTypeInfo: IScopeTypeInfo = {
            selfConstructor: typeInfo.keyConstructor,
            knownTypes: typeInfo.knownTypes
        };

        let valueTypeInfo: IScopeTypeInfo = {
            selfConstructor: typeInfo.elementConstructor[0],
            elementConstructor: (typeInfo.elementConstructor.length > 1) ? typeInfo.elementConstructor.slice(1) : [],
            knownTypes: typeInfo.knownTypes
        };

        let resultMap = new Map<any, any>();

        sourceObject.forEach((element: any) =>
        {
            try
            {
                let key = this.convertSingleValue(element.key, keyTypeInfo, memberName, memberOptions);

                // Undefined/null keys not supported, skip if so.
                if (isValueDefined(key))
                {
                    resultMap.set(
                        key,
                        this.convertSingleValue(
                            element.value,
                            valueTypeInfo,
                            `${memberName}[${key}]`,
                            memberOptions,
                        ),
                    );
                }
            }
            catch (e)
            {
                // Faulty entries are skipped, because a Map is not ordered,
                // and skipping an entry does not affect others.
                this._errorHandler(e);
            }
        });

        return resultMap;
    }

    private _convertAsFloatArray<T extends Float32Array | Float64Array>(
        sourceObject: any,
        arrayType: Constructor<T>,
        srcTypeNameForDebug: string,
        memberName: string,
    ): T {
        if (Array.isArray(sourceObject) && sourceObject.every(elem => !isNaN(elem)))
            return new arrayType(sourceObject);
        return this._throwTypeMismatchError(
            arrayType.name,
            "a numeric source array",
            srcTypeNameForDebug,
            memberName,
        );
    }

    private _convertAsUintArray<T extends Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array>(
        sourceObject: any,
        arrayType: Constructor<T>,
        srcTypeNameForDebug: string,
        memberName: string,
    ): T {
        if (Array.isArray(sourceObject) && sourceObject.every(elem => !isNaN(elem)))
            return new arrayType(sourceObject.map(value => ~~value));
        return this._throwTypeMismatchError(
            arrayType.name,
            "a numeric source array",
            srcTypeNameForDebug,
            memberName,
        );
    }

    private _throwTypeMismatchError(
        targetType: string,
        expectedSourceType: string,
        actualSourceType: string,
        memberName: string,
    ): never {
        throw new TypeError(
            `Could not deserialize ${memberName} as ${targetType}:`
            + ` expected ${expectedSourceType}, got ${actualSourceType}.`,
        );
    }

    private _makeTypeErrorMessage(expectedType: Function | string, actualType: Function | string, memberName: string)
    {
        const expectedTypeName = (typeof expectedType === "function") ? nameof(expectedType) : expectedType;
        const actualTypeName = (typeof actualType === "function") ? nameof(actualType) : actualType;

        return `Could not deserialize ${memberName}: expected '${expectedTypeName}', got '${actualTypeName}'.`;
    }

    private _instantiateType(ctor: any)
    {
        return new ctor();
    }

    private _mergeKnownTypes(...knownTypeMaps: Array<Map<string, Function>>)
    {
        let result = new Map<string, Function>();

        knownTypeMaps.forEach(knownTypes =>
        {
            knownTypes.forEach((ctor, name) =>
            {
                if (this._nameResolver)
                {
                    result.set(this._nameResolver(ctor), ctor);
                }
                else
                {
                    result.set(name, ctor);
                }
            });
        });

        return result;
    }

    private _createKnownTypesMap(knowTypes: Set<Function>)
    {
        const map = new Map<string, Function>();

        knowTypes.forEach(ctor =>
        {
            if (this._nameResolver)
            {
                map.set(this._nameResolver(ctor), ctor);
            }
            else
            {
                const knownTypeMeta = JsonObjectMetadata.getFromConstructor(ctor);
                const name = knownTypeMeta && knownTypeMeta.isExplicitlyMarked && knownTypeMeta.name
                    ? knownTypeMeta.name
                    : ctor.name;
                map.set(name, ctor);
            }
        });

        return map;
    }

    private _stringToArrayBuffer(str: string)
    {
        let buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        let bufView = new Uint16Array(buf);

        for (let i = 0, strLen = str.length; i < strLen; i++)
        {
            bufView[i] = str.charCodeAt(i);
        }

        return buf;
    }

    private _stringToDataView(str: string)
    {
        return new DataView(this._stringToArrayBuffer(str));
    }

    private retrievePreserveNull(memberOptions?: OptionsBase): boolean {
        return getOptionValue('preserveNull', mergeOptions(this.options, memberOptions));
    }
}
