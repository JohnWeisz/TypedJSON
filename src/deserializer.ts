import {identity, isSubtypeOf, isValueDefined, logError, nameof} from './helpers';
import {JsonObjectMetadata, TypeResolver} from './metadata';
import {getOptionValue, mergeOptions, OptionsBase} from './options-base';
import {
    AnyT,
    ArrayTypeDescriptor,
    ConcreteTypeDescriptor,
    ensureTypeDescriptor,
    MapShape,
    MapTypeDescriptor,
    SetTypeDescriptor,
    TypeDescriptor,
} from './type-descriptor';
import {Constructor, IndexedObject, Serializable} from './types';

export function defaultTypeResolver(
    sourceObject: IndexedObject,
    knownTypes: Map<string, Function>,
): Function | undefined {
    if (sourceObject.__type != null) {
        return knownTypes.get(sourceObject.__type);
    }
}

export type DeserializerFn<T, TD extends TypeDescriptor, Raw> = (
    sourceObject: Raw,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
    deserializer: Deserializer<T>,
    memberOptions?: OptionsBase,
) => T;

/**
 * Utility class, converts a simple/untyped javascript object-tree to a typed object-tree.
 * It is used after parsing a JSON-string.
 */
export class Deserializer<T> {
    options?: OptionsBase;

    private typeResolver: TypeResolver = defaultTypeResolver;
    private nameResolver?: (ctor: Function) => string;
    private errorHandler: (error: Error) => void = logError;
    private deserializationStrategy = new Map<
        Serializable<any>,
        DeserializerFn<any, TypeDescriptor, any>
    >([
        // primitives
        [AnyT.ctor, identity],
        [Number, deserializeDirectly],
        [String, deserializeDirectly],
        [Boolean, deserializeDirectly],

        [Date, deserializeDate],
        [ArrayBuffer, stringToArrayBuffer],
        [DataView, stringToDataView],

        [Array, convertAsArray],
        [Set, convertAsSet],
        [Map, convertAsMap],

        // typed arrays
        [Float32Array, convertAsFloatArray],
        [Float64Array, convertAsFloatArray],
        [Uint8Array, convertAsUintArray],
        [Uint8ClampedArray, convertAsUintArray],
        [Uint16Array, convertAsUintArray],
        [Uint32Array, convertAsUintArray],
    ]);

    setDeserializationStrategy(
        type: Serializable<any>,
        deserializer: DeserializerFn<any, TypeDescriptor, any>,
    ) {
        this.deserializationStrategy.set(type, deserializer);
    }

    setNameResolver(nameResolverCallback: (ctor: Function) => string) {
        this.nameResolver = nameResolverCallback;
    }

    setTypeResolver(typeResolverCallback: TypeResolver) {
        if (typeof typeResolverCallback as any !== 'function') {
            throw new TypeError('\'typeResolverCallback\' is not a function.');
        }

        this.typeResolver = typeResolverCallback;
    }

    getTypeResolver(): TypeResolver {
        return this.typeResolver;
    }

    setErrorHandler(errorHandlerCallback: (error: Error) => void) {
        if (typeof errorHandlerCallback as any !== 'function') {
            throw new TypeError('\'errorHandlerCallback\' is not a function.');
        }

        this.errorHandler = errorHandlerCallback;
    }

    getErrorHandler(): (error: Error) => void {
        return this.errorHandler;
    }

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        knownTypes: Map<string, Function>,
        memberName = 'object',
        memberOptions?: OptionsBase,
    ): any {
        if (this.retrievePreserveNull(memberOptions) && sourceObject === null) {
            return null;
        } else if (!isValueDefined(sourceObject)) {
            return;
        }

        const deserializer = this.deserializationStrategy.get(typeDescriptor.ctor);
        if (deserializer !== undefined) {
            return deserializer(
                sourceObject,
                typeDescriptor,
                knownTypes,
                memberName,
                this,
                memberOptions,
            );
        }

        if (typeof sourceObject === 'object') {
            return convertAsObject(sourceObject, typeDescriptor, knownTypes, memberName, this);
        }

        let error = `Could not deserialize '${memberName}'; don't know how to deserialize type`;

        if (typeDescriptor.hasFriendlyName()) {
            error += ` '${typeDescriptor.ctor.name}'`;
        }

        this.errorHandler(new TypeError(`${error}.`));
    }

    instantiateType(ctor: any) {
        return new ctor();
    }

    mergeKnownTypes(...knownTypeMaps: Array<Map<string, Function>>) {
        const result = new Map<string, Function>();

        knownTypeMaps.forEach(knownTypes => {
            knownTypes.forEach((ctor, name) => {
                if (this.nameResolver === undefined) {
                    result.set(name, ctor);
                } else {
                    result.set(this.nameResolver(ctor), ctor);
                }
            });
        });

        return result;
    }

    createKnownTypesMap(knowTypes: Set<Function>) {
        const map = new Map<string, Function>();

        knowTypes.forEach(ctor => {
            if (this.nameResolver === undefined) {
                const knownTypeMeta = JsonObjectMetadata.getFromConstructor(ctor);
                const customName = knownTypeMeta?.isExplicitlyMarked === true
                    ? knownTypeMeta.name
                    : null;
                map.set(customName ?? ctor.name, ctor);
            } else {
                map.set(this.nameResolver(ctor), ctor);
            }
        });

        return map;
    }

    retrievePreserveNull(memberOptions?: OptionsBase): boolean {
        return getOptionValue('preserveNull', mergeOptions(this.options, memberOptions));
    }
}

function throwTypeMismatchError(
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

function makeTypeErrorMessage(
    expectedType: Function | string,
    actualType: Function | string,
    memberName: string,
) {
    const expectedTypeName = typeof expectedType === 'function'
        ? nameof(expectedType)
        : expectedType;
    const actualTypeName = typeof actualType === 'function' ? nameof(actualType) : actualType;

    return `Could not deserialize ${memberName}: expected '${expectedTypeName}',`
        + ` got '${actualTypeName}'.`;
}

function srcTypeNameForDebug(sourceObject: any) {
    return sourceObject == null ? 'undefined' : nameof(sourceObject.constructor);
}

function deserializeDirectly<T extends string | number | boolean>(
    sourceObject: T,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    objectName: string,
): T {
    if (sourceObject.constructor !== typeDescriptor.ctor) {
        throw new TypeError(makeTypeErrorMessage(
            nameof(typeDescriptor.ctor),
            sourceObject.constructor,
            objectName,
        ));
    }
    return sourceObject;
}

function convertAsObject<T>(
    sourceObject: IndexedObject,
    typeDescriptor: ConcreteTypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
    deserializer: Deserializer<any>,
): IndexedObject | T | undefined {
    if (typeof sourceObject as any !== 'object' || sourceObject as any === null) {
        deserializer.getErrorHandler()(new TypeError(
            `Cannot deserialize ${memberName}: 'sourceObject' must be a defined object.`,
        ));
        return undefined;
    }

    let expectedSelfType = typeDescriptor.ctor;
    let sourceObjectMetadata = JsonObjectMetadata.getFromConstructor(expectedSelfType);
    let knownTypeConstructors = knownTypes;
    let typeResolver = deserializer.getTypeResolver();

    if (sourceObjectMetadata !== undefined) {
        sourceObjectMetadata.processDeferredKnownTypes();

        // Merge known types received from "above" with known types defined on the current type.
        knownTypeConstructors = deserializer.mergeKnownTypes(
            knownTypeConstructors,
            deserializer.createKnownTypesMap(sourceObjectMetadata.knownTypes),
        );
        if (sourceObjectMetadata.typeResolver != null) {
            typeResolver = sourceObjectMetadata.typeResolver;
        }
    }

    // Check if a type-hint is available from the source object.
    const typeFromTypeHint = typeResolver(sourceObject, knownTypeConstructors);

    if (typeFromTypeHint != null) {
        // Check if type hint is a valid subtype of the expected source type.
        if (isSubtypeOf(typeFromTypeHint, expectedSelfType)) {
            // Hell yes.
            expectedSelfType = typeFromTypeHint;
            sourceObjectMetadata = JsonObjectMetadata.getFromConstructor(typeFromTypeHint);

            if (sourceObjectMetadata !== undefined) {
                // Also merge new known types from subtype.
                knownTypeConstructors = deserializer.mergeKnownTypes(
                    knownTypeConstructors,
                    deserializer.createKnownTypesMap(sourceObjectMetadata.knownTypes),
                );
            }
        }
    }

    if (sourceObjectMetadata?.isExplicitlyMarked === true) {
        const sourceMetadata = sourceObjectMetadata;
        // Strong-typed deserialization available, get to it.
        // First deserialize properties into a temporary object.
        const sourceObjectWithDeserializedProperties = {} as IndexedObject;

        const classOptions = mergeOptions(deserializer.options, sourceMetadata.options);

        // Deserialize by expected properties.
        sourceMetadata.dataMembers.forEach((objMemberMetadata, propKey) => {
            const objMemberValue = sourceObject[propKey];
            const objMemberDebugName = `${nameof(sourceMetadata.classType)}.${propKey}`;
            const objMemberOptions = mergeOptions(classOptions, objMemberMetadata.options);

            let revivedValue;
            if (objMemberMetadata.deserializer != null) {
                revivedValue = objMemberMetadata.deserializer(
                    objMemberValue,
                    {
                        fallback: (so, td) => deserializer.convertSingleValue(
                            so,
                            ensureTypeDescriptor(td),
                            knownTypes,
                        ),
                    },
                );
            } else if (objMemberMetadata.type == null) {
                throw new TypeError(
                    `Cannot deserialize ${objMemberDebugName} there is`
                    + ` no constructor nor deserialization function to use.`,
                );
            } else {
                revivedValue = deserializer.convertSingleValue(
                    objMemberValue,
                    objMemberMetadata.type(),
                    knownTypeConstructors,
                    objMemberDebugName,
                    objMemberOptions,
                );
            }

            // @todo revivedValue will never be null in RHS of ||
            if (isValueDefined(revivedValue)
                || (deserializer.retrievePreserveNull(objMemberOptions)
                    && revivedValue as any === null)
            ) {
                sourceObjectWithDeserializedProperties[objMemberMetadata.key] = revivedValue;
            } else if (objMemberMetadata.isRequired === true) {
                deserializer.getErrorHandler()(new TypeError(
                    `Missing required member '${objMemberDebugName}'.`,
                ));
            }
        });

        // Next, instantiate target object.
        let targetObject: IndexedObject;

        if (typeof sourceObjectMetadata.initializerCallback === 'function') {
            try {
                targetObject = sourceObjectMetadata.initializerCallback(
                    sourceObjectWithDeserializedProperties,
                    sourceObject,
                );

                // Check the validity of user-defined initializer callback.
                if (targetObject as any == null) {
                    throw new TypeError(
                        `Cannot deserialize ${memberName}:`
                        + ` 'initializer' function returned undefined/null`
                        + `, but '${nameof(sourceObjectMetadata.classType)}' was expected.`,
                    );
                } else if (!(targetObject instanceof sourceObjectMetadata.classType)) {
                    throw new TypeError(
                        `Cannot deserialize ${memberName}:`
                        + `'initializer' returned '${nameof(targetObject.constructor)}'`
                        + `, but '${nameof(sourceObjectMetadata.classType)}' was expected`
                        + `, and '${nameof(targetObject.constructor)}' is not a subtype of`
                        + ` '${nameof(sourceObjectMetadata.classType)}'`,
                    );
                }
            } catch (e) {
                deserializer.getErrorHandler()(e);
                return undefined;
            }
        } else {
            targetObject = deserializer.instantiateType(expectedSelfType);
        }

        // Finally, assign deserialized properties to target object.
        Object.assign(targetObject, sourceObjectWithDeserializedProperties);

        // Call onDeserialized method (if any).
        const methodName = sourceObjectMetadata.onDeserializedMethodName;
        if (methodName != null) {
            if (typeof (targetObject as any)[methodName] === 'function') {
                // check for member first
                (targetObject as any)[methodName]();
            } else if (typeof (targetObject.constructor as any)[methodName] === 'function') {
                // check for static
                (targetObject.constructor as any)[methodName]();
            } else {
                deserializer.getErrorHandler()(new TypeError(
                    `onDeserialized callback`
                    + `'${nameof(sourceObjectMetadata.classType)}.${methodName}' is not a method.`,
                ));
            }
        }

        return targetObject;
    } else {
        // Untyped deserialization into Object instance.
        const targetObject = {} as IndexedObject;

        Object.keys(sourceObject).forEach(sourceKey => {
            targetObject[sourceKey] = deserializer.convertSingleValue(
                sourceObject[sourceKey],
                new ConcreteTypeDescriptor(sourceObject[sourceKey].constructor),
                knownTypes,
                sourceKey,
            );
        });

        return targetObject;
    }
}

function convertAsArray(
    sourceObject: any,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
    deserializer: Deserializer<any>,
    memberOptions?: OptionsBase,
): Array<any> {
    if (!(typeDescriptor instanceof ArrayTypeDescriptor)) {
        throw new TypeError(
            `Could not deserialize ${memberName} as Array: incorrect TypeDescriptor detected,`
            + ' please use proper annotation or function for this type',
        );
    }
    if (!Array.isArray(sourceObject)) {
        deserializer.getErrorHandler()(
            new TypeError(makeTypeErrorMessage(Array, sourceObject.constructor, memberName)),
        );
        return [];
    }

    if (typeDescriptor.elementType as any == null) {
        deserializer.getErrorHandler()(
            new TypeError(
                `Could not deserialize ${memberName} as Array: missing constructor reference of`
                + ` Array elements.`,
            ),
        );
        return [];
    }

    return sourceObject.map((element, i) => {
        // If an array element fails to deserialize, substitute with undefined. This is so that the
        // original ordering is not interrupted by faulty
        // entries, as an Array is ordered.
        try {
            return deserializer.convertSingleValue(
                element,
                typeDescriptor.elementType,
                knownTypes,
                `${memberName}[${i}]`,
                memberOptions,
            );
        } catch (e) {
            deserializer.getErrorHandler()(e);

            // Keep filling the array here with undefined to keep original ordering.
            // Note: this is just aesthetics, not returning anything produces the same result.
            return undefined;
        }
    });
}

function convertAsSet(
    sourceObject: any,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
    deserializer: Deserializer<any>,
    memberOptions?: OptionsBase,
): Set<any> {
    if (!(typeDescriptor instanceof SetTypeDescriptor)) {
        throw new TypeError(
            `Could not deserialize ${memberName} as Set: incorrect TypeDescriptor detected,`
            + ` please use proper annotation or function for this type`,
        );
    }
    if (!Array.isArray(sourceObject)) {
        deserializer.getErrorHandler()(new TypeError(makeTypeErrorMessage(
            Array,
            sourceObject.constructor,
            memberName,
        )));
        return new Set<any>();
    }

    if (typeDescriptor.elementType as any == null) {
        deserializer.getErrorHandler()(
            new TypeError(
                `Could not deserialize ${memberName} as Set: missing constructor reference of`
                + ` Set elements.`,
            ),
        );
        return new Set<any>();
    }

    const resultSet = new Set<any>();

    sourceObject.forEach((element, i) => {
        try {
            resultSet.add(deserializer.convertSingleValue(
                element,
                typeDescriptor.elementType,
                knownTypes,
                `${memberName}[${i}]`,
                memberOptions,
            ));
        } catch (e) {
            // Faulty entries are skipped, because a Set is not ordered, and skipping an entry
            // does not affect others.
            deserializer.getErrorHandler()(e);
        }
    });

    return resultSet;
}

function isExpectedMapShape(source: any, expectedShape: MapShape): boolean {
    return (expectedShape === MapShape.ARRAY && Array.isArray(source))
        || (expectedShape === MapShape.OBJECT && typeof source === 'object');
}

function convertAsMap(
    sourceObject: any,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
    deserializer: Deserializer<any>,
    memberOptions?: OptionsBase,
): Map<any, any> {
    if (!(typeDescriptor instanceof MapTypeDescriptor)) {
        throw new TypeError(
            `Could not deserialize ${memberName} as Map: incorrect TypeDescriptor detected,`
            + 'please use proper annotation or function for this type',
        );
    }
    const expectedShape = typeDescriptor.getCompleteOptions().shape;
    if (!isExpectedMapShape(sourceObject, expectedShape)) {
        const expectedType = expectedShape === MapShape.ARRAY ? Array : Object;
        deserializer.getErrorHandler()(
            new TypeError(makeTypeErrorMessage(expectedType, sourceObject.constructor, memberName)),
        );
        return new Map<any, any>();
    }

    if (typeDescriptor.keyType as any == null) {
        deserializer.getErrorHandler()(
            new TypeError(`Could not deserialize ${memberName} as Map: missing key constructor.`),
        );
        return new Map<any, any>();
    }

    if (typeDescriptor.valueType as any == null) {
        deserializer.getErrorHandler()(
            new TypeError(`Could not deserialize ${memberName} as Map: missing value constructor.`),
        );
        return new Map<any, any>();
    }

    const keyMemberName = `${memberName}[].key`;
    const valueMemberName = `${memberName}[].value`;
    const resultMap = new Map<any, any>();

    if (expectedShape === MapShape.OBJECT) {
        Object.keys(sourceObject).forEach(key => {
            try {
                const resultKey = deserializer.convertSingleValue(
                    key,
                    typeDescriptor.keyType,
                    knownTypes,
                    keyMemberName,
                    memberOptions,
                );
                if (isValueDefined(resultKey)) {
                    resultMap.set(
                        resultKey,
                        deserializer.convertSingleValue(
                            sourceObject[key],
                            typeDescriptor.valueType,
                            knownTypes,
                            valueMemberName,
                            memberOptions,
                        ),
                    );
                }
            } catch (e) {
                // Faulty entries are skipped, because a Map is not ordered,
                // and skipping an entry does not affect others.
                deserializer.getErrorHandler()(e);
            }
        });
    } else {
        sourceObject.forEach((element: any) => {
            try {
                const key = deserializer.convertSingleValue(
                    element.key,
                    typeDescriptor.keyType,
                    knownTypes,
                    keyMemberName,
                    memberOptions,
                );

                // Undefined/null keys not supported, skip if so.
                if (isValueDefined(key)) {
                    resultMap.set(
                        key,
                        deserializer.convertSingleValue(
                            element.value,
                            typeDescriptor.valueType,
                            knownTypes,
                            valueMemberName,
                            memberOptions,
                        ),
                    );
                }
            } catch (e) {
                // Faulty entries are skipped, because a Map is not ordered,
                // and skipping an entry does not affect others.
                deserializer.getErrorHandler()(e);
            }
        });
    }

    return resultMap;
}

function deserializeDate(
    sourceObject: string | number | Date,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
): Date {
    // Support for Date with ISO 8601 format, or with numeric timestamp (milliseconds elapsed since
    // the Epoch).
    // ISO 8601 spec.: https://www.w3.org/TR/NOTE-datetime

    if (typeof sourceObject === 'number') {
        const isInteger = sourceObject % 1 === 0;
        if (!isInteger) {
            throw new TypeError(
                `Could not deserialize ${memberName} as Date:`
                + ` expected an integer, got a number with decimal places.`,
            );
        }

        return new Date(sourceObject);
    } else if (typeof sourceObject === 'string') {
        return new Date(sourceObject);
    } else if (sourceObject instanceof Date) {
        return sourceObject;
    } else {
        throwTypeMismatchError(
            'Date',
            'an ISO-8601 string',
            srcTypeNameForDebug(sourceObject),
            memberName,
        );
    }
}

function stringToArrayBuffer(
    sourceObject: string | number | Date,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
) {
    if (typeof sourceObject !== 'string') {
        throwTypeMismatchError(
            'ArrayBuffer',
            'a string source',
            srcTypeNameForDebug(sourceObject),
            memberName,
        );
    }
    return createArrayBufferFromString(sourceObject);
}

function stringToDataView(
    sourceObject: string | number | Date,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
) {
    if (typeof sourceObject !== 'string') {
        throwTypeMismatchError(
            'DataView',
            'a string source',
            srcTypeNameForDebug(sourceObject),
            memberName,
        );
    }
    return new DataView(createArrayBufferFromString(sourceObject));
}

function createArrayBufferFromString(input: string): ArrayBuffer {
    const buf = new ArrayBuffer(input.length * 2); // 2 bytes for each char
    const bufView = new Uint16Array(buf);

    for (let i = 0, strLen = input.length; i < strLen; i++) {
        bufView[i] = input.charCodeAt(i);
    }

    return buf;
}

function convertAsFloatArray<T extends Float32Array | Float64Array>(
    sourceObject: string | number | Date,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
): T {
    const constructor = typeDescriptor.ctor as Constructor<T>;
    if (Array.isArray(sourceObject) && sourceObject.every(elem => !isNaN(elem))) {
        return new constructor(sourceObject);
    }
    return throwTypeMismatchError(
        constructor.name,
        'a numeric source array',
        srcTypeNameForDebug(sourceObject),
        memberName,
    );
}

// @todo: investigate bitwise and types
function convertAsUintArray<T extends Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array>(
    sourceObject: string | number | Date,
    typeDescriptor: TypeDescriptor,
    knownTypes: Map<string, Function>,
    memberName: string,
): T {
    const constructor = typeDescriptor.ctor as Constructor<T>;
    if (Array.isArray(sourceObject) && sourceObject.every(elem => !isNaN(elem))) {
        // eslint-disable-next-line no-bitwise
        return new constructor(sourceObject.map(value => ~~value));
    }
    return throwTypeMismatchError(
        typeDescriptor.ctor.name,
        'a numeric source array',
        srcTypeNameForDebug(sourceObject),
        memberName,
    );
}
